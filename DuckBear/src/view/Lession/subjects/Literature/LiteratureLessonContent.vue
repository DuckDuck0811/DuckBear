<template>
  <!-- Môn Ngữ Văn – trang sách: không thẻ, không bóng đổ, chỉ giấy – mực – son đỏ -->
  <div class="lit-page" :class="`lit-font-${fontSize}`">
    <!-- ── Mỗi phần học ── -->
    <article
      v-for="(sec, secIdx) in viewSections"
      :key="secIdx"
      :id="`lesson-section-${secIdx}`"
      class="lit-section"
    >
      <!-- Tiêu đề phần: số La Mã nghiêng + tên, gạch đôi bên dưới như đầu chương sách -->
      <header class="lit-section-head">
        <span class="lit-section-num" aria-hidden="true">{{
          toRoman(secIdx + 1)
        }}</span>
        <span
          class="lit-section-icon"
          :class="`lit-section-icon--${sec.layout}`"
          aria-hidden="true"
        >
          <v-icon :icon="sectionIcon(sec.layout, sec.title)" size="18" />
        </span>
        <h2 class="lit-section-title">
          <span class="lit-sr-only">Phần {{ secIdx + 1 }}: </span
          >{{ sec.cleanTitle || sec.title }}
        </h2>
      </header>

      <!-- Nội dung: mỗi loại khối có một cách trình bày riêng -->
      <div class="lit-body" :class="`lit-layout-${sec.layout}`">
        <template v-for="(block, bIdx) in sec.blocks" :key="bIdx">
          <!-- Tác giả → con dấu + tiểu sử -->
          <section v-if="block.type === 'author'" class="lit-author">
            <span class="lit-author-seal" aria-hidden="true">
              <v-icon icon="mdi-feather" size="21" />
            </span>
            <div>
              <h3 class="lit-author-label">
                {{ block.label || "Tác giả" }}
              </h3>
              <p class="lit-author-text">{{ capitalizeFirstLetter(block.text) }}</p>
            </div>
          </section>

          <!-- Hoàn cảnh sáng tác → năm lớn bên lề -->
          <section v-else-if="block.type === 'context'" class="lit-context">
            <span class="lit-context-year">
              <template v-if="block.year">{{ block.year }}</template>
              <v-icon v-else icon="mdi-calendar-edit-outline" size="21" />
            </span>
            <div>
              <h3 v-if="block.label" class="lit-context-label">
                {{ block.label }}
              </h3>
              <p class="lit-context-text">{{ capitalizeFirstLetter(block.text) }}</p>
            </div>
          </section>

          <!-- Nhiều thông tin ngắn liền nhau → phiếu thư mục -->
          <dl v-else-if="block.type === 'fact-sheet'" class="lit-facts">
            <div v-for="(f, i) in block.items" :key="i" class="lit-fact">
              <dt>
                <v-icon :icon="labelIcon(f.label)" size="16" aria-hidden="true" />
                {{ f.label }}
              </dt>
              <dd>{{ capitalizeFirstLetter(f.text) }}</dd>
            </div>
          </dl>

          <!-- Bố cục / dàn ý → sợi chỉ dọc nối các phần -->
          <ol v-else-if="block.type === 'outline'" class="lit-outline">
            <li v-for="(it, i) in block.items" :key="i">
              <span class="lit-outline-mark" aria-hidden="true">{{
                i + 1
              }}</span>
              <div>
                <h3 v-if="it.label">{{ it.label }}</h3>
                <p>{{ capitalizeFirstLetter(it.text) }}</p>
              </div>
            </li>
          </ol>

          <!-- Nghệ thuật / biện pháp tu từ → lưới đặc sắc -->
          <ul v-else-if="block.type === 'devices'" class="lit-devices">
            <li v-for="(it, i) in block.items" :key="i">
              <h3>
                <v-icon icon="mdi-feather" size="17" aria-hidden="true" />
                {{ it.label }}
              </h3>
              <p>{{ capitalizeFirstLetter(it.text) }}</p>
            </li>
          </ul>

          <!-- Khổ thơ -->
          <figure v-else-if="block.type === 'verse'" class="lit-verse">
            <v-icon
              class="lit-verse-mark"
              icon="mdi-feather"
              size="18"
              aria-hidden="true"
            />
            <div class="lit-verse-lines">
              <p v-for="(ln, i) in block.lines" :key="i">{{ capitalizeFirstLetter(ln) }}</p>
            </div>
            <figcaption v-if="block.label">{{ block.label }}</figcaption>
          </figure>

          <!-- Câu trích nổi bật -->
          <blockquote
            v-else-if="block.type === 'pullquote'"
            class="lit-blockquote"
          >
            <v-icon
              class="lit-quote-icon"
              icon="mdi-format-quote-open"
              size="28"
              aria-hidden="true"
            />
            <p class="lit-blockquote-text">{{ capitalizeFirstLetter(block.text) }}</p>
          </blockquote>

          <!-- Khái niệm / Định nghĩa -->
          <aside v-else-if="block.type === 'concept'" class="lit-concept">
            <strong v-if="block.label" class="lit-concept-label">
              <v-icon
                icon="mdi-bookmark-outline"
                size="17"
                aria-hidden="true"
              />
              {{ block.label }}
            </strong>
            <p class="lit-concept-text">{{ capitalizeFirstLetter(block.text) }}</p>
          </aside>

          <!-- Nhãn đơn -->
          <div v-else-if="block.type === 'labeled'" class="lit-labeled-single">
            <span class="lit-labeled-term">
              <v-icon :icon="labelIcon(block.label)" size="17" aria-hidden="true" />
              {{ block.label }}
            </span>
            <p class="lit-labeled-body">{{ capitalizeFirstLetter(block.text) }}</p>
          </div>

          <!-- Bảng nhãn -->
          <dl v-else-if="block.type === 'labeled-list'" class="lit-table">
            <div
              v-for="(it, iIdx) in block.items"
              :key="iIdx"
              class="lit-table-row"
            >
              <dt class="lit-table-term">
                <v-icon :icon="labelIcon(it.label)" size="16" aria-hidden="true" />
                {{ it.label }}
              </dt>
              <dd class="lit-table-def">{{ capitalizeFirstLetter(it.text) }}</dd>
            </div>
          </dl>

          <!-- Bảng nhiều cột -->
          <div v-else-if="block.type === 'table'" class="lit-grid-wrap">
            <table class="lit-grid">
              <thead>
                <tr>
                  <th v-for="(h, i) in block.headers" :key="i">{{ h }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, r) in block.rows" :key="r">
                  <td v-for="(cell, c) in row" :key="c">{{ capitalizeFirstLetter(cell) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Ghi chú / Lưu ý / Cảnh báo -->
          <aside
            v-else-if="block.type === 'note'"
            class="lit-note"
            :class="`lit-note--${block.tone}`"
          >
            <span class="lit-note-glyph" aria-hidden="true">
              <v-icon :icon="block.icon" size="18" />
            </span>
            <p class="lit-note-body">
              <strong class="lit-note-heading">{{ block.title }}</strong>
              <span class="lit-note-desc"> — {{ capitalizeFirstLetter(block.desc) }}</span>
            </p>
          </aside>

          <!-- Ví dụ: ngữ liệu + hướng phân tích (có thể thu gọn) + kết luận -->
          <section v-else-if="block.type === 'example'" class="lit-example">
            <h3 class="lit-example-label">
              <v-icon
                icon="mdi-book-open-page-variant-outline"
                size="18"
                aria-hidden="true"
              />
              {{ block.badgeTitle || "Ví dụ minh họa" }}
            </h3>
            <p class="lit-example-body">
              {{ capitalizeFirstLetter(block.problemText || block.text) }}
            </p>
            <details v-if="hasAnalysis(block)" class="lit-analysis" open>
              <summary>
                <v-icon icon="mdi-text-search" size="17" aria-hidden="true" />
                Hướng phân tích
              </summary>
              <template
                v-for="(phase, pIdx) in block.solutionPhases || []"
                :key="pIdx"
              >
                <p
                  v-if="phase.label && (phase.steps || []).length"
                  class="lit-phase-label"
                >
                  {{ phase.label }}
                </p>
                <p
                  v-for="(step, sIdx) in phase.steps || []"
                  :key="sIdx"
                  class="lit-analysis-point"
                >
                  <span class="lit-analysis-mark" aria-hidden="true">※</span>
                  <span>{{ capitalizeFirstLetter(step.text) }}</span>
                </p>
              </template>
            </details>
            <p v-if="block.conclusion" class="lit-conclusion">
              <strong>Kết luận:</strong> {{ capitalizeFirstLetter(block.conclusion) }}
            </p>
          </section>

          <!-- Quy trình / Phương pháp -->
          <section v-else-if="block.type === 'procedure'" class="lit-method">
            <h3 class="lit-method-title">
              <v-icon
                icon="mdi-notebook-edit-outline"
                size="18"
                aria-hidden="true"
              />
              {{ block.title }}
            </h3>
            <ol class="lit-method-list">
              <li v-for="(st, stIdx) in block.steps" :key="stIdx">
                <span class="lit-method-badge" aria-hidden="true">{{
                  stIdx + 1
                }}</span>
                <span class="lit-method-text">{{ capitalizeFirstLetter(st.text) }}</span>
              </li>
            </ol>
          </section>

          <!-- Bài tập tự luyện -->
          <section v-else-if="block.type === 'exercise'" class="lit-exercise">
            <h3 class="lit-exercise-title">
              <v-icon icon="mdi-pencil-outline" size="18" aria-hidden="true" />
              {{ block.title || "Bài tập tự luyện" }}
            </h3>
            <ol>
              <li v-for="(it, i) in block.items" :key="i">{{ capitalizeFirstLetter(it) }}</li>
            </ol>
            <details v-if="block.answers" class="lit-analysis">
              <summary>Xem gợi ý</summary>
              <p class="lit-analysis-point">{{ capitalizeFirstLetter(block.answers) }}</p>
            </details>
          </section>

          <!-- Danh sách ý -->
          <ul v-else-if="block.type === 'list'" class="lit-list">
            <li v-for="(item, iIdx) in block.items" :key="iIdx">
              <span class="lit-list-marker" aria-hidden="true">{{
                item.number ? `${item.number}.` : "—"
              }}</span>
              <span>{{ capitalizeFirstLetter(item.text ?? item) }}</span>
            </li>
          </ul>

          <!-- Đoạn văn -->
          <p v-else class="lit-para">{{ capitalizeFirstLetter(block.text) }}</p>
        </template>
      </div>
    </article>

    <!-- ── Tổng kết lưu ý ── -->
    <section v-if="extractedTips.length" class="lit-recap">
      <header class="lit-recap-head">
        <h3 class="lit-recap-title">
          <v-icon icon="mdi-book-check-outline" size="20" aria-hidden="true" />
          Lưu ý &amp; ghi nhớ của bài
        </h3>
      </header>
      <ul class="lit-recap-grid">
        <li
          v-for="(tip, tIdx) in extractedTips"
          :key="tIdx"
          class="lit-recap-item"
          :class="`lit-recap-item--${tip.color}`"
        >
          <span class="lit-recap-item-icon" aria-hidden="true">
            <v-icon :icon="tip.icon" size="18" />
          </span>
          <div>
            <h4 class="lit-recap-item-title">{{ tip.title }}</h4>
            <p class="lit-recap-item-desc">{{ capitalizeFirstLetter(tip.desc) }}</p>
          </div>
        </li>
      </ul>
    </section>

    <section v-if="reviewQuestions.length" class="lit-review">
      <header class="lit-review-head">
        <span class="lit-review-icon" aria-hidden="true">
          <v-icon icon="mdi-head-question-outline" size="20" />
        </span>
        <div>
          <h3 class="lit-review-title">Tự kiểm tra bài học</h3>
          <p class="lit-review-subtitle">
            Câu hỏi ôn tập được tạo từ chính nội dung bài học
          </p>
        </div>
      </header>

      <ol class="lit-review-list">
        <li
          v-for="(question, index) in reviewQuestions"
          :key="question.sectionTitle"
          class="lit-review-item"
        >
          <div class="lit-review-question">
            <span class="lit-review-number">{{ index + 1 }}</span>
            <p>{{ capitalizeFirstLetter(question.prompt) }}</p>
          </div>
          <button
            type="button"
            class="lit-review-toggle"
            :aria-expanded="revealedQuestions.includes(index)"
            @click="toggleReviewAnswer(index)"
          >
            <v-icon
              :icon="
                revealedQuestions.includes(index)
                  ? 'mdi-eye-off-outline'
                  : 'mdi-lightbulb-on-outline'
              "
              size="17"
            />
            {{ revealedQuestions.includes(index) ? "Ẩn trích dẫn" : "Xem trích dẫn gợi ý" }}
          </button>
          <blockquote
            v-if="revealedQuestions.includes(index)"
            class="lit-review-answer"
          >
            <span class="lit-review-source">
              <v-icon icon="mdi-book-open-page-variant-outline" size="15" />
              Trích từ phần “{{ question.sectionTitle }}”
            </span>
            <p>{{ capitalizeFirstLetter(question.excerpt) }}</p>
          </blockquote>
        </li>
      </ol>
    </section>
  </div>
</template>

<script setup>
/**
 * LiteratureLessonContent.vue
 * Môn Ngữ Văn – giao diện như một trang sách in:
 *   - Chữ: Playfair Display (tiêu đề) + Literata (nội dung, thiết kế cho đọc dài, đủ dấu tiếng Việt)
 *   - Màu: giấy dó, mực tàu, son đỏ (màu con dấu), xanh chàm – tránh tím "SaaS"
 *   - Không thẻ bo góc / bóng đổ; cấu trúc thể hiện bằng đường kẻ, thụt lề, chú giải bên lề
 *   - Chữ cái đầu đoạn đầu mỗi phần được lồng lớn (drop cap)
 *   - Parser dùng chung từ Literatureparser.js
 */
import { computed, ref } from "vue";
import {
  parseLiteratureSections,
  extractLiteratureTips,
} from "./Literatureparser";

const props = defineProps({
  lesson: { type: Object, required: true },
  chapter: { type: Object, default: null },
  fontSize: { type: String, default: "normal" },
});

const ROMAN = [
  "I",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
  "XI",
  "XII",
  "XIII",
  "XIV",
  "XV",
];
const toRoman = (n) => ROMAN[n - 1] || String(n);

function capitalizeFirstLetter(text) {
  return String(text ?? "").replace(/^([^\p{L}]*)(\p{L})/u, (_, prefix, letter) =>
    `${prefix}${letter.toLocaleUpperCase("vi")}`,
  );
}

function sectionIcon(layout, title) {
  const heading = String(title || "").toLocaleLowerCase("vi");
  if (/tác giả|nhà văn|nhà thơ/.test(heading)) return "mdi-account-edit-outline";
  if (/hoàn cảnh|xuất xứ|sáng tác/.test(heading)) return "mdi-calendar-text-outline";
  if (/tóm tắt|cốt truyện|nội dung/.test(heading)) return "mdi-book-open-page-variant";
  if (/chủ đề|giá trị|thông điệp/.test(heading)) return "mdi-lightbulb-on-outline";
  if (/nghệ thuật|biện pháp|đặc sắc/.test(heading)) return "mdi-feather";
  if (/câu hỏi|đọc hiểu|luyện tập/.test(heading)) return "mdi-comment-question-outline";

  const icons = {
    author: "mdi-account-edit-outline",
    context: "mdi-calendar-text-outline",
    outline: "mdi-format-list-numbered",
    timeline: "mdi-book-open-page-variant",
    devices: "mdi-feather",
    standard: "mdi-book-open-page-variant-outline",
  };
  return icons[layout] || icons.standard;
}

function labelIcon(label) {
  const value = String(label || "").toLocaleLowerCase("vi");
  if (/mục đích/.test(value)) return "mdi-bullseye-arrow";
  if (/yêu cầu|nhiệm vụ/.test(value)) return "mdi-clipboard-text-outline";
  if (/luận điểm|lập luận/.test(value)) return "mdi-format-list-checks";
  if (/thông điệp|ý nghĩa/.test(value)) return "mdi-message-bookmark-outline";
  if (/nhân vật/.test(value)) return "mdi-account-outline";
  if (/thời gian|hoàn cảnh|xuất xứ/.test(value)) return "mdi-calendar-text-outline";
  if (/nội dung|tóm tắt/.test(value)) return "mdi-book-open-page-variant-outline";
  if (/nghệ thuật|biện pháp|đặc sắc/.test(value)) return "mdi-feather";
  if (/thể loại|tác phẩm/.test(value)) return "mdi-book-outline";
  return "mdi-bookmark-outline";
}

const parsedSections = computed(() =>
  parseLiteratureSections(props.lesson?.content),
);
const extractedTips = computed(() =>
  extractLiteratureTips(props.lesson?.content),
);
const revealedQuestions = ref([]);

const reviewPrompts = [
  {
    pattern: /tác giả|tiểu sử/,
    prompt: "Tác giả được giới thiệu trong bài là ai và có đặc điểm gì?",
  },
  {
    pattern: /hoàn cảnh|xuất xứ|bối cảnh/,
    prompt: "Tác phẩm ra đời trong hoàn cảnh hoặc xuất xứ nào?",
  },
  {
    pattern: /tóm tắt|diễn biến|cốt truyện/,
    prompt: "Bài học tóm tắt nội dung tác phẩm như thế nào?",
  },
  {
    pattern: /bố cục|dàn ý/,
    prompt: "Bài học chia bố cục tác phẩm như thế nào?",
  },
  {
    pattern: /nghệ thuật|biện pháp|đặc sắc|tu từ/,
    prompt: "Những đặc sắc nghệ thuật nào được nhấn mạnh trong bài?",
  },
  {
    pattern: /chủ đề|ý nghĩa|giá trị|nội dung/,
    prompt: "Chủ đề hoặc giá trị của tác phẩm được nêu như thế nào?",
  },
];

const reviewLabelPrompts = [
  {
    pattern: /^mục đích$/i,
    prompt: "Mục đích của bài viết được nêu trong bài là gì?",
  },
  {
    pattern: /^yêu cầu$/i,
    prompt: "Bài viết cần đáp ứng những yêu cầu nào?",
  },
  {
    pattern: /^luận điểm chính$|^luận điểm$/i,
    prompt: "Luận điểm chính được nêu trong bài là gì?",
  },
  {
    pattern: /^thông điệp$/i,
    prompt: "Thông điệp nào được gửi gắm trong bài?",
  },
];

function getReviewableLabels(section) {
  return (section.blocks || []).flatMap((block) => {
    if (block.type === "labeled") {
      return [{ label: block.label, text: block.text }];
    }
    if (["labeled-list", "fact-sheet"].includes(block.type)) {
      return block.items || [];
    }
    return [];
  });
}

function getSectionExcerpt(section) {
  const parts = [];
  const collect = (value) => {
    if (typeof value === "string") {
      const text = value.trim();
      if (text) parts.push(text);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(collect);
      return;
    }
    if (value && typeof value === "object") {
      Object.entries(value).forEach(([key, nested]) => {
        if (!["type", "icon", "tone", "color", "breakBefore", "number"].includes(key)) {
          collect(nested);
        }
      });
    }
  };

  collect(section.blocks || []);
  const excerpt = [...new Set(parts)].join(" ").replace(/\s+/g, " ").trim();
  if (excerpt.length <= 420) return excerpt;
  const cutoff = excerpt.lastIndexOf(" ", 420);
  return `${excerpt.slice(0, cutoff > 250 ? cutoff : 420).trim()}…`;
}

const reviewQuestions = computed(() => {
  const labelQuestions = parsedSections.value.flatMap((section) => {
    const sectionTitle = section.cleanTitle || section.title;
    return getReviewableLabels(section).flatMap((item) => {
      const match = reviewLabelPrompts.find(({ pattern }) =>
        pattern.test(String(item.label || "").trim()),
      );
      const excerpt = String(item.text || "").trim();
      if (!match || excerpt.length < 12) return [];
      return [{
        sectionTitle,
        prompt: match.prompt,
        excerpt: `${String(item.label).trim()}: ${excerpt}`,
        priority: 0,
      }];
    });
  });
  const sectionsWithSpecificQuestions = new Set(
    labelQuestions.map((question) => question.sectionTitle),
  );
  const sectionQuestions = parsedSections.value
    .map((section) => {
      const title = section.cleanTitle || section.title;
      const match = reviewPrompts.find(({ pattern }) => pattern.test(title));
      return {
        sectionTitle: title,
        prompt: match?.prompt || `Thông tin chính ở phần “${title}” là gì?`,
        excerpt: getSectionExcerpt(section),
        priority:
          100 + (match ? reviewPrompts.indexOf(match) : reviewPrompts.length),
      };
    })
    .filter(
      (question) => !sectionsWithSpecificQuestions.has(question.sectionTitle),
    );
  const candidates = [...labelQuestions, ...sectionQuestions]
    .filter((question) => question.excerpt.length >= 25)
    .sort((a, b) => a.priority - b.priority);

  if (!candidates.length) return [];

  const bestPriority = candidates[0].priority;
  const relevantCandidates = candidates.filter(
    (question) => question.priority === bestPriority,
  );
  const lessonKey = String(
    props.lesson?.id || props.lesson?.title || props.lesson?.content || "",
  );
  const lessonHash = Array.from(lessonKey).reduce(
    (hash, character) => (hash * 31 + character.codePointAt(0)) >>> 0,
    0,
  );
  const question = relevantCandidates[lessonHash % relevantCandidates.length];
  const lessonTitle = String(props.lesson?.title || "").trim();

  return [{
    ...question,
    prompt: lessonTitle
      ? `Trong bài “${lessonTitle}”, ${question.prompt.charAt(0).toLocaleLowerCase("vi")}${question.prompt.slice(1)}`
      : question.prompt,
  }];
});

function toggleReviewAnswer(index) {
  revealedQuestions.value = revealedQuestions.value.includes(index)
    ? revealedQuestions.value.filter((item) => item !== index)
    : [...revealedQuestions.value, index];
}

/* ── Làm giàu khối: chọn cách trình bày theo tiêu đề mục + loại khối parser trả về ── */
const norm = (s) => (s || "").toLowerCase();
const YEAR = /\b(1[5-9]\d{2}|20\d{2})\b/;
const splitVerse = (t) => (t || "").split(/\s*(?:\n|\/|\|)\s*/).filter(Boolean);
const hasAnalysis = (b) =>
  (b.solutionPhases || []).some((p) => (p.steps || []).length);

function sectionLayout(title) {
  const t = norm(title);
  if (/tác giả|tiểu sử/.test(t)) return "author";
  if (/hoàn cảnh|xuất xứ|bối cảnh/.test(t)) return "context";
  if (/bố cục|dàn ý/.test(t)) return "outline";
  if (/tóm tắt|diễn biến|cốt truyện/.test(t)) return "timeline";
  if (/nghệ thuật|biện pháp|đặc sắc|tu từ/.test(t)) return "devices";
  return "standard";
}

function enhanceBlock(b, layout, ctx) {
  const type = b.type || "paragraph";

  if (type === "paragraph") {
    const t = (b.text || "").trim();
    if (layout === "author" && !ctx.used) {
      ctx.used = true;
      return { type: "author", initial: t.charAt(0).toUpperCase(), text: t };
    }
    if (layout === "context" && !ctx.used) {
      ctx.used = true;
      return { type: "context", year: (t.match(YEAR) || [])[0] || "", text: t };
    }
    if (/^[“"].+[”"]$/s.test(t) && t.length < 260)
      return { type: "pullquote", text: t };
    if (t.length < 260 && /\s\/\s|\n/.test(t))
      return { type: "verse", lines: splitVerse(t) };
    return b;
  }

  if (type === "labeled-list") {
    const items = b.items || [];
    if (layout === "outline") return { type: "outline", items };
    if (layout === "devices") return { type: "devices", items };
    if (items.length >= 2 && items.every((i) => (i.text || "").length < 70))
      return { type: "fact-sheet", items };
    if (items.length === 1)
      return { type: "labeled", label: items[0].label, text: items[0].text };
    return b;
  }

  if (type === "list" && layout === "outline")
    return {
      type: "outline",
      items: (b.items || []).map((i) => ({ label: "", text: i.text ?? i })),
    };

  return b;
}

// Phần "Tóm tắt": nhiều đoạn liền nhau → sợi chỉ diễn biến
function groupTimeline(blocks) {
  const out = [];
  let run = [];
  const flush = () => {
    if (run.length >= 2)
      out.push({
        type: "outline",
        items: run.map((r) => ({ label: "", text: r.text })),
      });
    else out.push(...run);
    run = [];
  };
  for (const b of blocks) {
    if ((b.type || "paragraph") === "paragraph") run.push(b);
    else {
      flush();
      out.push(b);
    }
  }
  flush();
  return out;
}

const viewSections = computed(() =>
  parsedSections.value.map((sec) => {
    const layout = sectionLayout(sec.cleanTitle || sec.title);
    const ctx = { used: false };
    let blocks = (sec.blocks || []).map((b) => enhanceBlock(b, layout, ctx));
    if (layout === "timeline") blocks = groupTimeline(blocks);
    return { ...sec, layout, blocks };
  }),
);
</script>

<style scoped>
/* ══════════════════════════════════════════
   Design tokens
══════════════════════════════════════════ */
.lit-page {
  --paper: #ffffff;
  --paper-2: #f8fafc;
  --ink: #1f2937;
  --ink-2: #374151;
  --ink-3: #6b7280;
  --rule: #e5e7eb;
  --rule-2: #f3f4f6;

  --seal: #2563eb;
  --chàm: #475569;
  --gold: #7c6a4d;
  --moss: #3f5f52;
  --blood: #1d4ed8;

  --display: var(
    --t-font,
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif
  );
  --serif: var(
    --t-font,
    "Inter",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif
  );

  --base: 17px;

  font-family: var(--display);
  font-size: var(--base);
  line-height: 1.85;
  color: var(--ink);
  background: var(--paper);
  padding: 40px 20px 56px;
  font-variant-numeric: oldstyle-nums;
  text-rendering: optimizeLegibility;
}

.lit-font-small {
  --base: 15.5px;
}
.lit-font-normal {
  --base: 17px;
}
.lit-font-large {
  --base: 19.5px;
}

.lit-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* ══════════════════════════════════════════
   PHẦN – như một chương sách
══════════════════════════════════════════ */
.lit-section {
  max-width: 46rem;
  margin: 0 auto;
  position: relative;
  padding: 1.5rem 1.4rem 1.2rem;
  background: #ffffff;
  border: 1px solid var(--rule);
  border-radius: 18px;
  box-shadow: 0 6px 18px rgba(15, 23, 42, 0.03);
}

.lit-section + .lit-section {
  margin-top: 1.5rem;
}

.lit-section-head {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.2rem 0 0.8rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--rule);
}

.lit-section-icon {
  display: inline-grid;
  flex-shrink: 0;
  width: 2.2rem;
  height: 2.2rem;
  place-items: center;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  color: #64748b;
}
.lit-section-icon--author,
.lit-section-icon--devices {
  color: #2563eb;
  background: #eff6ff;
  border-color: #dbeafe;
}
.lit-section-icon--context,
.lit-section-icon--timeline {
  color: #0f766e;
  background: #f0fdfa;
  border-color: #ccfbf1;
}

.lit-section-num {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 10px;
  background: #eff6ff;
  border: 1px solid #dbeafe;
  font-family: var(--display);
  font-weight: 700;
  font-size: 0.96rem;
  line-height: 1;
  color: var(--seal);
}

.lit-section-title {
  margin: 0;
  font-family: var(--display);
  font-weight: 700;
  font-size: 1.32em;
  line-height: 1.3;
  letter-spacing: -0.02em;
  color: var(--ink);
  text-wrap: balance;
}

.lit-body {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

/* ══════════════════════════════════════════
   ĐOẠN VĂN  (+ chữ cái lồng lớn ở đoạn đầu)
══════════════════════════════════════════ */
.lit-para {
  margin: 0;
  max-width: 66ch;
  color: var(--ink);
  text-align: left;
  text-wrap: pretty;
}

.lit-body > .lit-para:first-child::first-letter {
  float: left;
  font-family: var(--display);
  font-weight: 700;
  font-size: 3.3em;
  line-height: 0.84;
  padding: 0.08em 0.12em 0 0;
  color: var(--seal);
}

/* ══════════════════════════════════════════
   KHÁI NIỆM / ĐỊNH NGHĨA – chú giải
══════════════════════════════════════════ */
.lit-concept {
  padding: 0.95rem 1.1rem 1rem 1.2rem;
  background: var(--paper-2);
  border-left: 2px solid var(--seal);
}

.lit-concept-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.2rem;
  font-family: var(--display);
  font-weight: 600;
  font-size: 1.02em;
  color: var(--seal);
}

.lit-concept-text {
  margin: 0;
  max-width: 62ch;
  line-height: 1.8;
  color: var(--ink);
}

/* ══════════════════════════════════════════
   TRÍCH THƠ / VĂN – khổ thơ
══════════════════════════════════════════ */
.lit-blockquote {
  position: relative;
  margin: 0.5rem 0;
  padding: 1rem 1.25rem 1rem 3rem;
  max-width: 34rem;
  border-left: 3px solid #93c5fd;
  border-radius: 0 12px 12px 0;
  background: #f8fafc;
  text-align: left;
}

.lit-quote-icon {
  position: absolute;
  top: 0.9rem;
  left: 0.8rem;
  color: #60a5fa;
}

.lit-blockquote-text {
  margin: 0;
  white-space: pre-line; /* giữ nguyên xuống dòng của câu thơ */
  font-family: var(--display);
  font-weight: 600;
  font-size: 1.05em;
  line-height: 1.75;
  color: var(--ink-2);
}

.lit-blockquote-footer {
  margin-top: 0.6rem;
  font-size: 0.92em;
  font-style: italic;
  color: var(--ink-3);
}
.lit-blockquote-footer::before {
  content: "— ";
  color: var(--seal);
}

/* ══════════════════════════════════════════
   NHÃN ĐƠN – mục từ
══════════════════════════════════════════ */
.lit-labeled-single {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  column-gap: 1rem;
  align-items: start;
  max-width: 66ch;
}

.lit-labeled-term {
  display: inline-flex;
  align-items: baseline;
  gap: 0.4rem;
  font-family: var(--display);
  font-style: italic;
  font-weight: 600;
  font-size: 1.02em;
  line-height: 1.6;
  color: var(--seal);
}

.lit-labeled-body {
  margin: 0;
  line-height: 1.8;
  color: var(--ink);
}

/* ══════════════════════════════════════════
   BẢNG NHÃN – như mục lục có đường kẻ
══════════════════════════════════════════ */
.lit-table {
  margin: 0;
  border-top: 1px solid var(--ink);
  border-bottom: 1px solid var(--ink);
}

.lit-table-row {
  display: grid;
  grid-template-columns: minmax(7.5rem, 12rem) 1fr;
  column-gap: 1.5rem;
  padding: 0.85rem 0.25rem;
}
.lit-table-row + .lit-table-row {
  border-top: 1px dotted var(--ink-3);
}

.lit-table-term {
  display: inline-flex;
  align-items: baseline;
  gap: 0.4rem;
  font-family: var(--display);
  font-style: italic;
  font-weight: 600;
  line-height: 1.6;
  color: var(--seal);
}

.lit-table-def {
  margin: 0;
  line-height: 1.8;
  color: var(--ink);
}

/* ══════════════════════════════════════════
   GHI CHÚ / LƯU Ý / CẢNH BÁO – chú thích bên lề
══════════════════════════════════════════ */
.lit-note {
  --nc: var(--seal);
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  padding: 0.75rem 0.9rem;
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
  background: var(--paper-2);
}
.lit-note--amber {
  --nc: var(--gold);
}
.lit-note--blue {
  --nc: var(--chàm);
}
.lit-note--green {
  --nc: var(--moss);
}
.lit-note--red {
  --nc: var(--blood);
}

.lit-note-glyph {
  flex-shrink: 0;
  padding-top: 0.2rem;
  color: var(--nc);
}

.lit-note-body {
  margin: 0;
  font-size: 0.94em;
  line-height: 1.75;
  color: var(--ink-2);
}

.lit-note-heading {
  font-family: var(--display);
  font-style: italic;
  font-weight: 700;
  color: var(--nc);
}

/* ══════════════════════════════════════════
   VÍ DỤ – đoạn trích kèm phân tích
══════════════════════════════════════════ */
.lit-example {
  padding-top: 0.9rem;
  border-top: 1px solid var(--rule);
}

.lit-example-label {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0 0 0.7rem;
  font-family: var(--display);
  font-weight: 600;
  font-size: 1.05em;
  color: var(--seal);
}

.lit-example-body {
  margin: 0 0 1.1rem;
  padding: 0.1rem 0 0.1rem 1.25rem;
  border-left: 2px solid var(--rule);
  font-style: italic;
  line-height: 1.9;
  color: var(--ink-2);
}

.lit-analysis-point {
  display: flex;
  gap: 0.7rem;
  margin: 0.55rem 0 0;
  font-size: 0.95em;
  line-height: 1.75;
  color: var(--ink);
}

.lit-analysis-mark {
  flex-shrink: 0;
  color: var(--seal);
}

/* ══════════════════════════════════════════
   QUY TRÌNH / PHƯƠNG PHÁP
══════════════════════════════════════════ */
.lit-method {
  padding: 0.9rem 0 0.2rem;
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
}

.lit-method-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0 0 0.8rem;
  font-family: var(--display);
  font-weight: 600;
  font-size: 1.12em;
  color: var(--ink);
}

.lit-method-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.lit-method-list li {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  padding: 0.65rem 0;
}
.lit-method-list li + li {
  border-top: 1px dotted var(--rule);
}

.lit-method-badge {
  flex-shrink: 0;
  width: 1.5em;
  text-align: right;
  font-family: var(--display);
  font-style: italic;
  font-weight: 700;
  font-size: 1.35em;
  line-height: 1;
  color: var(--seal);
}

.lit-method-text {
  line-height: 1.75;
  color: var(--ink);
}

/* ══════════════════════════════════════════
   DANH SÁCH Ý – gạch đầu dòng kiểu sách in
══════════════════════════════════════════ */
.lit-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-width: 66ch;
}

.lit-list li {
  display: flex;
  gap: 0.8rem;
  line-height: 1.8;
}

.lit-list-marker {
  flex-shrink: 0;
  color: var(--seal);
}

/* ══════════════════════════════════════════
   TỔNG KẾT LƯU Ý – trang "ghi nhớ" cuối bài
══════════════════════════════════════════ */
.lit-recap {
  max-width: 44rem;
  margin: 4.5rem auto 0;
  padding-top: 1.5rem;
  border-top: 4px double var(--rule);
}

.lit-recap-head {
  margin-bottom: 1.25rem;
}

.lit-recap-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-family: var(--display);
  font-weight: 600;
  font-size: 1.4em;
  color: var(--ink);
}

.lit-recap-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  column-gap: 2.25rem;
}

.lit-recap-item {
  --rc: var(--seal);
  display: flex;
  gap: 0.8rem;
  padding: 0.95rem 0;
  border-top: 1px solid var(--rule);
}
.lit-recap-item--amber {
  --rc: var(--gold);
}
.lit-recap-item--blue {
  --rc: var(--chàm);
}
.lit-recap-item--green {
  --rc: var(--moss);
}
.lit-recap-item--red {
  --rc: var(--blood);
}
.lit-recap-item--purple {
  --rc: var(--seal);
}

.lit-recap-item-icon {
  flex-shrink: 0;
  padding-top: 0.2rem;
  color: var(--rc);
}

.lit-recap-item-title {
  margin: 0 0 0.15rem;
  font-family: var(--display);
  font-style: italic;
  font-weight: 700;
  font-size: 1em;
  line-height: 1.5;
  color: var(--rc);
}

.lit-recap-item-desc {
  margin: 0;
  font-size: 0.92em;
  line-height: 1.7;
  color: var(--ink-2);
}

.lit-review {
  max-width: 46rem;
  margin: 2rem auto 0;
  padding: 1.25rem;
  border: 1px solid var(--rule);
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.03);
}

.lit-review-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--rule-2);
}

.lit-review-icon {
  display: inline-grid;
  width: 2.4rem;
  height: 2.4rem;
  flex-shrink: 0;
  place-items: center;
  border: 1px solid #dbeafe;
  border-radius: 11px;
  background: #eff6ff;
  color: #2563eb;
}

.lit-review-title {
  margin: 0;
  color: var(--ink);
  font-size: 1.08em;
  font-weight: 700;
}

.lit-review-subtitle {
  margin: 0.15rem 0 0;
  color: var(--ink-3);
  font-size: 0.84em;
}

.lit-review-list {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 1rem 0 0;
  list-style: none;
}

.lit-review-item {
  padding: 0.85rem 1rem;
  border: 1px solid var(--rule-2);
  border-radius: 12px;
  background: #fbfdff;
}

.lit-review-question {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
}

.lit-review-question p {
  margin: 0.1rem 0 0;
  color: var(--ink);
  font-weight: 600;
  line-height: 1.6;
}

.lit-review-number {
  display: inline-grid;
  width: 1.7rem;
  height: 1.7rem;
  flex-shrink: 0;
  place-items: center;
  border-radius: 8px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 0.82em;
  font-weight: 700;
}

.lit-review-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0.65rem 0 0 2.35rem;
  padding: 0;
  border: 0;
  background: transparent;
  color: #2563eb;
  font: inherit;
  font-size: 0.86em;
  font-weight: 600;
  cursor: pointer;
}

.lit-review-toggle:hover {
  color: #1d4ed8;
}

.lit-review-answer {
  margin: 0.7rem 0 0 2.35rem;
  padding: 0.7rem 0.85rem;
  border-left: 2px solid #93c5fd;
  border-radius: 0 8px 8px 0;
  background: #f1f7ff;
}

.lit-review-source {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  color: #475569;
  font-size: 0.78em;
  font-weight: 700;
}

.lit-review-answer p {
  margin: 0.35rem 0 0;
  color: var(--ink-2);
  font-size: 0.92em;
  line-height: 1.7;
}

/* ══════════════════════════════════════════
   RESPONSIVE
══════════════════════════════════════════ */
@media (max-width: 768px) {
  .lit-page {
    padding: 24px 14px 32px;
  }
  .lit-section + .lit-section {
    margin-top: 1rem;
  }
  .lit-section-head {
    gap: 0.55rem;
  }
  .lit-section-num,
  .lit-section-icon {
    width: 2rem;
    height: 2rem;
  }
  .lit-section-title {
    font-size: 1.15em;
  }
  .lit-labeled-single,
  .lit-table-row {
    grid-template-columns: 1fr;
    row-gap: 0.15rem;
  }
  .lit-review {
    padding: 1rem;
  }
  .lit-review-item {
    padding: 0.75rem;
  }
  .lit-review-toggle,
  .lit-review-answer {
    margin-left: 0;
  }
  .lit-blockquote-text {
    font-size: 1.12em;
  }
}

/* ══════════════════════════════════════════
   CÁC LOẠI KHỐI MỞ RỘNG
══════════════════════════════════════════ */
.lit-author {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  padding: 0.9rem 0;
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
}
.lit-author-seal {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 2.8rem;
  height: 2.8rem;
  border: 1px solid #dbeafe;
  border-radius: 12px;
  background: #eff6ff;
  color: #2563eb;
  font-family: var(--display);
  font-weight: 700;
  font-size: 1.5em;
  line-height: 1;
}
.lit-author-label,
.lit-context-label,
.lit-compare-col h3,
.lit-outline h3,
.lit-devices h3,
.lit-exercise-title {
  margin: 0 0 0.2rem;
  font-family: var(--display);
  font-weight: 700;
  font-size: 1.05em;
  line-height: 1.5;
  color: var(--seal);
}
.lit-devices h3,
.lit-exercise-title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.lit-author-text,
.lit-context-text,
.lit-compare-col p,
.lit-outline p,
.lit-devices p {
  margin: 0;
  line-height: 1.8;
}

.lit-context {
  display: grid;
  grid-template-columns: 5.15rem 1fr;
  column-gap: 1rem;
  padding: 0.25rem 0;
}
.lit-context-year {
  padding-right: 0.8rem;
  border-right: 1px solid var(--rule);
  text-align: right;
  font-family: var(--display);
  font-style: italic;
  font-weight: 600;
  font-size: 1.8em;
  line-height: 1.1;
  color: var(--ink-3);
}

.lit-facts {
  margin: 0;
  border: 1px solid var(--rule);
  background: var(--paper-2);
  padding: 0.5rem 0;
}
.lit-fact {
  display: grid;
  grid-template-columns: minmax(7rem, 10rem) 1fr;
  column-gap: 1.25rem;
  padding: 0.5rem 1.4rem;
}
.lit-fact + .lit-fact {
  border-top: 1px dotted var(--ink-3);
}
.lit-fact dt {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--display);
  font-style: italic;
  font-weight: 600;
  color: var(--seal);
}
.lit-fact dd {
  margin: 0;
}

.lit-compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1px solid var(--rule);
  border-bottom: 1px solid var(--rule);
}
.lit-compare-col {
  padding: 1rem 1.4rem 1.1rem;
}
.lit-compare-col + .lit-compare-col {
  border-left: 1px solid var(--rule);
}

.lit-outline {
  list-style: none;
  margin: 0;
  padding: 0;
}
.lit-outline li {
  position: relative;
  display: grid;
  grid-template-columns: 2.1rem 1fr;
  column-gap: 0.8rem;
  padding-bottom: 1rem;
}
.lit-outline li:not(:last-child)::before {
  content: "";
  position: absolute;
  left: 1.05rem;
  top: 2.1rem;
  bottom: 0.2rem;
  border-left: 1px dashed var(--seal);
}
.lit-outline-mark {
  display: grid;
  place-items: center;
  width: 2.1rem;
  height: 2.1rem;
  border: 1px solid var(--seal);
  border-radius: 999px;
  background: var(--paper);
  font-family: var(--display);
  font-style: italic;
  font-weight: 700;
  color: var(--seal);
}

.lit-devices {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
  gap: 1.5rem 2.25rem;
}
.lit-devices li {
  padding-top: 0.7rem;
  border-top: 2px solid var(--seal);
}
.lit-devices p {
  font-size: 0.96em;
  color: var(--ink-2);
}

.lit-verse {
  position: relative;
  margin: 0.75rem 0;
  padding: 1rem 1rem 0.8rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  text-align: center;
}
.lit-verse-mark {
  display: block;
  margin: 0 auto 0.45rem;
  color: #64748b;
}
.lit-verse-lines {
  display: inline-block;
  text-align: left;
}
.lit-verse-lines p {
  margin: 0;
  font-family: var(--display);
  font-style: italic;
  font-weight: 500;
  font-size: 1.06em;
  line-height: 1.8;
}
.lit-verse-lines p:nth-child(even) {
  padding-left: 1.5em;
}
.lit-verse figcaption {
  margin-top: 0.5rem;
  font-style: italic;
  font-size: 0.92em;
  color: var(--ink-3);
}
.lit-verse figcaption::before {
  content: "— ";
  color: var(--seal);
}

.lit-grid-wrap {
  overflow-x: auto;
}
.lit-grid {
  width: 100%;
  border-collapse: collapse;
}
.lit-grid th {
  padding: 0.5rem 0.8rem;
  text-align: left;
  border-bottom: 1px solid var(--ink);
  font-family: var(--display);
  font-style: italic;
  color: var(--seal);
}
.lit-grid td {
  padding: 0.55rem 0.8rem;
  border-bottom: 1px dotted var(--rule);
  vertical-align: top;
}

.lit-analysis > summary {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  list-style: none;
  margin-bottom: 0.35rem;
  font-family: var(--display);
  font-weight: 600;
  color: var(--seal);
}
.lit-analysis > summary::-webkit-details-marker {
  display: none;
}
.lit-analysis > summary::after {
  content: "▾";
  margin-left: auto;
  color: var(--ink-3);
}
.lit-analysis:not([open]) > summary::after {
  content: "▸";
}
.lit-phase-label {
  margin: 0.8rem 0 0;
  font-style: italic;
  font-size: 0.92em;
  color: var(--ink-3);
}
.lit-conclusion {
  margin: 1rem 0 0;
  padding-top: 0.7rem;
  border-top: 1px solid var(--rule);
}
.lit-conclusion strong {
  font-family: var(--display);
  font-style: italic;
  color: var(--seal);
}

.lit-exercise {
  padding: 1rem 1.4rem;
  border: 1px dashed var(--ink-3);
}
.lit-exercise ol {
  margin: 0.4rem 0 0.6rem;
  padding-left: 1.4rem;
}
.lit-exercise li {
  padding-left: 0.3rem;
  line-height: 1.8;
}
.lit-exercise li::marker {
  color: var(--seal);
  font-family: var(--display);
  font-style: italic;
}

@media (max-width: 768px) {
  .lit-compare {
    grid-template-columns: 1fr;
  }
  .lit-compare-col + .lit-compare-col {
    border-left: none;
    border-top: 1px solid var(--rule);
  }
  .lit-context {
    grid-template-columns: 1fr;
    row-gap: 0.3rem;
  }
  .lit-context-year {
    border-right: none;
    text-align: left;
    padding-right: 0;
    font-size: 1.7em;
  }
  .lit-fact {
    grid-template-columns: 1fr;
    padding: 0.5rem 1rem;
  }
  .lit-author {
    gap: 0.9rem;
  }
}

.lit-list-marker {
  min-width: 1.3em;
  font-family: var(--display);
  font-style: italic;
}
.lit-author-text,
.lit-context-text {
  max-width: 62ch;
}
</style>
