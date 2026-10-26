  /**
   * レコーディング事前ヒアリング：回答の保存・メール送信（Google Apps Script）
   *
   * このコードは、Googleスプレッドシートの「拡張機能 → Apps Script」に貼り付けて使います（README の手順）。
   * - 途中保存と回答は、このスプレッドシートの「下書き」「回答」シートに保存されます。
   * - メールは、このスクリプトを公開したGoogleアカウント（Gmail）から送られます。
   * - 管理ページは作らず、スプレッドシートがそのまま「いつ・誰が・どんな回答をしたか」の確認画面になります。
   *
   * @OnlyCurrentDoc
   */
  
  // ====================================================================
  // 設定
  // ====================================================================
  
  // 件名。{band} には回答されたバンド名が入ります
  const SUBJECT_TEMPLATE = "【{band}】レコーディング事前ヒアリング回答";
  
  // メールの差出人の表示名
  const SENDER_NAME = "レコーディング事前ヒアリング";
  
  // 「スクリプトのプロパティ」で設定する値（README を参照）。
  // このコードは公開されるリポジトリに置くため、メールアドレスはコードに書かず、Google側のプロパティに入れます。
  //   STAFF_RECIPIENTS … 回答メールの宛先（カンマ区切りで3件）。回答者のメールアドレスは、これに自動で加わります。
  //   PUBLIC_BASE_URL  … 公開したフォームのアドレス（例: https://〇〇.github.io/hearing-form）。末尾の / は不要。
  //                       メールに載せる「続きのURL」「修正用URL」の土台になります。
  //                       このアドレスは固定で使い、リクエストの値は使いません
  //                       （第三者が偽のURLを埋め込んだメールを送らせるのを防ぐため）。
  
  const SHEET_DRAFTS = "下書き";
  const SHEET_SUBMISSIONS = "回答";
  
  const DRAFT_HEADERS = [
    "ID", "作成", "最終更新", "ページ", "到達ページ", "メールアドレス", "バンド名", "送信済み",
    "回答データ1", "回答データ2", "回答データ3", "回答データ4",
  ];
  const SUBMISSION_HEADERS = ["日時", "バンド名", "メールアドレス", "送信回数", "メール", "下書きID", "回答内容", "送信先"];
  
  const ID_PATTERN = /^[A-Za-z0-9_-]{22,64}$/;
  const EMAIL_PATTERN = /^[^@\s,;<>"'()\[\]\\]+@[^@\s,;<>"'()\[\]\\]+\.[^@\s,;<>"'()\[\]\\]+$/;
  const CONTROL_CHARS = /[\u0000-\u001f\u007f]+/g;
  
  const CELL_LIMIT = 45000; // スプレッドシートの1セルは50,000文字まで
  const ANSWER_CHUNKS = 4;
  const MAX_ANSWERS_CHARS = CELL_LIMIT * ANSWER_CHUNKS;
  const MAX_SUMMARY_CHARS = 49000;
  const MAX_STEP = 100;
  const MAX_DRAFT_ROWS = 20000;
  
  // ====================================================================
  // 入口（画面からの通信）
  // ====================================================================
  
  class UserError_ extends Error {}
  
  function doGet() {
    return json_({ ok: true, message: "レコーディング事前ヒアリング API" });
  }
  
  function doPost(e) {
    try {
      const payload = JSON.parse((e && e.postData && e.postData.contents) || "{}");
      const handlers = { getDraft: getDraft_, saveDraft: saveDraft_, submit: submit_, saveLink: saveLink_ };
      const handler = handlers[payload.action];
      if (!handler) throw new UserError_("リクエストを読み取れませんでした。");
      return json_(Object.assign({ ok: true }, handler(payload)));
    } catch (error) {
      if (error instanceof UserError_) return json_({ ok: false, error: error.message });
      console.error(error && error.stack ? error.stack : error);
      return json_({ ok: false, error: "処理中にエラーが発生しました。" });
    }
  }
  
  function json_(body) {
    return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
  }
  
  // ====================================================================
  // 初期設定（スクリプトのエディタで、最初に1回だけ実行する）
  // ====================================================================
  
  function setup() {
    sheet_(SHEET_DRAFTS);
    sheet_(SHEET_SUBMISSIONS);
    const quota = MailApp.getRemainingDailyQuota(); // メール送信の権限の許可画面を出すために呼ぶ
    console.log("準備ができました。今日あと送れるメールの宛先数: " + quota);
    const config = config_();
    if (!config.staff.length) console.log("次に、スクリプトのプロパティに STAFF_RECIPIENTS（回答メールの宛先）を設定してください。");
    if (!config.baseUrl) console.log("次に、スクリプトのプロパティに PUBLIC_BASE_URL（公開するフォームのアドレス）を設定してください。");
  }
  
  // ====================================================================
  // 途中保存
  // ====================================================================
  
  function getDraft_(payload) {
    const id = validId_(payload.id);
    const sheet = sheet_(SHEET_DRAFTS);
    const row = findRow_(sheet, 1, id);
    if (!row) return { found: false };
  
    const values = sheet.getRange(row, 1, 1, DRAFT_HEADERS.length).getValues()[0];
    const answers = JSON.parse(values.slice(8, 8 + ANSWER_CHUNKS).join("") || "{}");
    return { found: true, state: { step: Number(values[3]), maxStep: Number(values[4]), answers: answers } };
  }
  
  function saveDraft_(payload) {
    const id = validId_(payload.id);
    const step = payload.step;
    const maxStep = payload.maxStep;
    const answers = payload.answers;
    if (!isStep_(step) || !isStep_(maxStep) || !answers || typeof answers !== "object" || Array.isArray(answers)) {
      throw new UserError_("保存内容を読み取れませんでした。");
    }
    const json = JSON.stringify(answers);
    if (json.length > MAX_ANSWERS_CHARS) throw new UserError_("回答が大きすぎるため、保存できませんでした。");
  
    bump_("save:" + id, 90, 60, "保存の回数が多すぎます。しばらくしてからお試しください。");
  
    return withLock_(function () {
      const sheet = sheet_(SHEET_DRAFTS);
      let row = findRow_(sheet, 1, id);
      const now = now_();
      let created = now;
      let submitted = "";
  
      if (row) {
        const existing = sheet.getRange(row, 1, 1, 8).getValues()[0];
        created = existing[1] || now;
        submitted = existing[7] || "";
      } else {
        if (sheet.getLastRow() - 1 >= MAX_DRAFT_ROWS) throw new UserError_("現在、新しい回答を受け付けられません。");
        bumpDaily_("newDrafts", 500, "本日の新規の回答受付数が上限に達しました。明日以降にお試しください。");
        row = Math.max(sheet.getLastRow(), 1) + 1;
      }
  
      const chunks = chunk_(json, CELL_LIMIT, ANSWER_CHUNKS);
      const email = cleanText_(answers.email, 254);
      const band = cleanText_(answers.bandName, 100);
      const values = [id, created, now, step, maxStep, email, band, submitted].concat(chunks);
      sheet.getRange(row, 1, 1, values.length).setValues([values]);
      return { updatedAt: now };
    });
  }
  
  // ====================================================================
  // 回答の送信（メール）
  // ====================================================================
  
  function submit_(payload) {
    const email = cleanText_(payload.email, 254);
    const band = cleanText_(payload.bandName, 100);
    const summary = String(payload.summary || "");
    const draftId = ID_PATTERN.test(String(payload.draftId || "")) ? String(payload.draftId) : "";
  
    if (!EMAIL_PATTERN.test(email)) throw new UserError_("メールアドレスの形式が正しくありません。1ページ目を確認してください。");
    if (!band) throw new UserError_("バンド名が入力されていません。");
    if (!summary.trim() || summary.length > MAX_SUMMARY_CHARS) throw new UserError_("回答内容を読み取れませんでした。");
  
    bump_("submit:" + email.toLowerCase().slice(0, 200), 10, 21600, "このメールアドレスからの送信が上限に達しました。しばらくしてからお試しください。");
    bumpDaily_("submit", 100, "本日の送信数が上限に達しました。明日以降にお試しください。");
  
    const config = config_();
    if (!config.staff.length) throw new UserError_("メール送信の設定がまだ完了していません。管理者にお問い合わせください。");
    const recipients = recipientsFor_(email, config.staff);
    if (MailApp.getRemainingDailyQuota() < recipients.length) {
      throw new UserError_("本日のメール送信数の上限に達しました。回答内容は保存されています。明日以降にもう一度お試しください。");
    }
  
    const baseUrl = config.baseUrl;
    const editUrl = baseUrl && draftId ? baseUrl + "/?r=" + draftId + "&p=16" : "";
  
    // まず回答そのものを記録（メール送信に失敗しても失われないように）
    const sheet = sheet_(SHEET_SUBMISSIONS);
    const receivedAt = new Date();
    const record = withLock_(function () {
      const nth = countPrevious_(sheet, draftId) + 1;
      const row = Math.max(sheet.getLastRow(), 1) + 1;
      sheet.getRange(row, 1, 1, SUBMISSION_HEADERS.length).setValues([[
        format_(receivedAt, "yyyy/MM/dd HH:mm"), band, email, nth, "処理中", draftId, summary, recipients.join(", "),
      ]]);
      return { row: row, nth: nth };
    });
  
    const header =
      "【" + band + "】レコーディング事前ヒアリング回答\n" +
      "回答日時：" + format_(receivedAt, "yyyy/MM/dd HH:mm") + "\n" +
      "回答者のメールアドレス：" + email + "\n" +
      (record.nth > 1 ? "送信回数：" + record.nth + "回目（回答内容を修正しての再送信）\n" : "") +
      "========================================\n\n";
    const footer = editUrl
      ? "\n\n----------------------------------------\n" +
        "回答内容を修正して再送信する場合は、下のURLを開いてください。\n" + editUrl + "\n" +
        "（このURLを知っている人は回答内容を見られます。他の人に共有しないでください）"
      : "";
  
    try {
      MailApp.sendEmail({
        to: recipients.join(","),
        subject: SUBJECT_TEMPLATE.replace("{band}", band),
        body: header + summary + footer + "\n",
        replyTo: email,
        name: SENDER_NAME,
      });
    } catch (error) {
      console.error(error && error.stack ? error.stack : error);
      sheet.getRange(record.row, 5).setValue("メール送信失敗");
      throw new UserError_("メールの送信に失敗しました。時間をおいてもう一度お試しください。");
    }
  
    sheet.getRange(record.row, 5).setValue("メール送信済み");
    markSubmitted_(draftId);
    return {};
  }
  
  // ====================================================================
  // 続きのURLをメールで送る（一時保存）
  // ====================================================================
  
  function saveLink_(payload) {
    const id = validId_(payload.draftId);
    const drafts = sheet_(SHEET_DRAFTS);
    const row = findRow_(drafts, 1, id);
    if (!row) throw new UserError_("先に回答を保存してください。");
  
    // 宛先は、リクエストではなく「保存済みの回答」のメールアドレスだけを使う
    const saved = drafts.getRange(row, 1, 1, 8).getValues()[0];
    const email = cleanText_(saved[5], 254);
    const band = cleanText_(saved[6], 100);
    if (!EMAIL_PATTERN.test(email)) {
      throw new UserError_("メールアドレスが入力されていません。1ページ目に入力すると、続きのURLをメールでお送りできます。");
    }
  
    const baseUrl = config_().baseUrl;
    if (!baseUrl) throw new UserError_("メール送信の設定がまだ完了していません。管理者にお問い合わせください。");
  
    bump_("link-addr:" + email.toLowerCase().slice(0, 200), 3, 3600, "このメールアドレス宛のURL送信が上限に達しました。しばらくしてからお試しください。");
    bump_("link-draft:" + id, 3, 3600, "短時間に何度も送信できません。しばらくしてからお試しください。");
    bumpDaily_("link", 30, "本日のURL送信数が上限に達しました。明日以降にお試しください。");
    if (MailApp.getRemainingDailyQuota() < 1) {
      throw new UserError_("本日のメール送信数の上限に達しました。回答内容は保存されています。明日以降にお試しください。");
    }
  
    const reached = Math.max(Number(saved[3]), Number(saved[4])) + 1;
    const wanted = Number(payload.page);
    const page = wanted >= 1 ? Math.min(Math.floor(wanted), reached, 16) : Math.min(Number(saved[3]) + 1, 16);
    const url = baseUrl + "/?r=" + id + "&p=" + page;
  
    const subject = "レコーディング事前ヒアリング 回答の途中保存";
    try {
      MailApp.sendEmail({
        to: email,
        subject: band ? "【" + band + "】" + subject : subject,
        body:
          "レコーディング事前ヒアリングの回答を途中保存しました。\n" +
          "下のURLを開くと、続きから回答できます。\n\n" + url + "\n\n" +
          "・このURLを知っている人は、回答内容を見たり変更したりできます。他の人に共有しないでください。\n" +
          "・URLを開いたあとの入力は、自動で保存されます。\n" +
          "・このメールに心当たりがない場合は、破棄してください。\n",
        name: SENDER_NAME,
      });
    } catch (error) {
      console.error(error && error.stack ? error.stack : error);
      throw new UserError_("メールの送信に失敗しました。時間をおいてもう一度お試しください。");
    }
    return {};
  }
  
  // ====================================================================
  // 内部の部品
  // ====================================================================
  
  function config_() {
    const properties = PropertiesService.getScriptProperties();
    const base = String(properties.getProperty("PUBLIC_BASE_URL") || "").trim().replace(/\/+$/, "");
    const staff = String(properties.getProperty("STAFF_RECIPIENTS") || "")
      .split(/[,\s]+/)
      .filter(function (address) { return EMAIL_PATTERN.test(address); });
    return { baseUrl: /^https?:\/\//.test(base) ? base : "", staff: staff };
  }
  
  function recipientsFor_(respondent, staff) {
    const seen = {};
    const result = [];
    staff.concat([respondent]).forEach(function (address) {
      const key = address.toLowerCase();
      if (!seen[key]) {
        seen[key] = true;
        result.push(address);
      }
    });
    return result;
  }
  
  function validId_(id) {
    if (typeof id !== "string" || !ID_PATTERN.test(id)) throw new UserError_("URLが正しくありません。");
    return id;
  }
  
  function isStep_(value) {
    return Number.isInteger(value) && value >= 0 && value <= MAX_STEP;
  }
  
  function cleanText_(value, limit) {
    return String(value || "").replace(CONTROL_CHARS, " ").trim().slice(0, limit);
  }
  
  function chunk_(text, size, count) {
    const result = [];
    for (let i = 0; i < count; i++) result.push(text.slice(i * size, (i + 1) * size));
    return result;
  }
  
  function now_() {
    return format_(new Date(), "yyyy-MM-dd'T'HH:mm:ssXXX");
  }
  
  function format_(date, pattern) {
    return Utilities.formatDate(date, "Asia/Tokyo", pattern);
  }
  
  function sheet_(name) {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(name);
    if (!sheet) {
      sheet = spreadsheet.insertSheet(name);
      const headers = name === SHEET_DRAFTS ? DRAFT_HEADERS : SUBMISSION_HEADERS;
      // すべて「書式なしテキスト」にして、ID や回答が数式・数値として解釈されないようにする
      sheet.getRange(1, 1, sheet.getMaxRows(), headers.length).setNumberFormat("@");
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
    }
    return sheet;
  }
  
  function findRow_(sheet, column, value) {
    const last = sheet.getLastRow();
    if (last < 2) return 0;
    const found = sheet
      .getRange(2, column, last - 1, 1)
      .createTextFinder(value)
      .matchCase(true)
      .matchEntireCell(true)
      .findNext();
    return found ? found.getRow() : 0;
  }
  
  function countPrevious_(sheet, draftId) {
    if (!draftId || sheet.getLastRow() < 2) return 0;
    const ids = sheet.getRange(2, 6, sheet.getLastRow() - 1, 1).getValues();
    return ids.filter(function (cells) { return cells[0] === draftId; }).length;
  }
  
  function markSubmitted_(draftId) {
    if (!draftId) return;
    withLock_(function () {
      const sheet = sheet_(SHEET_DRAFTS);
      const row = findRow_(sheet, 1, draftId);
      if (row) sheet.getRange(row, 8).setValue(now_());
    });
  }
  
  function withLock_(fn) {
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      return fn();
    } finally {
      lock.releaseLock();
    }
  }
  
  // 回数制限（seconds 秒のあいだに limit 回まで）。アクセス元のアドレスは分からないので、
  // 「メールアドレスごと」「下書きごと」「1日の合計」で制限する。
  function bump_(key, limit, seconds, message) {
    const cache = CacheService.getScriptCache();
    const count = Number(cache.get(key) || 0);
    if (count >= limit) throw new UserError_(message);
    cache.put(key, String(count + 1), seconds);
  }
  
  function bumpDaily_(name, limit, message) {
    const properties = PropertiesService.getScriptProperties();
    const today = format_(new Date(), "yyyyMMdd");
    const key = "daily:" + name;
    const stored = String(properties.getProperty(key) || "").split(":");
    const count = stored[0] === today ? Number(stored[1]) : 0;
    if (count >= limit) throw new UserError_(message);
    properties.setProperty(key, today + ":" + (count + 1));
  }
