/**
 * Historyparser.js
 *
 * Parser nội dung bài học môn Lịch sử – cùng vai trò với Geographyparser.js.
 * Dùng chung cho:
 *  - HistoryLessonContent.vue (hiển thị nội dung)
 *  - Trang chi tiết bài học (mục lục, số "phần trọng tâm")
 *
 * ── Cách nhận diện đề mục ──────────────────────────────────────────────
 *  1. Số La Mã luôn là đề mục:          "I. Bối cảnh lịch sử", "II) Diễn biến"
 *  2. Số thường là đề mục khi ngắn, không kết thúc bằng dấu câu, hoặc bắt đầu
 *     bằng từ khóa mục:                 "1. Cách mạng tháng Tám"
 *     (ngược lại "1. Quân ta tiến công vào Sài Gòn." được coi là một ý)
 *  3. "Giai đoạn / Thời kì ...:" luôn là đề mục.
 *  4. Từ khóa chủ đề lịch sử + dấu ":":  "Kinh tế:" (đứng một mình) hoặc
 *     "Kinh tế: <đoạn dài hơn 80 ký tự>". Nếu sau dấu ":" chỉ là một ý ngắn
 *     thì đó là một dòng thông tin, KHÔNG phải đề mục.
 *  5. Dòng ngắn kết thúc bằng ":" (trừ các nhãn Nguyên nhân / Diễn biến / Kết quả…).
 *
 * ── Các khối đặc thù của Lịch sử ───────────────────────────────────────
 *  timeline    Nhiều dòng bắt đầu bằng mốc thời gian liền nhau
 *              ("1930: …", "Tháng 8/1945 – …", "19/8/1945: …", "Thế kỉ XV: …")
 *  keyfacts    Thẻ sự kiện: Thời gian / Địa điểm / Lãnh đạo / Lực lượng / Tính chất…
 *  chain       Nguyên nhân → Diễn biến → Kết quả → Ý nghĩa
 *  assess      Thành tựu / Hạn chế (hoặc Mặt tích cực / Mặt tiêu cực)
 *  figure      "Nhân vật: Hồ Chí Minh (1890 – 1969): lãnh tụ …"
 *  source      "Tư liệu: “…” (Nguồn)" – trích sử liệu
 *  stats       Nhiều dòng "Nhãn: số + đơn vị" liền nhau (Lực lượng: 55 000 quân)
 *  table       Bảng dùng dấu "|" hoặc phím Tab (bảng so sánh, niên biểu)
 *  + concept, note, example, exercise, goal, list, labeled-list, paragraph
 */

/* ─────────────── Ghi chú: 4 tông màu của môn Sử ─────────────── */
export const NOTE_STYLES = {
  "chú ý": { tone: "gold", icon: "mdi-alert-circle-outline" },
  "lưu ý": { tone: "gold", icon: "mdi-alert-circle-outline" },
  "nhận xét": { tone: "indigo", icon: "mdi-information-outline" },
  "đánh giá": { tone: "indigo", icon: "mdi-scale-balance" },
  "liên hệ": { tone: "indigo", icon: "mdi-link-variant" },
  "mở rộng": { tone: "indigo", icon: "mdi-arrow-expand-all" },
  "ghi nhớ": { tone: "red", icon: "mdi-bookmark-star-outline" },
  "lỗi hay gặp": { tone: "red", icon: "mdi-alert-octagon-outline" },
  "cảnh báo": { tone: "red", icon: "mdi-alert-octagon-outline" },
  "mẹo nhớ": { tone: "jade", icon: "mdi-lightbulb-on-outline" },
  mẹo: { tone: "jade", icon: "mdi-lightbulb-on-outline" },
  "em có biết": { tone: "jade", icon: "mdi-book-open-page-variant-outline" },
};

const NOTE_RE =
  /^(chú ý|lưu ý|nhận xét|đánh giá|liên hệ|mở rộng|ghi nhớ|lỗi hay gặp|cảnh báo|mẹo nhớ|mẹo|em có biết)\s*[:.]\s*(.*)$/i;

/* ─────────────── Chủ đề của từng phần (màu + icon) ─────────────── */
const TOPICS = [
  {
    key: "figure",
    re: /nhân vật|danh nhân|tiểu sử|lãnh tụ|anh hùng/,
    theme: "gold",
    icon: "mdi-account-star-outline",
  },
  {
    key: "diplomacy",
    re: /ngoại giao|đối ngoại|quốc tế|hiệp định|hội nghị|liên hợp quốc|thế giới|liên minh|đồng minh/,
    theme: "indigo",
    icon: "mdi-handshake-outline",
  },
  {
    key: "military",
    re: /quân sự|chiến dịch|chiến thắng|chiến tranh|kháng chiến|khởi nghĩa|trận|chiến đấu|tổng tiến công/,
    theme: "red",
    icon: "mdi-sword-cross",
  },
  {
    key: "politics",
    re: /chính trị|cách mạng|đảng|nhà nước|chính quyền|phong trào|cải cách|chính sách|độc lập|thành lập/,
    theme: "red",
    icon: "mdi-flag-variant-outline",
  },
  {
    key: "economy",
    re: /kinh tế|nông nghiệp|công nghiệp|thương nghiệp|thủ công|ruộng đất|tài chính|sản xuất|thương mại/,
    theme: "jade",
    icon: "mdi-chart-line",
  },
  {
    key: "culture",
    re: /văn hóa|văn hoá|giáo dục|tôn giáo|tư tưởng|khoa học|nghệ thuật|văn học|kiến trúc/,
    theme: "gold",
    icon: "mdi-book-open-page-variant-outline",
  },
  {
    key: "society",
    re: /xã hội|giai cấp|đời sống|dân cư|tầng lớp|nông dân|công nhân/,
    theme: "gold",
    icon: "mdi-account-group-outline",
  },
  {
    key: "context",
    re: /bối cảnh|hoàn cảnh|tình hình|khái quát|nguồn gốc|nguyên nhân|giai đoạn|thời kì|thời kỳ/,
    theme: "indigo",
    icon: "mdi-history",
  },
  {
    key: "summary",
    re: /tổng kết|kết luận|tóm tắt|bài học|ý nghĩa|kết quả|đánh giá/,
    theme: "jade",
    icon: "mdi-bookmark-check-outline",
  },
];

export function detectTopic(title) {
  const t = String(title || "").toLocaleLowerCase("vi");
  const hit = TOPICS.find((x) => x.re.test(t));
  return hit
    ? { key: hit.key, theme: hit.theme, icon: hit.icon }
    : { key: "standard", theme: "red", icon: "mdi-script-text-outline" };
}

/* ─────────────── Nhận diện đề mục ─────────────── */
const HEADING_WORDS = [
  "bối cảnh lịch sử",
  "bối cảnh",
  "hoàn cảnh",
  "tình hình",
  "khái quát",
  "nguồn gốc",
  "giai đoạn",
  "thời kì",
  "thời kỳ",
  "chính trị",
  "kinh tế",
  "xã hội",
  "văn hóa",
  "văn hoá",
  "giáo dục",
  "quân sự",
  "ngoại giao",
  "đối ngoại",
  "chiến dịch",
  "chiến thắng",
  "chiến tranh",
  "kháng chiến",
  "khởi nghĩa",
  "cách mạng",
  "phong trào",
  "cải cách",
  "chính sách",
  "nhà nước",
  "chính quyền",
  "thế giới",
  "quốc tế",
  "lịch sử",
  "tổng kết",
  "kết luận",
  "tóm tắt",
].join("|");

const SECTION_KEYWORDS = new RegExp(
  `^((?:${HEADING_WORDS})[^:.\\n]{0,50}):\\s*(.*)$`,
  "i",
);
const NUMBERED_SECTION = new RegExp(`^(?:${HEADING_WORDS})`, "i");
const PERIOD_RE = /^(giai đoạn|thời kì|thời kỳ)/i;

const BLOCK_KEYWORDS =
  /^(định nghĩa|khái niệm|chú ý|lưu ý|nhận xét|đánh giá|liên hệ|mở rộng|ghi nhớ|lỗi hay gặp|cảnh báo|mẹo nhớ|mẹo|ví dụ|em có biết|nhân vật|danh nhân|tiểu sử|chân dung|trích dẫn|trích|tư liệu|sử liệu|nguồn tư liệu|bài tập|câu hỏi|luyện tập|vận dụng|thực hành|gợi ý|đáp án|đáp số|hướng dẫn)\s*[:.\d]/i;

const NUMBERED = /^([0-9]+|[IVX]+)[.)]\s+(\D.*)$/;
const ORDERED_STEP = /^([0-9]+)[.)]\s+(.+)$/;

/* ─────────────── Mốc thời gian ─────────────── */
const YEAR = "\\d{3,4}";
const DATE_ATOM = `(?:(?:ngày|tháng|năm)\\s+)?(?:\\d{1,2}\\s*[/.-]\\s*){0,2}${YEAR}`;
const CENTURY = "(?:thế\\s+kỉ|thế\\s+kỷ)\\s+(?:[IVXL]+|\\d{1,2})";
const DATE_SPAN = `(?:${CENTURY}|${DATE_ATOM}(?:\\s*[–—-]\\s*${DATE_ATOM})?)`;
const EVENT_RE = new RegExp(`^(${DATE_SPAN})\\s*[:–—-]\\s+(.+)$`, "iu");

/* ─────────────── Nhãn ngữ nghĩa ─────────────── */
const PRO_RE =
  /^(thành tựu|ưu điểm|mặt tích cực|tích cực|tiến bộ|đóng góp|thuận lợi)/i;
const CON_RE =
  /^(hạn chế|nhược điểm|mặt tiêu cực|tiêu cực|tồn tại|khó khăn|thiếu sót|thất bại|bất cập)/i;
const CAUSE_RE = /^(nguyên nhân|nguyên do|căn nguyên)/i;
const PROCESS_RE =
  /^(diễn biến|nội dung|quá trình|tiến trình|hoạt động|chủ trương)/i;
const RESULT_RE = /^(kết quả|kết cục|hậu quả|hệ quả|kết thúc)/i;
const MEANING_RE =
  /^(ý nghĩa|tác động|ảnh hưởng|bài học|vai trò|tầm quan trọng)/i;
const FACT_RE =
  /^(thời gian|địa điểm|địa bàn|người lãnh đạo|lãnh đạo|chỉ huy|lực lượng|bên tham chiến|tham gia|tính chất|mục tiêu|hình thức|đối tượng)/i;
const GROUP_EXTRA_RE =
  /^(đặc điểm|đặc trưng|biểu hiện|nội dung chính|nhận định|yêu cầu cần đạt|mục tiêu bài học|chuẩn bị)/i;

export function classifyLabel(label) {
  const l = String(label || "").trim();
  if (PRO_RE.test(l)) return "pro";
  if (CON_RE.test(l)) return "con";
  if (CAUSE_RE.test(l)) return "cause";
  if (PROCESS_RE.test(l)) return "process";
  if (RESULT_RE.test(l)) return "result";
  if (MEANING_RE.test(l)) return "meaning";
  if (FACT_RE.test(l)) return "fact";
  return null;
}

const isGroupLabel = (label) =>
  classifyLabel(label) !== null || GROUP_EXTRA_RE.test(String(label).trim());

const CHAIN_KINDS = ["cause", "process", "result", "meaning"];

/* ─────────────── Nhân vật / tư liệu / số liệu ─────────────── */
const FIGURE_RE = /^(nhân vật|danh nhân|tiểu sử|chân dung)\s*[:.]\s*(.+)$/i;
const SOURCE_RE =
  /^(trích dẫn|trích|tư liệu|sử liệu|nguồn tư liệu)\s*[:.]\s*(.+)$/i;

const STAT_RE =
  /^((?:khoảng|gần|hơn|trên|xấp xỉ|trung bình|từ)\s+|~\s*)?(\d[\d\s.,]*(?:\s*[–-]\s*\d[\d\s.,]*)?)\s*(%|°\s?[CF]|[^\d,;()]{0,24}?)\s*(?:[,;(]\s*(.+?)\)?)?$/i;

export function parseStat(text) {
  const m = String(text || "")
    .trim()
    .match(STAT_RE);
  if (!m) return null;
  const unit = (m[3] || "").trim();
  if (unit.split(/\s+/).filter(Boolean).length > 3) return null;
  return {
    prefix: (m[1] || "").trim(),
    value: m[2].trim().replace(/[,.\s]+$/, ""),
    unit,
    note: (m[4] || "").trim(),
  };
}

function parseFigure(text) {
  const t = String(text || "").trim();
  let head = t;
  let role = "";
  const c = t.indexOf(":");
  if (c > 0 && c <= 80) {
    head = t.slice(0, c);
    role = t.slice(c + 1).trim();
  } else {
    const d = t.match(/^(.{2,70}?)\s+[–—-]\s+(.+)$/);
    if (d) {
      head = d[1];
      role = d[2].trim();
    }
  }
  const life = head.match(/\(([^)]*)\)/);
  const name = head
    .replace(/\([^)]*\)/, "")
    .replace(/\s+/g, " ")
    .trim();
  return { name, life: life ? life[1].trim() : "", role };
}

function parseSource(text) {
  const t = String(text || "").trim();
  const q = t.match(/^["“«](.+?)["”»]\s*(?:[—–-]\s*|\(\s*)?(.*?)\)?\s*$/);
  if (q) return { quote: q[1].trim(), cite: q[2].trim() };
  return { quote: t, cite: "" };
}

const splitItems = (text) => {
  const parts = String(text)
    .split(/\s*;\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length > 1 ? parts : [String(text).trim()];
};

/* ─────────────── Nhận diện một dòng là đề mục? ─────────────── */
function detectHeading(line) {
  if (!line) return null;

  const markdown = line.match(/^#{1,6}\s+(.+)$/);
  if (markdown) return { title: markdown[1].trim(), rest: "" };

  const secPattern = line.match(
    /^(?:phần|mục|chương|bài)\s+(\d+|[IVX]+)\s*[:.\-–]\s*(.+)$/i,
  );
  if (secPattern) return { title: secPattern[2].trim(), rest: "" };

  if (BLOCK_KEYWORDS.test(line)) return null;
  if (EVENT_RE.test(line)) return null; // dòng mốc thời gian

  const colon = line.indexOf(":");
  if (colon > 0 && isGroupLabel(line.slice(0, colon))) return null;

  const kw = line.match(SECTION_KEYWORDS);
  if (kw) {
    const rest = kw[2].trim();
    if (PERIOD_RE.test(kw[1].trim()))
      return {
        title: rest ? `${kw[1].trim()}: ${rest}` : kw[1].trim(),
        rest: "",
      };
    if (rest === "" || rest.length > 80) return { title: kw[1].trim(), rest };
    return null; // "Kinh tế: nông nghiệp là chủ yếu" -> dòng thông tin
  }

  if (line.endsWith(":") && line.length <= 80 && line.split(/\s+/).length <= 12)
    return { title: line.slice(0, -1).trim(), rest: "" };

  return null;
}

function isNumberedHeading(line) {
  const secPattern = line.match(
    /^(?:phần|mục|chương|bài)\s+(\d+|[IVX]+)\s*[:.\-–]\s*(.+)$/i,
  );
  if (secPattern) return secPattern[2].trim().replace(/:$/, "");

  const m = line.match(NUMBERED);
  if (!m) return null;
  if (/^[IVX]+$/.test(m[1])) return m[2].trim().replace(/:$/, "");
  const t = m[2].trim();
  if (NUMBERED_SECTION.test(t)) return t.replace(/:$/, "");
  if (t.length <= 60 && !/[.;,:]$/.test(t) && t.split(/\s+/).length <= 10)
    return t;
  return null;
}

/* ─────────────── Một dòng → một khối thô ─────────────── */
function toBlock(line) {
  const numbered = line.match(/^[-*•]\s+(\d+)[.)]\s+(.+)$/);
  if (numbered)
    return {
      type: "list-item",
      text: numbered[2],
      number: Number(numbered[1]),
    };
  const bullet = line.match(/^[-*•]\s+(.+)$/);
  if (bullet) return { type: "list-item", text: bullet[1] };

  const def = line.match(/^(định nghĩa|khái niệm)\s*[:.]\s*(.*)$/i);
  if (def)
    return {
      type: "concept",
      label: def[1].charAt(0).toUpperCase() + def[1].slice(1),
      text: def[2],
    };

  const note = line.match(NOTE_RE);
  if (note) {
    const key = note[1].toLowerCase();
    const style = NOTE_STYLES[key] || NOTE_STYLES["ghi nhớ"];
    return { type: "note", title: note[1], desc: note[2], ...style };
  }

  const eg = line.match(/^ví dụ(\s*\d+)?\s*[:.]?\s*(.*)$/i);
  if (eg)
    return {
      type: "example",
      badgeTitle: `Ví dụ ${eg[1]?.trim() || ""}`.trim(),
      problemText: eg[2],
    };

  const exHead = line.match(
    /^(bài tập|câu hỏi|luyện tập|vận dụng|thực hành)(\s*\d+)?\s*[:.]\s*(.*)$/i,
  );
  if (exHead) {
    const t = exHead[1];
    return {
      type: "exercise-head",
      title: (
        t.charAt(0).toUpperCase() +
        t.slice(1) +
        (exHead[2] || "")
      ).trim(),
      text: exHead[3],
    };
  }
  const ans = line.match(/^(gợi ý|đáp án|đáp số|hướng dẫn)\s*[:.]\s*(.*)$/i);
  if (ans) return { type: "answer", label: ans[1], text: ans[2] };

  // Bảng: dùng dấu | hoặc Tab
  if (line.includes("|") || line.includes("\t")) {
    const cells = line
      .split(/\t|\|/)
      .map((s) => s.trim())
      .filter((s, i, arr) => s !== "" || (i > 0 && i < arr.length - 1));
    if (cells.filter(Boolean).length >= 2) return { type: "table-row", cells };
  }

  const src = line.match(SOURCE_RE);
  if (src) return { type: "source", ...parseSource(src[2]) };

  const fig = line.match(FIGURE_RE);
  if (fig) {
    const f = parseFigure(fig[2]);
    if (f.name) return { type: "figure", ...f };
  }

  const ev = line.match(EVENT_RE);
  if (ev) return { type: "event-row", time: ev[1].trim(), text: ev[2].trim() };

  const goal = line.match(
    /^(yêu cầu cần đạt|mục tiêu bài học)\s*[:.]\s*(.*)$/i,
  );
  if (goal) {
    return {
      type: "goal-head",
      title: goal[1].charAt(0).toUpperCase() + goal[1].slice(1),
      text: goal[2] || "",
    };
  }

  const head = line.match(/^([^:.]{2,48}):$/);
  if (head && isGroupLabel(head[1]))
    return { type: "label-head", label: head[1].trim() };

  const lab = line.match(/^([^:.]{2,48}):\s+(.+)$/);
  if (lab && lab[1].trim().split(/\s+/).length <= 9)
    return { type: "labeled", label: lab[1].trim(), text: lab[2].trim() };

  return { type: "paragraph", text: line };
}

/* ─────────────── Gom các khối thô thành khối hoàn chỉnh ─────────────── */
function collect(raw) {
  const mid = [];
  for (let i = 0; i < raw.length; i += 1) {
    const b = raw[i];

    if (b.type === "goal-head") {
      const items = b.text ? [b.text] : [];
      let j = i + 1;
      while (j < raw.length) {
        const n = raw[j];
        if (n.type === "list-item" || n.type === "paragraph") {
          items.push(n.text);
          j += 1;
        } else {
          break;
        }
      }
      i = j - 1;
      mid.push({ type: "goal", title: b.title, items });
      continue;
    }

    if (b.type === "label-head") {
      const items = [];
      let j = i + 1;
      if (raw[j]?.type === "list-item") {
        while (raw[j]?.type === "list-item") items.push(raw[j++].text);
      } else if (raw[j]?.type === "event-row") {
        // "Diễn biến:" theo sau là các dòng mốc thời gian
        while (raw[j]?.type === "event-row") {
          items.push(`${raw[j].time}: ${raw[j].text}`);
          j += 1;
        }
      } else {
        while (
          raw[j]?.type === "paragraph" &&
          (items.length === 0 || !raw[j].breakBefore)
        )
          items.push(raw[j++].text);
      }
      i = j - 1;
      mid.push({
        type: "entry",
        label: b.label,
        text: items.join("; "),
        items,
      });
      continue;
    }

    if (b.type === "labeled") {
      const kind = classifyLabel(b.label);
      mid.push({
        type: "entry",
        label: b.label,
        text: b.text,
        items: kind ? splitItems(b.text) : [b.text],
      });
      continue;
    }

    if (b.type === "exercise-head") {
      const items = b.text ? [b.text] : [];
      let answers = "";
      let j = i + 1;
      while (j < raw.length) {
        const n = raw[j];
        if (n.type === "answer") {
          answers = n.text;
          j += 1;
          break;
        }
        if (n.type === "list-item" || n.type === "paragraph")
          items.push(n.text);
        else if (n.type === "labeled") items.push(`${n.label}: ${n.text}`);
        else break;
        j += 1;
      }
      i = j - 1;
      mid.push({ type: "exercise", title: b.title, items, answers });
      continue;
    }

    if (b.type === "answer") {
      mid.push({
        type: "paragraph",
        text: `${b.label}: ${b.text}`,
        breakBefore: true,
      });
      continue;
    }

    mid.push(b);
  }
  return mid;
}

function finalizeEntries(group) {
  const entries = group._entries;

  if (group._cat === "pc") {
    const pros = entries.filter((e) => e.kind === "pro");
    const cons = entries.filter((e) => e.kind === "con");
    return [
      {
        type: "assess",
        prosLabel: pros[0]?.label || "",
        consLabel: cons[0]?.label || "",
        pros: pros.flatMap((e) => e.items),
        cons: cons.flatMap((e) => e.items),
      },
    ];
  }

  if (group._cat === "chain" && entries.length >= 2) {
    return [
      {
        type: "chain",
        steps: entries.map((e) => ({
          kind: e.kind,
          label: e.label,
          items: e.items,
        })),
      },
    ];
  }

  if (group._cat === "keyfacts" && entries.length >= 2) {
    return [
      {
        type: "keyfacts",
        items: entries.map((e) => ({ label: e.label, text: e.text })),
      },
    ];
  }

  const items = entries.map((e) => ({ label: e.label, text: e.text }));
  const stats = items.map((it) => parseStat(it.text));
  const hit = stats.filter(Boolean).length;
  if (items.length >= 2 && hit / items.length >= 0.6) {
    return [
      {
        type: "stats",
        items: items.map((it, i) => ({
          label: it.label,
          text: it.text,
          ...(stats[i] || { value: "", unit: "", prefix: "", note: "" }),
        })),
      },
    ];
  }
  return [{ type: "labeled-list", items }];
}

function buildBlocks(raw) {
  const mid = collect(raw);
  const out = [];

  for (const b of mid) {
    const last = out[out.length - 1];

    if (b.type === "entry") {
      const kind = classifyLabel(b.label);
      let cat = "facts";
      if (kind === "pro" || kind === "con") cat = "pc";
      else if (CHAIN_KINDS.includes(kind)) cat = "chain";
      else if (kind === "fact") cat = "keyfacts";
      const entry = { ...b, kind };
      if (last?._cat === cat) last._entries.push(entry);
      else out.push({ _cat: cat, _entries: [entry] });
      continue;
    }
    if (b.type === "event-row") {
      const item = { time: b.time, text: b.text };
      if (last?.type === "timeline") last.items.push(item);
      else out.push({ type: "timeline", items: [item] });
      continue;
    }
    if (b.type === "table-row") {
      if (last?.type === "table") last._rows.push(b.cells);
      else out.push({ type: "table", _rows: [b.cells] });
      continue;
    }
    if (b.type === "list-item") {
      const item = { text: b.text, number: b.number };
      if (last?.type === "list") last.items.push(item);
      else out.push({ type: "list", items: [item] });
      continue;
    }
    if (
      b.type === "paragraph" &&
      last?.type === "paragraph" &&
      !b.breakBefore
    ) {
      last.text += ` ${b.text}`;
      continue;
    }
    out.push(b);
  }

  return out.flatMap((x) => {
    if (x._cat) return finalizeEntries(x);
    if (x.type === "timeline" && x.items.length < 2)
      return [
        {
          type: "labeled-list",
          items: x.items.map((i) => ({ label: i.time, text: i.text })),
        },
      ];
    if (x.type === "table") {
      const rows = x._rows.filter(
        (r) => !r.every((c) => /^:?-{2,}:?$/.test(c)),
      );
      const [headers = [], ...body] = rows;
      return [{ type: "table", headers, rows: body }];
    }
    return [x];
  });
}

/* ─────────────── API công khai ─────────────── */
export function parseHistorySections(content) {
  if (!content?.trim()) return [];

  const groups = [];
  let current = null;
  const open = (title, rest) => {
    current = { title, cleanTitle: title, lines: [] };
    groups.push(current);
    if (rest) current.lines.push({ text: rest, gap: false });
  };

  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) continue;

    let prev = index - 1;
    while (prev >= 0 && !lines[prev].trim()) prev -= 1;
    const gap = prev >= 0 && prev < index - 1;

    const numberedTitle = isNumberedHeading(line);
    if (numberedTitle) {
      open(numberedTitle, "");
      continue;
    }

    const step = line.match(ORDERED_STEP);
    if (step) {
      if (!current) open("Khái quát", "");
      current.lines.push({ text: `- ${step[1]}. ${step[2]}`, gap });
      continue;
    }

    const heading = detectHeading(line);
    if (heading) {
      open(heading.title, heading.rest);
      continue;
    }

    if (!current) open("Khái quát", "");
    current.lines.push({ text: line, gap });
  }

  return groups.map((g) => ({
    type: "standard",
    title: g.title,
    cleanTitle: g.cleanTitle,
    topic: detectTopic(g.title),
    blocks: buildBlocks(
      g.lines.map((l) => ({ ...toBlock(l.text), breakBefore: l.gap })),
    ),
  }));
}

export function extractHistoryTips(content) {
  if (!content) return [];
  return content
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => NOTE_RE.test(l))
    .map((line) => {
      const m = line.match(NOTE_RE);
      const style = NOTE_STYLES[m[1].toLowerCase()] || NOTE_STYLES["ghi nhớ"];
      return {
        title: m[1].charAt(0).toUpperCase() + m[1].slice(1),
        desc: m[2].trim(),
        icon: style.icon,
        color: style.tone,
      };
    });
}
