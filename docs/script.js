(() => {
  const STORAGE_KEY = "recordingHearingForm";

  // 提携エンジニア（出典: https://www.applevinegarmusicsupport.com/mif/ ）
  const engineerProfiles = [
    {
      "photo": "engineers/koga.jpg",
      "name": "古賀 健一",
      "role": "レコーディングエンジニア / Xylomania Studio LLC 代表",
      "bio": "福岡県出身のレコーディングエンジニア、Xylomania Studio LLC CEO。\n2005年青葉台スタジオに入社、2014年フリーエンジニアとして独立後、Xylomania Studioを設立。最先端の立体音響の制作を手掛け、スタジオ造りやホームシアターのコンサルティングも多数行う。\n世界有数の11.2.6.4chスピーカー設備を備えたスタジオでDolby AtmosやSony 360 Reality Audioの技術を活用し、ASIAN KUNG-FU GENERATION、Ado、Official髭男dismなど、多くのアーティストの楽曲に携わる。\nまた、映画音楽やミュージカル、クラシックの分野でもその技術を発揮している。\n日本酒と城を愛し、酒蔵巡りを楽しむ一面も。音楽と音響の新たな可能性を追求し続けるエンジニアである。"
    },
    {
      "photo": "engineers/iwatani.jpg",
      "name": "岩谷 啓士郎",
      "role": "レコーディング、PAエンジニア/Safe & Sound LLC代表",
      "bio": "熊本県出身、2001年に都内スタジオにてキャリアをスタート。\nLOSTAGE、トクマルシューゴなど、特にインディペンデントなアーティストとの関わりが深い。\nギタリストでもあり、エンジニアとプレイヤー、レコーディングとライヴの両方で得た視点と経験を活かし、様々なアプローチを提案。\nPAとしては国内主要ライブ会場/フェスや、アメリカ、ヨーロッパ、オーストラリア、アジア諸国への海外ツアーなども経験。2026年より相愛大学非常勤講師に就任。\nGotchさんをはじめとして、関わってくださる皆さんの沢山の想いが詰まったMUSIC inn Fujieda、ここからまた続いていく音楽とそれにまつわる文化の歴史の一助になれれば幸いです。"
    },
    {
      "photo": "engineers/yoshii.jpg",
      "name": "吉井 大希",
      "role": "エンジニア",
      "bio": "楽曲提供・DTM作曲講師・ボイトレ講師を主な業務とし、都内のレコーディングスタジオ、Xylomania Studioでアシスタントとしてもサポート。Dolby AtmosやSony 360RAの立体音響の楽曲制作にも携わり、自身の作品も配信中。バンド活動も行い、制作から演奏まで様々な形で音楽に携わってきた。\n大阪府出身だが幼少期はアメリカで育ち、サラリーマン時代には静岡県の茶畑の隣に住んでいた。しかし好きな食べ物はピザと餃子。動画制作にも取り組み、アーティストのプロモーションに繋がる映像制作も行なう。趣味は有名人でなくともSNSでバズる動画制作の研究で、自身のSNSで実験・実証を行なっている。幅広くサポートできる便利屋・マルチプレイヤー・エンジニアとして、技術をこれからも追求していく。"
    },
    {
      "photo": "engineers/iguchi.jpg",
      "name": "井口 風温",
      "role": "アシスタントエンジニア",
      "bio": "1999年 静岡県静岡市に出生。学生時代の全てを静岡で過ごす。大学3年次に結成したオリジナルバンド「いえろうさぶまりん」にて、人生初のレコーディング経験。同時期に出会った海外バンドの楽曲に衝撃を受け、「アレンジがシンプルで音数が少なくても、音が良ければ人を感動させられる」と確信を得る。そこから録音や音楽制作の面白さに目覚め、独学でレコーディング・ミックス・マスタリングなどを追求。バンドではベーシストとして活動し、作詞・作曲・編曲・ボーカルを担当することも。\n大学では音楽教育を専攻しており、教員免許取得を通じて得た知見を生かし、次世代の創作活動を支える。レコーディングの歴史や、機材の扱い方については、日々勉強中。"
    }
  ];

  const questions = [
    {
      id: "email",
      type: "text",
      inputType: "email",
      title: "メールアドレス",
      required: true,
      example: "taro.yamada@example.com",
    },
    {
      id: "guideConfirmed",
      type: "single-checkbox",
      title: "レコーディングの手引きを確認しましたか？",
      description: "事前にお送りした手引きの内容をご確認のうえ、チェックしてください。",
      required: true,
      label: "内容を確認した",
      link: {
        url: "https://booking.applevinegar-ms.com/guide",
        label: "レコーディングの手引きを見る",
      },
    },
    {
      id: "bandName",
      type: "text",
      title: "バンド名",
      required: true,
      example: "Fujieda Band",
    },
    {
      id: "members",
      type: "textarea",
      title: "メンバー名・担当楽器",
      description: "ボーカル・ギターなど、担当楽器も合わせてご記入ください。",
      required: true,
      example: "山田太郎（Vo/Gt）\n鈴木花子（Ba）\n佐藤次郎（Dr）",
    },
    {
      id: "sns",
      type: "multi-text",
      addLabel: "さらに追加する",
      title: "SNSリンク",
      description: "バンドのSNSアカウントがあれば教えてください（任意）。複数ある場合は「さらに追加する」で増やせます。",
      required: false,
      example: "https://www.instagram.com/xxxxxxxx",
    },
    {
      id: "songInfo",
      type: "song-list",
      addLabel: "曲を追加する",
      title: "楽曲情報（曲名 / BPM / 拍子 / キー）",
      description: "分かる範囲で構いません。決まっていたら録音順で入力してください。",
      required: false,
      songFields: [
        { key: "title", label: "曲名", example: "夏の残響" },
        { key: "bpm", label: "BPM", example: "140", inputMode: "numeric" },
        { key: "meter", label: "拍子（曲中で変更ある場合は全て記入）", example: "4/4（サビ：6/8）" },
        { key: "key", label: "Key（分かれば）", example: "E" },
      ],
    },
    {
      id: "recordingInstruments",
      type: "song-instruments",
      addLabel: "さらに追加する",
      title: "曲ごとの録音楽器",
      description: "各曲でどの楽器を録音するか選んでください。6ページ目で入力した曲が録音順に表示されます。一覧にない楽器は「Other」を選ぶと自由に入力できます。",
      required: true,
      instruments: [
        "Vocal",
        "E Guitar",
        "Acoustic Guitar",
        "E Bass",
        "Drum",
        "Hamo/Chorus",
        "Key",
        "Other",
      ],
    },
    {
      id: "rentalNeeds",
      type: "equipment-picker",
      title: "機材レンタルのご希望",
      description:
        "レンタルしたい機材にチェックを入れてください。機材リストは最新の内容を自動で読み込んでいます。当日に追加や変更で選んでいただくこともできますが、大きな機材などは少しお時間いただきます。\n※リスト内のオレンジ背景の機材はヴィンテージ機材録音パックで利用可能です。ヴィンテージ機材録音パック：3,300円（税込）",
      required: true,
      groupNotes: {
        Piano: "※ピアノの調律は16,500円で承ります（事前にご相談ください）",
      },
      noteLabel: "その他のご希望・お任せ",
      noteHint: "分からない場合は「ドラム：お任せ」などでご記入ください。",
      example: "ドラム：お任せ",
    },
    {
      id: "ownEquipment",
      type: "textarea",
      title: "持ち込み機材",
      description: "持ち込み予定の機材を項目ごとにご記入ください。",
      required: true,
      example: "エレキギター×2\nベース×1\nスネアドラム×1\nシンバル一式",
    },
    {
      id: "drumToms",
      type: "text",
      title: "ドラムのタム構成",
      required: true,
      example: "ハイタム1個、フロアタム1個（計2個）",
    },
    {
      id: "recordingMethod",
      type: "song-methods",
      title: "録音方法のご希望",
      description:
        "各曲の録音方法を選んでください（「同時録音」と「個別」は両方選べます）。6ページ目で入力した曲が録音順に表示されます。同時録音（3ブース）の場合は、下記の組み合わせから選んでください。「個別」を選ぶと、7ページ目で選んだ楽器の中から、個別に録音するものを選べます。録音方法は「コピー」して、他の曲に「ペースト」できます。\n※ボーカルは原則個別で録ります。同時録音を希望したい場合、いくつかの制約が発生するため、ご了承ください",
      required: true,
      simultaneousOptions: [
        "ドラム・ギター・ベース",
        "ドラム・ギター・ギター",
        "ドラム・ギター・アコギ",
        "ドラム・ベース・アコギ",
        "ギター・ギター",
        "ギター・ベース",
      ],
    },
    {
      id: "demoAudio",
      type: "song-links",
      title: "デモ音源",
      description:
        "デモ音源がありましたらギガファイル便やDropboxやGoogle Driveなどのリンクを貼ってください。なければYoutubeなどでライブ音源など、どんな曲か確認できるもの共有ください。音源等がない場合は空白で大丈夫です。",
      required: false,
      example: "https://youtu.be/xxxxxxxxxxx",
    },
    {
      id: "deliveryMethod",
      type: "radio-other",
      title: "録音データのお渡し方法",
      description:
        "データのお渡し方法はお客様でSSDを持ち込んでいただき、そこにコピーを取ることを推奨しています\nSSDがない場合はHDDも可能、容量としては１曲あたり10GBほどを目安にするとよいです。\nギガファイル便などにアップロードも可能ですが、時間がかかります(1曲15分程度)ので、早めにレコーディングを終了すること、ご了承くださいませ。\nデータは基本的にスタジオには保存しませんので外部エンジニアにお渡しする際はご注意ください。\n\n※スタジオのPCはMacです。製品によっては古いOSにしか対応していないハードディスクもございますのでご注意ください。",
      required: true,
      otherPlaceholder: "お渡し方法を入力してください",
      options: [
        { value: "持ち込みSSDへコピー", note: "(Windows専用にフォーマットされたものは不可)" },
        { value: "持ち込みHDDへコピー", note: "(Windows専用にフォーマットされたものは不可)" },
        { value: "ギガファイル便にアップロード" },
        { value: "その他", label: "その他：", withText: true },
      ],
    },
    {
      id: "editingServices",
      type: "radio-other",
      title: "エディット・ミックス・マスタリングの有無",
      description:
        "エディット・ミックス・マスタリングをどこに依頼されるか、共有くださいませ\n**エディット・ミックス・マスタリングは原則持ち帰り作業となります。**\nレコーディングが早く終わり、時間が余った場合などはエディット作業をさせていただきます。\n※吉井以外の料金はその都度お問い合わせをお願い致します",
      profiles: { heading: "提携エンジニア", people: engineerProfiles },
      required: true,
      options: [
        { value: "依頼するエンジニアを決めている (他で決めている)" },
        { value: "特に決まっていない" },
        { value: "古賀 健一", note: "料金：お問い合わせください" },
        { value: "岩谷 啓士郎", note: "料金：お問い合わせください" },
        {
          value: "吉井 大希",
          note: "①（1700円+税/h）で作業させていただきます。エディット・ミックス・マスタリングまでで１曲大体 20000円〜30000円+税ほどになることが多いです\n②それ以上かかる場合は事前に相談させていただきます（1700円+税/h）\n③曲数にもよりますが、最初の納品まで１ヶ月ほどのお時間をいただきたいです\nそこから修正や変更が必要な場合は追加でお時間をいただきますので、リリース日や配信日には余裕を持ってスケジュールをお取りくださいませ。",
        },
        { value: "井口 風温", note: "料金：お問い合わせください" },
        {
          value: "相談したい",
          withText: true,
          textOptional: true,
          placeholder: "ご相談内容があればご記入ください（任意）",
        },
      ],
    },
    {
      id: "videoShooting",
      type: "radio-other",
      title: "動画撮影・SNS投稿について",
      description:
        "エンジニア吉井がスタジオの宣伝用として動画を撮影させていただくことがございます。SNSにて投稿させていただくことは問題ございませんでしょうか？\n\n※撮れないこともあります\n\n▼参考インスタグラム",
      link: {
        url: "https://www.instagram.com/hanna_zonnne/",
        label: "ここから飛べます",
      },
      required: true,
      otherPlaceholder: "ご希望の内容を入力してください",
      options: [
        { value: "撮影・投稿 OK" },
        { value: "動画完成後に内容を事前共有してからなら OK" },
        { value: "モザイクありならOK (事前共有もあり)" },
        { value: "ごめんなさい撮影・投稿 NGです" },
        { value: "撮っといてレコーディング終わりに決めたい" },
        { value: "その他", withText: true },
      ],
    },
  ];

  const totalSteps = questions.length;

  let state = {
    step: 0,
    maxStep: 0,
    answers: {},
  };

  const el = {
    container: document.getElementById("question-container"),
    progressFill: document.getElementById("progress-fill"),
    progressCurrent: document.getElementById("progress-current"),
    progressTotal: document.getElementById("progress-total"),
    btnPrev: document.getElementById("btn-prev"),
    btnNext: document.getElementById("btn-next"),
    btnSave: document.getElementById("btn-save"),
    saveToast: document.getElementById("save-toast"),
    resumeBanner: document.getElementById("resume-banner"),
    resumeContinue: document.getElementById("resume-continue"),
    resumeRestart: document.getElementById("resume-restart"),
    tocList: document.getElementById("toc-list"),
    footer: document.querySelector(".app-footer"),
  };

  el.progressTotal.textContent = totalSteps + 1;

  // ---------- 保存（サーバー + ブラウザの控え） ----------
  // 回答ページのURL（?r=<ID>&p=<ページ番号>）を保存しておけば、別の端末・後日でも、そのページから続きを回答できる。
  // 回答はサーバーに自動保存し、通信できないときに備えてブラウザにも控えを持つ。

  const RESEND_NOTE =
    "また、回答内容に変更がある場合は再度送信してください。このページを保存しておけば部分的に修正して再送信できます。";
  const DRAFT_ID_PATTERN = /^[A-Za-z0-9_-]{22,64}$/;

  let draftId = null;
  let saveTimer = null;
  let savePromise = Promise.resolve(true);
  let saveWarned = false;

  function newDraftId() {
    const bytes = crypto.getRandomValues(new Uint8Array(24));
    return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function loadSaved() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function localSave() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, draftId }));
    } catch (e) {
      /* ブラウザの保存が使えなくてもサーバー保存で続けられる */
    }
  }

  // ---------- サーバーとの通信 ----------
  // 画面は静的なページとして公開し、保存とメール送信は Google Apps Script が受け持つ（config.js の apiUrl）。
  // 本文を text/plain で送ると、ブラウザの事前確認（CORSのpreflight）が要らず、Apps Script と通信できる。

  const API_URL = (window.APP_CONFIG && window.APP_CONFIG.apiUrl) || "api";

  function apiBody(action, payload) {
    return JSON.stringify({ action, ...payload });
  }

  async function callApi(action, payload = {}) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: apiBody(action, payload),
    });
    let data;
    try {
      data = await response.json();
    } catch (e) {
      // JSONでない応答（公開設定の間違いで Google のログイン画面が返った、など）は、通信の失敗として扱う
      throw new TypeError("invalid response");
    }
    if (!data.ok) throw new Error(data.error || "通信に失敗しました。");
    return data;
  }

  function draftPayload() {
    return { id: draftId, step: state.step, maxStep: state.maxStep ?? 0, answers: state.answers };
  }

  async function sendDraft() {
    if (!draftId) return true;
    try {
      await callApi("saveDraft", draftPayload());
      saveWarned = false;
      return true;
    } catch (error) {
      if (!saveWarned) {
        saveWarned = true;
        showToast("通信できないため、この端末にのみ保存しています", 3500);
      }
      return false;
    }
  }

  function flushSave() {
    clearTimeout(saveTimer);
    savePromise = savePromise.then(sendDraft);
    return savePromise;
  }

  function scheduleServerSave(delay) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flushSave, delay);
  }

  function persist() {
    localSave();
    scheduleServerSave(0);
  }

  function persistSoon() {
    localSave();
    scheduleServerSave(1000);
  }

  function clearSaved() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      /* 何もしない */
    }
  }

  function syncUrl() {
    if (!draftId) return;
    const url = new URL(window.location.href);
    url.searchParams.set("r", draftId);
    url.searchParams.set("p", String(state.step + 1));
    history.replaceState(null, "", url);
  }

  function showToast(message, duration = 1800) {
    el.saveToast.textContent = message;
    el.saveToast.hidden = false;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      el.saveToast.hidden = true;
    }, duration);
  }

  function examplePlaceholder(q) {
    return q.example ? `例）${q.example}` : "";
  }

  function multiTextRow(q, value) {
    return `
      <div class="multi-text__row">
        <input type="text" class="multi-text__input" value="${escapeHtml(value)}" placeholder="${escapeHtml(examplePlaceholder(q))}">
        <button type="button" class="multi-text__remove" aria-label="この項目を削除">×</button>
      </div>`;
  }

  // ---------- 機材リスト（PDFから自動取得） ----------

  const equipmentIndex = new Map();
  let equipmentData = null;

  function safeColor(color) {
    return /^#[0-9a-f]{6}$/i.test(color || "") ? color : "";
  }

  function equipmentItem(section, group, item, checkedIds) {
    equipmentIndex.set(item.id, {
      id: item.id,
      section: section.title,
      group: group.name,
      sub: item.sub,
      name: item.name,
      qty: item.qty,
      bg: item.bg || null,
    });
    const bg = safeColor(item.bg);
    return `
      <label class="equip__item${item.unavailable ? " is-unavailable" : ""}" ${bg ? `style="background:${bg}"` : ""}>
        <input type="checkbox" data-id="${escapeHtml(item.id)}" ${checkedIds.has(item.id) ? "checked" : ""} ${item.unavailable ? "disabled" : ""}>
        <span class="equip__text">
          ${item.sub ? `<span class="equip__sub">${escapeHtml(item.sub)}</span>` : ""}
          <span class="equip__name">${escapeHtml(item.name)}</span>
        </span>
        ${item.qty ? `<span class="equip__qty">${escapeHtml(item.qty)}</span>` : ""}
      </label>`;
  }

  function equipmentMarkup(data, checkedIds, groupNotes = {}) {
    equipmentIndex.clear();
    return data.sections
      .map(
        (section, i) => `
        <details class="equip__section" ${i === 0 ? "open" : ""}>
          <summary class="equip__summary">
            <span class="equip__section-title">${escapeHtml(section.title)}</span>
            <span class="equip__count" data-section="${escapeHtml(section.title)}"></span>
          </summary>
          ${section.groups
            .map(
              (group) => `
            <div class="equip__group">
              ${group.name ? `<h3 class="equip__group-title">${escapeHtml(group.name)}</h3>` : ""}
              ${groupNotes[group.name] ? `<p class="equip__group-note">${escapeHtml(groupNotes[group.name])}</p>` : ""}
              ${group.items.map((item) => equipmentItem(section, group, item, checkedIds)).join("")}
            </div>`
            )
            .join("")}
        </details>`
      )
      .join("");
  }

  function updateEquipmentCounts(root) {
    const counts = {};
    root.querySelectorAll("input[data-id]:checked").forEach((input) => {
      const entry = equipmentIndex.get(input.dataset.id);
      if (entry) counts[entry.section] = (counts[entry.section] || 0) + 1;
    });
    root.querySelectorAll(".equip__count").forEach((span) => {
      const n = counts[span.dataset.section] || 0;
      span.textContent = n ? `${n}件選択中` : "";
    });
  }

  async function loadEquipment(q, { force = false } = {}) {
    const root = document.getElementById(`field-${q.id}`);
    const body = root.querySelector(".equip__body");
    const saved = state.answers[q.id];
    const checkedIds = new Set((saved && saved.selected ? saved.selected : []).map((s) => s.id));

    const show = (data) => {
      if (!root.isConnected) return;
      const notice = data.stale
        ? `<p class="equip__status equip__status--warn">
             最新版の読み込みにエラーが出たため、暫定で直近のリストを表示しています。
             <button type="button" class="equip__retry equip__retry--inline">もう一度読み込む</button>
           </p>`
        : "";
      body.innerHTML = notice + equipmentMarkup(data, checkedIds, q.groupNotes);
      root.dataset.loaded = "1";
      updateEquipmentCounts(root);
    };

    if (force) equipmentData = null;
    if (equipmentData) {
      show(equipmentData);
      return;
    }

    body.innerHTML = '<p class="equip__status">機材リストを読み込み中…</p>';
    try {
      // 機材リストはPDFから自動で作られる静的ファイル（GitHub Actions が定期的に更新する）
      const response = await fetch("data/equipments.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      // 更新が3日以上止まっているときも、「暫定で直近のリストを表示」の注意書きを出す
      const ageHours = (Date.now() - new Date(data.fetchedAt).getTime()) / 3600000;
      if (!(ageHours < 72)) data.stale = true;
      equipmentData = data;
      show(data);
    } catch (error) {
      if (!root.isConnected) return;
      body.innerHTML = `
        <p class="equip__status equip__status--error">機材リストを読み込めませんでした。下の欄に希望の機材を直接ご記入ください。</p>
        <button type="button" class="multi-text__add equip__retry">もう一度読み込む</button>`;
    }
  }

  // ---------- 録音方法（曲ごと） ----------

  let methodClipboard = null;

  function songIds() {
    const songs = Array.isArray(state.answers.songInfo) ? state.answers.songInfo.filter((song) => song.id) : [];
    return songs.length ? songs.map((song) => song.id) : ["_none"];
  }

  function songInstrumentLabels(songId) {
    const entry = (Array.isArray(state.answers.recordingInstruments) ? state.answers.recordingInstruments : []).find(
      (item) => item.id === songId
    );
    const labels = (entry ? entry.instruments : []).map((inst) =>
      inst.name === "Other" && inst.other ? `Other（${inst.other}）` : inst.name
    );
    return [...new Set(labels)];
  }

  function recSongCard(q, song, index, saved) {
    const current = {
      methods: saved ? saved.methods ?? (saved.method ? [saved.method] : []) : [],
      simultaneous: saved?.simultaneous ?? "",
      individualAll: Boolean(saved?.individualAll),
      individual: saved?.individual ?? [],
    };
    const labels = songInstrumentLabels(song.id);
    const input = (type, role, name, value, checked, extra = "") => `
      <label class="option">
        <input type="${type}" data-role="${role}" ${name ? `name="${name}"` : ""} value="${escapeHtml(value)}" ${checked ? "checked" : ""} ${extra}>
        <span class="option__text">${escapeHtml(value)}</span>
      </label>`;
    const has = (method) => current.methods.includes(method);

    return `
      <div class="rec-song" data-id="${escapeHtml(song.id)}" data-title="${escapeHtml(song.title || "")}">
        <div class="rec-song__head">
          <p class="inst-song__title">
            <span class="inst-song__number">${index + 1}曲目</span>
            <span class="inst-song__name">${escapeHtml(song.title || "（曲名未入力）")}</span>
          </p>
          <div class="rec-song__tools">
            <button type="button" class="rec-tool rec-copy">コピー</button>
            <button type="button" class="rec-tool rec-paste" ${methodClipboard ? "" : "disabled"}>ペースト</button>
          </div>
        </div>
        <div class="options">
          ${input("checkbox", "method", "", "同時録音", has("同時録音"), has("スタッフにお任せ") ? "disabled" : "")}
          <div class="rec-sub" data-for="同時録音" ${has("同時録音") ? "" : "hidden"}>
            <p class="rec-sub__label">同時録音の組み合わせ</p>
            <div class="options">
              ${q.simultaneousOptions.map((o) => input("radio", "combo", `rec-${song.id}-combo`, o, current.simultaneous === o)).join("")}
            </div>
          </div>
          ${input("checkbox", "method", "", "個別", has("個別"), has("スタッフにお任せ") ? "disabled" : "")}
          <div class="rec-sub" data-for="個別" ${has("個別") ? "" : "hidden"}>
            <p class="rec-sub__label">個別に録音するもの</p>
            <div class="options">
              ${input("checkbox", "indiv-all", "", "同時録音するもの以外は個別", current.individualAll)}
              ${labels.map((label) => input("checkbox", "indiv", "", label, current.individual.includes(label), current.individualAll ? "disabled" : "")).join("")}
            </div>
            ${labels.length ? "" : '<p class="rec-sub__empty">7ページ目で、この曲の楽器が選ばれていません。</p>'}
          </div>
          ${input("checkbox", "method", "", "スタッフにお任せ", has("スタッフにお任せ"))}
        </div>
      </div>`;
  }

  function readMethodCard(card) {
    const methods = [...card.querySelectorAll('[data-role="method"]:checked')].map((box) => box.value);
    const individual = methods.includes("個別");
    const all = individual && Boolean(card.querySelector('[data-role="indiv-all"]:checked'));
    return {
      methods,
      simultaneous: methods.includes("同時録音") ? card.querySelector('[data-role="combo"]:checked')?.value || "" : "",
      individualAll: all,
      individual:
        individual && !all ? [...card.querySelectorAll('[data-role="indiv"]:checked')].map((box) => box.value) : [],
    };
  }

  // 「同時録音するもの以外は個別」を選んだら、楽器の個別選択は不要なので無効にする
  function syncIndividual(card) {
    const all = Boolean(card.querySelector('[data-role="indiv-all"]:checked'));
    card.querySelectorAll('[data-role="indiv"]').forEach((box) => {
      box.disabled = all;
      if (all) box.checked = false;
    });
  }

  function syncMethodSubs(card) {
    // 「スタッフにお任せ」を選んだら、他の録音方法は選べなくする（外すと選べる）
    const omakase = card.querySelector('[data-role="method"][value="スタッフにお任せ"]');
    card.querySelectorAll('[data-role="method"]').forEach((box) => {
      if (box === omakase) return;
      box.disabled = omakase.checked;
      if (omakase.checked) box.checked = false;
    });
    const methods = [...card.querySelectorAll('[data-role="method"]:checked')].map((box) => box.value);
    card.querySelectorAll(".rec-sub").forEach((sub) => {
      sub.hidden = !methods.includes(sub.dataset.for);
    });
    syncIndividual(card);
  }

  function applyMethodCard(card, data) {
    card.querySelectorAll('[data-role="method"]').forEach((box) => (box.checked = data.methods.includes(box.value)));
    card.querySelectorAll('[data-role="combo"]').forEach(
      (radio) => (radio.checked = data.methods.includes("同時録音") && radio.value === data.simultaneous)
    );
    card.querySelectorAll('[data-role="indiv-all"]').forEach(
      (box) => (box.checked = data.methods.includes("個別") && data.individualAll)
    );
    card.querySelectorAll('[data-role="indiv"]').forEach(
      (box) => (box.checked = data.methods.includes("個別") && data.individual.includes(box.value))
    );
    syncMethodSubs(card);
  }

  function newId() {
    return `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  }

  function instRow(q, inst = {}) {
    const options = q.instruments
      .map((name) => `<option value="${escapeHtml(name)}" ${inst.name === name ? "selected" : ""}>${escapeHtml(name)}</option>`)
      .join("");
    return `
      <div class="inst__row">
        <select class="inst__select">
          <option value="">楽器を選択</option>
          ${options}
        </select>
        <input type="text" class="inst__other" placeholder="楽器名を入力" value="${escapeHtml(inst.other ?? "")}" ${inst.name === "Other" ? "" : "hidden"}>
        <button type="button" class="inst__remove" aria-label="この楽器を削除">×</button>
      </div>`;
  }

  function instSongCard(q, song, index, saved) {
    const instruments = saved?.instruments?.length ? saved.instruments : [{}];
    return `
      <div class="inst-song" data-id="${escapeHtml(song.id)}" data-title="${escapeHtml(song.title || "")}">
        <p class="inst-song__title">
          <span class="inst-song__number">${index + 1}曲目</span>
          <span class="inst-song__name">${escapeHtml(song.title || "（曲名未入力）")}</span>
        </p>
        <div class="inst__rows">${instruments.map((inst) => instRow(q, inst)).join("")}</div>
        <button type="button" class="multi-text__add inst__add">＋ ${escapeHtml(q.addLabel)}</button>
      </div>`;
  }

  function songCard(q, song = {}) {
    const fields = q.songFields
      .map(
        (f) => `
        <label class="song__field">
          <span class="song__label">${escapeHtml(f.label)}</span>
          <input type="text" class="song__input" data-key="${f.key}"
            ${f.inputMode ? `inputmode="${f.inputMode}"` : ""}
            value="${escapeHtml(song[f.key] ?? "")}" placeholder="例）${escapeHtml(f.example)}">
        </label>`
      )
      .join("");

    return `
      <div class="song" data-id="${escapeHtml(song.id || newId())}">
        <div class="song__head">
          <span class="song__number"></span>
          <div class="song__tools">
            <button type="button" class="song__btn song__up" aria-label="1つ上へ">↑</button>
            <button type="button" class="song__btn song__down" aria-label="1つ下へ">↓</button>
            <button type="button" class="song__btn song__remove" aria-label="この曲を削除">×</button>
          </div>
        </div>
        ${fields}
      </div>`;
  }

  function renumberSongs(list) {
    const cards = [...list.querySelectorAll(".song")];
    cards.forEach((card, i) => {
      card.querySelector(".song__number").textContent = `${i + 1}曲目`;
      card.querySelector(".song__up").disabled = i === 0;
      card.querySelector(".song__down").disabled = i === cards.length - 1;
    });
  }

  function fieldMarkup(q) {
    const value = state.answers[q.id] ?? "";

    if (q.type === "song-list") {
      const songs = Array.isArray(value) && value.length ? value : [{}];
      return `
        <div class="song-list" id="field-${q.id}" data-question="${q.id}">
          <div class="song-list__items">${songs.map((s) => songCard(q, s)).join("")}</div>
          <button type="button" class="multi-text__add song-list__add">＋ ${escapeHtml(q.addLabel || "追加する")}</button>
        </div>`;
    }

    if (q.type === "equipment-picker") {
      const note = typeof value === "string" ? value : value.note ?? "";
      return `
        <div class="equip" id="field-${q.id}" data-question="${q.id}" data-loaded="0">
          <label class="equip__note">
            <span class="song__label">${escapeHtml(q.noteLabel)}</span>
            <span class="equip__hint">${escapeHtml(q.noteHint)}</span>
            <textarea class="equip__note-input" placeholder="${escapeHtml(examplePlaceholder(q))}">${escapeHtml(note)}</textarea>
          </label>
          <div class="equip__body"></div>
        </div>`;
    }

    if (q.type === "song-links") {
      const songs = Array.isArray(state.answers.songInfo) ? state.answers.songInfo.filter((song) => song.id) : [];
      const saved = Array.isArray(value) ? value : [];
      const list = songs.length ? songs : [{ id: "_none", title: "" }];
      return `
        <div class="link-list" id="field-${q.id}" data-question="${q.id}">
          ${songs.length ? "" : '<p class="inst-list__note">6ページ目で曲を入力すると、ここに曲ごとに表示されます。</p>'}
          ${list
            .map(
              (song, i) => `
            <div class="link-song" data-id="${escapeHtml(song.id)}" data-title="${escapeHtml(song.title || "")}">
              <p class="inst-song__title">
                <span class="inst-song__number">${i + 1}曲目</span>
                <span class="inst-song__name">${escapeHtml(song.title || "（曲名未入力）")}</span>
              </p>
              <input type="text" inputmode="url" class="link-song__input" autocomplete="off"
                value="${escapeHtml(saved.find((item) => item.id === song.id)?.url ?? "")}"
                placeholder="${escapeHtml(examplePlaceholder(q))}">
            </div>`
            )
            .join("")}
        </div>`;
    }

    if (q.type === "song-methods") {
      const songs = Array.isArray(state.answers.songInfo) ? state.answers.songInfo.filter((song) => song.id) : [];
      const saved = Array.isArray(value) ? value : [];
      const list = songs.length ? songs : [{ id: "_none", title: "" }];
      return `
        <div class="rec-list" id="field-${q.id}" data-question="${q.id}">
          ${songs.length ? "" : '<p class="inst-list__note">6ページ目で曲を入力すると、ここに曲ごとに表示されます。曲を入力しない場合は、まとめて選択してください。</p>'}
          ${list.map((song, i) => recSongCard(q, song, i, saved.find((item) => item.id === song.id))).join("")}
        </div>`;
    }

    if (q.type === "song-instruments") {
      const songs = Array.isArray(state.answers.songInfo) ? state.answers.songInfo.filter((s) => s.id) : [];
      const saved = Array.isArray(value) ? value : [];
      const list = songs.length ? songs : [{ id: "_none", title: "" }];
      return `
        <div class="inst-list" id="field-${q.id}" data-question="${q.id}">
          ${songs.length ? "" : '<p class="inst-list__note">6ページ目で曲を入力すると、ここに曲ごとに表示されます。曲を入力しない場合は、まとめて選択してください。</p>'}
          ${list.map((song, i) => instSongCard(q, song, i, saved.find((s) => s.id === song.id))).join("")}
        </div>`;
    }

    if (q.type === "multi-text") {
      const values = Array.isArray(value) ? value : value ? [value] : [];
      const rows = values.length ? values : [""];
      return `
        <div class="multi-text" id="field-${q.id}" data-question="${q.id}">
          <div class="multi-text__rows">${rows.map((v) => multiTextRow(q, v)).join("")}</div>
          <button type="button" class="multi-text__add">＋ ${escapeHtml(q.addLabel || "さらに追加する")}</button>
        </div>`;
    }

    if (q.type === "text") {
      return `<input type="${q.inputType || "text"}" id="field-${q.id}" name="${q.id}"
        value="${escapeHtml(value)}" placeholder="${escapeHtml(examplePlaceholder(q))}">`;
    }

    if (q.type === "textarea") {
      return `<textarea id="field-${q.id}" name="${q.id}" placeholder="${escapeHtml(examplePlaceholder(q))}">${escapeHtml(value)}</textarea>`;
    }

    if (q.type === "single-checkbox") {
      const checked = value === true ? "checked" : "";
      return `
        <label class="option">
          <input type="checkbox" id="field-${q.id}" name="${q.id}" ${checked}>
          <span class="option__text">${escapeHtml(q.label)}</span>
        </label>`;
    }

    if (q.type === "radio-other") {
      const current = typeof value === "object" ? value : { choice: value, other: "" };
      return `
        <div class="options radio-other" id="field-${q.id}" data-question="${q.id}">
          ${q.options
            .map(
              (opt) => `
            <label class="option">
              <input type="radio" name="${q.id}" value="${escapeHtml(opt.value)}" ${current.choice === opt.value ? "checked" : ""}>
              <span class="option__text">${escapeHtml(opt.label || opt.value)}${opt.note ? `<span class="option__note">${escapeHtml(opt.note)}</span>` : ""}</span>
            </label>
            ${
              opt.withText
                ? `<input type="text" class="option__other" data-for="${escapeHtml(opt.value)}" placeholder="${escapeHtml(opt.placeholder || q.otherPlaceholder || "")}" value="${escapeHtml(current.other ?? "")}" ${current.choice === opt.value ? "" : "hidden"}>`
                : ""
            }`
            )
            .join("")}
        </div>`;
    }

    if (q.type === "radio") {
      return `<div class="options">${q.options
        .map((opt, i) => {
          const checked = value === opt ? "checked" : "";
          return `
          <label class="option">
            <input type="radio" name="${q.id}" value="${escapeHtml(opt)}" ${checked}>
            <span class="option__text">${escapeHtml(opt)}</span>
          </label>`;
        })
        .join("")}</div>`;
    }

    return "";
  }

  // 説明文の **強調** を太字・斜体にする（それ以外のHTMLはエスケープ）
  function formatDescription(text) {
    return escapeHtml(text).replace(/\*\*(.+?)\*\*/g, '<strong class="question__em">$1</strong>');
  }

  function profilesMarkup(profiles) {
    return `
      <section class="engineers">
        <h3 class="engineers__heading">${escapeHtml(profiles.heading)}</h3>
        ${profiles.people
          .map(
            (person) => `
          <article class="engineer">
            <img class="engineer__photo" src="${escapeHtml(person.photo)}" alt="${escapeHtml(person.name)}" loading="lazy">
            <div class="engineer__body">
              <p class="engineer__name">${escapeHtml(person.name)}<span class="engineer__role">${escapeHtml(person.role)}</span></p>
              <p class="engineer__bio">${escapeHtml(person.bio)}</p>
            </div>
          </article>`
          )
          .join("")}
      </section>`;
  }

  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));
  }

  // 質問のあとに「最終確認」(confirmIndex)、送信後に「ご回答ありがとうございました！」(doneIndex) が続く
  const confirmIndex = totalSteps;
  const doneIndex = totalSteps + 1;
  let submitting = false;

  function reachedStep() {
    if (state.step > confirmIndex) return confirmIndex;
    return Math.min(Math.max(state.step, state.maxStep ?? 0), confirmIndex);
  }

  function renderToc() {
    const reached = reachedStep();
    const finished = state.step > confirmIndex;

    syncUrl();
    el.tocList.innerHTML = [...questions.map((q) => q.title), "最終確認"]
      .map((title, i) => {
        let status = "upcoming";
        if (!finished && i === state.step) status = "current";
        else if (i <= reached) status = "done";

        const clickable = status !== "upcoming";
        const tag = clickable ? "button" : "span";
        const typeAttr = clickable ? 'type="button"' : "";

        return `
          <li class="toc__item toc__item--${status}">
            <${tag} ${typeAttr} class="toc__link" data-step="${i}" ${clickable ? "" : "disabled"}>
              <span class="toc__number">${status === "done" ? "✓" : i + 1}</span>
              <span class="toc__label">${escapeHtml(title)}</span>
            </${tag}>
          </li>`;
      })
      .join("");
  }

  function jumpToStep(index) {
    if (index < 0 || index > confirmIndex || index > reachedStep()) return;
    if (state.step < totalSteps) readCurrentAnswer();
    state.step = index;
    persist();
    renderQuestion();
    window.scrollTo(0, 0);
  }

  el.container.addEventListener("change", (e) => {
    if (e.target.matches(".radio-other input[type=radio]")) {
      e.target.closest(".radio-other").querySelectorAll(".option__other").forEach((input) => {
        input.hidden = input.dataset.for !== e.target.value;
        if (!input.hidden) input.focus();
      });
      return;
    }
    if (e.target.matches('.rec-song input[data-role="method"]')) {
      syncMethodSubs(e.target.closest(".rec-song"));
      return;
    }
    if (e.target.matches('.rec-song input[data-role="indiv-all"]')) {
      syncIndividual(e.target.closest(".rec-song"));
      return;
    }
    if (e.target.matches(".equip input[data-id]")) {
      updateEquipmentCounts(e.target.closest(".equip"));
      return;
    }
    if (!e.target.classList.contains("inst__select")) return;
    const other = e.target.closest(".inst__row").querySelector(".inst__other");
    other.hidden = e.target.value !== "Other";
    if (!other.hidden) other.focus();
  });

  el.container.addEventListener("click", (e) => {
    const editButton = e.target.closest(".confirm__edit");
    if (editButton) {
      jumpToStep(parseInt(editButton.dataset.step, 10));
      return;
    }

    const copyButton = e.target.closest(".rec-copy");
    const pasteButton = e.target.closest(".rec-paste");
    if (copyButton || pasteButton) {
      const card = e.target.closest(".rec-song");
      if (copyButton) {
        const data = readMethodCard(card);
        if (!data.methods.length) {
          showToast("先に録音方法を選んでください");
          return;
        }
        methodClipboard = data;
        el.container.querySelectorAll(".rec-paste").forEach((button) => (button.disabled = false));
        showToast("録音方法をコピーしました");
      } else if (methodClipboard) {
        applyMethodCard(card, methodClipboard);
        const missing = methodClipboard.individual.filter(
          (label) => !card.querySelector(`[data-role="indiv"][value="${CSS.escape(label)}"]`)
        );
        showToast(missing.length ? "貼り付けました（この曲にない楽器は除きました）" : "貼り付けました");
      }
      return;
    }

    if (e.target.closest(".equip__retry")) {
      // 未保存のチェックを失わないよう、いまの選択を保存してから読み込み直す
      readCurrentAnswer();
      loadEquipment(questions[state.step], { force: true });
      return;
    }

    const instSong = e.target.closest(".inst-song");
    if (instSong) {
      const q = questions[state.step];
      const rows = instSong.querySelector(".inst__rows");
      if (e.target.closest(".inst__add")) {
        rows.insertAdjacentHTML("beforeend", instRow(q));
        rows.lastElementChild.querySelector("select").focus();
      } else if (e.target.closest(".inst__remove")) {
        e.target.closest(".inst__row").remove();
        if (!rows.children.length) rows.insertAdjacentHTML("beforeend", instRow(q));
      }
      return;
    }

    const songs = e.target.closest(".song-list");
    if (songs) {
      const q = questions.find((item) => item.id === songs.dataset.question);
      const items = songs.querySelector(".song-list__items");
      const card = e.target.closest(".song");

      if (e.target.closest(".song-list__add")) {
        items.insertAdjacentHTML("beforeend", songCard(q));
        renumberSongs(items);
        items.lastElementChild.querySelector("input").focus();
      } else if (card && e.target.closest(".song__up") && card.previousElementSibling) {
        card.previousElementSibling.before(card);
        renumberSongs(items);
      } else if (card && e.target.closest(".song__down") && card.nextElementSibling) {
        card.nextElementSibling.after(card);
        renumberSongs(items);
      } else if (card && e.target.closest(".song__remove")) {
        card.remove();
        if (!items.children.length) items.insertAdjacentHTML("beforeend", songCard(q));
        renumberSongs(items);
      }
      return;
    }

    const wrap = e.target.closest(".multi-text");
    if (!wrap) return;
    const q = questions.find((item) => item.id === wrap.dataset.question);
    const rows = wrap.querySelector(".multi-text__rows");

    if (e.target.closest(".multi-text__add")) {
      rows.insertAdjacentHTML("beforeend", multiTextRow(q, ""));
      rows.lastElementChild.querySelector("input").focus();
    } else if (e.target.closest(".multi-text__remove")) {
      e.target.closest(".multi-text__row").remove();
      if (!rows.children.length) rows.insertAdjacentHTML("beforeend", multiTextRow(q, ""));
    }
  });

  el.tocList.addEventListener("click", (e) => {
    const link = e.target.closest(".toc__link[data-step]");
    if (!link || link.disabled) return;
    jumpToStep(parseInt(link.dataset.step, 10));
  });

  function renderQuestion() {
    if (state.step === confirmIndex) {
      renderConfirm();
      return;
    }
    if (state.step > confirmIndex) {
      renderThanks();
      return;
    }

    el.footer.hidden = false;
    el.btnNext.hidden = false;
    el.btnSave.hidden = false;
    el.btnNext.disabled = false;
    const q = questions[state.step];

    el.container.innerHTML = `
      <div class="question">
        <h2 class="question__title">${escapeHtml(q.title)}${q.required ? '<span class="question__required">必須</span>' : ""}</h2>
        ${q.description ? `<p class="question__description">${formatDescription(q.description)}</p>` : ""}
        ${q.link ? `<a class="guide-link" href="${escapeHtml(q.link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(q.link.label)} ↗</a>` : ""}
        ${q.image ? `
          <a class="question-image-link" href="${escapeHtml(q.image.src)}" target="_blank" rel="noopener noreferrer">
            <img class="question-image" src="${escapeHtml(q.image.src)}" alt="${escapeHtml(q.image.alt)}" loading="lazy">
          </a>` : ""}
        ${q.profiles ? profilesMarkup(q.profiles) : ""}
        <div class="field">${fieldMarkup(q)}</div>
        <p class="field-error" id="field-error"></p>
      </div>
    `;

    const songItems = el.container.querySelector(".song-list__items");
    if (songItems) renumberSongs(songItems);
    if (q.type === "equipment-picker") loadEquipment(q);

    el.btnPrev.disabled = state.step === 0;
    el.btnPrev.style.visibility = state.step === 0 ? "hidden" : "visible";
    el.btnNext.textContent = state.step === totalSteps - 1 ? "確認する" : "次へ";

    updateProgress();
    renderToc();
  }

  // ---------- 回答内容のまとめ（最終確認の表示とメール本文で共通） ----------

  function instrumentLabel(inst) {
    return inst.name === "Other" && inst.other ? `Other（${inst.other}）` : inst.name;
  }

  function songLabel(entry) {
    const songs = Array.isArray(state.answers.songInfo) ? state.answers.songInfo : [];
    const index = songs.findIndex((song) => song.id === entry.id);
    return `${index >= 0 ? `${index + 1}曲目 ` : ""}${entry.title || "（曲名未入力）"}`;
  }

  function methodSummary(item) {
    return (item.methods || [])
      .map((method) => {
        if (method === "同時録音") return `同時録音（${item.simultaneous}）`;
        if (method === "個別") return `個別（${item.individualAll ? "同時録音するもの以外は個別" : item.individual.join("、")}）`;
        return method;
      })
      .join(" ＋ ");
  }

  function equipmentLines(value) {
    const lines = [];
    const selected = value && Array.isArray(value.selected) ? value.selected : [];
    [...new Set(selected.map((item) => item.section))].forEach((section) => {
      lines.push(`【${section}】`);
      selected
        .filter((item) => item.section === section)
        .forEach((item) => {
          const name = item.name.replace(/\n/g, " / ");
          const vintage = item.bg ? " ※ヴィンテージ機材録音パック対象" : "";
          lines.push(`${item.group}：${item.sub ? `${item.sub} ` : ""}${name}${item.qty ? `（${item.qty}）` : ""}${vintage}`);
        });
    });
    if (value && value.note) lines.push(`その他のご希望・お任せ：${value.note}`);
    return lines;
  }

  function answerLines(q, value) {
    const list = Array.isArray(value) ? value : [];
    switch (q.type) {
      case "text":
      case "textarea":
        return value ? String(value).split("\n") : [];
      case "single-checkbox":
        return value ? [q.label] : [];
      case "multi-text":
        return Array.isArray(value) ? value : value ? [value] : [];
      case "song-list":
        return list.map((song, i) => {
          const parts = [
            song.title && `曲名：${song.title}`,
            song.bpm && `BPM：${song.bpm}`,
            song.meter && `拍子：${song.meter}`,
            song.key && `Key：${song.key}`,
          ].filter(Boolean);
          return `${i + 1}曲目　${parts.join(" ／ ")}`;
        });
      case "song-instruments":
        return list.map((item) => `${songLabel(item)}：${item.instruments.map(instrumentLabel).join("、")}`);
      case "equipment-picker":
        return equipmentLines(value);
      case "song-methods":
        return list.map((item) => `${songLabel(item)}：${methodSummary(item)}`);
      case "song-links":
        return list.map((item) => `${songLabel(item)}：${item.url}`);
      case "radio-other": {
        if (!value || !value.choice) return [];
        return [value.other ? `${value.choice}：${value.other}` : value.choice];
      }
      default:
        return value ? [String(value)] : [];
    }
  }

  function buildSummary() {
    return questions.map((q, i) => ({
      index: i,
      no: i + 1,
      title: q.title,
      missing: Boolean(q.required && answerError(q)),
      lines: answerLines(q, state.answers[q.id]),
    }));
  }

  function summaryText() {
    return buildSummary()
      .map((section) => `■ ${section.no}. ${section.title}\n${section.lines.length ? section.lines.join("\n") : "（未回答）"}`)
      .join("\n\n");
  }

  // ---------- 最終確認・送信・完了 ----------

  function renderConfirm() {
    const sections = buildSummary();
    el.container.innerHTML = `
      <div class="confirm">
        <h2 class="question__title">最終確認</h2>
        <p class="question__description">回答内容をご確認ください。内容に問題がなければ「メールで回答を送信」を押してください。ご入力いただいたメールアドレスにも、回答内容をお送りします。</p>
        <p class="confirm__note">${RESEND_NOTE}</p>
        <div class="confirm__list">
          ${sections
            .map(
              (section) => `
            <section class="confirm__item">
              <div class="confirm__head">
                <h3 class="confirm__title"><span class="confirm__no">${section.no}</span>${escapeHtml(section.title)}</h3>
                <button type="button" class="confirm__edit" data-step="${section.index}">修正する</button>
              </div>
              ${section.missing ? '<p class="confirm__missing">必須項目が未入力です。</p>' : ""}
              <div class="confirm__body">
                ${
                  section.lines.length
                    ? section.lines
                        .map((line) => `<p class="confirm__line${line.startsWith("【") ? " confirm__line--head" : ""}">${escapeHtml(line)}</p>`)
                        .join("")
                    : '<p class="confirm__line confirm__line--empty">（未回答）</p>'
                }
              </div>
            </section>`
            )
            .join("")}
        </div>
        <p class="field-error" id="field-error"></p>
      </div>
    `;
    el.footer.hidden = false;
    el.btnNext.hidden = false;
    el.btnSave.hidden = false;
    el.btnPrev.style.visibility = "visible";
    el.btnPrev.disabled = false;
    el.btnNext.disabled = false;
    el.btnNext.textContent = "メールで回答を送信";
    updateProgress();
    renderToc();
  }

  function renderThanks() {
    el.container.innerHTML = `
      <div class="complete">
        <div class="complete__icon">✅</div>
        <h2 class="complete__title">ご回答ありがとうございました！</h2>
        <p class="complete__note">${RESEND_NOTE}</p>
      </div>
    `;
    // 修正して再送信できるよう、最後のページにも「戻る」を出す
    el.footer.hidden = false;
    el.btnNext.hidden = true;
    el.btnSave.hidden = true;
    el.btnPrev.style.visibility = "visible";
    el.btnPrev.disabled = false;
    updateProgress();
    renderToc();
  }

  async function submitAnswers() {
    if (submitting) return;
    const errorEl = document.getElementById("field-error");

    const missing = questions.find((q) => q.required && answerError(q));
    if (missing) {
      errorEl.textContent = `必須項目「${missing.title}」が未入力です。「修正する」から入力してください。`;
      return;
    }

    submitting = true;
    errorEl.textContent = "";
    el.btnNext.disabled = true;
    el.btnPrev.disabled = true;
    el.btnNext.textContent = "送信中…";

    try {
      await callApi("submit", {
        email: state.answers.email,
        bandName: state.answers.bandName,
        summary: summaryText(),
        answers: state.answers,
        draftId,
      });

      // ブラウザの控えは消す（次にこのブラウザで開いたとき、新しい回答として始められるように）。
      // サーバーの保存は残し、保存したURLからいつでも修正・再送信できる。
      clearSaved();
      state.step = doneIndex;
      renderQuestion();
      window.scrollTo(0, 0);
      flushSave();
    } catch (error) {
      // fetch自体の失敗（TypeError）は英語メッセージなので、日本語の文言に置き換える
      const detail = error instanceof TypeError ? "通信に失敗しました。" : error.message;
      errorEl.textContent = `送信できませんでした。${detail} もう一度「確認した」を押してください。`;
      el.btnNext.disabled = false;
      el.btnPrev.disabled = false;
      el.btnNext.textContent = "メールで回答を送信";
    } finally {
      submitting = false;
    }
  }

  function updateProgress() {
    const current = Math.min(state.step + 1, totalSteps + 1);
    el.progressCurrent.textContent = current;
    el.progressFill.style.width = `${(current / (totalSteps + 1)) * 100}%`;
  }

  function readCurrentAnswer() {
    if (state.step >= totalSteps) return;
    const q = questions[state.step];

    if (q.type === "song-list") {
      state.answers[q.id] = [...document.querySelectorAll(`#field-${q.id} .song`)]
        .map((card) => ({
          id: card.dataset.id,
          ...Object.fromEntries(
            [...card.querySelectorAll(".song__input")].map((input) => [input.dataset.key, input.value.trim()])
          ),
        }))
        .filter((song) => q.songFields.some((f) => song[f.key]));
    } else if (q.type === "equipment-picker") {
      const root = document.getElementById(`field-${q.id}`);
      const previous = state.answers[q.id];
      const kept = previous && Array.isArray(previous.selected) ? previous.selected : [];
      // 機材リストの読み込み前・失敗時は、保存済みの選択を消さない
      const selected =
        root.dataset.loaded === "1"
          ? [...root.querySelectorAll("input[data-id]:checked")]
              .map((input) => equipmentIndex.get(input.dataset.id))
              .filter(Boolean)
          : kept;
      state.answers[q.id] = { selected, note: root.querySelector(".equip__note-input").value.trim() };
    } else if (q.type === "song-links") {
      // 音源がない曲は空欄のままでよい（空欄の曲は保存しない）
      state.answers[q.id] = [...document.querySelectorAll(`#field-${q.id} .link-song`)]
        .map((card) => ({
          id: card.dataset.id,
          title: card.dataset.title,
          url: card.querySelector(".link-song__input").value.trim(),
        }))
        .filter((song) => song.url);
    } else if (q.type === "song-methods") {
      state.answers[q.id] = [...document.querySelectorAll(`#field-${q.id} .rec-song`)]
        .map((card) => ({ id: card.dataset.id, title: card.dataset.title, ...readMethodCard(card) }))
        .filter((song) => song.methods.length);
    } else if (q.type === "song-instruments") {
      state.answers[q.id] = [...document.querySelectorAll(`#field-${q.id} .inst-song`)]
        .map((card) => ({
          id: card.dataset.id,
          title: card.dataset.title,
          instruments: [...card.querySelectorAll(".inst__row")]
            .map((row) => ({
              name: row.querySelector(".inst__select").value,
              other: row.querySelector(".inst__other").value.trim(),
            }))
            .filter((inst) => inst.name)
            .map((inst) => (inst.name === "Other" ? inst : { name: inst.name })),
        }))
        .filter((song) => song.instruments.length);
    } else if (q.type === "multi-text") {
      state.answers[q.id] = [...document.querySelectorAll(`#field-${q.id} .multi-text__input`)]
        .map((input) => input.value.trim())
        .filter(Boolean);
    } else if (q.type === "text" || q.type === "textarea") {
      const input = document.getElementById(`field-${q.id}`);
      state.answers[q.id] = input.value.trim();
    } else if (q.type === "single-checkbox") {
      const input = document.getElementById(`field-${q.id}`);
      state.answers[q.id] = input.checked;
    } else if (q.type === "radio-other") {
      const root = document.getElementById(`field-${q.id}`);
      const choice = root.querySelector("input[type=radio]:checked")?.value || "";
      const option = q.options.find((opt) => opt.value === choice);
      state.answers[q.id] = {
        choice,
        other: option?.withText ? root.querySelector(".option__other").value.trim() : "",
      };
    } else if (q.type === "radio") {
      const checked = document.querySelector(`input[name="${q.id}"]:checked`);
      state.answers[q.id] = checked ? checked.value : "";
    }
  }

  // 回答に問題があればメッセージを返す（問題なしは空文字）
  function answerError(q) {
    if (!q.required) return "";

    if (q.type === "radio-other") {
      const value = state.answers[q.id] || {};
      const option = q.options.find((opt) => opt.value === value.choice);
      if (!option) return "この質問は必須です。";
      return option.withText && !option.textOptional && !value.other ? "内容を入力してください。" : "";
    }

    if (q.type === "song-methods") {
      const answers = Array.isArray(state.answers[q.id]) ? state.answers[q.id] : [];
      const complete = songIds().every((id) => {
        const item = answers.find((a) => a.id === id);
        return (
          item &&
          item.methods.length &&
          (!item.methods.includes("同時録音") || item.simultaneous) &&
          (!item.methods.includes("個別") || item.individualAll || item.individual.length)
        );
      });
      return complete ? "" : "すべての曲の録音方法を選んでください（同時録音は組み合わせ、個別は録音するものも選んでください）。";
    }

    const value = state.answers[q.id];
    const isEmpty =
      value === undefined || value === "" || value === false ||
      (Array.isArray(value) && value.length === 0) ||
      (q.type === "equipment-picker" && !(value && (value.selected?.length || value.note)));
    return isEmpty ? "この質問は必須です。" : "";
  }

  function validateCurrent() {
    const message = answerError(questions[state.step]);
    document.getElementById("field-error").textContent = message;
    return !message;
  }

  function goNext() {
    if (state.step > confirmIndex) return;
    if (state.step === confirmIndex) {
      submitAnswers();
      return;
    }

    readCurrentAnswer();
    if (!validateCurrent()) return;

    state.step += 1;
    state.maxStep = Math.max(state.maxStep ?? 0, state.step);
    persist();
    renderQuestion();
    window.scrollTo(0, 0);
  }

  function goPrev() {
    if (state.step === 0) return;
    readCurrentAnswer();
    state.step -= 1;
    persist();
    renderQuestion();
    window.scrollTo(0, 0);
  }

  async function saveAndExit() {
    readCurrentAnswer();
    localSave();
    const saved = await flushSave();
    if (!saved) {
      showToast("通信できないため、この端末にのみ保存しました", 4000);
      return;
    }

    let copied = false;
    try {
      await navigator.clipboard.writeText(window.location.href);
      copied = true;
    } catch (e) {
      /* コピーできない環境ではアドレスバーのURLを保存してもらう */
    }
    const copiedText = copied ? "このページのURLをコピーしました。" : "";

    // 続きのURLを、1ページ目に入力されたメールアドレスへ送る
    const email = String(state.answers.email || "").trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      showToast(`保存しました。${copiedText}1ページ目のメールアドレスを入力すると、続きのURLをメールでお送りできます`, 6000);
      return;
    }

    el.btnSave.disabled = true;
    let message;
    try {
      const data = await callApi("saveLink", { draftId, page: state.step + 1 });
      message =
        data.mode === "dry-run"
          ? "保存しました（テストモードのため、続きのURLのメールは実際には送信していません）"
          : `保存しました。続きのURLを ${email} にメールでお送りしました`;
    } catch (error) {
      const detail = error instanceof TypeError ? "通信に失敗しました。" : error.message;
      message = `保存しました。${copiedText}（続きのURLのメール：${detail}）`;
    } finally {
      el.btnSave.disabled = false;
    }
    showToast(message, 6000);
  }

  function onEdit() {
    if (state.step >= totalSteps) return;
    readCurrentAnswer();
    persistSoon();
  }

  el.container.addEventListener("input", onEdit);
  el.container.addEventListener("change", onEdit);

  // ページを閉じる・移動するときも、直前の入力をサーバーへ送る
  window.addEventListener("pagehide", () => {
    if (!draftId) return;
    if (state.step < totalSteps) readCurrentAnswer();
    localSave();
    // 閉じる途中でも送りきれるよう sendBeacon を使う（text/plain なので事前確認も要らない）
    try {
      navigator.sendBeacon(API_URL, new Blob([apiBody("saveDraft", draftPayload())], { type: "text/plain;charset=UTF-8" }));
    } catch (e) {
      /* 送れなくても、入力は1秒ごとの自動保存で残っている */
    }
  });

  el.btnNext.addEventListener("click", goNext);
  el.btnPrev.addEventListener("click", goPrev);
  el.btnSave.addEventListener("click", saveAndExit);

  // 入力欄でEnterを押しても、次のページへは進まない。
  // （入力欄が1つだけのページで、Enterによるフォーム送信＝ページの再読み込みが起きないように、送信自体も止める）
  const form = document.getElementById("hearing-form");
  form.addEventListener("keydown", (e) => {
    const isTextInput = e.target.tagName === "INPUT" && ["text", "email"].includes(e.target.type);
    if (e.key === "Enter" && isTextInput) e.preventDefault();
  });
  form.addEventListener("submit", (e) => e.preventDefault());

  // サーバーに保存した回答を開く。サーバーに無い・通信できないときは、ブラウザの控えを使う。
  async function openDraft(id, page, fallback = null) {
    draftId = id;
    let record = null;
    try {
      const data = await callApi("getDraft", { id });
      if (data.found) record = data.state;
    } catch (error) {
      /* 通信できない: 下でブラウザの控えを探す */
    }
    if (!record) {
      const local = fallback || loadSaved();
      if (local && local.draftId === id) record = local;
    }

    if (record) {
      state = {
        step: record.step ?? 0,
        maxStep: record.maxStep ?? record.step ?? 0,
        answers: record.answers || {},
      };
      // URLのページ番号（p）があればそのページから。まだ到達していないページには進ませない
      const reached = Math.min(Math.max(state.step, state.maxStep), doneIndex);
      if (Number.isInteger(page) && page >= 1) state.step = Math.min(page - 1, reached);
      localSave();
    } else {
      state = { step: 0, maxStep: 0, answers: {} };
    }
    el.resumeBanner.hidden = true;
    renderQuestion();
  }

  async function init() {
    const params = new URLSearchParams(window.location.search);
    const urlId = params.get("r");

    // 保存したURLから開いた場合: その回答の続きから
    if (urlId && DRAFT_ID_PATTERN.test(urlId)) {
      el.container.innerHTML = '<p class="loading">読み込み中…</p>';
      await openDraft(urlId, parseInt(params.get("p"), 10));
      return;
    }

    // URLに回答ページのIDがない場合: 新しい回答として始める（このブラウザに途中の控えがあれば再開を案内）
    draftId = newDraftId();
    const saved = loadSaved();
    const hasWork = saved && saved.answers && Object.keys(saved.answers).length > 0 && saved.step <= confirmIndex;
    if (hasWork) {
      el.resumeBanner.hidden = false;
      el.resumeContinue.addEventListener("click", async () => {
        if (saved.draftId && DRAFT_ID_PATTERN.test(saved.draftId)) {
          await openDraft(saved.draftId, saved.step + 1, saved);
        } else {
          state = { step: saved.step, maxStep: saved.maxStep ?? saved.step, answers: saved.answers };
          el.resumeBanner.hidden = true;
          persist();
          renderQuestion();
        }
      });
      el.resumeRestart.addEventListener("click", () => {
        clearSaved();
        state = { step: 0, maxStep: 0, answers: {} };
        el.resumeBanner.hidden = true;
        renderQuestion();
      });
    }
    renderQuestion();
  }

  init();
})();
