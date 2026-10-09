/**
 * literatureParser.js  (đặt tại src/utils/literatureParser.js)
 *
 * Parser nội dung bài học môn Ngữ Văn.
 * Dùng chung cho:
 *  - LiteratureLessonContent.vue  (hiển thị nội dung)
 *  - Trang chi tiết bài học       (mục lục, số "phần trọng tâm")
 * để số phần ở hai nơi luôn khớp nhau.
 *
 * Nhận diện đề mục theo 3 cách (theo thứ tự ưu tiên):
 *  1. Có số thứ tự:            "1. Tác giả", "II) Bố cục"
 *  2. Từ khóa mục quen thuộc:  "Tác giả: ...", "Bố cục: ...", "Giá trị nghệ thuật: ..."
 *                              (phần sau dấu ":" trở thành đoạn đầu của mục)
 *  3. Dòng ngắn kết thúc ":":  "Tóm tắt chi tiết:", "Giá trị nội dung:"
 *
 * Thay đổi so với bản trước: các đoạn văn cách nhau bằng dòng trống được GIỮ RIÊNG
 * (trước đây bị nối hết thành một đoạn dài). Chỉ những dòng liền nhau (không có dòng
 * trống) mới được nối lại, để xử lý trường hợp văn bản bị ngắt dòng cứng.
 */

// Màu + icon của từng loại ghi chú (cùng bộ nhãn với trang Toán)
export const NOTE_STYLES = {
  "chú ý": { tone: "amber", icon: "mdi-alert-circle-outline" },
  "lưu ý": { tone: "amber", icon: "mdi-alert-circle-outline" },
  "nhận xét": { tone: "blue", icon: "mdi-information-outline" },
  "ghi nhớ": { tone: "purple", icon: "mdi-star-outline" },
  "lỗi hay gặp": { tone: "red", icon: "mdi-alert-octagon-outline" },
  "cảnh báo": { tone: "red", icon: "mdi-alert-octagon-outline" },
  mẹo: { tone: "green", icon: "mdi-lightbulb-on-outline" },
};

// Từ khóa mở đầu một mục lớn. Thêm từ khóa mới vào đây nếu bài khác có mục khác.
const SECTION_KEYWORDS =
  /^((?:tác giả|tác phẩm|tóm tắt|bố cục|xuất xứ|hoàn cảnh sáng tác|thể loại|chủ đề|nhan đề|nội dung|nghệ thuật|giá trị|ý nghĩa|đặc sắc|kết luận|tổng kết)[^:.\n]{0,50}):\s*(.*)$/i;

// Các dòng này là khối riêng (khái niệm / ghi chú / ví dụ), không phải đề mục
const BLOCK_KEYWORDS =
  /^(định nghĩa|khái niệm|định lí|tính chất|chú ý|lưu ý|nhận xét|ghi nhớ|lỗi hay gặp|cảnh báo|mẹo|ví dụ)/i;

const NUMBERED = /^([0-9]+|[IVX]+)[\.\)]\s*(.+)$/;
const ORDERED_STEP = /^([0-9]+)[\.\)]\s+(.+)$/;
const NUMBERED_SECTION =
  /^(?:tác giả|tác phẩm|tóm tắt|bố cục|xuất xứ|hoàn cảnh sáng tác|thể loại|chủ đề|nhan đề|nội dung|nghệ thuật|giá trị|ý nghĩa|đặc sắc|kết luận|tổng kết)\b/i;

function detectHeading(line) {
  if (!line) return null;

  // Accept Markdown headings and numbered headings even when their first
  // paragraph continues on the same line.
  const markdown = line.match(/^#{1,6}\s+(.+)$/);
  if (markdown) return { title: markdown[1].trim(), rest: "" };

  const num = line.match(NUMBERED);
  if (num) return { title: num[2].trim(), rest: "" };
  if (BLOCK_KEYWORDS.test(line)) return null;

  // Đề mục theo từ khóa: dòng có thể rất dài vì nội dung nằm ngay sau dấu ":"
  const kw = line.match(SECTION_KEYWORDS);
  if (kw) return { title: kw[1].trim(), rest: kw[2].trim() };

  if (
    line.endsWith(":") &&
    line.length <= 80 &&
    line.split(/\s+/).length <= 12
  ) {
    return { title: line.slice(0, -1).trim(), rest: "" };
  }
  return null;
}

function toBlock(line) {
  const numbered = line.match(/^[-*•]\s+(\d+)[.)]\s+(.+)$/);
  if (numbered)
    return {
      type: "list-item",
      text: numbered[2],
      number: Number(numbered[1]),
    };
  const bullet = line.match(/^(?:[-*•])\s+(.+)$/);
  if (bullet) return { type: "list-item", text: bullet[1] };

  const def = line.match(
    /^(định nghĩa|khái niệm|định lí|tính chất)[:\.]\s*(.*)$/i,
  );
  if (def) {
    const label = def[1];
    return {
      type: "concept",
      label: label.charAt(0).toUpperCase() + label.slice(1),
      text: def[2],
    };
  }

  const note = line.match(
    /^(chú ý|lưu ý|nhận xét|ghi nhớ|lỗi hay gặp|cảnh báo|mẹo)[:\.]\s*(.*)$/i,
  );
  if (note) {
    const style = NOTE_STYLES[note[1].toLowerCase()] || NOTE_STYLES["ghi nhớ"];
    return { type: "note", title: note[1], desc: note[2], ...style };
  }

  const eg = line.match(/^ví dụ(\s*\d+)?[:\.]?\s*(.*)$/i);
  if (eg) {
    return {
      type: "example",
      badgeTitle: `Ví dụ ${eg[1]?.trim() || ""}`.trim() || "Ví dụ",
      problemText: eg[2],
      solutionPhases: [],
    };
  }

  // "Kì ảo: ...", "Từ đầu đến “cha Đản”: ..." -> nhãn ngắn + nội dung
  const lab = line.match(/^([^:.]{2,36}):\s+(.+)$/);
  if (lab && lab[1].trim().split(/\s+/).length <= 8) {
    return { type: "labeled", label: lab[1].trim(), text: lab[2].trim() };
  }

  return { type: "paragraph", text: line };
}

// Keep ordinary prose as prose. Only explicit bullets become a list.
function groupBlocks(blocks) {
  const out = [];

  for (const b of blocks) {
    const last = out[out.length - 1];

    if (b.type === "labeled") {
      if (last?.type === "labeled-list")
        last.items.push({ label: b.label, text: b.text });
      else
        out.push({
          type: "labeled-list",
          items: [{ label: b.label, text: b.text }],
        });
      continue;
    }

    if (b.type === "list-item") {
      const item = { text: b.text, number: b.number };
      if (last?.type === "list") last.items.push(item);
      else out.push({ type: "list", items: [item] });
      continue;
    }

    // Nối các dòng bị ngắt cứng thành một đoạn, NHƯNG giữ riêng các đoạn
    // được tách nhau bởi dòng trống trong văn bản gốc.
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
  return out;
}

export function parseLiteratureSections(content) {
  if (!content?.trim()) return [];

  const groups = [];
  let current = null;

  const lines = content.replace(/\r\n?/g, "\n").split("\n");
  for (let index = 0; index < lines.length; index += 1) {
    const raw = lines[index];
    const line = raw.trim();
    if (!line) continue;

    let previousIndex = index - 1;
    while (previousIndex >= 0 && !lines[previousIndex].trim())
      previousIndex -= 1;
    let nextIndex = index + 1;
    while (nextIndex < lines.length && !lines[nextIndex].trim()) nextIndex += 1;
    // Có dòng trống nằm giữa dòng này và dòng nội dung liền trước?
    const gap = previousIndex >= 0 && previousIndex < index - 1;
    const previousIsStep = ORDERED_STEP.test(
      lines[previousIndex]?.trim() || "",
    );
    const nextIsStep = ORDERED_STEP.test(lines[nextIndex]?.trim() || "");
    const orderedStep = line.match(ORDERED_STEP);
    const isNumberedListItem =
      orderedStep &&
      !NUMBERED_SECTION.test(orderedStep[2]) &&
      (current !== null || previousIsStep || nextIsStep);

    if (isNumberedListItem) {
      if (!current) {
        current = { title: "Giới thiệu", cleanTitle: "Giới thiệu", lines: [] };
        groups.push(current);
      }
      const [, number, text] = line.match(ORDERED_STEP);
      current.lines.push({ text: `- ${number}. ${text}`, gap });
      continue;
    }

    const heading = detectHeading(line);
    if (heading) {
      current = { title: heading.title, cleanTitle: heading.title, lines: [] };
      groups.push(current);
      if (heading.rest) current.lines.push({ text: heading.rest, gap: false });
    } else {
      if (!current) {
        current = { title: "Giới thiệu", cleanTitle: "Giới thiệu", lines: [] };
        groups.push(current);
      }
      current.lines.push({ text: line, gap });
    }
  }

  return groups.map((g) => ({
    type: "standard",
    title: g.title,
    cleanTitle: g.cleanTitle,
    blocks: groupBlocks(
      g.lines.map((l) => ({ ...toBlock(l.text), breakBefore: l.gap })),
    ),
  }));
}

export function extractLiteratureTips(content) {
  if (!content) return [];
  return content
    .split("\n")
    .map((l) => l.trim())
    .filter((l) =>
      /^(chú ý|lưu ý|nhận xét|ghi nhớ|lỗi hay gặp|cảnh báo|mẹo):/i.test(l),
    )
    .map((line) => {
      const i = line.indexOf(":");
      const title = line.substring(0, i).trim();
      const style = NOTE_STYLES[title.toLowerCase()] || NOTE_STYLES["ghi nhớ"];
      return {
        title,
        desc: line.substring(i + 1).trim(),
        icon: style.icon,
        color: style.tone,
      };
    });
}
