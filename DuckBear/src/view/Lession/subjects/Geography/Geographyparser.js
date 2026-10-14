/**
 * Geographyparser.js
 *
 * Parser nội dung bài học môn Địa lí – cùng vai trò với Literatureparser.js.
 * Dùng chung cho:
 *  - GeographyLessonContent.vue (hiển thị nội dung)
 *  - Trang chi tiết bài học (mục lục, số "phần trọng tâm")
 *
 * ── Cách nhận diện đề mục ──────────────────────────────────────────────
 *  1. Số La Mã luôn là đề mục:          "I. Vị trí địa lí", "II) Đặc điểm"
 *  2. Số thường là đề mục khi ngắn, không kết thúc bằng dấu câu, hoặc bắt đầu
 *     bằng từ khóa mục:                 "1. Địa hình", "2. Khí hậu"
 *     (ngược lại "1. Núi chiếm 3/4 diện tích." được coi là một ý trong danh sách)
 *  3. Từ khóa chủ đề địa lí + dấu ":":   "Khí hậu:" (đứng một mình) hoặc
 *     "Khí hậu: <đoạn dài hơn 80 ký tự>". Nếu sau dấu ":" chỉ là một số liệu ngắn
 *     ("Khí hậu: nhiệt đới ẩm gió mùa") thì đó là một dòng thông tin, KHÔNG phải đề mục.
 *  4. Dòng ngắn kết thúc bằng ":" (trừ các nhãn Thuận lợi / Khó khăn / Nguyên nhân…).
 *
 * ── Các khối đặc thù của Địa lí ────────────────────────────────────────
 *  stats       Nhiều dòng "Nhãn: số + đơn vị" liền nhau  (Diện tích: 331 212 km²)
 *  pros-cons   Thuận lợi / Khó khăn (hoặc Thế mạnh / Hạn chế)
 *  causal      Nguyên nhân → Hậu quả → Giải pháp
 *  compass     Phía bắc: … / Phía nam: … / Đông: … / Tây: …  (la bàn)
 *  extremes    Cực Bắc: 23°23′B (xã Lũng Cú…)               (các điểm cực)
 *  table       Bảng dùng dấu "|" hoặc phím Tab
 *  + concept, note, example, exercise, list, labeled-list, paragraph
 */

/* ─────────────── Ghi chú: 4 tông màu = 4 màu bản đồ ─────────────── */
export const NOTE_STYLES = {
  "chú ý": { tone: "land", icon: "mdi-alert-circle-outline" },
  "lưu ý": { tone: "land", icon: "mdi-alert-circle-outline" },
  "nhận xét": { tone: "sea", icon: "mdi-information-outline" },
  "ghi nhớ": { tone: "pin", icon: "mdi-map-marker-star-outline" },
  "lỗi hay gặp": { tone: "pin", icon: "mdi-alert-octagon-outline" },
  "cảnh báo": { tone: "pin", icon: "mdi-alert-octagon-outline" },
  mẹo: { tone: "forest", icon: "mdi-lightbulb-on-outline" },
  "em có biết": { tone: "forest", icon: "mdi-earth" },
  "kĩ năng": { tone: "sea", icon: "mdi-map-search-outline" },
  "kỹ năng": { tone: "sea", icon: "mdi-map-search-outline" },
  "sử dụng atlat": { tone: "sea", icon: "mdi-map-search-outline" },
  atlat: { tone: "sea", icon: "mdi-map-search-outline" },
};

const NOTE_RE =
  /^(chú ý|lưu ý|nhận xét|ghi nhớ|lỗi hay gặp|cảnh báo|mẹo|em có biết|kĩ năng|kỹ năng|sử dụng atlat|atlat)\s*[:.]\s*(.*)$/i;

/* ─────────────── Chủ đề của từng phần (màu + icon) ─────────────── */
const TOPICS = [
  {
    key: "location",
    re: /vị trí|phạm vi|giới hạn|lãnh thổ|tọa độ|toạ độ/,
    theme: "pin",
    icon: "mdi-map-marker-radius-outline",
  },
  {
    key: "climate",
    re: /khí hậu|thời tiết|gió mùa|nhiệt độ|lượng mưa/,
    theme: "sea",
    icon: "mdi-weather-partly-rainy",
  },
  {
    key: "water",
    re: /sông|hồ|nước|thủy văn|thuỷ văn/,
    theme: "sea",
    icon: "mdi-waves",
  },
  { key: "sea", re: /biển|đảo|hải/, theme: "sea", icon: "mdi-sail-boat" },
  {
    key: "terrain",
    re: /địa hình|núi|đồng bằng|cao nguyên|địa chất/,
    theme: "land",
    icon: "mdi-terrain",
  },
  {
    key: "resources",
    re: /khoáng sản|tài nguyên/,
    theme: "land",
    icon: "mdi-diamond-stone",
  },
  {
    key: "bio",
    re: /sinh vật|thực vật|động vật|rừng|đất đai|thổ nhưỡng/,
    theme: "forest",
    icon: "mdi-pine-tree",
  },
  {
    key: "environment",
    re: /môi trường|thiên tai|bảo vệ|biến đổi khí hậu/,
    theme: "forest",
    icon: "mdi-leaf",
  },
  {
    key: "population",
    re: /dân cư|dân số|dân tộc|lao động/,
    theme: "pin",
    icon: "mdi-account-group-outline",
  },
  {
    key: "urban",
    re: /đô thị|thành phố|nông thôn/,
    theme: "land",
    icon: "mdi-city-variant-outline",
  },
  {
    key: "agri",
    re: /nông nghiệp|lâm nghiệp|thủy sản|thuỷ sản|trồng trọt|chăn nuôi/,
    theme: "forest",
    icon: "mdi-sprout-outline",
  },
  {
    key: "industry",
    re: /công nghiệp|năng lượng/,
    theme: "land",
    icon: "mdi-factory",
  },
  {
    key: "service",
    re: /dịch vụ|giao thông|thương mại|du lịch|viễn thông/,
    theme: "sea",
    icon: "mdi-truck-delivery-outline",
  },
  {
    key: "region",
    re: /vùng|khu vực|miền|tiểu vùng/,
    theme: "pin",
    icon: "mdi-map-outline",
  },
  {
    key: "summary",
    re: /tổng kết|kết luận|tóm tắt|ghi nhớ/,
    theme: "land",
    icon: "mdi-bookmark-check-outline",
  },
];

export function detectTopic(title) {
  const t = String(title || "").toLocaleLowerCase("vi");
  const hit = TOPICS.find((x) => x.re.test(t));
  return hit
    ? { key: hit.key, theme: hit.theme, icon: hit.icon }
    : { key: "standard", theme: "sea", icon: "mdi-earth" };
}

/* ─────────────── Nhận diện đề mục ─────────────── */
const HEADING_WORDS = [
  "vị trí địa lí",
  "vị trí địa lý",
  "vị trí",
  "phạm vi lãnh thổ",
  "phạm vi",
  "giới hạn",
  "lãnh thổ",
  "địa hình",
  "khoáng sản",
  "khí hậu",
  "sông ngòi",
  "đất đai",
  "sinh vật",
  "thiên nhiên",
  "tự nhiên",
  "tài nguyên",
  "môi trường",
  "thiên tai",
  "dân cư",
  "dân số",
  "dân tộc",
  "đô thị",
  "lao động",
  "kinh tế",
  "nông nghiệp",
  "lâm nghiệp",
  "thủy sản",
  "thuỷ sản",
  "công nghiệp",
  "dịch vụ",
  "giao thông",
  "thương mại",
  "du lịch",
  "biển",
  "đảo",
  "khái quát",
  "tổng kết",
  "kết luận",
  "tóm tắt",
  "vùng",
  "khu vực",
].join("|");

const SECTION_KEYWORDS = new RegExp(
  `^((?:${HEADING_WORDS})[^:.\\n]{0,50}):\\s*(.*)$`,
  "i",
);
const NUMBERED_SECTION = new RegExp(`^(?:${HEADING_WORDS})`, "i");

const BLOCK_KEYWORDS =
  /^(định nghĩa|khái niệm|chú ý|lưu ý|nhận xét|ghi nhớ|lỗi hay gặp|cảnh báo|mẹo|ví dụ|em có biết|kĩ năng|kỹ năng|sử dụng atlat|atlat|bài tập|câu hỏi|luyện tập|vận dụng|thực hành|gợi ý|đáp án|đáp số|hướng dẫn)\s*[:.\d]/i;

const NUMBERED = /^([0-9]+|[IVX]+)[.)]\s+(\D.*)$/;
const ORDERED_STEP = /^([0-9]+)[.)]\s+(.+)$/;

/* ─────────────── Nhãn ngữ nghĩa ─────────────── */
const PRO_RE = /^(thuận lợi|thế mạnh|ưu điểm|tiềm năng|điều kiện thuận lợi)/i;
const CON_RE = /^(khó khăn|hạn chế|nhược điểm|thách thức|bất lợi)/i;
const CAUSE_RE = /^(nguyên nhân)/i;
const EFFECT_RE = /^(hậu quả|hệ quả|tác động|ảnh hưởng)/i;
const SOLUTION_RE = /^(giải pháp|biện pháp|phương hướng|hướng khắc phục)/i;
const GROUP_EXTRA_RE =
  /^(đặc điểm|biểu hiện|vai trò|ý nghĩa|các nhân tố|nhân tố|thực trạng|hiện trạng|phân bố|tình hình)/i;

export function classifyLabel(label) {
  const l = String(label || "").trim();
  if (PRO_RE.test(l)) return "pro";
  if (CON_RE.test(l)) return "con";
  if (CAUSE_RE.test(l)) return "cause";
  if (EFFECT_RE.test(l)) return "effect";
  if (SOLUTION_RE.test(l)) return "solution";
  return null;
}

const isGroupLabel = (label) =>
  classifyLabel(label) !== null || GROUP_EXTRA_RE.test(String(label).trim());

/* ─────────────── La bàn / điểm cực / số liệu ─────────────── */
const DIRECTION_RE =
  /^(?:phía\s+|hướng\s+)?(đông bắc|tây bắc|đông nam|tây nam|bắc|nam|đông|tây)\s*:\s*(.+)$/i;
const EXTREME_RE = /^cực\s+(bắc|nam|đông|tây)\s*[:\-–]\s*(.+)$/i;
const COORD_RE = /\d{1,3}\s*°\s*\d{0,2}\s*['′’]?\s*[BNĐT](?!\p{L})/u;

const DIR_KEY = {
  bắc: "n",
  nam: "s",
  đông: "e",
  tây: "w",
  "đông bắc": "ne",
  "tây bắc": "nw",
  "đông nam": "se",
  "tây nam": "sw",
};

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

  if (BLOCK_KEYWORDS.test(line)) return null;
  if (EXTREME_RE.test(line) || DIRECTION_RE.test(line)) return null;

  const colon = line.indexOf(":");
  if (colon > 0 && isGroupLabel(line.slice(0, colon))) return null;

  const kw = line.match(SECTION_KEYWORDS);
  if (kw) {
    const rest = kw[2].trim();
    if (rest === "" || rest.length > 80) return { title: kw[1].trim(), rest };
    return null; // "Khí hậu: nhiệt đới ẩm" -> dòng thông tin, không phải đề mục
  }

  if (line.endsWith(":") && line.length <= 80 && line.split(/\s+/).length <= 12)
    return { title: line.slice(0, -1).trim(), rest: "" };

  return null;
}

function isNumberedHeading(line) {
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

  const ext = line.match(EXTREME_RE);
  if (ext) {
    const text = ext[2].trim();
    const coord = (text.match(COORD_RE) || [""])[0].replace(/\s+/g, "");
    const place = text
      .replace(COORD_RE, "")
      .replace(/^[\s,;–-]+/, "")
      .replace(/^\((.*)\)$/, "$1")
      .trim();
    return {
      type: "extreme",
      key: DIR_KEY[ext[1].toLowerCase()],
      label: `Cực ${ext[1].toLowerCase()}`,
      coord,
      place,
      text,
    };
  }

  const dir = line.match(DIRECTION_RE);
  if (dir) {
    const d = dir[1].toLowerCase();
    return {
      type: "direction",
      key: DIR_KEY[d],
      label: `Phía ${d}`,
      text: dir[2].trim(),
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

    if (b.type === "label-head") {
      const items = [];
      let j = i + 1;
      if (raw[j]?.type === "list-item") {
        while (raw[j]?.type === "list-item") items.push(raw[j++].text);
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
        type: "pros-cons",
        prosLabel: pros[0]?.label || "",
        consLabel: cons[0]?.label || "",
        pros: pros.flatMap((e) => e.items),
        cons: cons.flatMap((e) => e.items),
      },
    ];
  }

  if (group._cat === "causal" && entries.length >= 2) {
    return [
      {
        type: "causal",
        steps: entries.map((e) => ({
          kind: e.kind,
          label: e.label,
          items: e.items,
        })),
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
      const cat =
        kind === "pro" || kind === "con" ? "pc" : kind ? "causal" : "facts";
      const entry = { ...b, kind };
      if (last?._cat === cat) last._entries.push(entry);
      else out.push({ _cat: cat, _entries: [entry] });
      continue;
    }
    if (b.type === "direction") {
      if (last?.type === "compass") last.items.push(b);
      else out.push({ type: "compass", items: [b] });
      continue;
    }
    if (b.type === "extreme") {
      if (last?.type === "extremes") last.items.push(b);
      else out.push({ type: "extremes", items: [b] });
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
    if (x.type === "compass" && x.items.length < 2)
      return x.items.map((i) => ({
        type: "labeled-list",
        items: [{ label: i.label, text: i.text }],
      }));
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
export function parseGeographySections(content) {
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

export function extractGeographyTips(content) {
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
