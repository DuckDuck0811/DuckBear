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
          <v-icon icon="mdi-bookmark-check-outline" size="22" aria-hidden="true" />
          Ghi nhớ &amp; Lưu ý trọng tâm
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
          <v-icon icon="mdi-head-question-outline" size="22" />
        </span>
        <div>
          <h3 class="lit-review-title">Câu hỏi đọc hiểu &amp; suy ngẫm</h3>
          <p class="lit-review-subtitle">
            Hệ thống câu hỏi gợi mở cảm thụ theo sát nội dung văn bản
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
                  : 'mdi-book-search-outline'
              "
              size="17"
            />
            {{ revealedQuestions.includes(index) ? "Ẩn dẫn chứng gợi ý" : "Xem dẫn chứng gợi ý" }}
          </button>
          <blockquote
            v-if="revealedQuestions.includes(index)"
            class="lit-review-answer"
          >
            <span class="lit-review-source">
              <v-icon icon="mdi-book-open-page-variant-outline" size="15" />
              Dẫn chứng từ phần “{{ question.sectionTitle }}”
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
@import url("https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;0,800;1,500;1,600;1,700&display=swap");

/* ══════════════════════════════════════════
   Design tokens – Đậm chất văn học trên nền trắng
══════════════════════════════════════════ */
.lit-page {
  --paper: #ffffff;
  --paper-subtle: #faf8f5;
  --paper-accent: #f5f0e6;
  --ink: #1f2421;
  --ink-2: #3f4441;
  --ink-3: #6b726d;
  --rule: #e5ded5;
  --rule-2: #f0ebe2;

  /* Sắc màu văn chương truyền thống */
  --seal: #8b1e1e;          /* son đỏ chu sa – nét bút phê, con dấu */
  --seal-soft: #fcf2f0;
  --seal-border: #f6c8c4;
  --chàm: #1e3a5f;          /* lam chàm cổ điển – học thuật, sâu lắng */
  --chàm-soft: #f1f5fa;
  --chàm-border: #c8d8ec;
  --gold: #854d0e;          /* hoàng cúc / nâu hổ phách */
  --gold-soft: #fefce8;
  --gold-border: #fef08a;
  --moss: #245339;          /* xanh rêu cổ thi */
  --moss-soft: #f0fdf4;
  --moss-border: #bbf7d0;
  --blood: #6b1414;

  --display: "Playfair Display", "Georgia", "Times New Roman", serif;
  --serif: "Lora", "Merriweather", "Noto Serif", Georgia, serif;

  --base: 17px;

  font-family: var(--serif);
  font-size: var(--base);
  line-height: 1.88;
  color: var(--ink);
  background: transparent;
  padding: 0;
  font-variant-numeric: oldstyle-nums;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
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
   PHẦN – trang sách văn học tinh tuyển
══════════════════════════════════════════ */
.lit-section {
  width: 100%;
  max-width: 100%;
  margin: 0;
  position: relative;
  padding: 2.25rem 2.2rem 2rem;
  background: #ffffff;
  border: 1px solid var(--rule);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(35, 30, 25, 0.04);
}

.lit-section + .lit-section {
  margin-top: 1.5rem;
}

.lit-section-head {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1.1rem;
  margin-bottom: 1.6rem;
  border-bottom: 3px double var(--rule);
}

.lit-section-icon {
  display: inline-grid;
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  place-items: center;
  border: 1px solid var(--rule);
  border-radius: 8px;
  background: var(--paper-subtle);
  color: var(--ink-2);
}
.lit-section-icon--author,
.lit-section-icon--devices {
  color: var(--seal);
  background: var(--seal-soft);
  border-color: var(--seal-border);
}
.lit-section-icon--context,
.lit-section-icon--timeline {
  color: var(--chàm);
  background: var(--chàm-soft);
  border-color: var(--chàm-border);
}

.lit-section-num {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 8px;
  background: var(--seal-soft);
  border: 1px solid var(--seal-border);
  font-family: var(--display);
  font-style: italic;
  font-weight: 700;
  font-size: 1.15rem;
  line-height: 1;
  color: var(--seal);
}

.lit-section-title {
  margin: 0;
  font-family: var(--display);
  font-weight: 700;
  font-size: 1.42em;
  line-height: 1.35;
  letter-spacing: -0.01em;
  color: var(--ink);
  text-wrap: balance;
}

.lit-body {
  display: flex;
  flex-direction: column;
  gap: 1.3rem;
}

/* ══════════════════════════════════════════
   ĐOẠN VĂN (+ chữ cái lồng lớn ở đầu bài)
══════════════════════════════════════════ */
.lit-para {
  margin: 0;
  max-width: 68ch;
  color: var(--ink);
  line-height: 1.9;
  text-align: justify;
  text-justify: inter-word;
}

.lit-body > .lit-para:first-child::first-letter {
  float: left;
  font-family: var(--display);
  font-weight: 700;
  font-size: 3.5em;
  line-height: 0.82;
  padding: 0.08em 0.12em 0 0;
  color: var(--seal);
  text-shadow: 1px 1px 0 rgba(139, 30, 30, 0.15);
}

/* ══════════════════════════════════════════
   KHÁI NIỆM / ĐỊNH NGHĨA – chú giải học thuật
══════════════════════════════════════════ */
.lit-concept {
  padding: 1.1rem 1.4rem;
  background: var(--paper-subtle);
  border: 1px solid var(--rule);
  border-left: 4px solid var(--gold);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.lit-concept-label {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-bottom: 0.35rem;
  font-family: var(--display);
  font-weight: 700;
  font-size: 1.05em;
  color: var(--gold);
  letter-spacing: 0.01em;
}

.lit-concept-text {
  margin: 0;
  max-width: 66ch;
  line-height: 1.85;
  color: var(--ink);
}

/* ══════════════════════════════════════════
   TRÍCH THƠ / VĂN – câu trích & khổ thơ
══════════════════════════════════════════ */
.lit-blockquote {
  position: relative;
  margin: 1rem 0;
  padding: 1.2rem 1.6rem 1.2rem 3.4rem;
  max-width: 44rem;
  border-left: 4px solid var(--seal);
  border-radius: 0 10px 10px 0;
  background: var(--paper-subtle);
  border-top: 1px solid var(--rule-2);
  border-right: 1px solid var(--rule-2);
  border-bottom: 1px solid var(--rule-2);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
  text-align: left;
}

.lit-quote-icon {
  position: absolute;
  top: 1rem;
  left: 1rem;
  color: var(--seal);
  opacity: 0.75;
}

.lit-blockquote-text {
  margin: 0;
  white-space: pre-line;
  font-family: var(--serif);
  font-style: italic;
  font-weight: 500;
  font-size: 1.08em;
  line-height: 1.88;
  color: var(--ink);
}

.lit-blockquote-footer {
  margin-top: 0.7rem;
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
  column-gap: 1.1rem;
  align-items: baseline;
  max-width: 68ch;
  padding: 0.4rem 0;
}

.lit-labeled-term {
  display: inline-flex;
  align-items: baseline;
  gap: 0.45rem;
  font-family: var(--display);
  font-style: italic;
  font-weight: 700;
  font-size: 1.05em;
  line-height: 1.6;
  color: var(--seal);
}

.lit-labeled-body {
  margin: 0;
  line-height: 1.85;
  color: var(--ink);
}

/* ══════════════════════════════════════════
   BẢNG NHÃN – mục lục trang sách
══════════════════════════════════════════ */
.lit-table {
  margin: 0;
  border: 1px solid var(--rule);
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
}

.lit-table-row {
  display: grid;
  grid-template-columns: minmax(8rem, 12.5rem) 1fr;
  column-gap: 1.5rem;
  padding: 0.9rem 1.4rem;
}
.lit-table-row:nth-child(even) {
  background: var(--paper-subtle);
}
.lit-table-row + .lit-table-row {
  border-top: 1px solid var(--rule-2);
}

.lit-table-term {
  display: inline-flex;
  align-items: baseline;
  gap: 0.45rem;
  font-family: var(--display);
  font-style: italic;
  font-weight: 700;
  font-size: 1.02em;
  line-height: 1.6;
  color: var(--seal);
}

.lit-table-def {
  margin: 0;
  line-height: 1.85;
  color: var(--ink);
}

/* ══════════════════════════════════════════
   GHI CHÚ / LƯU Ý – trích dẫn bên lề
══════════════════════════════════════════ */
.lit-note {
  --nc: var(--seal);
  --nbg: var(--seal-soft);
  --nbd: var(--seal-border);
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--nbd);
  border-left: 4px solid var(--nc);
  border-radius: 8px;
  background: var(--nbg);
}
.lit-note--amber {
  --nc: var(--gold);
  --nbg: var(--gold-soft);
  --nbd: var(--gold-border);
}
.lit-note--blue {
  --nc: var(--chàm);
  --nbg: var(--chàm-soft);
  --nbd: var(--chàm-border);
}
.lit-note--green {
  --nc: var(--moss);
  --nbg: var(--moss-soft);
  --nbd: var(--moss-border);
}
.lit-note--red {
  --nc: var(--blood);
  --nbg: var(--seal-soft);
  --nbd: var(--seal-border);
}

.lit-note-glyph {
  flex-shrink: 0;
  padding-top: 0.15rem;
  color: var(--nc);
}

.lit-note-body {
  margin: 0;
  font-size: 0.96em;
  line-height: 1.8;
  color: var(--ink-2);
}

.lit-note-heading {
  font-family: var(--display);
  font-weight: 700;
  color: var(--nc);
}

/* ══════════════════════════════════════════
   VÍ DỤ – đoạn trích kèm phân tích
══════════════════════════════════════════ */
.lit-example {
  padding: 1.3rem 1.5rem;
  background: var(--paper-subtle);
  border: 1px solid var(--rule);
  border-radius: 8px;
}

.lit-example-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.8rem;
  font-family: var(--display);
  font-weight: 700;
  font-size: 1.08em;
  color: var(--seal);
}

.lit-example-body {
  margin: 0 0 1.1rem;
  padding: 0.2rem 0 0.2rem 1.2rem;
  border-left: 3px solid var(--rule);
  font-style: italic;
  line-height: 1.9;
  color: var(--ink);
}

.lit-analysis-point {
  display: flex;
  gap: 0.7rem;
  margin: 0.55rem 0 0;
  font-size: 0.96em;
  line-height: 1.75;
  color: var(--ink-2);
}

.lit-analysis-mark {
  flex-shrink: 0;
  color: var(--seal);
  font-weight: bold;
}

/* ══════════════════════════════════════════
   QUY TRÌNH / PHƯƠNG PHÁP
══════════════════════════════════════════ */
.lit-method {
  padding: 1rem 0 0.3rem;
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
  gap: 0.75rem;
  max-width: 68ch;
}

.lit-list li {
  display: flex;
  gap: 0.85rem;
  line-height: 1.85;
  color: var(--ink);
}

.lit-list-marker {
  flex-shrink: 0;
  font-family: var(--display);
  font-style: italic;
  font-weight: 700;
  color: var(--seal);
}

/* ══════════════════════════════════════════
   TỔNG KẾT LƯU Ý – khung ghi nhớ cuối bài
══════════════════════════════════════════ */
.lit-recap {
  max-width: 100%;
  margin: 1.5rem 0 0;
  padding: 2rem 2.2rem;
  background: #ffffff;
  border: 1px solid var(--rule);
  border-top: 4px double var(--seal);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(35, 30, 25, 0.04);
}

.lit-recap-head {
  margin-bottom: 1.4rem;
  padding-bottom: 0.9rem;
  border-bottom: 1px solid var(--rule);
}

.lit-recap-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin: 0;
  font-family: var(--display);
  font-weight: 700;
  font-size: 1.35em;
  color: var(--seal);
  letter-spacing: -0.01em;
}

.lit-recap-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.25rem;
}

.lit-recap-item {
  --rc: var(--seal);
  --rbg: var(--seal-soft);
  --rbd: var(--seal-border);
  display: flex;
  gap: 0.85rem;
  padding: 1rem 1.15rem;
  border: 1px solid var(--rbd);
  border-radius: 8px;
  background: var(--rbg);
}
.lit-recap-item--amber {
  --rc: var(--gold);
  --rbg: var(--gold-soft);
  --rbd: var(--gold-border);
}
.lit-recap-item--blue {
  --rc: var(--chàm);
  --rbg: var(--chàm-soft);
  --rbd: var(--chàm-border);
}
.lit-recap-item--green {
  --rc: var(--moss);
  --rbg: var(--moss-soft);
  --rbd: var(--moss-border);
}
.lit-recap-item--red {
  --rc: var(--blood);
  --rbg: var(--seal-soft);
  --rbd: var(--seal-border);
}
.lit-recap-item--purple {
  --rc: var(--seal);
  --rbg: var(--seal-soft);
  --rbd: var(--seal-border);
}

.lit-recap-item-icon {
  flex-shrink: 0;
  padding-top: 0.15rem;
  color: var(--rc);
}

.lit-recap-item-title {
  margin: 0 0 0.25rem;
  font-family: var(--display);
  font-weight: 700;
  font-size: 1.02em;
  line-height: 1.5;
  color: var(--rc);
}

.lit-recap-item-desc {
  margin: 0;
  font-size: 0.94em;
  line-height: 1.75;
  color: var(--ink-2);
}

/* ══════════════════════════════════════════
   CÂU HỎI ĐỌC HIỂU & SUY NGẪM
══════════════════════════════════════════ */
.lit-review {
  max-width: 100%;
  margin: 1.5rem 0 0;
  padding: 2rem 2.2rem;
  border: 1px solid var(--rule);
  border-top: 4px solid var(--chàm);
  border-radius: 12px;
  background: #ffffff;
  box-shadow: 0 4px 20px rgba(35, 30, 25, 0.04);
}

.lit-review-head {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding-bottom: 1.1rem;
  border-bottom: 1px solid var(--rule);
}

.lit-review-icon {
  display: inline-grid;
  width: 2.6rem;
  height: 2.6rem;
  flex-shrink: 0;
  place-items: center;
  border: 1px solid var(--chàm-border);
  border-radius: 8px;
  background: var(--chàm-soft);
  color: var(--chàm);
}

.lit-review-title {
  margin: 0;
  color: var(--ink);
  font-family: var(--display);
  font-size: 1.25em;
  font-weight: 700;
}

.lit-review-subtitle {
  margin: 0.2rem 0 0;
  color: var(--ink-3);
  font-size: 0.88em;
}

.lit-review-list {
  display: grid;
  gap: 1rem;
  margin: 0;
  padding: 1.25rem 0 0;
  list-style: none;
}

.lit-review-item {
  padding: 1.1rem 1.3rem;
  border: 1px solid var(--rule);
  border-radius: 10px;
  background: var(--paper-subtle);
}

.lit-review-question {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.lit-review-question p {
  margin: 0.1rem 0 0;
  color: var(--ink);
  font-weight: 600;
  line-height: 1.7;
}

.lit-review-number {
  display: inline-grid;
  width: 1.85rem;
  height: 1.85rem;
  flex-shrink: 0;
  place-items: center;
  border-radius: 6px;
  background: var(--chàm-soft);
  border: 1px solid var(--chàm-border);
  color: var(--chàm);
  font-family: var(--display);
  font-size: 0.9em;
  font-weight: 700;
}

.lit-review-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0.75rem 0 0 2.6rem;
  padding: 0.3rem 0.75rem;
  border: 1px solid var(--chàm-border);
  border-radius: 6px;
  background: #ffffff;
  color: var(--chàm);
  font: inherit;
  font-size: 0.88em;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.lit-review-toggle:hover {
  background: var(--chàm-soft);
  border-color: var(--chàm);
}

.lit-review-answer {
  margin: 0.85rem 0 0 2.6rem;
  padding: 0.9rem 1.15rem;
  border-left: 3px solid var(--seal);
  border-radius: 0 8px 8px 0;
  background: #ffffff;
  border-top: 1px solid var(--rule-2);
  border-right: 1px solid var(--rule-2);
  border-bottom: 1px solid var(--rule-2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.lit-review-source {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--seal);
  font-family: var(--display);
  font-size: 0.82em;
  font-weight: 700;
}

.lit-review-answer p {
  margin: 0.4rem 0 0;
  color: var(--ink-2);
  font-size: 0.94em;
  line-height: 1.8;
  font-style: italic;
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
  gap: 1.25rem;
  align-items: flex-start;
  padding: 1.25rem 1.4rem;
  background: var(--paper-subtle);
  border: 1px solid var(--rule);
  border-left: 4px solid var(--seal);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}
.lit-author-seal {
  flex-shrink: 0;
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  border: 1px solid var(--seal-border);
  border-radius: 50%;
  background: var(--seal-soft);
  color: var(--seal);
  box-shadow: 0 2px 6px rgba(139, 30, 30, 0.08);
}
.lit-author-label,
.lit-context-label,
.lit-compare-col h3,
.lit-outline h3,
.lit-devices h3,
.lit-exercise-title {
  margin: 0 0 0.25rem;
  font-family: var(--display);
  font-weight: 700;
  font-size: 1.08em;
  line-height: 1.5;
  color: var(--seal);
}
.lit-context-label {
  color: var(--chàm);
}
.lit-devices h3,
.lit-exercise-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}
.lit-author-text,
.lit-context-text,
.lit-compare-col p,
.lit-outline p,
.lit-devices p {
  margin: 0;
  line-height: 1.85;
}

.lit-context {
  display: grid;
  grid-template-columns: 5.5rem 1fr;
  column-gap: 1.25rem;
  padding: 1.25rem 1.4rem;
  background: var(--paper-subtle);
  border: 1px solid var(--rule);
  border-left: 4px solid var(--chàm);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}
.lit-context-year {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-right: 0.9rem;
  border-right: 2px solid var(--rule);
  text-align: right;
  font-family: var(--display);
  font-style: italic;
  font-weight: 700;
  font-size: 2em;
  line-height: 1;
  color: var(--chàm);
}

.lit-facts {
  margin: 0;
  border: 1px solid var(--rule);
  border-radius: 8px;
  background: var(--paper-subtle);
  padding: 0.5rem 0;
}
.lit-fact {
  display: grid;
  grid-template-columns: minmax(7.5rem, 11rem) 1fr;
  column-gap: 1.25rem;
  padding: 0.65rem 1.4rem;
}
.lit-fact + .lit-fact {
  border-top: 1px dotted var(--rule);
}
.lit-fact dt {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-family: var(--display);
  font-style: italic;
  font-weight: 700;
  color: var(--seal);
}
.lit-fact dd {
  margin: 0;
  line-height: 1.75;
  color: var(--ink);
}

.lit-compare {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border: 1px solid var(--rule);
  border-radius: 8px;
  overflow: hidden;
  background: #ffffff;
}
.lit-compare-col {
  padding: 1.2rem 1.4rem;
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
  grid-template-columns: 2.2rem 1fr;
  column-gap: 1rem;
  padding-bottom: 1.25rem;
}
.lit-outline li:not(:last-child)::before {
  content: "";
  position: absolute;
  left: 1.1rem;
  top: 2.3rem;
  bottom: 0.2rem;
  border-left: 2px dashed var(--seal-border);
}
.lit-outline-mark {
  display: grid;
  place-items: center;
  width: 2.2rem;
  height: 2.2rem;
  border: 1px solid var(--seal-border);
  border-radius: 50%;
  background: var(--seal-soft);
  font-family: var(--display);
  font-style: italic;
  font-weight: 700;
  font-size: 0.95em;
  color: var(--seal);
}

.lit-devices {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1.25rem;
}
.lit-devices li {
  padding: 1.15rem 1.25rem;
  background: var(--paper-subtle);
  border: 1px solid var(--rule);
  border-top: 3px solid var(--seal);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}
.lit-devices p {
  font-size: 0.96em;
  line-height: 1.8;
  color: var(--ink-2);
}

.lit-verse {
  position: relative;
  margin: 1.2rem 0;
  padding: 1.4rem 1.8rem 1.2rem;
  border: 1px solid var(--rule);
  border-radius: 10px;
  background: var(--paper-subtle);
  text-align: center;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.015);
}
.lit-verse-mark {
  display: block;
  margin: 0 auto 0.6rem;
  color: var(--seal);
  opacity: 0.85;
}
.lit-verse-lines {
  display: inline-block;
  text-align: left;
}
.lit-verse-lines p {
  margin: 0;
  font-family: var(--serif);
  font-style: italic;
  font-size: 1.08em;
  line-height: 2;
  color: var(--ink);
}
.lit-verse-lines p:nth-child(even) {
  padding-left: 1.8em;
}
.lit-verse figcaption {
  margin-top: 0.8rem;
  font-style: italic;
  font-size: 0.9em;
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
  padding: 0.6rem 0.9rem;
  text-align: left;
  border-bottom: 2px solid var(--seal);
  font-family: var(--display);
  font-style: italic;
  font-weight: 700;
  color: var(--seal);
}
.lit-grid td {
  padding: 0.65rem 0.9rem;
  border-bottom: 1px dotted var(--rule);
  vertical-align: top;
}

.lit-analysis > summary {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  cursor: pointer;
  list-style: none;
  margin-bottom: 0.45rem;
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
  margin: 0.8rem 0 0.2rem;
  font-style: italic;
  font-weight: 600;
  font-size: 0.94em;
  color: var(--chàm);
}
.lit-conclusion {
  margin: 1rem 0 0;
  padding-top: 0.8rem;
  border-top: 1px solid var(--rule);
}
.lit-conclusion strong {
  font-family: var(--display);
  font-style: italic;
  color: var(--seal);
}

.lit-exercise {
  padding: 1.25rem 1.4rem;
  border: 1px dashed var(--seal-border);
  border-radius: 8px;
  background: var(--paper-subtle);
}
.lit-exercise ol {
  margin: 0.5rem 0 0.7rem;
  padding-left: 1.4rem;
}
.lit-exercise li {
  padding-left: 0.3rem;
  line-height: 1.85;
}
.lit-exercise li::marker {
  color: var(--seal);
  font-family: var(--display);
  font-style: italic;
  font-weight: 700;
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
    row-gap: 0.5rem;
  }
  .lit-context-year {
    border-right: none;
    border-bottom: 1px solid var(--rule);
    text-align: left;
    padding-right: 0;
    padding-bottom: 0.4rem;
    font-size: 1.8em;
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
  max-width: 66ch;
}
</style>
