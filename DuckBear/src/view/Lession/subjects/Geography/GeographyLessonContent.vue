<template>
  <!-- Môn Địa lí – trang atlas: giấy bản đồ, đường đồng mức, 4 màu bản đồ (biển – đất – rừng – ghim đỏ) -->
  <div class="geo-page" :class="`geo-font-${fontSize}`">
    <!-- ── Mỗi phần học ── -->
    <article
      v-for="(sec, secIdx) in viewSections"
      :key="secIdx"
      :id="`lesson-section-${secIdx}`"
      class="geo-section"
      :class="`geo-theme--${sec.topic.theme}`"
    >
      <header class="geo-section-head">
        <span class="geo-section-icon" aria-hidden="true">
          <v-icon :icon="sec.topic.icon" size="22" />
        </span>
        <h2 class="geo-section-title">
          <span class="geo-sr-only">Phần {{ secIdx + 1 }}: </span
          >{{ sec.cleanTitle || sec.title }}
        </h2>
      </header>

      <div class="geo-body">
        <template v-for="(block, bIdx) in sec.blocks" :key="bIdx">
          <!-- Số liệu: các con số nổi bật -->
          <ul v-if="block.type === 'stats'" class="geo-stats">
            <li
              v-for="(s, i) in block.items"
              :key="i"
              class="geo-stat"
              :class="{ 'geo-stat--text': !s.value }"
            >
              <span class="geo-stat-label">{{ s.label }}</span>
              <span v-if="s.value" class="geo-stat-figure">
                <small v-if="s.prefix">{{ s.prefix }}</small>
                <b>{{ s.value }}</b>
                <i v-if="s.unit">{{ s.unit }}</i>
              </span>
              <span v-else class="geo-stat-text">{{
                capitalizeFirstLetter(s.text)
              }}</span>
              <span v-if="s.note" class="geo-stat-note">{{
                capitalizeFirstLetter(s.note)
              }}</span>
            </li>
          </ul>

          <!-- Điểm cực: tọa độ -->
          <ul v-else-if="block.type === 'extremes'" class="geo-extremes">
            <li v-for="(it, i) in block.items" :key="i" class="geo-extreme">
              <span class="geo-extreme-arrow" aria-hidden="true">
                <v-icon :icon="extremeIcon(it.key)" size="18" />
              </span>
              <div>
                <h3>{{ it.label }}</h3>
                <p v-if="it.coord" class="geo-coord">{{ it.coord }}</p>
                <p class="geo-extreme-place">
                  {{ capitalizeFirstLetter(it.coord ? it.place : it.text) }}
                </p>
              </div>
            </li>
          </ul>

          <!-- La bàn: tiếp giáp các hướng -->
          <div v-else-if="block.type === 'compass'" class="geo-compass">
            <template v-for="cell in compassCells(block)" :key="cell.key">
              <div
                v-if="cell.key === 'c'"
                class="geo-compass-center"
                aria-hidden="true"
              >
                <svg viewBox="0 0 120 120" class="geo-rose">
                  <circle cx="60" cy="60" r="52" class="rose-ring" />
                  <circle
                    cx="60"
                    cy="60"
                    r="38"
                    class="rose-ring rose-ring--in"
                  />
                  <polygon points="60,8 68,60 60,52 52,60" class="rose-n" />
                  <polygon points="60,112 52,60 60,68 68,60" class="rose-s" />
                  <polygon points="8,60 60,52 52,60 60,68" class="rose-s" />
                  <polygon points="112,60 60,68 68,60 60,52" class="rose-s" />
                  <text x="60" y="26" text-anchor="middle" class="rose-letter">
                    B
                  </text>
                </svg>
              </div>
              <div
                v-else
                class="geo-compass-cell"
                :class="[
                  `geo-compass-cell--${cell.key}`,
                  { 'geo-compass-cell--empty': !cell.item },
                ]"
              >
                <template v-if="cell.item">
                  <h3>{{ cell.item.label }}</h3>
                  <p>{{ capitalizeFirstLetter(cell.item.text) }}</p>
                </template>
              </div>
            </template>
          </div>

          <!-- Thuận lợi – Khó khăn -->
          <div
            v-else-if="block.type === 'pros-cons'"
            class="geo-proscons"
            :class="{ 'is-single': !(block.pros.length && block.cons.length) }"
          >
            <section v-if="block.pros.length" class="geo-pc geo-pc--pro">
              <h3>
                <v-icon
                  icon="mdi-plus-circle-outline"
                  size="19"
                  aria-hidden="true"
                />
                {{ block.prosLabel }}
              </h3>
              <ul>
                <li v-for="(it, i) in block.pros" :key="i">
                  {{ capitalizeFirstLetter(it) }}
                </li>
              </ul>
            </section>
            <section v-if="block.cons.length" class="geo-pc geo-pc--con">
              <h3>
                <v-icon
                  icon="mdi-minus-circle-outline"
                  size="19"
                  aria-hidden="true"
                />
                {{ block.consLabel }}
              </h3>
              <ul>
                <li v-for="(it, i) in block.cons" :key="i">
                  {{ capitalizeFirstLetter(it) }}
                </li>
              </ul>
            </section>
          </div>

          <!-- Nguyên nhân – Hậu quả – Giải pháp -->
          <ol v-else-if="block.type === 'causal'" class="geo-causal">
            <li
              v-for="(st, i) in block.steps"
              :key="i"
              class="geo-causal-step"
              :class="`geo-causal--${st.kind}`"
            >
              <h3>{{ st.label }}</h3>
              <ul>
                <li v-for="(it, k) in st.items" :key="k">
                  {{ capitalizeFirstLetter(it) }}
                </li>
              </ul>
            </li>
          </ol>

          <!-- Các vùng: thẻ khu vực -->
          <ul v-else-if="block.type === 'regions'" class="geo-regions">
            <li v-for="(it, i) in block.items" :key="i">
              <h3>
                <v-icon icon="mdi-map-outline" size="18" aria-hidden="true" />
                {{ it.label }}
              </h3>
              <p>{{ capitalizeFirstLetter(it.text) }}</p>
            </li>
          </ul>

          <!-- Bảng số liệu -->
          <div v-else-if="block.type === 'table'" class="geo-grid-wrap">
            <table class="geo-grid">
              <thead>
                <tr>
                  <th v-for="(h, i) in block.headers" :key="i" scope="col">
                    {{ h }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, r) in block.rows" :key="r">
                  <td v-for="(cell, c) in row" :key="c">{{ cell }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Khái niệm -->
          <aside v-else-if="block.type === 'concept'" class="geo-concept">
            <strong class="geo-concept-label">
              <v-icon
                icon="mdi-bookmark-outline"
                size="17"
                aria-hidden="true"
              />
              {{ block.label }}
            </strong>
            <p>{{ capitalizeFirstLetter(block.text) }}</p>
          </aside>

          <!-- Ghi chú: chú ý / em có biết / kĩ năng Atlat -->
          <aside
            v-else-if="block.type === 'note'"
            class="geo-note"
            :class="`geo-note--${block.tone}`"
          >
            <span class="geo-note-glyph" aria-hidden="true">
              <v-icon :icon="block.icon" size="19" />
            </span>
            <p>
              <strong>{{ capitalizeFirstLetter(block.title) }}.</strong>
              {{ capitalizeFirstLetter(block.desc) }}
            </p>
          </aside>

          <!-- Ví dụ -->
          <section v-else-if="block.type === 'example'" class="geo-example">
            <h3>
              <v-icon
                icon="mdi-map-search-outline"
                size="18"
                aria-hidden="true"
              />
              {{ block.badgeTitle || "Ví dụ" }}
            </h3>
            <p>{{ capitalizeFirstLetter(block.problemText) }}</p>
          </section>

          <!-- Bài tập / Câu hỏi -->
          <section v-else-if="block.type === 'exercise'" class="geo-exercise">
            <h3>
              <v-icon icon="mdi-pencil-outline" size="18" aria-hidden="true" />
              {{ block.title || "Bài tập" }}
            </h3>
            <ol>
              <li v-for="(it, i) in block.items" :key="i">
                {{ capitalizeFirstLetter(it) }}
              </li>
            </ol>
            <details v-if="block.answers" class="geo-details">
              <summary>Xem gợi ý</summary>
              <p>{{ capitalizeFirstLetter(block.answers) }}</p>
            </details>
          </section>

          <!-- Nhãn đơn -->
          <div v-else-if="block.type === 'labeled'" class="geo-labeled">
            <span class="geo-labeled-term">{{ block.label }}</span>
            <p>{{ capitalizeFirstLetter(block.text) }}</p>
          </div>

          <!-- Bảng nhãn -->
          <dl v-else-if="block.type === 'labeled-list'" class="geo-facts">
            <div v-for="(it, i) in block.items" :key="i" class="geo-fact">
              <dt>{{ it.label }}</dt>
              <dd>{{ capitalizeFirstLetter(it.text) }}</dd>
            </div>
          </dl>

          <!-- Danh sách ý -->
          <ul v-else-if="block.type === 'list'" class="geo-list">
            <li v-for="(item, i) in block.items" :key="i">
              <span class="geo-list-marker" aria-hidden="true">{{
                item.number ? `${item.number}.` : "•"
              }}</span>
              <span>{{ capitalizeFirstLetter(item.text) }}</span>
            </li>
          </ul>

          <!-- Đoạn văn -->
          <p v-else class="geo-para">{{ capitalizeFirstLetter(block.text) }}</p>
        </template>
      </div>
    </article>

    <!-- ── Tổng kết lưu ý ── -->
    <section v-if="extractedTips.length" class="geo-recap">
      <h3 class="geo-recap-title">
        <v-icon
          icon="mdi-map-marker-star-outline"
          size="22"
          aria-hidden="true"
        />
        Ghi nhớ &amp; Lưu ý của bài
      </h3>
      <ul class="geo-recap-grid">
        <li
          v-for="(tip, tIdx) in extractedTips"
          :key="tIdx"
          class="geo-recap-item"
          :class="`geo-tone--${tip.color}`"
        >
          <span class="geo-recap-icon" aria-hidden="true">
            <v-icon :icon="tip.icon" size="19" />
          </span>
          <div>
            <h4>{{ tip.title }}</h4>
            <p>{{ capitalizeFirstLetter(tip.desc) }}</p>
          </div>
        </li>
      </ul>
    </section>

    <!-- ── Tự kiểm tra nhanh (sinh từ số liệu / điểm cực / la bàn… của bài) ── -->
    <section v-if="checkQuestions.length" class="geo-check">
      <header class="geo-check-head">
        <span class="geo-check-icon" aria-hidden="true">
          <v-icon icon="mdi-compass-outline" size="22" />
        </span>
        <div>
          <h3>Tự kiểm tra nhanh</h3>
          <p>Những câu hỏi lấy trực tiếp từ số liệu và nội dung bài vừa đọc</p>
        </div>
      </header>
      <ol class="geo-check-list">
        <li v-for="(q, i) in checkQuestions" :key="i" class="geo-check-item">
          <div class="geo-check-q">
            <span class="geo-check-no">{{ i + 1 }}</span>
            <p>{{ q.prompt }}</p>
          </div>
          <button
            type="button"
            class="geo-check-toggle"
            :aria-expanded="revealed.includes(i)"
            @click="toggleReveal(i)"
          >
            <v-icon
              :icon="
                revealed.includes(i) ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
              "
              size="17"
            />
            {{ revealed.includes(i) ? "Ẩn đáp án" : "Xem đáp án" }}
          </button>
          <div v-if="revealed.includes(i)" class="geo-check-answer">
            <span class="geo-check-source">Từ phần “{{ q.source }}”</span>
            <p>{{ capitalizeFirstLetter(q.answer) }}</p>
          </div>
        </li>
      </ol>
    </section>
  </div>
</template>

<script setup>
/**
 * GeographyLessonContent.vue
 * Môn Địa lí – giao diện như một trang atlas:
 *   - Chữ: Noto Serif (tiêu đề, như tên bản đồ) + Be Vietnam Pro (nội dung, số liệu dạng tabular)
 *   - Màu: 4 màu bản đồ – xanh biển, nâu đất, xanh rừng, đỏ ghim. Mỗi phần tự nhận màu theo chủ đề
 *   - Khối đặc thù: số liệu, điểm cực (tọa độ), la bàn tiếp giáp, thuận lợi/khó khăn,
 *     nguyên nhân → hậu quả → giải pháp, bảng, thẻ vùng
 *   - Parser dùng chung từ Geographyparser.js
 */
import { computed, ref } from "vue";
import {
  parseGeographySections,
  extractGeographyTips,
} from "./Geographyparser";

const props = defineProps({
  lesson: { type: Object, required: true },
  chapter: { type: Object, default: null },
  fontSize: { type: String, default: "normal" },
});

function capitalizeFirstLetter(text) {
  return String(text ?? "").replace(
    /^([^\p{L}\d]*)(\p{L})/u,
    (_, prefix, letter) => `${prefix}${letter.toLocaleUpperCase("vi")}`,
  );
}

const COMPASS_ORDER = ["nw", "n", "ne", "w", "c", "e", "sw", "s", "se"];
const compassCells = (block) =>
  COMPASS_ORDER.map((key) => ({
    key,
    item: block.items.find((i) => i.key === key) || null,
  }));

const extremeIcon = (key) =>
  ({
    n: "mdi-arrow-up",
    s: "mdi-arrow-down",
    e: "mdi-arrow-right",
    w: "mdi-arrow-left",
  })[key] || "mdi-compass-outline";

const parsedSections = computed(() =>
  parseGeographySections(props.lesson?.content),
);
const extractedTips = computed(() =>
  extractGeographyTips(props.lesson?.content),
);

// Phần "vùng / khu vực": các dòng "Tên vùng: mô tả" hiển thị dạng thẻ vùng
const viewSections = computed(() =>
  parsedSections.value
    .map((sec) => ({
      ...sec,
      blocks: sec.blocks.map((b) => {
        if (b.type === "labeled-list" && b.items.length === 1)
          return {
            type: "labeled",
            label: b.items[0].label,
            text: b.items[0].text,
          };
        if (
          b.type === "labeled-list" &&
          sec.topic.key === "region" &&
          b.items.length >= 2
        )
          return { type: "regions", items: b.items };
        return b;
      }),
    }))
    // Bỏ các phần rỗng (đề mục cha chỉ có tiêu đề, nội dung nằm ở đề mục con)
    .filter((sec) => sec.blocks.length > 0),
);

/* ── Tự kiểm tra: lấy câu hỏi từ chính dữ liệu của bài ── */
const revealed = ref([]);
const toggleReveal = (i) => {
  revealed.value = revealed.value.includes(i)
    ? revealed.value.filter((x) => x !== i)
    : [...revealed.value, i];
};

const checkQuestions = computed(() => {
  const pool = { stats: [], extremes: [], compass: [], pc: [], causal: [] };

  for (const sec of parsedSections.value) {
    const source = sec.cleanTitle || sec.title;
    for (const b of sec.blocks) {
      if (b.type === "stats") {
        b.items
          .filter((i) => i.value)
          .slice(0, 2)
          .forEach((i) =>
            pool.stats.push({
              prompt: `Số liệu “${i.label}” được nêu trong bài là bao nhiêu?`,
              answer: i.text,
              source,
            }),
          );
      } else if (b.type === "extremes") {
        b.items.slice(0, 2).forEach((i) =>
          pool.extremes.push({
            prompt: `${capitalizeFirstLetter(i.label)} của lãnh thổ nằm ở đâu, tọa độ bao nhiêu?`,
            answer: i.text,
            source,
          }),
        );
      } else if (b.type === "compass") {
        pool.compass.push({
          prompt: "Lãnh thổ tiếp giáp với những đâu theo từng hướng?",
          answer: b.items.map((i) => `${i.label}: ${i.text}`).join("; "),
          source,
        });
      } else if (b.type === "pros-cons") {
        if (b.pros.length)
          pool.pc.push({
            prompt: `Bài học nêu những ${b.prosLabel.toLocaleLowerCase("vi")} nào?`,
            answer: b.pros.join("; "),
            source,
          });
        if (b.cons.length)
          pool.pc.push({
            prompt: `Bài học nêu những ${b.consLabel.toLocaleLowerCase("vi")} nào?`,
            answer: b.cons.join("; "),
            source,
          });
      } else if (b.type === "causal") {
        pool.causal.push({
          prompt: `Trình bày ${b.steps.map((s) => s.label.toLocaleLowerCase("vi")).join(", ")} được nêu trong bài.`,
          answer: b.steps
            .map((s) => `${s.label}: ${s.items.join("; ")}`)
            .join(" • "),
          source,
        });
      }
    }
  }

  // Xen kẽ các loại câu hỏi, tối đa 4 câu
  const order = ["stats", "extremes", "compass", "pc", "causal"];
  const result = [];
  for (let round = 0; result.length < 4; round += 1) {
    let added = false;
    for (const k of order) {
      const q = pool[k][round];
      if (q && result.length < 4) {
        result.push(q);
        added = true;
      }
    }
    if (!added) break;
  }
  return result;
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Noto+Serif:ital,wght@0,500;0,600;0,700;1,500&display=swap");

/* ══════════ Tokens: giấy bản đồ + 4 màu bản đồ ══════════ */
.geo-page {
  --paper: #ffffff;
  --sheet: #f6f4ec;
  --ink: #16282e;
  --ink-2: #3a4c53;
  --ink-3: #69797f;
  --rule: #dde3df;
  --rule-2: #ecefec;

  --sea: #0b6a82;
  --sea-soft: #e9f4f7;
  --sea-bd: #b9dbe4;
  --land: #8a5a1e;
  --land-soft: #faf3e4;
  --land-bd: #e9d3a6;
  --forest: #2c6a3c;
  --forest-soft: #edf7ee;
  --forest-bd: #bfe0c4;
  --pin: #b83a28;
  --pin-soft: #fcefec;
  --pin-bd: #f1c7bf;

  --display: "Noto Serif", Georgia, "Times New Roman", serif;
  --sans: "Be Vietnam Pro", system-ui, -apple-system, "Segoe UI", sans-serif;
  --base: 16.5px;

  font-family: var(--sans);
  font-size: var(--base);
  line-height: 1.75;
  color: var(--ink);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
.geo-font-small {
  --base: 15px;
}
.geo-font-normal {
  --base: 16.5px;
}
.geo-font-large {
  --base: 19px;
}

/* Mỗi phần mang màu chủ đề của nó */
.geo-theme--sea {
  --t: var(--sea);
  --t-soft: var(--sea-soft);
  --t-bd: var(--sea-bd);
}
.geo-theme--land {
  --t: var(--land);
  --t-soft: var(--land-soft);
  --t-bd: var(--land-bd);
}
.geo-theme--forest {
  --t: var(--forest);
  --t-soft: var(--forest-soft);
  --t-bd: var(--forest-bd);
}
.geo-theme--pin {
  --t: var(--pin);
  --t-soft: var(--pin-soft);
  --t-bd: var(--pin-bd);
}

.geo-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* ══════════ Phần học ══════════ */
.geo-section {
  background: var(--paper);
  border: 1px solid var(--rule);
  border-radius: 10px;
  overflow: hidden;
}
.geo-section + .geo-section {
  margin-top: 1.4rem;
}

/* Tiêu đề phần: nền giấy bản đồ + đường đồng mức */
.geo-section-head {
  display: flex;
  align-items: center;
  gap: 0.95rem;
  padding: 1.15rem 1.6rem;
  background-color: var(--sheet);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='360' height='90' viewBox='0 0 360 90'%3E%3Cg fill='none' stroke='%238a5a1e' stroke-opacity='.17' stroke-width='1'%3E%3Cpath d='M180 12c40-8 80 6 96 28s-10 40-52 40-96 2-112-22 28-40 68-46z'/%3E%3Cpath d='M184 26c30-5 58 6 68 22s-8 28-38 28-70 1-80-16 20-30 50-34z'/%3E%3Cpath d='M190 40c20-3 36 4 40 14s-6 16-24 16-44 0-48-10 12-17 32-20z'/%3E%3Cpath d='M196 52c10-2 18 2 20 7s-3 8-12 8-22 0-24-5 6-8 16-10z'/%3E%3C/g%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1.2rem center;
  background-size: auto 100%;
  border-bottom: 1px solid var(--rule);
  border-left: 5px solid var(--t);
}
.geo-section-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 2.7rem;
  height: 2.7rem;
  border-radius: 50%;
  background: var(--paper);
  border: 1.5px solid var(--t);
  color: var(--t);
}
.geo-section-title {
  margin: 0;
  font-family: var(--display);
  font-weight: 700;
  font-size: 1.38em;
  line-height: 1.35;
  letter-spacing: -0.005em;
  text-wrap: balance;
}

.geo-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.6rem;
}

/* ══════════ Đoạn văn / danh sách ══════════ */
.geo-para {
  margin: 0;
  max-width: 70ch;
  color: var(--ink);
}
.geo-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  max-width: 70ch;
}
.geo-list li {
  display: flex;
  gap: 0.75rem;
}
.geo-list-marker {
  flex-shrink: 0;
  min-width: 1.2em;
  font-weight: 700;
  color: var(--t);
  font-variant-numeric: tabular-nums;
}

/* ══════════ Số liệu ══════════ */
.geo-stats {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  gap: 0.9rem;
}
.geo-stat {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.95rem 1.1rem 1rem;
  background: var(--t-soft);
  border: 1px solid var(--t-bd);
  border-top: 3px solid var(--t);
  border-radius: 8px;
}
.geo-stat-label {
  font-size: 0.86em;
  font-weight: 600;
  color: var(--ink-2);
}
.geo-stat-figure {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.35rem;
  line-height: 1.15;
}
.geo-stat-figure small {
  font-size: 0.82em;
  color: var(--ink-3);
}
.geo-stat-figure b {
  font-family: var(--display);
  font-weight: 700;
  font-size: 1.85em;
  color: var(--t);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}
.geo-stat-figure i {
  font-style: normal;
  font-weight: 600;
  font-size: 0.95em;
  color: var(--ink-2);
}
.geo-stat-text {
  font-weight: 600;
  color: var(--ink);
  line-height: 1.5;
}
.geo-stat-note {
  font-size: 0.84em;
  color: var(--ink-3);
  line-height: 1.5;
}

/* ══════════ Điểm cực ══════════ */
.geo-extremes {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13.5rem, 1fr));
  gap: 0.9rem;
}
.geo-extreme {
  display: flex;
  gap: 0.8rem;
  padding: 0.95rem 1.1rem;
  border: 1px solid var(--rule);
  border-radius: 8px;
  background: var(--paper);
}
.geo-extreme-arrow {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 2.1rem;
  height: 2.1rem;
  border-radius: 50%;
  background: var(--t);
  color: #fff;
}
.geo-extreme h3 {
  margin: 0;
  font-family: var(--display);
  font-size: 1em;
  font-weight: 700;
}
.geo-coord {
  margin: 0.1rem 0 0.15rem;
  font-weight: 700;
  font-size: 1.12em;
  color: var(--t);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
}
.geo-extreme-place {
  margin: 0;
  font-size: 0.88em;
  color: var(--ink-2);
  line-height: 1.55;
}

/* ══════════ La bàn ══════════ */
.geo-compass {
  display: grid;
  grid-template-columns: 1fr minmax(8rem, 10rem) 1fr;
  grid-template-rows: auto auto auto;
  gap: 0.7rem 1rem;
  align-items: center;
  padding: 1.2rem;
  background: var(--sheet);
  border: 1px solid var(--rule);
  border-radius: 10px;
}
.geo-compass-cell {
  padding: 0.7rem 0.95rem;
  background: var(--paper);
  border: 1px solid var(--rule);
  border-left: 3px solid var(--t);
  border-radius: 6px;
}
.geo-compass-cell--empty {
  visibility: hidden;
  border: 0;
  background: none;
}
.geo-compass-cell h3 {
  margin: 0 0 0.1rem;
  font-family: var(--display);
  font-size: 0.95em;
  font-weight: 700;
  color: var(--t);
}
.geo-compass-cell p {
  margin: 0;
  font-size: 0.92em;
  line-height: 1.55;
  color: var(--ink-2);
}
.geo-compass-cell--n,
.geo-compass-cell--s {
  text-align: center;
  border-left-width: 1px;
}
.geo-compass-cell--n {
  border-top: 3px solid var(--t);
}
.geo-compass-cell--s {
  border-bottom: 3px solid var(--t);
}
.geo-compass-cell--w {
  text-align: right;
  border-left-width: 1px;
  border-right: 3px solid var(--t);
}
.geo-compass-center {
  display: grid;
  place-items: center;
}
.geo-rose {
  width: 100%;
  max-width: 8.5rem;
  height: auto;
}
.rose-ring {
  fill: none;
  stroke: var(--t);
  stroke-opacity: 0.35;
  stroke-width: 1;
}
.rose-ring--in {
  stroke-dasharray: 2 3;
}
.rose-n {
  fill: var(--pin);
}
.rose-s {
  fill: var(--ink-2);
  fill-opacity: 0.75;
}
.rose-letter {
  font-family: var(--display);
  font-size: 13px;
  font-weight: 700;
  fill: #fff;
}

/* ══════════ Thuận lợi – Khó khăn ══════════ */
.geo-proscons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.geo-proscons.is-single {
  grid-template-columns: 1fr;
}
.geo-pc {
  padding: 1.05rem 1.25rem 1.15rem;
  border: 1px solid var(--rule);
  border-radius: 8px;
}
.geo-pc--pro {
  background: var(--forest-soft);
  border-color: var(--forest-bd);
}
.geo-pc--con {
  background: var(--pin-soft);
  border-color: var(--pin-bd);
}
.geo-pc h3 {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0 0 0.6rem;
  font-family: var(--display);
  font-size: 1.05em;
  font-weight: 700;
}
.geo-pc--pro h3 {
  color: var(--forest);
}
.geo-pc--con h3 {
  color: var(--pin);
}
.geo-pc ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}
.geo-pc li {
  position: relative;
  padding-left: 1.05rem;
  line-height: 1.6;
}
.geo-pc li::before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.68em;
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 50%;
}
.geo-pc--pro li::before {
  background: var(--forest);
}
.geo-pc--con li::before {
  background: var(--pin);
}

/* ══════════ Nguyên nhân → Hậu quả → Giải pháp ══════════ */
.geo-causal {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: 1.7rem;
}
.geo-causal-step {
  position: relative;
  padding: 1rem 1.15rem 1.1rem;
  border: 1px solid var(--rule);
  border-top: 4px solid var(--ink-3);
  border-radius: 8px;
  background: var(--paper);
}
.geo-causal-step:not(:last-child)::after {
  content: "";
  position: absolute;
  top: 50%;
  right: -1.2rem;
  transform: translateY(-50%);
  border: 0.45rem solid transparent;
  border-left: 0.6rem solid var(--ink-3);
  border-right: 0;
}
.geo-causal-step h3 {
  margin: 0 0 0.45rem;
  font-family: var(--display);
  font-size: 1.02em;
  font-weight: 700;
}
.geo-causal-step ul {
  margin: 0;
  padding-left: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}
.geo-causal-step li {
  line-height: 1.55;
  font-size: 0.95em;
}
.geo-causal--cause {
  border-top-color: var(--land);
}
.geo-causal--cause h3 {
  color: var(--land);
}
.geo-causal--effect {
  border-top-color: var(--pin);
}
.geo-causal--effect h3 {
  color: var(--pin);
}
.geo-causal--solution {
  border-top-color: var(--forest);
}
.geo-causal--solution h3 {
  color: var(--forest);
}

/* ══════════ Thẻ vùng ══════════ */
.geo-regions {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 0.9rem;
}
.geo-regions li {
  padding: 1rem 1.15rem;
  border: 1px solid var(--t-bd);
  background: var(--t-soft);
  border-radius: 8px;
}
.geo-regions h3 {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0 0 0.35rem;
  font-family: var(--display);
  font-size: 1em;
  font-weight: 700;
  color: var(--t);
}
.geo-regions p {
  margin: 0;
  font-size: 0.94em;
  line-height: 1.65;
  color: var(--ink-2);
}

/* ══════════ Bảng ══════════ */
.geo-grid-wrap {
  overflow-x: auto;
  border: 1px solid var(--rule);
  border-radius: 8px;
}
.geo-grid {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95em;
}
.geo-grid th {
  padding: 0.65rem 1rem;
  text-align: left;
  background: var(--t-soft);
  color: var(--t);
  font-weight: 700;
  border-bottom: 2px solid var(--t);
  white-space: nowrap;
}
.geo-grid td {
  padding: 0.6rem 1rem;
  border-bottom: 1px solid var(--rule-2);
  font-variant-numeric: tabular-nums;
}
.geo-grid tbody tr:last-child td {
  border-bottom: 0;
}
.geo-grid tbody tr:nth-child(even) td {
  background: #fafbfa;
}

/* ══════════ Khái niệm / ghi chú ══════════ */
.geo-concept {
  padding: 1rem 1.3rem;
  background: var(--t-soft);
  border: 1px solid var(--t-bd);
  border-left: 4px solid var(--t);
  border-radius: 8px;
}
.geo-concept-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin-bottom: 0.2rem;
  font-family: var(--display);
  color: var(--t);
}
.geo-concept p {
  margin: 0;
  max-width: 68ch;
}

.geo-note,
.geo-recap-item {
  --nc: var(--land);
  --nbg: var(--land-soft);
  --nbd: var(--land-bd);
}
.geo-note--sea,
.geo-tone--sea {
  --nc: var(--sea);
  --nbg: var(--sea-soft);
  --nbd: var(--sea-bd);
}
.geo-note--forest,
.geo-tone--forest {
  --nc: var(--forest);
  --nbg: var(--forest-soft);
  --nbd: var(--forest-bd);
}
.geo-note--pin,
.geo-tone--pin {
  --nc: var(--pin);
  --nbg: var(--pin-soft);
  --nbd: var(--pin-bd);
}
.geo-note--land,
.geo-tone--land {
  --nc: var(--land);
  --nbg: var(--land-soft);
  --nbd: var(--land-bd);
}

.geo-note {
  display: flex;
  gap: 0.8rem;
  padding: 0.95rem 1.2rem;
  background: var(--nbg);
  border: 1px solid var(--nbd);
  border-left: 4px solid var(--nc);
  border-radius: 8px;
}
.geo-note-glyph {
  flex-shrink: 0;
  padding-top: 0.12rem;
  color: var(--nc);
}
.geo-note p {
  margin: 0;
  font-size: 0.95em;
  line-height: 1.7;
  color: var(--ink-2);
}
.geo-note strong {
  font-family: var(--display);
  color: var(--nc);
}

/* ══════════ Ví dụ / bài tập ══════════ */
.geo-example,
.geo-exercise {
  padding: 1.1rem 1.3rem;
  background: var(--sheet);
  border: 1px solid var(--rule);
  border-radius: 8px;
}
.geo-example h3,
.geo-exercise h3 {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0 0 0.5rem;
  font-family: var(--display);
  font-size: 1.02em;
  font-weight: 700;
  color: var(--t);
}
.geo-example p {
  margin: 0;
}
.geo-exercise {
  border-style: dashed;
  border-color: var(--t-bd);
}
.geo-exercise ol {
  margin: 0 0 0.5rem;
  padding-left: 1.3rem;
}
.geo-exercise li::marker {
  color: var(--t);
  font-weight: 700;
}
.geo-details > summary {
  cursor: pointer;
  font-weight: 600;
  color: var(--t);
  list-style: none;
}
.geo-details > summary::-webkit-details-marker {
  display: none;
}
.geo-details > summary::before {
  content: "▸ ";
}
.geo-details[open] > summary::before {
  content: "▾ ";
}
.geo-details p {
  margin: 0.4rem 0 0;
  color: var(--ink-2);
}

/* ══════════ Nhãn ══════════ */
.geo-labeled {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  column-gap: 1.1rem;
  align-items: baseline;
  max-width: 72ch;
}
.geo-labeled-term {
  font-family: var(--display);
  font-weight: 700;
  color: var(--t);
}
.geo-labeled p {
  margin: 0;
}

.geo-facts {
  margin: 0;
  border: 1px solid var(--rule);
  border-radius: 8px;
  overflow: hidden;
}
.geo-fact {
  display: grid;
  grid-template-columns: minmax(8rem, 13rem) 1fr;
  column-gap: 1.4rem;
  padding: 0.8rem 1.25rem;
}
.geo-fact:nth-child(even) {
  background: var(--sheet);
}
.geo-fact + .geo-fact {
  border-top: 1px solid var(--rule-2);
}
.geo-fact dt {
  font-family: var(--display);
  font-weight: 700;
  color: var(--t);
}
.geo-fact dd {
  margin: 0;
}

/* ══════════ Tổng kết ══════════ */
.geo-recap,
.geo-check {
  margin-top: 1.4rem;
  padding: 1.7rem 1.6rem;
  background: var(--paper);
  border: 1px solid var(--rule);
  border-radius: 10px;
}
.geo-recap {
  border-top: 4px solid var(--pin);
}
.geo-recap-title {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin: 0 0 1.1rem;
  font-family: var(--display);
  font-size: 1.28em;
  font-weight: 700;
  color: var(--pin);
}
.geo-recap-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: 0.9rem;
}
.geo-recap-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.95rem 1.1rem;
  background: var(--nbg);
  border: 1px solid var(--nbd);
  border-radius: 8px;
}
.geo-recap-icon {
  flex-shrink: 0;
  padding-top: 0.12rem;
  color: var(--nc);
}
.geo-recap-item h4 {
  margin: 0 0 0.2rem;
  font-family: var(--display);
  font-size: 1em;
  font-weight: 700;
  color: var(--nc);
}
.geo-recap-item p {
  margin: 0;
  font-size: 0.93em;
  line-height: 1.65;
  color: var(--ink-2);
}

/* ══════════ Tự kiểm tra ══════════ */
.geo-check {
  border-top: 4px solid var(--sea);
}
.geo-check-head {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding-bottom: 1rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--rule);
}
.geo-check-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 2.6rem;
  height: 2.6rem;
  border-radius: 50%;
  background: var(--sea-soft);
  border: 1.5px solid var(--sea);
  color: var(--sea);
}
.geo-check-head h3 {
  margin: 0;
  font-family: var(--display);
  font-size: 1.22em;
  font-weight: 700;
}
.geo-check-head p {
  margin: 0.1rem 0 0;
  font-size: 0.86em;
  color: var(--ink-3);
}
.geo-check-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.85rem;
}
.geo-check-item {
  padding: 1rem 1.2rem;
  background: var(--sheet);
  border: 1px solid var(--rule);
  border-radius: 8px;
}
.geo-check-q {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}
.geo-check-q p {
  margin: 0.1rem 0 0;
  font-weight: 600;
  line-height: 1.6;
}
.geo-check-no {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 50%;
  background: var(--sea);
  color: #fff;
  font-size: 0.85em;
  font-weight: 700;
}
.geo-check-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0.7rem 0 0 2.55rem;
  padding: 0.3rem 0.8rem;
  border: 1px solid var(--sea-bd);
  border-radius: 6px;
  background: var(--paper);
  color: var(--sea);
  font: inherit;
  font-size: 0.88em;
  font-weight: 600;
  cursor: pointer;
}
.geo-check-toggle:hover {
  background: var(--sea-soft);
  border-color: var(--sea);
}
.geo-check-toggle:focus-visible,
.geo-details > summary:focus-visible {
  outline: 2px solid var(--sea);
  outline-offset: 2px;
}
.geo-check-answer {
  margin: 0.75rem 0 0 2.55rem;
  padding: 0.8rem 1.05rem;
  background: var(--paper);
  border: 1px solid var(--rule);
  border-left: 3px solid var(--sea);
  border-radius: 0 8px 8px 0;
}
.geo-check-source {
  font-size: 0.8em;
  font-weight: 700;
  color: var(--sea);
}
.geo-check-answer p {
  margin: 0.25rem 0 0;
  font-size: 0.95em;
  color: var(--ink-2);
  line-height: 1.65;
}

/* ══════════ Responsive ══════════ */
@media (max-width: 768px) {
  .geo-section-head {
    padding: 0.95rem 1.1rem;
    gap: 0.7rem;
    background-size: auto 80%;
  }
  .geo-section-icon {
    width: 2.3rem;
    height: 2.3rem;
  }
  .geo-section-title {
    font-size: 1.15em;
  }
  .geo-body {
    padding: 1.15rem;
    gap: 1.1rem;
  }
  .geo-recap,
  .geo-check {
    padding: 1.2rem;
  }

  .geo-compass {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;
  }
  .geo-compass-center {
    order: -1;
  }
  .geo-compass-cell--empty {
    display: none;
  }
  .geo-compass-cell,
  .geo-compass-cell--n,
  .geo-compass-cell--s,
  .geo-compass-cell--w {
    text-align: left;
    border: 1px solid var(--rule);
    border-left: 3px solid var(--t);
  }

  .geo-proscons {
    grid-template-columns: 1fr;
  }
  .geo-causal {
    grid-auto-flow: row;
    gap: 1.6rem;
  }
  .geo-causal-step:not(:last-child)::after {
    top: auto;
    bottom: -1.15rem;
    right: auto;
    left: 50%;
    transform: translateX(-50%);
    border: 0.45rem solid transparent;
    border-top: 0.6rem solid var(--ink-3);
    border-bottom: 0;
  }
  .geo-labeled,
  .geo-fact {
    grid-template-columns: 1fr;
    row-gap: 0.1rem;
  }
  .geo-check-toggle,
  .geo-check-answer {
    margin-left: 0;
  }
}
</style>
