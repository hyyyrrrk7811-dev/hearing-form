"""機材リストPDFを取得して、フォーム用のJSON構造に変換する。

対象PDFのページ構成（見出し）が変わらない限り、更新のたびに自動で最新内容を反映する。
- 見出し行の文字でページを探す（ページ番号は使わない）
- 表の列位置は見出し行（Category / Brand / Name ...）から求める
- 行の区切りは表のドット罫線から求める（結合セルも罫線の長さで判定）
- オレンジ背景などの色はPDFの塗りつぶし矩形から読み取る
"""

import json
import os
import re
import ssl
import urllib.request
from bisect import bisect_right
from datetime import datetime, timezone
from pathlib import Path

import certifi
import pymupdf

# 環境変数 EQUIPMENT_PDF_URL で取得元を差し替えられる（URLが変わったときや動作確認用）
PDF_URL = os.environ.get(
    "EQUIPMENT_PDF_URL", "https://www.applevinegarmusicsupport.com/pdf/mif/equipments.pdf"
)

# 最後に正常に読み込めたリスト。最新版の取得や解析に失敗したときの代わりに使う。
CACHE_FILE = Path(__file__).parent / "cache" / "equipments.json"

SECTIONS = [
    {
        "id": "instruments",
        "title": "Instruments",
        "heading": "Instruments",
        "columns": ["Category", "Brand", "Name", "Quantity"],
        "group_col": 0,
        "sub_col": 1,
        "name_col": 2,
        "qty_col": 3,
        # BOSSペダルは別セクション（BOSS Pedals）で一覧にするため除外する
        "skip_groups": {"Effects Pedal"},
    },
    {
        "id": "boss",
        "title": "BOSS Pedals",
        "heading": "BOSS effector",
        "columns": ["No.", "Genre", "Model Number", "Name"],
        "group_col": 1,
        "sub_col": 2,
        "name_col": 3,
        "qty_col": None,
        "skip_groups": set(),
    },
]

TEXT_FIXES = {"MODULATI…": "MODULATION"}


SIZE_LIST = re.compile(r"(\S+)\s+(\d+(?:\s*/\s*\d+)+)")


def split_names(name):
    """複数サイズが1セルにまとまっている機材を、サイズごとの項目に分ける。

    - 「BD 24 / 22 / 20」  -> 「BD 24」「BD 22」「BD 20」
    - 「Tom 12×8」改行「Tom 13×9」 -> それぞれ別項目
    """
    names = []
    for line in name.split("\n"):
        line = line.strip()
        match = SIZE_LIST.fullmatch(line)
        if match:
            names += [f"{match.group(1)} {size.strip()}" for size in match.group(2).split("/")]
        elif line:
            names.append(line)
    return names


def download_pdf(url=PDF_URL, timeout=15):
    request = urllib.request.Request(url, headers={"User-Agent": "recording-form/1.0"})
    context = ssl.create_default_context(cafile=certifi.where())
    with urllib.request.urlopen(request, timeout=timeout, context=context) as response:
        return response.read()


def _lines(page):
    result = []
    for block in page.get_text("dict")["blocks"]:
        if block["type"] != 0:
            continue
        for line in block["lines"]:
            text = "".join(span["text"] for span in line["spans"]).strip()
            if text:
                x0, y0, x1, y1 = line["bbox"]
                result.append({"text": text, "x0": x0, "y0": y0, "x1": x1, "y1": y1})
    return result


def _find_page(doc, heading):
    for page in doc:
        for line in _lines(page):
            if line["text"] == heading and line["y0"] < 120:
                return page, line
    raise ValueError(f"見出し「{heading}」のページが見つかりません")


def _column_edges(lines, columns, heading_line):
    first = next(
        (l for l in lines if l["text"] == columns[0] and l["y0"] > heading_line["y0"]),
        None,
    )
    if first is None:
        raise ValueError(f"表の見出し「{columns[0]}」が見つかりません")
    edges = [first["x0"] - 3.5]
    for label in columns[1:]:
        found = next(
            (l for l in lines if l["text"] == label and abs(l["y0"] - first["y0"]) < 4),
            None,
        )
        if found is None:
            raise ValueError(f"表の見出し「{label}」が見つかりません")
        edges.append(found["x0"] - 3.5)
    return edges, first["y1"]


def _boundaries(page, header_bottom):
    """行の区切り線（y座標と、線が始まるx座標）と、縦罫線のx座標を返す。"""
    raw = []
    for drawing in page.get_drawings():
        for item in drawing["items"]:
            if item[0] != "l":
                continue
            a, b = item[1], item[2]
            if abs(a.y - b.y) < 0.01 and abs(a.x - b.x) > 0.2 and a.y > header_bottom:
                raw.append((a.y, min(a.x, b.x), max(a.x, b.x)))

    # 点線は小さな四角の連なりで描かれており、縦の点線罫線も細かい横線の集まりになる。
    # 同じ横位置に縦方向へ密集している短い線は縦罫線なので除く。
    vertical_xs = []
    if raw:
        height = max(y for y, _, _ in raw) - min(y for y, _, _ in raw) or 1.0
        density = {}
        for y, x0, x1 in raw:
            if x1 - x0 < 3:
                key = round((x0 + x1) / 2)
                density[key] = density.get(key, 0) + 1
        dense_keys = sorted(k for k, n in density.items() if n / height >= 0.5)
        for key in dense_keys:
            if vertical_xs and key - vertical_xs[-1][-1] <= 2:
                vertical_xs[-1].append(key)
            else:
                vertical_xs.append([key])
        vertical_xs = [sum(group) / len(group) for group in vertical_xs]
        raw = [
            (y, x0, x1)
            for y, x0, x1 in raw
            if x1 - x0 >= 3 or density[round((x0 + x1) / 2)] / height < 0.5
        ]
    raw.sort()

    clusters = []
    for y, x0, x1 in raw:
        if clusters and y - clusters[-1]["ys"][-1] < 1.5:
            cluster = clusters[-1]
            cluster["ys"].append(y)
            cluster["x0"] = min(cluster["x0"], x0)
            cluster["x1"] = max(cluster["x1"], x1)
        else:
            clusters.append({"ys": [y], "x0": x0, "x1": x1})

    # 角丸の枠など短い線は罫線ではないので除く
    clusters = [c for c in clusters if c["x1"] - c["x0"] >= 100]
    return [(sum(c["ys"]) / len(c["ys"]), c["x0"]) for c in clusters], vertical_xs


def _fills(page):
    fills = []
    for drawing in page.get_drawings():
        fill = drawing.get("fill")
        if not fill:
            continue
        if all(v > 0.97 for v in fill) or all(v < 0.03 for v in fill):
            continue
        rect = drawing["rect"]
        if rect.height > 200:
            continue
        fills.append((rect, fill))
    return fills


def _hex(color):
    return "#" + "".join(f"{round(v * 255):02x}" for v in color)


def _parse_section(doc, section):
    page, heading_line = _find_page(doc, section["heading"])
    lines = _lines(page)
    edges, header_bottom = _column_edges(lines, section["columns"], heading_line)
    boundaries, vertical_xs = _boundaries(page, header_bottom)
    # 列間の縦罫線が列数-1本見つかれば、見出し文字の位置（アイコン付きの見出しでずれる）より正確
    if len(vertical_xs) == len(section["columns"]) - 1:
        edges = [edges[0]] + [x - 1 for x in vertical_xs]
    if len(boundaries) < 2:
        raise ValueError(f"「{section['title']}」の表の罫線を読み取れませんでした")

    ys = [y for y, _ in boundaries]
    row_count = len(ys) - 1

    def level(x0):
        for j, edge in enumerate(edges):
            if edge >= x0 - 2:
                return j
        return len(edges) - 1

    row_levels = [level(boundaries[r][1]) for r in range(row_count)]

    column_count = len(edges)
    cells = [[[] for _ in range(row_count)] for _ in range(column_count)]
    for line in lines:
        yc = (line["y0"] + line["y1"]) / 2
        if yc <= ys[0] or yc >= ys[-1]:
            continue
        row = bisect_right(ys, yc) - 1
        col = max((j for j, edge in enumerate(edges) if line["x0"] >= edge), default=0)
        cells[col][row].append(line)

    # 結合セル: 罫線がその列まで届いていない行は、上の行と同じセルとして扱う
    values = [[""] * row_count for _ in range(column_count)]
    for col in range(column_count):
        start = 0
        for row in range(row_count + 1):
            if row == row_count or (row > 0 and row_levels[row] <= col):
                span_lines = [l for r in range(start, row) for l in cells[col][r]]
                span_lines.sort(key=lambda l: (round(l["y0"]), l["x0"]))
                text = "\n".join(l["text"] for l in span_lines)
                for r in range(start, row):
                    values[col][r] = text
                start = row

    fills = _fills(page)
    name_left = edges[section["name_col"]]

    def row_color(row):
        yc = (ys[row] + ys[row + 1]) / 2
        for rect, fill in fills:
            if rect.y0 <= yc <= rect.y1 and rect.x0 < name_left + 5 and rect.x1 > name_left + 20:
                return _hex(fill)
        return None

    def clean(text):
        for old, new in TEXT_FIXES.items():
            text = text.replace(old, new)
        return text

    groups = []
    for row in range(row_count):
        group = clean(values[section["group_col"]][row].replace("\n", " ")).strip()
        sub = clean(values[section["sub_col"]][row].replace("\n", " ")).strip()
        name = clean(values[section["name_col"]][row]).strip()
        qty = values[section["qty_col"]][row].strip() if section["qty_col"] is not None else ""
        if not name or group in section["skip_groups"]:
            continue

        if not groups or groups[-1]["name"] != group:
            groups.append({"name": group, "items": []})

        names = split_names(name)
        if len(names) > 1:
            qty = qty.removeprefix("各")  # 「各1」は分けた各項目が1台ずつという意味
        bg = row_color(row)
        for single in names:
            groups[-1]["items"].append(
                {
                    "id": "|".join([section["id"], group, sub, single]),
                    "sub": sub,
                    "name": single,
                    "qty": qty,
                    "bg": bg,
                    "unavailable": "メンテナンス" in f"{sub}{single}",
                }
            )

    last_update = None
    match = re.search(r"Last Update[：:]\s*(\S+)", page.get_text())
    if match:
        last_update = match.group(1)

    return {
        "id": section["id"],
        "title": section["title"],
        "lastUpdate": last_update,
        "groups": groups,
    }


def parse_equipment(pdf_bytes):
    doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
    return {
        "source": PDF_URL,
        "fetchedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "sections": [_parse_section(doc, section) for section in SECTIONS],
    }


def _save_cache(data):
    CACHE_FILE.parent.mkdir(exist_ok=True)
    temp = CACHE_FILE.with_suffix(".tmp")
    temp.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    os.replace(temp, CACHE_FILE)


def _load_cache():
    try:
        return json.loads(CACHE_FILE.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None


def fetch_equipment():
    """最新のPDFから機材リストを作る。失敗したときは、直近に成功したリストを stale=True で返す。"""
    try:
        data = parse_equipment(download_pdf())
        # 表の形式が変わって中身が空になった結果で、正常なキャッシュを上書きしない
        if any(not any(group["items"] for group in section["groups"]) for section in data["sections"]):
            raise ValueError("機材リストの項目を読み取れませんでした")
    except Exception as error:
        cached = _load_cache()
        if cached is None:
            raise
        cached["stale"] = True
        cached["error"] = str(error)
        return cached

    _save_cache(data)
    return data
