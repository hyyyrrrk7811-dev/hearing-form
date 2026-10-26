"""機材リストのPDFを取得して、docs/data/equipments.json を更新する。

GitHub Actions が毎日1回実行する（.github/workflows/deploy.yml）。パソコンでも実行できる:
    python tools/update_equipment.py

- 成功: 最新の内容で書き換える（stale=false）
- 失敗: 前回の内容を残したまま stale=true にして、終了コード1で終わる
        （画面に「最新版の読み込みにエラーが出たため、暫定で直近のリストを表示しています。」と出る）
"""

import json
import sys
from pathlib import Path

import equipment_parser

OUTPUT = Path(__file__).resolve().parent.parent / "docs" / "data" / "equipments.json"


def write(data):
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def main():
    try:
        data = equipment_parser.parse_equipment(equipment_parser.download_pdf())
        # 表の形式が変わって項目が空に読めた結果で、正常なリストを上書きしない
        if any(not any(group["items"] for group in section["groups"]) for section in data["sections"]):
            raise ValueError("機材リストの項目を読み取れませんでした")
    except Exception as error:
        print(f"::error::機材リストを更新できませんでした: {error}")
        if not OUTPUT.exists():
            return 1
        previous = json.loads(OUTPUT.read_text(encoding="utf-8"))
        previous["stale"] = True
        previous["error"] = str(error)[:300]
        write(previous)
        return 1

    data["stale"] = False
    write(data)
    count = sum(len(g["items"]) for s in data["sections"] for g in s["groups"])
    print(f"機材リストを更新しました（{count}件）: {OUTPUT}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
