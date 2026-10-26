/**
 * 動作確認用: Google Apps Script の部品（スプレッドシート・メール等）をブラウザ内で再現し、
 * apps-script/Code.gs をそのまま動かす。公開サイトでは使わない（開発用のサーバーだけが読み込む）。
 *
 * - スプレッドシートの中身は、このブラウザの localStorage に保存される（再読み込みしても残る）
 * - メールは実際には送らず、「送信したメール」として記録するだけ
 * - 画面からの通信（fetch "api"）を、Code.gs の doPost に振り向ける
 */
(function () {
  const STORE_KEY = "__gas_mock_store__";
  const MAIL_KEY = "__gas_mock_mail__";
  const QUOTA_KEY = "__gas_mock_quota__";
  const MAX_CACHE_SECONDS = 21600; // 本物の CacheService の上限

  let db = { sheets: {}, props: {}, cache: {} };
  const loadDb = () => {
    try {
      db = JSON.parse(localStorage.getItem(STORE_KEY)) || db;
    } catch (e) {}
    db.sheets = db.sheets || {};
    db.props = db.props || {};
    db.cache = db.cache || {};
  };
  const saveDb = () => localStorage.setItem(STORE_KEY, JSON.stringify(db));
  const mails = () => JSON.parse(localStorage.getItem(MAIL_KEY) || "[]");

  // ---------------------------------------------------------------- Sheets
  class Range {
    constructor(sheet, row, col, rows, cols) {
      Object.assign(this, { sheet, row, col, rows, cols });
    }
    getRow() {
      return this.row;
    }
    getValues() {
      const out = [];
      for (let r = 0; r < this.rows; r++) {
        const line = [];
        for (let c = 0; c < this.cols; c++) {
          const cell = (this.sheet.data.rows[this.row - 1 + r] || [])[this.col - 1 + c];
          line.push(cell === undefined ? "" : cell);
        }
        out.push(line);
      }
      return out;
    }
    setValues(values) {
      values.forEach((line, r) =>
        line.forEach((value, c) => {
          const rows = this.sheet.data.rows;
          while (rows.length <= this.row - 1 + r) rows.push([]);
          const target = rows[this.row - 1 + r];
          while (target.length < this.col - 1 + c) target.push("");
          // 書式なしテキストの列と同じく、すべて文字列として保存する
          target[this.col - 1 + c] = String(value);
        })
      );
      return this;
    }
    setValue(value) {
      return this.setValues([[value]]);
    }
    setNumberFormat() {
      return this;
    }
    createTextFinder(text) {
      const options = { matchCase: false, entire: false };
      const range = this;
      const finder = {
        matchCase(flag) { options.matchCase = flag; return finder; },
        matchEntireCell(flag) { options.entire = flag; return finder; },
        findNext() {
          const values = range.getValues();
          for (let r = 0; r < values.length; r++) {
            for (let c = 0; c < values[r].length; c++) {
              let cell = String(values[r][c]);
              let needle = String(text);
              if (!options.matchCase) { cell = cell.toLowerCase(); needle = needle.toLowerCase(); }
              if (options.entire ? cell === needle : cell.includes(needle)) {
                return new Range(range.sheet, range.row + r, range.col + c, 1, 1);
              }
            }
          }
          return null;
        },
      };
      return finder;
    }
  }

  class Sheet {
    constructor(name) {
      this.name = name;
      this.data = db.sheets[name];
    }
    getLastRow() {
      return this.data.rows.length;
    }
    getMaxRows() {
      return 1000;
    }
    getRange(row, col, rows = 1, cols = 1) {
      return new Range(this, row, col, rows, cols);
    }
    setFrozenRows() {}
  }

  const SpreadsheetApp = {
    getActiveSpreadsheet() {
      return {
        getSheetByName: (name) => (db.sheets[name] ? new Sheet(name) : null),
        insertSheet: (name) => {
          db.sheets[name] = { rows: [] };
          return new Sheet(name);
        },
      };
    },
  };

  // ---------------------------------------------------------------- 排他・キャッシュ・プロパティ
  const LockService = { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) };

  const CacheService = {
    getScriptCache: () => ({
      get(key) {
        const entry = db.cache[key];
        return entry && entry.exp > Date.now() ? entry.value : null;
      },
      put(key, value, seconds) {
        if (seconds > MAX_CACHE_SECONDS) throw new Error("CacheService: 有効期限は " + MAX_CACHE_SECONDS + " 秒までです");
        db.cache[key] = { value: String(value), exp: Date.now() + seconds * 1000 };
      },
    }),
  };

  const PropertiesService = {
    getScriptProperties: () => ({
      getProperty: (key) => (key in db.props ? db.props[key] : null),
      setProperty: (key, value) => {
        db.props[key] = String(value);
      },
    }),
  };

  // ---------------------------------------------------------------- メール
  const MailApp = {
    sendEmail(options) {
      if (!options || !options.to || !options.subject || !options.body) throw new Error("MailApp: to / subject / body が必要です");
      if (/[\r\n]/.test(options.subject)) throw new Error("MailApp: 件名に改行は使えません");
      const list = mails();
      list.push({ at: new Date().toISOString(), ...options });
      localStorage.setItem(MAIL_KEY, JSON.stringify(list));
    },
    getRemainingDailyQuota() {
      const base = Number(localStorage.getItem(QUOTA_KEY) || 100);
      const used = mails().reduce((sum, mail) => sum + String(mail.to).split(",").length, 0);
      return Math.max(base - used, 0);
    },
  };

  // ---------------------------------------------------------------- その他
  const Utilities = {
    formatDate(date, timeZone, pattern) {
      if (timeZone !== "Asia/Tokyo") throw new Error("このモックは Asia/Tokyo だけ対応しています");
      const t = new Date(date.getTime() + 9 * 3600 * 1000);
      const p = (n, w = 2) => String(n).padStart(w, "0");
      const parts = {
        yyyy: p(t.getUTCFullYear(), 4), MM: p(t.getUTCMonth() + 1), dd: p(t.getUTCDate()),
        HH: p(t.getUTCHours()), mm: p(t.getUTCMinutes()), ss: p(t.getUTCSeconds()), XXX: "+09:00",
      };
      return pattern.replace(/'([^']*)'|yyyy|MM|dd|HH|mm|ss|XXX/g, (m, literal) => (literal !== undefined ? literal : parts[m]));
    },
  };

  const ContentService = {
    MimeType: { JSON: "application/json" },
    createTextOutput: (text) => ({ text, setMimeType() { return this; }, getContent() { return this.text; } }),
  };

  // ---------------------------------------------------------------- Code.gs を読み込む
  const request = new XMLHttpRequest();
  request.open("GET", "/__dev__/Code.gs", false);
  request.send();
  if (request.status !== 200) throw new Error("Code.gs を読み込めません");
  const gas = new Function(
    "SpreadsheetApp", "LockService", "CacheService", "PropertiesService", "MailApp", "Utilities", "ContentService", "console",
    request.responseText + "\nreturn { doPost, doGet, setup };"
  )(SpreadsheetApp, LockService, CacheService, PropertiesService, MailApp, Utilities, ContentService, console);

  function run(fn) {
    loadDb();
    try {
      return fn();
    } finally {
      saveDb();
    }
  }

  async function handle(bodyText) {
    await new Promise((resolve) => setTimeout(resolve, 250)); // 本物の通信の遅さの目安
    return run(() => gas.doPost({ postData: { contents: bodyText } }).getContent());
  }

  // ---------------------------------------------------------------- 通信を横取りする
  const apiUrl = () => new URL((window.APP_CONFIG && window.APP_CONFIG.apiUrl) || "api", location.href).href;
  const realFetch = window.fetch.bind(window);
  window.fetch = async (url, options = {}) => {
    if (new URL(url, location.href).href === apiUrl() && options.method === "POST") {
      const text = await handle(options.body);
      return new Response(text, { status: 200, headers: { "Content-Type": "application/json" } });
    }
    return realFetch(url, options);
  };
  const realBeacon = navigator.sendBeacon.bind(navigator);
  navigator.sendBeacon = (url, data) => {
    if (new URL(url, location.href).href === apiUrl()) {
      (data instanceof Blob ? data.text() : Promise.resolve(String(data))).then(handle);
      return true;
    }
    return realBeacon(url, data);
  };

  // ---------------------------------------------------------------- テスト用の操作
  loadDb();
  if (!("PUBLIC_BASE_URL" in db.props)) {
    db.props.PUBLIC_BASE_URL = location.origin;
    db.props.STAFF_RECIPIENTS = "staff1@example.com, staff2@example.com, staff3@example.com";
    saveDb();
  }
  window.__gas = {
    sheets: () => { loadDb(); return JSON.parse(JSON.stringify(db.sheets)); },
    mails,
    props: () => { loadDb(); return { ...db.props }; },
    setProp: (key, value) => run(() => { value === null ? delete db.props[key] : (db.props[key] = String(value)); }),
    setQuota: (n) => localStorage.setItem(QUOTA_KEY, String(n)),
    resetAll: () => { localStorage.removeItem(STORE_KEY); localStorage.removeItem(MAIL_KEY); localStorage.removeItem(QUOTA_KEY); },
    clearCache: () => run(() => { db.cache = {}; }),
    call: (action, payload = {}) => handle(JSON.stringify({ action, ...payload })).then(JSON.parse),
  };
})();
