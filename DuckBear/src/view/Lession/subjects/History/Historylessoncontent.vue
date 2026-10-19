<template>
  <!-- Môn Lịch sử – Trang Sử liệu & Niên biểu Trực quan: Giấy dó cổ, mặt trống đồng Đông Sơn, ấn son triều đình, trục thời gian, 4 gam màu sử sách -->
  <div class="hist-page" :class="`hist-font-${fontSize}`">
    <!-- ── Dải Banner Sử liệu & Niên đại đầu trang ── -->
    <aside class="hist-banner" aria-label="Bảng chỉ dẫn Biên niên Sử liệu">
      <div class="hist-banner-top">
        <div class="hist-banner-brand">
          <div class="hist-seal-icon" aria-hidden="true">
            <span class="seal-inner">SỬ</span>
          </div>
          <div class="hist-banner-text">
            <div class="hist-banner-tag">
              {{ chapter?.title || "ĐẠI VIỆT SỬ KÝ · BIÊN NIÊN SỬ LIỆU & CHÂU BẢN" }}
            </div>
            <div class="hist-banner-title">
              {{ lesson?.title || "Hệ thống Tri thức Lịch sử & Mốc son Thời đại" }}
            </div>
          </div>
        </div>

        <!-- Khoảng thời gian bài học (tự lấy từ các mốc trong nội dung) -->
        <div
          v-if="yearSpan"
          class="hist-span-badge"
          title="Khoảng thời gian các mốc sự kiện trong bài"
        >
          <v-icon icon="mdi-hourglass-history" size="16" class="mr-1" />
          <span>
            Niên đại: {{ yearSpan.min }}
            <template v-if="yearSpan.max !== yearSpan.min"> &ndash; {{ yearSpan.max }}</template>
          </span>
        </div>
      </div>

      <div class="hist-banner-bottom">
        <div class="hist-ruler" title="Trục kỷ nguyên thời gian biểu trưng môn Lịch sử">
          <span class="ruler-label">TRỤC KỶ NGUYÊN:</span>
          <div class="ruler-graphic">
            <span class="ruler-era">CỔ ĐẠI</span>
            <div class="ruler-track" aria-hidden="true">
              <span class="ruler-pip pip--start"></span>
              <span class="ruler-pip pip--mid"></span>
              <span class="ruler-pip pip--end"></span>
            </div>
            <span class="ruler-era">TRUNG ĐẠI</span>
            <div class="ruler-track" aria-hidden="true">
              <span class="ruler-pip pip--start"></span>
              <span class="ruler-pip pip--end"></span>
            </div>
            <span class="ruler-era">CẬN &amp; HIỆN ĐẠI</span>
          </div>
        </div>

        <div class="hist-legend-tags">
          <span class="hist-legend-tag tag--red">
            <span class="dot"></span> Chiến sự &amp; Khởi nghĩa
          </span>
          <span class="hist-legend-tag tag--gold">
            <span class="dot"></span> Vương triều &amp; Danh nhân
          </span>
          <span class="hist-legend-tag tag--indigo">
            <span class="dot"></span> Bối cảnh &amp; Đối ngoại
          </span>
          <span class="hist-legend-tag tag--jade">
            <span class="dot"></span> Thành tựu &amp; Văn hiến
          </span>
        </div>
      </div>
    </aside>

    <!-- ── Danh sách các phần bài học ── -->
    <article
      v-for="(sec, secIdx) in viewSections"
      :key="secIdx"
      :id="`lesson-section-${secIdx}`"
      class="hist-section"
      :class="`hist-theme--${sec.topic.theme}`"
    >
      <!-- Hoa văn góc cổ phong (Antique Corner Ornaments) -->
      <span class="corner-mark corner-tl" aria-hidden="true">❖</span>
      <span class="corner-mark corner-tr" aria-hidden="true">❖</span>
      <span class="corner-mark corner-bl" aria-hidden="true">❖</span>
      <span class="corner-mark corner-br" aria-hidden="true">❖</span>

      <!-- Tiêu đề phần: Họa tiết Trống đồng Đông Sơn + Ấn son + Thẻ thời đại -->
      <header class="hist-section-head">
        <div class="hist-head-main">
          <span class="hist-section-badge" aria-hidden="true">
            <span class="hist-badge-order">PHẦN {{ toRoman(secIdx + 1) }}</span>
            <span class="hist-badge-icon">
              <v-icon :icon="sec.topic.icon" size="20" />
            </span>
          </span>

          <div class="hist-title-wrapper">
            <div class="hist-topic-subtag">
              <v-icon :icon="getTopicIcon(sec.topic.key)" size="14" class="mr-1" />
              {{ getTopicLabel(sec.topic.key) }}
            </div>
            <h2 class="hist-section-title">
              <span class="hist-sr-only">Phần {{ secIdx + 1 }}: </span>
              {{ sec.cleanTitle || sec.title }}
            </h2>
          </div>
        </div>

        <div class="hist-head-meta">
          <span class="block-count-badge" v-if="sec.blocks.length">
            <v-icon icon="mdi-script-text-outline" size="14" class="mr-1" />
            {{ sec.blocks.length }} sử liệu
          </span>
        </div>
      </header>

      <!-- Thân nội dung phần học -->
      <div class="hist-body">
        <template v-for="(block, bIdx) in sec.blocks" :key="bIdx">
          <!-- 1. DÒNG THỜI GIAN & BIÊN NIÊN SỰ KIỆN: Trục thời gian hoa văn trống đồng -->
          <div
            v-if="block.type === 'timeline'"
            class="hist-timeline-wrapper"
          >
            <div class="hist-block-label">
              <v-icon icon="mdi-timeline-clock-outline" size="16" class="mr-1" />
              Biên niên sử liệu &ndash; Dòng thời gian sự kiện
            </div>
            <ol class="hist-timeline">
              <li v-for="(ev, i) in block.items" :key="i" class="hist-ev">
                <!-- Nút mốc thời gian: Biểu trưng Mặt trống đồng Đông Sơn -->
                <span class="hist-ev-node" aria-hidden="true">
                  <span class="node-drum-inner"></span>
                </span>
                <div class="hist-ev-card">
                  <div class="hist-ev-header">
                    <span class="hist-ev-time">
                      <v-icon icon="mdi-calendar-star" size="15" class="mr-1" />
                      {{ capitalizeFirstLetter(ev.time) }}
                    </span>
                    <span class="hist-ev-idx">SỰ KIỆN #{{ i + 1 }}</span>
                  </div>
                  <p class="hist-ev-content">{{ capitalizeFirstLetter(ev.text) }}</p>
                </div>
              </li>
            </ol>
          </div>

          <!-- 2. SỐ LIỆU & QUY MÔ SỰ KIỆN LỊCH SỬ -->
          <div v-else-if="block.type === 'stats'" class="hist-stats-container">
            <div class="hist-block-label">
              <v-icon icon="mdi-chart-box-outline" size="16" class="mr-1" />
              Số liệu &amp; Quy mô chiến sự &ndash; Lực lượng
            </div>
            <ul class="hist-stats">
              <li
                v-for="(s, i) in block.items"
                :key="i"
                class="hist-stat"
                :class="{ 'hist-stat--text': !s.value }"
              >
                <div class="hist-stat-head">
                  <span class="hist-stat-icon-wrap" aria-hidden="true">
                    <v-icon :icon="getStatIcon(s.label)" size="18" />
                  </span>
                  <span class="hist-stat-label">{{ s.label }}</span>
                </div>

                <div v-if="s.value" class="hist-stat-figure">
                  <small v-if="s.prefix" class="stat-prefix">{{ s.prefix }}</small>
                  <b class="stat-val">{{ s.value }}</b>
                  <i v-if="s.unit" class="stat-unit">{{ s.unit }}</i>
                </div>
                <div v-else class="hist-stat-text">
                  {{ capitalizeFirstLetter(s.text) }}
                </div>

                <div v-if="s.note" class="hist-stat-note">
                  <v-icon icon="mdi-information-outline" size="13" class="mr-1" />
                  {{ capitalizeFirstLetter(s.note) }}
                </div>
                <div class="hist-stat-accent-bar" aria-hidden="true"></div>
              </li>
            </ul>
          </div>

          <!-- 3. NHÂN VẬT LỊCH SỬ & DANH NHÂN: Thiết kế như Bia tiến sĩ / Sắc phong -->
          <section v-else-if="block.type === 'figure'" class="hist-figure">
            <div class="hist-figure-seal" aria-hidden="true">
              <v-icon icon="mdi-crown" size="26" class="crown-icon" />
              <span class="figure-seal-label">DANH NHÂN</span>
            </div>
            <div class="hist-figure-body">
              <div class="hist-figure-top">
                <h3 class="hist-figure-name">{{ block.name }}</h3>
                <span v-if="block.years" class="hist-figure-years">
                  <v-icon icon="mdi-calendar-range" size="13" class="mr-1" />
                  {{ block.years }}
                </span>
              </div>
              <p v-if="block.role" class="hist-figure-role">
                {{ capitalizeFirstLetter(block.role) }}
              </p>
              <p v-if="block.note" class="hist-figure-note">
                <v-icon icon="mdi-star-outline" size="14" class="mr-1" />
                {{ capitalizeFirstLetter(block.note) }}
              </p>
            </div>
          </section>

          <!-- 4. TRÍCH ĐOẠN SỬ LIỆU / CHIẾU CHỈ: Phong cách Cuộn thư & Châu bản ngự phê -->
          <blockquote v-else-if="block.type === 'source'" class="hist-source">
            <div class="hist-source-seal" aria-hidden="true">
              <span class="source-seal-box">CHÂU BẢN</span>
            </div>
            <div class="hist-source-body">
              <p class="hist-source-quote">
                &ldquo;{{ capitalizeFirstLetter(block.quote) }}&rdquo;
              </p>
              <footer v-if="block.source || block.author" class="hist-source-cite">
                <v-icon icon="mdi-feather" size="14" class="mr-1" />
                <span v-if="block.author" class="source-author">{{ block.author }}</span>
                <span v-if="block.source && block.author"> &ndash; </span>
                <cite v-if="block.source">{{ block.source }}</cite>
              </footer>
            </div>
          </blockquote>

          <!-- 5. THẺ SỰ KIỆN & HỒ SƠ CHIẾN SỰ (KEYFACTS) -->
          <div
            v-else-if="block.type === 'keyfacts'"
            class="hist-keyfacts-container"
          >
            <div class="hist-block-label">
              <v-icon icon="mdi-card-account-details-outline" size="16" class="mr-1" />
              Hồ sơ Sự kiện &amp; Thông số Lịch sử
            </div>
            <ul class="hist-keyfacts">
              <li v-for="(it, i) in block.items" :key="i" class="hist-keyfact">
                <div class="hist-keyfact-cap">
                  <span class="hist-keyfact-icon" aria-hidden="true">
                    <v-icon :icon="getFactIcon(it.label)" size="18" />
                  </span>
                  <h3>{{ it.label }}</h3>
                </div>
                <p>{{ capitalizeFirstLetter(it.text) }}</p>
              </li>
            </ul>
          </div>

          <!-- 6. MẠCH SỰ KIỆN: Nguyên nhân → Diễn biến → Kết quả → Ý nghĩa -->
          <div v-else-if="block.type === 'chain'" class="hist-chain-wrapper">
            <div class="hist-block-label">
              <v-icon icon="mdi-arrow-decision-outline" size="16" class="mr-1" />
              Mạch Sử liệu: Bối cảnh &ndash; Diễn biến &ndash; Kết quả &ndash; Ý nghĩa
            </div>
            <ol
              class="hist-chain"
              :style="{ '--n': Math.min(block.steps.length, 4) }"
            >
              <li
                v-for="(st, i) in block.steps"
                :key="i"
                class="hist-chain-step"
                :class="`hist-chain--${st.kind}`"
              >
                <div class="chain-step-head">
                  <span class="chain-step-no">{{ i + 1 }}</span>
                  <span class="chain-step-icon">
                    <v-icon :icon="getChainIcon(st.kind)" size="18" />
                  </span>
                  <h3>{{ st.label }}</h3>
                </div>
                <ul>
                  <li v-for="(it, k) in st.items" :key="k">
                    {{ capitalizeFirstLetter(it) }}
                  </li>
                </ul>
              </li>
            </ol>
          </div>

          <!-- 7. ĐÁNH GIÁ SỬ QUAN: Thành tựu vs Hạn chế (Thắng lợi & Bài học) -->
          <div v-else-if="block.type === 'assess'" class="hist-assess-wrapper">
            <div class="hist-block-label">
              <v-icon icon="mdi-scale-balance" size="16" class="mr-1" />
              Luận bàn Lịch sử: Giá trị Thành tựu &amp; Bài học kinh nghiệm
            </div>
            <div
              class="hist-assess"
              :class="{ 'is-single': !(block.pros.length && block.cons.length) }"
            >
              <section v-if="block.pros.length" class="hist-card hist-card--pro">
                <header class="card-head">
                  <span class="card-badge-icon">
                    <v-icon icon="mdi-trophy-variant-outline" size="20" />
                  </span>
                  <div>
                    <span class="card-eyebrow">DẤU SON THỜI ĐẠI</span>
                    <h3>{{ block.prosLabel || "Thành tựu & Điểm sáng" }}</h3>
                  </div>
                </header>
                <ul>
                  <li v-for="(it, i) in block.pros" :key="i">
                    <span class="card-bullet-icon">
                      <v-icon icon="mdi-check" size="14" />
                    </span>
                    <span>{{ capitalizeFirstLetter(it) }}</span>
                  </li>
                </ul>
              </section>

              <section v-if="block.cons.length" class="hist-card hist-card--con">
                <header class="card-head">
                  <span class="card-badge-icon">
                    <v-icon icon="mdi-alert-octagon-outline" size="20" />
                  </span>
                  <div>
                    <span class="card-eyebrow">BÀI HỌC KINH NGHIỆM</span>
                    <h3>{{ block.consLabel || "Hạn chế & Khó khăn" }}</h3>
                  </div>
                </header>
                <ul>
                  <li v-for="(it, i) in block.cons" :key="i">
                    <span class="card-bullet-icon">
                      <v-icon icon="mdi-alert-circle-outline" size="14" />
                    </span>
                    <span>{{ capitalizeFirstLetter(it) }}</span>
                  </li>
                </ul>
              </section>
            </div>
          </div>

          <!-- 8. YÊU CẦU CẦN ĐẠT / MỤC TIÊU BÀI HỌC -->
          <section v-else-if="block.type === 'goal'" class="hist-goal-card">
            <header class="goal-card-head">
              <div class="goal-icon-wrap" aria-hidden="true">
                <v-icon icon="mdi-torch" size="20" />
              </div>
              <div>
                <span class="goal-eyebrow">MỤC TIÊU SỬ HỌC</span>
                <h3>{{ block.title || "Yêu cầu cần đạt" }}</h3>
              </div>
            </header>
            <ul class="goal-list">
              <li v-for="(it, i) in block.items" :key="i">
                <span class="goal-check-bullet" aria-hidden="true">
                  <v-icon icon="mdi-check-decagram" size="16" />
                </span>
                <span>{{ capitalizeFirstLetter(it) }}</span>
              </li>
            </ul>
          </section>

          <!-- 9. BẢNG SỐ LIỆU / NIÊN BIỂU SO SÁNH -->
          <div v-else-if="block.type === 'table'" class="hist-grid-container">
            <div class="hist-block-label">
              <v-icon icon="mdi-table-large" size="16" class="mr-1" />
              Bảng Niên biểu &amp; Thống kê So sánh Lịch sử
            </div>
            <div class="hist-grid-wrap">
              <table class="hist-grid">
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
          </div>

          <!-- 10. KHÁI NIỆM & THUẬT NGỮ LỊCH SỬ -->
          <aside v-else-if="block.type === 'concept'" class="hist-concept">
            <div class="hist-concept-head">
              <v-icon icon="mdi-bookmark-outline" size="18" class="mr-1" />
              <strong class="hist-concept-label">{{ block.label }}</strong>
            </div>
            <p>{{ capitalizeFirstLetter(block.text) }}</p>
          </aside>

          <!-- 11. GHI CHÚ / MỞ RỘNG / LIÊN HỆ THỰC TIỄN -->
          <aside
            v-else-if="block.type === 'note'"
            class="hist-note"
            :class="`hist-note--${block.tone}`"
          >
            <span class="hist-note-glyph" aria-hidden="true">
              <v-icon :icon="block.icon || 'mdi-bookmark-star-outline'" size="22" />
            </span>
            <div class="hist-note-body">
              <div class="hist-note-badge">
                <v-icon icon="mdi-lightbulb-on-outline" size="13" class="mr-1" />
                CHIÊM NGHIỆM LỊCH SỬ
              </div>
              <p>
                <strong>{{ capitalizeFirstLetter(block.title) }}.</strong>
                {{ capitalizeFirstLetter(block.desc) }}
              </p>
            </div>
          </aside>

          <!-- 12. VÍ DỤ MINH HỌA -->
          <section v-else-if="block.type === 'example'" class="hist-example">
            <header class="example-head">
              <v-icon icon="mdi-book-search-outline" size="19" class="mr-1" />
              <h3>{{ block.badgeTitle || "Tư liệu minh họa" }}</h3>
            </header>
            <p>{{ capitalizeFirstLetter(block.problemText) }}</p>
          </section>

          <!-- 13. BÀI TẬP / CÂU HỎI LỊCH SỬ -->
          <section v-else-if="block.type === 'exercise'" class="hist-exercise">
            <header class="exercise-head">
              <v-icon icon="mdi-script-outline" size="19" class="mr-1" />
              <h3>{{ block.title || "Câu hỏi &amp; Bài tập ôn tập" }}</h3>
            </header>
            <ol>
              <li v-for="(it, i) in block.items" :key="i">
                {{ capitalizeFirstLetter(it) }}
              </li>
            </ol>
            <details v-if="block.answers" class="hist-details">
              <summary>
                <v-icon icon="mdi-lightbulb-on-outline" size="16" class="mr-1" />
                Xem định hướng trả lời &amp; gợi ý
              </summary>
              <div class="hist-details-content">
                <p>{{ capitalizeFirstLetter(block.answers) }}</p>
              </div>
            </details>
          </section>

          <!-- 14. NHÃN ĐƠN LẺ -->
          <div v-else-if="block.type === 'labeled'" class="hist-labeled">
            <span class="hist-labeled-term">
              <v-icon icon="mdi-feather" size="14" class="mr-1" />
              {{ block.label }}
            </span>
            <p>{{ capitalizeFirstLetter(block.text) }}</p>
          </div>

          <!-- 15. DANH SÁCH THÔNG SỐ -->
          <dl v-else-if="block.type === 'labeled-list'" class="hist-facts">
            <div v-for="(it, i) in block.items" :key="i" class="hist-fact">
              <dt>
                <v-icon icon="mdi-circle-small" size="18" class="mr-1" />
                {{ it.label }}
              </dt>
              <dd>{{ capitalizeFirstLetter(it.text) }}</dd>
            </div>
          </dl>

          <!-- 16. DANH SÁCH Ý -->
          <ul v-else-if="block.type === 'list'" class="hist-list">
            <li v-for="(item, i) in block.items" :key="i">
              <span class="hist-list-marker" aria-hidden="true">
                {{ item.number ? `${item.number}.` : "❖" }}
              </span>
              <span>{{ capitalizeFirstLetter(item.text) }}</span>
            </li>
          </ul>

          <!-- 17. ĐOẠN VĂN TIÊU CHUẨN -->
          <p v-else class="hist-para">{{ capitalizeFirstLetter(block.text) }}</p>
        </template>
      </div>
    </article>

    <!-- ── TỔNG KẾT & GHI NHỚ LỊCH SỬ CỦA BÀI ── -->
    <section v-if="extractedTips.length" class="hist-recap">
      <header class="hist-recap-header">
        <div class="hist-recap-icon-box" aria-hidden="true">
          <v-icon icon="mdi-bookmark-star-outline" size="24" />
        </div>
        <div>
          <span class="hist-recap-eyebrow">HỒ SƠ TỔNG KẾT</span>
          <h3 class="hist-recap-title">Ghi nhớ &amp; Ý nghĩa Lịch sử của bài</h3>
        </div>
      </header>

      <ul class="hist-recap-grid">
        <li
          v-for="(tip, tIdx) in extractedTips"
          :key="tIdx"
          class="hist-recap-item"
          :class="`hist-tone--${tip.color}`"
        >
          <span class="hist-recap-icon" aria-hidden="true">
            <v-icon :icon="tip.icon" size="20" />
          </span>
          <div class="hist-recap-text">
            <h4>{{ tip.title }}</h4>
            <p>{{ capitalizeFirstLetter(tip.desc) }}</p>
          </div>
        </li>
      </ul>
    </section>

    <!-- ── TỰ KIỂM TRA NHANH: Thử thách Niên biểu & Sự kiện ── -->
    <section v-if="checkQuestions.length" class="hist-check">
      <header class="hist-check-head">
        <span class="hist-check-icon" aria-hidden="true">
          <v-icon icon="mdi-hourglass" size="24" />
        </span>
        <div>
          <span class="hist-check-eyebrow">ÔN TẬP NIÊN BIỂU</span>
          <h3>Thử thách Tri thức Lịch sử</h3>
          <p>Câu hỏi tự kiểm tra trích xuất trực tiếp từ mốc thời gian, nhân vật và sự kiện của bài</p>
        </div>
      </header>

      <ol class="hist-check-list">
        <li v-for="(q, i) in checkQuestions" :key="i" class="hist-check-item">
          <div class="hist-check-q">
            <span class="hist-check-no">{{ i + 1 }}</span>
            <p>{{ q.prompt }}</p>
          </div>
          <button
            type="button"
            class="hist-check-toggle"
            :aria-expanded="revealed.includes(i)"
            @click="toggleReveal(i)"
          >
            <v-icon
              :icon="revealed.includes(i) ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
              size="17"
              class="mr-1"
            />
            {{ revealed.includes(i) ? "Ẩn đáp án" : "Xem đáp án" }}
          </button>
          <div v-if="revealed.includes(i)" class="hist-check-answer">
            <div class="hist-check-source">
              <v-icon icon="mdi-source-branch" size="14" class="mr-1" />
              Sử liệu trích xuất từ: “{{ q.source }}”
            </div>
            <p>{{ capitalizeFirstLetter(q.answer) }}</p>
          </div>
        </li>
      </ol>
    </section>
  </div>
</template>

<script setup>
/**
 * Historylessoncontent.vue
 * Giao diện học liệu môn Lịch sử – Đậm chất Đại Việt Sử Ký & Sử liệu Hào Hùng:
 *   - Bản sắc: Giấy dó cổ, mặt trống đồng Đông Sơn, ấn triều đình son đỏ,
 *     trục thời gian niên biểu, mạch sự kiện Binh thư (Bối cảnh → Diễn biến → Kết quả → Ý nghĩa),
 *     thẻ bia vinh danh danh nhân, cuộn chiếu thư trích dẫn châu bản.
 *   - Parser tích hợp từ Historyparser.js.
 */
import { computed, ref } from "vue";
import { parseHistorySections, extractHistoryTips } from "./Historyparser";

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

const ROMAN = [
  "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
  "XI", "XII", "XIII", "XIV", "XV",
];
const toRoman = (n) => ROMAN[n - 1] || String(n);

/* ── Icon số liệu lịch sử ── */
function getStatIcon(label) {
  const l = String(label || "").toLowerCase();
  if (l.includes("quân") || l.includes("lực lượng") || l.includes("binh")) return "mdi-shield-sword-outline";
  if (l.includes("vũ khí") || l.includes("súng") || l.includes("pháo")) return "mdi-pistol";
  if (l.includes("thương vong") || l.includes("hi sinh") || l.includes("mất mát")) return "mdi-coffin";
  if (l.includes("thắng lợi") || l.includes("chiến công") || l.includes("diệt")) return "mdi-trophy-variant-outline";
  if (l.includes("thời gian") || l.includes("ngày") || l.includes("năm")) return "mdi-clock-outline";
  if (l.includes("diện tích") || l.includes("lãnh thổ") || l.includes("căn cứ")) return "mdi-map-marker-radius-outline";
  if (l.includes("dân số") || l.includes("quần chúng") || l.includes("người")) return "mdi-account-group-outline";
  if (l.includes("chi phí") || l.includes("kinh phí") || l.includes("tiền")) return "mdi-cash-multiple";
  return "mdi-numeric";
}

/* ── Icon thẻ sự kiện ── */
function getFactIcon(label) {
  const l = String(label || "").toLowerCase();
  if (l.includes("thời gian") || l.includes("ngày") || l.includes("năm")) return "mdi-calendar-clock";
  if (l.includes("địa điểm") || l.includes("nơi") || l.includes("chiến trường")) return "mdi-map-marker";
  if (l.includes("lãnh đạo") || l.includes("chỉ huy") || l.includes("tổng chỉ huy")) return "mdi-account-tie";
  if (l.includes("lực lượng") || l.includes("quân số")) return "mdi-account-group";
  if (l.includes("kết quả") || l.includes("thắng lợi")) return "mdi-trophy-award";
  if (l.includes("tính chất") || l.includes("mục tiêu")) return "mdi-bullseye-arrow";
  if (l.includes("phương châm") || l.includes("khẩu hiệu")) return "mdi-bullhorn-outline";
  return "mdi-card-text-outline";
}

/* ── Icon mạch sự kiện ── */
function getChainIcon(kind) {
  const map = {
    cause: "mdi-source-branch",
    prog: "mdi-sword-cross",
    result: "mdi-trophy-variant-outline",
    signif: "mdi-pillar",
  };
  return map[kind] || "mdi-circle-medium";
}

/* ── Icon và nhãn chủ đề ── */
function getTopicIcon(key) {
  const map = {
    figure: "mdi-crown",
    diplomacy: "mdi-handshake-outline",
    military: "mdi-sword-cross",
    politics: "mdi-flag-variant",
    economy: "mdi-chart-line",
    culture: "mdi-book-open-page-variant-outline",
    society: "mdi-account-group-outline",
    context: "mdi-history",
    summary: "mdi-bookmark-check-outline",
  };
  return map[key] || "mdi-script-text-outline";
}

function getTopicLabel(key) {
  const map = {
    figure: "DANH NHÂN & HOÀNG TRIỀU",
    diplomacy: "ĐỐI NGOẠI & QUỐC TẾ",
    military: "CHIẾN SỰ & KHỞI NGHĨA",
    politics: "CHÍNH TRỊ & CÁCH MẠNG",
    economy: "KINH TẾ & XÃ HỘI",
    culture: "VĂN HÓA & VĂN HIẾN",
    society: "ĐỜI SỐNG & GIAI TẦNG",
    context: "BỐI CẢNH & NGUỒN GỐC",
    summary: "TỔNG KẾT SỬ LIỆU",
  };
  return map[key] || "SỬ LIỆU LỊCH SỬ";
}

const parsedSections = computed(() =>
  parseHistorySections(props.lesson?.content),
);
const extractedTips = computed(() => extractHistoryTips(props.lesson?.content));

// Phần "vùng / khu vực": hiển thị dạng thẻ
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
        return b;
      }),
    }))
    .filter((sec) => sec.blocks.length > 0),
);

/* ── Khoảng thời gian: lấy từ chính các mốc trong bài ── */
const yearSpan = computed(() => {
  const years = [];
  for (const sec of parsedSections.value)
    for (const b of sec.blocks)
      if (b.type === "timeline")
        for (const it of b.items)
          for (const m of String(it.time).matchAll(/\b(\d{3,4})\b/g)) {
            const y = Number(m[1]);
            if (y > 0 && y < 3000) years.push(y);
          }
  if (!years.length) return null;
  return { min: Math.min(...years), max: Math.max(...years) };
});

/* ── Tự kiểm tra: lấy câu hỏi từ chính dữ liệu của bài ── */
const revealed = ref([]);
const toggleReveal = (i) => {
  revealed.value = revealed.value.includes(i)
    ? revealed.value.filter((x) => x !== i)
    : [...revealed.value, i];
};

const checkQuestions = computed(() => {
  const pool = {
    timeline: [],
    keyfacts: [],
    chain: [],
    assess: [],
    figure: [],
  };

  for (const sec of parsedSections.value) {
    const source = sec.cleanTitle || sec.title;
    for (const b of sec.blocks) {
      if (b.type === "timeline") {
        b.items.slice(0, 2).forEach((i) =>
          pool.timeline.push({
            prompt: `Sự kiện lịch sử nào gắn liền với mốc “${capitalizeFirstLetter(i.time)}”?`,
            answer: i.text,
            source,
          }),
        );
      } else if (b.type === "keyfacts") {
        b.items.slice(0, 2).forEach((i) =>
          pool.keyfacts.push({
            prompt: `Mục “${i.label}” của sự kiện được nêu trong bài như thế nào?`,
            answer: i.text,
            source,
          }),
        );
      } else if (b.type === "chain") {
        pool.chain.push({
          prompt: `Trình bày ${b.steps.map((s) => s.label.toLocaleLowerCase("vi")).join(", ")} được nêu trong bài.`,
          answer: b.steps
            .map((s) => `${s.label}: ${s.items.join("; ")}`)
            .join(" • "),
          source,
        });
      } else if (b.type === "assess") {
        if (b.pros.length)
          pool.assess.push({
            prompt: `Bài học nêu những ${(b.prosLabel || "thành tựu").toLocaleLowerCase("vi")} nào?`,
            answer: b.pros.join("; "),
            source,
          });
        if (b.cons.length)
          pool.assess.push({
            prompt: `Bài học nêu những ${(b.consLabel || "hạn chế").toLocaleLowerCase("vi")} nào?`,
            answer: b.cons.join("; "),
            source,
          });
      } else if (b.type === "figure" && b.role) {
        pool.figure.push({
          prompt: `Hãy nêu công lao, vai trò lịch sử của ${b.name}.`,
          answer: b.role,
          source,
        });
      }
    }
  }

  // Xen kẽ các loại câu hỏi, tối đa 4 câu
  const order = ["timeline", "keyfacts", "chain", "assess", "figure"];
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
@import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Noto+Serif:ital,wght@0,500;0,600;0,700;0,800;1,500;1,600&display=swap");

/* ════════════════════════════════════════════════════════════════════
   TOKENS ĐẶC TRƯNG MÔN LỊCH SỬ:
   - Giấy dó cổ, ấn son triều đình, mặt trống đồng Đông Sơn
   - 4 gam màu sử sách:
     * Đỏ son hào khí / Cờ nghĩa   (--red: #991b1b, --red-deep: #7f1d1d)
     * Vàng đồng Đông Sơn / Ngai vàng (--gold: #b45309, --gold-deep: #78350f)
     * Chàm cổ / Nghiên mực thư tịch (--indigo: #1e3a8a, --indigo-deep: #172554)
     * Ngọc bích / Đại thắng lưu danh (--jade: #047857, --jade-deep: #064e3b)
   ════════════════════════════════════════════════════════════════════ */
.hist-page {
  --paper: #fdfaf3;
  --sheet: #f7f1e1;
  --sheet-alt: #efe3c9;
  --ink: #1f1813;
  --ink-2: #3e2f24;
  --ink-3: #6e5847;
  --rule: #dfcdb0;
  --rule-2: #ebdcc5;

  --red: #991b1b;
  --red-deep: #7f1d1d;
  --red-soft: #fef2f2;
  --red-bd: #fecaca;

  --gold: #b45309;
  --gold-deep: #78350f;
  --gold-soft: #fffbeb;
  --gold-bd: #fde68a;

  --indigo: #1e3a8a;
  --indigo-deep: #172554;
  --indigo-soft: #eff6ff;
  --indigo-bd: #bfdbfe;

  --jade: #047857;
  --jade-deep: #064e3b;
  --jade-soft: #f0fdf4;
  --jade-bd: #bbf7d0;

  --display: "Noto Serif", Georgia, "Times New Roman", serif;
  --sans: "Be Vietnam Pro", system-ui, -apple-system, sans-serif;
  --base: 16px;

  font-family: var(--sans);
  font-size: var(--base);
  line-height: 1.78;
  color: var(--ink);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

.hist-font-small { --base: 14.5px; }
.hist-font-normal { --base: 16px; }
.hist-font-large { --base: 18.5px; }

/* Themes theo màu phần học */
.hist-theme--red {
  --t: var(--red);
  --t-deep: var(--red-deep);
  --t-soft: var(--red-soft);
  --t-bd: var(--red-bd);
}
.hist-theme--gold {
  --t: var(--gold);
  --t-deep: var(--gold-deep);
  --t-soft: var(--gold-soft);
  --t-bd: var(--gold-bd);
}
.hist-theme--indigo {
  --t: var(--indigo);
  --t-deep: var(--indigo-deep);
  --t-soft: var(--indigo-soft);
  --t-bd: var(--indigo-bd);
}
.hist-theme--jade {
  --t: var(--jade);
  --t-deep: var(--jade-deep);
  --t-soft: var(--jade-soft);
  --t-bd: var(--jade-bd);
}

.hist-sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

/* ════════════════════════════════════════════════════════════════════
   DẢI BANNER SỬ LIỆU ĐẦU TRANG (CHRONICLE EPIC BANNER)
   ════════════════════════════════════════════════════════════════════ */
.hist-banner {
  background: linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #991b1b 100%);
  color: #ffffff;
  border-radius: 14px;
  padding: 1.5rem 1.9rem;
  margin-bottom: 1.8rem;
  box-shadow: 0 10px 25px -5px rgba(69, 10, 10, 0.25), 0 8px 10px -6px rgba(69, 10, 10, 0.15);
  position: relative;
  overflow: hidden;
  border: 1.5px solid rgba(251, 191, 36, 0.35);
}

/* Họa tiết Trống đồng Đông Sơn mạ vàng kim chìm ở nền */
.hist-banner::before {
  content: "";
  position: absolute;
  top: -40%;
  right: -8%;
  width: 380px;
  height: 380px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='90' fill='none' stroke='%23fef08a' stroke-opacity='0.16' stroke-width='2' stroke-dasharray='4,4'/%3E%3Ccircle cx='100' cy='100' r='75' fill='none' stroke='%23fef08a' stroke-opacity='0.18' stroke-width='1.5'/%3E%3Ccircle cx='100' cy='100' r='55' fill='none' stroke='%23fef08a' stroke-opacity='0.22' stroke-width='1'/%3E%3Cpolygon points='100,20 108,70 100,60 92,70' fill='%23fef08a' fill-opacity='0.25'/%3E%3Cpolygon points='100,180 92,130 100,140 108,130' fill='%23fef08a' fill-opacity='0.25'/%3E%3Cpolygon points='20,100 70,92 60,100 70,108' fill='%23fef08a' fill-opacity='0.25'/%3E%3Cpolygon points='180,100 130,108 140,100 130,92' fill='%23fef08a' fill-opacity='0.25'/%3E%3Ccircle cx='100' cy='100' r='18' fill='%23fef08a' fill-opacity='0.3'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-size: contain;
  pointer-events: none;
}

.hist-banner-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding-bottom: 1.15rem;
  border-bottom: 1px solid rgba(254, 240, 138, 0.2);
}

.hist-banner-brand {
  display: flex;
  align-items: center;
  gap: 1.1rem;
}

/* Ấn son triều đình */
.hist-seal-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background: #b91c1c;
  border: 2px solid #fef08a;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35), inset 0 0 6px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
}

.seal-inner {
  font-family: var(--display);
  font-weight: 800;
  font-size: 1.35rem;
  color: #fef08a;
  line-height: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.hist-banner-tag {
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #fef08a;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.hist-banner-title {
  font-family: var(--display);
  font-size: 1.32rem;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.01em;
}

.hist-span-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(254, 240, 138, 0.45);
  padding: 0.45rem 0.95rem;
  border-radius: 30px;
  font-size: 0.84rem;
  color: #fef08a;
  font-family: var(--display);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
}

.hist-banner-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.2rem;
  padding-top: 1rem;
}

/* Thước đo trục kỷ nguyên thời gian */
.hist-ruler {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.ruler-label {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  color: #fef08a;
}

.ruler-graphic {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.74rem;
  color: #fef9c3;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.ruler-era {
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.12);
}

.ruler-track {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  height: 4px;
  width: 45px;
  background: rgba(254, 240, 138, 0.4);
  border-radius: 2px;
  position: relative;
}

.ruler-pip {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fef08a;
}

.hist-legend-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.85rem;
}

.hist-legend-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: #fef9c3;
}

.hist-legend-tag .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.hist-legend-tag.tag--red .dot { background-color: #f87171; }
.hist-legend-tag.tag--gold .dot { background-color: #fbbf24; }
.hist-legend-tag.tag--indigo .dot { background-color: #93c5fd; }
.hist-legend-tag.tag--jade .dot { background-color: #4ade80; }

/* ════════════════════════════════════════════════════════════════════
   CÁC PHẦN HỌC SỬ LIỆU (HISTORICAL SECTION CARDS)
   ════════════════════════════════════════════════════════════════════ */
.hist-section {
  position: relative;
  background: var(--paper);
  border: 1px solid var(--rule);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 4px 18px rgba(69, 10, 10, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hist-section + .hist-section {
  margin-top: 1.8rem;
}

/* Hoa văn góc cổ phong ❖ */
.corner-mark {
  position: absolute;
  font-size: 13px;
  color: var(--t);
  opacity: 0.45;
  line-height: 1;
  pointer-events: none;
  z-index: 2;
}

.corner-tl { top: 6px; left: 8px; }
.corner-tr { top: 6px; right: 8px; }
.corner-bl { bottom: 6px; left: 8px; }
.corner-br { bottom: 6px; right: 8px; }

/* Header của từng phần: Giấy bản mộc + Đường viền kép son đỏ */
.hist-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  padding: 1.3rem 1.8rem;
  background-color: var(--sheet);
  background-image: 
    radial-gradient(circle at 90% 50%, rgba(180, 83, 9, 0.04) 0%, transparent 60%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cg fill='none' stroke='%23b45309' stroke-opacity='0.08' stroke-width='1.2'%3E%3Ccircle cx='60' cy='60' r='50'/%3E%3Ccircle cx='60' cy='60' r='38' stroke-dasharray='3,3'/%3E%3Ccircle cx='60' cy='60' r='20'/%3E%3C/g%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1.5rem center;
  background-size: 90px;
  border-bottom: 1.5px solid var(--rule);
  border-left: 6px solid var(--t);
}

.hist-head-main {
  display: flex;
  align-items: center;
  gap: 1.1rem;
}

.hist-section-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 10px;
  background: var(--paper);
  border: 1.5px solid var(--t);
  color: var(--t);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.hist-badge-order {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: var(--t);
  line-height: 1;
  margin-bottom: 2px;
}

.hist-topic-subtag {
  display: inline-flex;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--t);
  margin-bottom: 0.2rem;
}

.hist-section-title {
  margin: 0;
  font-family: var(--display);
  font-weight: 700;
  font-size: 1.45rem;
  line-height: 1.35;
  letter-spacing: -0.01em;
  color: var(--ink);
}

.hist-body {
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
  padding: 1.9rem;
}

/* Nhãn tiêu đề khối nhỏ */
.hist-block-label {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ink-2);
  margin-bottom: 0.85rem;
}

/* ════════════════════════════════════════════════════════════════════
   1. DÒNG THỜI GIAN & BIÊN NIÊN SỰ KIỆN (TIMELINE)
   ════════════════════════════════════════════════════════════════════ */
.hist-timeline-wrapper {
  margin: 0.3rem 0;
}

.hist-timeline {
  list-style: none;
  margin: 0;
  padding: 0 0 0 1.8rem;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1.15rem;
}

.hist-timeline::before {
  content: "";
  position: absolute;
  left: 0.6rem;
  top: 0.5rem;
  bottom: 0.5rem;
  width: 3.5px;
  border-radius: 3px;
  background: linear-gradient(180deg, var(--t) 0%, var(--gold) 50%, var(--t-bd) 100%);
}

.hist-ev {
  position: relative;
}

/* Nút mốc thời gian: Mặt trống đồng thu nhỏ */
.hist-ev-node {
  position: absolute;
  left: -1.8rem;
  top: 1rem;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--paper);
  border: 3px solid var(--t);
  box-shadow: 0 0 0 3px var(--t-soft), 0 2px 6px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.node-drum-inner {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--t);
}

.hist-ev-card {
  padding: 1.1rem 1.35rem;
  background: linear-gradient(135deg, var(--paper) 0%, var(--sheet) 100%);
  border: 1px solid var(--rule);
  border-left: 4.5px solid var(--t);
  border-radius: 12px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.03);
  transition: transform 0.15s ease;
}

.hist-ev-card:hover {
  transform: translateX(4px);
}

.hist-ev-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.4rem;
  padding-bottom: 0.35rem;
  border-bottom: 1px dashed var(--rule);
}

.hist-ev-time {
  display: inline-flex;
  align-items: center;
  font-family: var(--display);
  font-weight: 800;
  font-size: 1.1rem;
  color: var(--t);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}

.hist-ev-idx {
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--ink-3);
  letter-spacing: 0.05em;
}

.hist-ev-content {
  margin: 0;
  line-height: 1.7;
  color: var(--ink);
  font-size: 0.98rem;
}

/* ════════════════════════════════════════════════════════════════════
   2. SỐ LIỆU LỊCH SỬ & QUY MÔ (STATS)
   ════════════════════════════════════════════════════════════════════ */
.hist-stats-container {
  margin: 0.2rem 0;
}

.hist-stats {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(14.5rem, 1fr));
  gap: 1rem;
}

.hist-stat {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1.1rem 1.25rem 1.2rem;
  background: var(--t-soft);
  border: 1px solid var(--t-bd);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.hist-stat:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(0, 0, 0, 0.05);
}

.hist-stat-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.5rem;
}

.hist-stat-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--paper);
  border: 1px solid var(--t-bd);
  color: var(--t);
  flex-shrink: 0;
}

.hist-stat-label {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--ink-2);
  line-height: 1.35;
}

.hist-stat-figure {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0.35rem 0 0.25rem;
}

.stat-prefix {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--ink-3);
}

.stat-val {
  font-family: var(--display);
  font-weight: 800;
  font-size: 2rem;
  color: var(--t);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  line-height: 1;
}

.stat-unit {
  font-style: normal;
  font-weight: 700;
  font-size: 1rem;
  color: var(--ink-2);
}

.hist-stat-text {
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--ink);
  line-height: 1.45;
  margin: 0.3rem 0;
}

.hist-stat-note {
  font-size: 0.82rem;
  color: var(--ink-3);
  margin-top: 0.4rem;
  line-height: 1.4;
  display: flex;
  align-items: center;
}

.hist-stat-accent-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3.5px;
  background: linear-gradient(90deg, var(--t) 0%, transparent 100%);
}

/* ════════════════════════════════════════════════════════════════════
   3. NHÂN VẬT LỊCH SỬ & DANH NHÂN (FIGURE CARDS)
   ════════════════════════════════════════════════════════════════════ */
.hist-figure {
  display: flex;
  align-items: flex-start;
  gap: 1.3rem;
  padding: 1.3rem 1.6rem;
  background: linear-gradient(135deg, var(--gold-soft) 0%, var(--sheet) 100%);
  border: 1.5px solid var(--gold-bd);
  border-left: 6px solid var(--gold);
  border-radius: 14px;
  box-shadow: 0 4px 12px rgba(180, 83, 9, 0.06);
}

.hist-figure-seal {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 68px;
  height: 68px;
  border-radius: 12px;
  background: #ffffff;
  border: 2px solid var(--gold);
  color: var(--gold);
  box-shadow: 0 4px 10px rgba(180, 83, 9, 0.15);
  flex-shrink: 0;
}

.crown-icon {
  color: var(--gold);
  margin-bottom: 2px;
}

.figure-seal-label {
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  color: var(--gold-deep);
  line-height: 1;
}

.hist-figure-body {
  flex: 1;
}

.hist-figure-top {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-bottom: 0.45rem;
}

.hist-figure-name {
  margin: 0;
  font-family: var(--display);
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--gold-deep);
}

.hist-figure-years {
  display: inline-flex;
  align-items: center;
  padding: 0.2rem 0.65rem;
  background: #ffffff;
  border: 1px solid var(--gold-bd);
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--gold);
  font-variant-numeric: tabular-nums;
}

.hist-figure-role {
  margin: 0 0 0.35rem;
  font-size: 0.98rem;
  font-weight: 600;
  color: var(--ink);
  line-height: 1.6;
}

.hist-figure-note {
  margin: 0;
  font-size: 0.88rem;
  color: var(--ink-3);
  display: flex;
  align-items: center;
}

/* ════════════════════════════════════════════════════════════════════
   4. TRÍCH ĐOẠN SỬ LIỆU & CHIẾU CHỈ (SOURCE QUOTES)
   ════════════════════════════════════════════════════════════════════ */
.hist-source {
  position: relative;
  margin: 0.6rem 0;
  padding: 1.4rem 1.8rem;
  background: linear-gradient(135deg, #fef9ee 0%, #f7ecd5 100%);
  border: 1.5px solid #d97706;
  border-radius: 12px;
  box-shadow: inset 0 0 15px rgba(217, 119, 6, 0.08), 0 4px 12px rgba(0, 0, 0, 0.03);
}

.hist-source-seal {
  position: absolute;
  top: 10px;
  right: 14px;
}

.source-seal-box {
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border: 1.5px solid #b91c1c;
  color: #b91c1c;
  font-family: var(--display);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  border-radius: 4px;
  background: rgba(254, 242, 242, 0.85);
  box-shadow: 0 2px 4px rgba(185, 28, 28, 0.15);
}

.hist-source-quote {
  font-family: var(--display);
  font-size: 1.08rem;
  font-style: italic;
  font-weight: 600;
  line-height: 1.8;
  color: #3f2212;
  margin: 0 0 0.8rem;
}

.hist-source-cite {
  display: flex;
  align-items: center;
  font-size: 0.88rem;
  font-weight: 700;
  color: #854d0e;
}

.source-author {
  font-weight: 800;
  color: #78350f;
}

/* ════════════════════════════════════════════════════════════════════
   5. THẺ SỰ KIỆN & HỒ SƠ CHIẾN SỰ (KEYFACTS)
   ════════════════════════════════════════════════════════════════════ */
.hist-keyfacts-container {
  margin: 0.3rem 0;
}

.hist-keyfacts {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
  gap: 1rem;
}

.hist-keyfact {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0.6rem;
  padding: 1.15rem 1.3rem;
  border: 1px solid var(--rule);
  border-top: 4px solid var(--t);
  border-radius: 12px;
  background: var(--paper);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.02);
}

.hist-keyfact-cap {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.hist-keyfact-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--t-soft);
  color: var(--t);
  border: 1px solid var(--t-bd);
  flex-shrink: 0;
}

.hist-keyfact-cap h3 {
  margin: 0;
  font-family: var(--display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--ink);
}

.hist-keyfact p {
  margin: 0;
  font-size: 0.94rem;
  line-height: 1.6;
  color: var(--ink-2);
}

/* ════════════════════════════════════════════════════════════════════
   6. MẠCH SỰ KIỆN: Bối cảnh → Diễn biến → Kết quả → Ý nghĩa (CHAIN)
   ════════════════════════════════════════════════════════════════════ */
.hist-chain-wrapper {
  margin: 0.3rem 0;
}

.hist-chain {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(0, 1fr);
  gap: 2rem;
}

.hist-chain-step {
  position: relative;
  padding: 1.2rem 1.35rem;
  border: 1px solid var(--rule);
  border-top: 4.5px solid var(--ink-3);
  border-radius: 12px;
  background: var(--paper);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.03);
}

.hist-chain-step:not(:last-child)::after {
  content: "";
  position: absolute;
  top: 50%;
  right: -1.35rem;
  transform: translateY(-50%);
  border: 0.5rem solid transparent;
  border-left: 0.7rem solid var(--t);
  border-right: 0;
}

.chain-step-head {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--rule-2);
}

.chain-step-no {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--sheet-alt);
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--ink-2);
}

.chain-step-icon {
  color: var(--t);
}

.hist-chain-step h3 {
  margin: 0;
  font-family: var(--display);
  font-size: 1.05rem;
  font-weight: 700;
}

.hist-chain-step ul {
  margin: 0;
  padding-left: 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.hist-chain-step li {
  line-height: 1.6;
  font-size: 0.94rem;
}

.hist-chain--cause { border-top-color: var(--indigo); }
.hist-chain--cause h3 { color: var(--indigo); }
.hist-chain--prog { border-top-color: var(--red); }
.hist-chain--prog h3 { color: var(--red); }
.hist-chain--result { border-top-color: var(--gold); }
.hist-chain--result h3 { color: var(--gold); }
.hist-chain--signif { border-top-color: var(--jade); }
.hist-chain--signif h3 { color: var(--jade); }

/* ════════════════════════════════════════════════════════════════════
   7. ĐÁNH GIÁ SỬ QUAN: Thành tựu vs Hạn chế (ASSESS)
   ════════════════════════════════════════════════════════════════════ */
.hist-assess-wrapper {
  margin: 0.3rem 0;
}

.hist-assess {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.2rem;
}

.hist-assess.is-single {
  grid-template-columns: 1fr;
}

.hist-card {
  padding: 1.25rem 1.45rem;
  border-radius: 12px;
  border: 1px solid transparent;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.02);
}

.hist-card--pro {
  background: var(--jade-soft);
  border-color: var(--jade-bd);
  border-top: 4px solid var(--jade);
}

.hist-card--con {
  background: var(--red-soft);
  border-color: var(--red-bd);
  border-top: 4px solid var(--red);
}

.card-head {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 0.9rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px dashed rgba(0, 0, 0, 0.1);
}

.card-badge-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--paper);
}

.hist-card--pro .card-badge-icon {
  color: var(--jade);
  border: 1px solid var(--jade-bd);
}

.hist-card--con .card-badge-icon {
  color: var(--red);
  border: 1px solid var(--red-bd);
}

.card-eyebrow {
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  display: block;
  line-height: 1;
  margin-bottom: 3px;
}

.hist-card--pro .card-eyebrow { color: var(--jade); }
.hist-card--con .card-eyebrow { color: var(--red); }

.hist-card h3 {
  margin: 0;
  font-family: var(--display);
  font-size: 1.12rem;
  font-weight: 700;
  color: var(--ink);
}

.hist-card ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.hist-card li {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  line-height: 1.6;
  font-size: 0.95rem;
}

.card-bullet-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 2px;
}

.hist-card--pro .card-bullet-icon {
  background: var(--jade);
  color: #ffffff;
}

.hist-card--con .card-bullet-icon {
  background: var(--red);
  color: #ffffff;
}

/* ════════════════════════════════════════════════════════════════════
   8. YÊU CẦU CẦN ĐẠT / MỤC TIÊU BÀI HỌC (GOALS)
   ════════════════════════════════════════════════════════════════════ */
.hist-goal-card {
  padding: 1.25rem 1.45rem;
  background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
  border: 1.5px solid #fde68a;
  border-left: 5px solid #d97706;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(217, 119, 6, 0.08);
}

.goal-card-head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px dashed rgba(217, 119, 6, 0.35);
}

.goal-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #ffffff;
  color: #d97706;
  border: 1px solid #fde68a;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.goal-eyebrow {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  color: #b45309;
  text-transform: uppercase;
  display: block;
  line-height: 1;
  margin-bottom: 2px;
}

.goal-card-head h3 {
  margin: 0;
  font-family: var(--display);
  font-size: 1.12rem;
  font-weight: 700;
  color: #78350f;
}

.goal-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.goal-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  line-height: 1.6;
  font-size: 0.95rem;
  color: #292524;
}

.goal-check-bullet {
  color: #d97706;
  flex-shrink: 0;
  margin-top: 2px;
}

/* ════════════════════════════════════════════════════════════════════
   9. BẢNG SỐ LIỆU / NIÊN BIỂU SO SÁNH (TABLE)
   ════════════════════════════════════════════════════════════════════ */
.hist-grid-container {
  margin: 0.3rem 0;
}

.hist-grid-wrap {
  overflow-x: auto;
  border: 1px solid var(--rule);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.hist-grid {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.hist-grid th {
  padding: 0.8rem 1.1rem;
  text-align: left;
  background: var(--t-soft);
  color: var(--t);
  font-weight: 700;
  border-bottom: 2px solid var(--t);
  white-space: nowrap;
}

.hist-grid td {
  padding: 0.75rem 1.1rem;
  border-bottom: 1px solid var(--rule-2);
  font-variant-numeric: tabular-nums;
  color: var(--ink);
}

.hist-grid tbody tr:nth-child(even) td {
  background: #fdfbf7;
}

.hist-grid tbody tr:hover td {
  background: var(--t-soft);
}

/* ════════════════════════════════════════════════════════════════════
   10. KHÁI NIỆM & GHI CHÚ SỬ HỌC (CONCEPT & NOTES)
   ════════════════════════════════════════════════════════════════════ */
.hist-concept {
  padding: 1.15rem 1.45rem;
  background: var(--t-soft);
  border: 1px solid var(--t-bd);
  border-left: 5px solid var(--t);
  border-radius: 10px;
}

.hist-concept-head {
  display: flex;
  align-items: center;
  color: var(--t);
  margin-bottom: 0.3rem;
}

.hist-concept-label {
  font-family: var(--display);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--t);
}

.hist-concept p {
  margin: 0;
  line-height: 1.65;
}

.hist-note {
  display: flex;
  gap: 1rem;
  padding: 1.15rem 1.4rem;
  border-radius: 12px;
  background: var(--sheet);
  border: 1px solid var(--rule);
  border-left: 5px solid var(--t);
}

.hist-note-glyph {
  color: var(--t);
  flex-shrink: 0;
  padding-top: 2px;
}

.hist-note-badge {
  display: inline-flex;
  align-items: center;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: var(--t);
  margin-bottom: 0.35rem;
}

.hist-note p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.65;
  color: var(--ink-2);
}

.hist-note strong {
  font-family: var(--display);
  color: var(--ink);
  font-weight: 700;
}

/* ════════════════════════════════════════════════════════════════════
   11. VÍ DỤ / BÀI TẬP / DANH SÁCH / ĐOẠN VĂN
   ════════════════════════════════════════════════════════════════════ */
.hist-example,
.hist-exercise {
  padding: 1.25rem 1.45rem;
  background: var(--sheet);
  border: 1px solid var(--rule);
  border-radius: 12px;
}

.example-head,
.exercise-head {
  display: flex;
  align-items: center;
  margin-bottom: 0.6rem;
  color: var(--t);
}

.example-head h3,
.exercise-head h3 {
  margin: 0;
  font-family: var(--display);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--t);
}

.hist-exercise {
  border: 1.5px dashed var(--t-bd);
  background: var(--t-soft);
}

.hist-exercise ol {
  margin: 0 0 0.8rem;
  padding-left: 1.3rem;
}

.hist-exercise li {
  line-height: 1.65;
  margin-bottom: 0.35rem;
}

.hist-details summary {
  cursor: pointer;
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--t);
  display: flex;
  align-items: center;
}

.hist-details-content {
  margin-top: 0.5rem;
  padding: 0.8rem 1.1rem;
  background: var(--paper);
  border: 1px solid var(--t-bd);
  border-radius: 8px;
}

.hist-labeled {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  column-gap: 1.2rem;
  align-items: baseline;
}

.hist-labeled-term {
  display: flex;
  align-items: center;
  font-family: var(--display);
  font-weight: 700;
  color: var(--t);
}

.hist-facts {
  margin: 0;
  border: 1px solid var(--rule);
  border-radius: 12px;
  overflow: hidden;
}

.hist-fact {
  display: grid;
  grid-template-columns: minmax(8rem, 14rem) 1fr;
  column-gap: 1.5rem;
  padding: 0.85rem 1.35rem;
}

.hist-fact:nth-child(even) {
  background: var(--sheet);
}

.hist-fact + .hist-fact {
  border-top: 1px solid var(--rule-2);
}

.hist-fact dt {
  display: flex;
  align-items: center;
  font-family: var(--display);
  font-weight: 700;
  color: var(--t);
}

.hist-fact dd {
  margin: 0;
  line-height: 1.6;
}

.hist-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.hist-list li {
  display: flex;
  gap: 0.8rem;
  line-height: 1.65;
}

.hist-list-marker {
  font-weight: 800;
  color: var(--t);
  font-variant-numeric: tabular-nums;
  flex-shrink: 0;
}

.hist-para {
  margin: 0;
  line-height: 1.78;
}

/* ════════════════════════════════════════════════════════════════════
   12. TỔNG KẾT & GHI NHỚ LỊCH SỬ (HIST RECAP)
   ════════════════════════════════════════════════════════════════════ */
.hist-recap {
  margin-top: 2rem;
  padding: 1.8rem 2rem;
  background: var(--paper);
  border: 1px solid var(--rule);
  border-top: 5px solid var(--red);
  border-radius: 14px;
  box-shadow: 0 4px 18px rgba(69, 10, 10, 0.04);
}

.hist-recap-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.4rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px solid var(--rule-2);
}

.hist-recap-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--red-soft);
  color: var(--red);
  border: 1px solid var(--red-bd);
  flex-shrink: 0;
}

.hist-recap-eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  color: var(--red);
  text-transform: uppercase;
}

.hist-recap-title {
  margin: 0;
  font-family: var(--display);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--ink);
}

.hist-recap-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
  gap: 1.1rem;
}

.hist-recap-item {
  display: flex;
  gap: 0.85rem;
  padding: 1.1rem 1.25rem;
  border-radius: 12px;
  border: 1px solid var(--rule);
  background: var(--sheet);
  transition: transform 0.15s ease;
}

.hist-recap-item:hover {
  transform: translateY(-2px);
}

.hist-recap-icon {
  flex-shrink: 0;
  color: var(--t);
  margin-top: 2px;
}

.hist-recap-item h4 {
  margin: 0 0 0.3rem;
  font-family: var(--display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--ink);
}

.hist-recap-item p {
  margin: 0;
  font-size: 0.93rem;
  line-height: 1.6;
  color: var(--ink-2);
}

.hist-tone--red { border-left: 4px solid var(--red); }
.hist-tone--red .hist-recap-icon { color: var(--red); }
.hist-tone--gold { border-left: 4px solid var(--gold); }
.hist-tone--gold .hist-recap-icon { color: var(--gold); }
.hist-tone--indigo { border-left: 4px solid var(--indigo); }
.hist-tone--indigo .hist-recap-icon { color: var(--indigo); }
.hist-tone--jade { border-left: 4px solid var(--jade); }
.hist-tone--jade .hist-recap-icon { color: var(--jade); }

/* ════════════════════════════════════════════════════════════════════
   13. TỰ KIỂM TRA NHANH (QUICK HIST QUIZ)
   ════════════════════════════════════════════════════════════════════ */
.hist-check {
  margin-top: 1.8rem;
  padding: 1.8rem 2rem;
  background: var(--paper);
  border: 1px solid var(--rule);
  border-top: 5px solid var(--indigo);
  border-radius: 14px;
  box-shadow: 0 4px 18px rgba(69, 10, 10, 0.04);
}

.hist-check-head {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.4rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--rule);
}

.hist-check-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: var(--indigo-soft);
  color: var(--indigo);
  border: 1.5px solid var(--indigo-bd);
  flex-shrink: 0;
}

.hist-check-eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.07em;
  color: var(--indigo);
  text-transform: uppercase;
}

.hist-check-head h3 {
  margin: 0;
  font-family: var(--display);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--ink);
}

.hist-check-head p {
  margin: 0.2rem 0 0;
  font-size: 0.88rem;
  color: var(--ink-3);
}

.hist-check-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.hist-check-item {
  padding: 1.15rem 1.35rem;
  background: var(--sheet);
  border: 1px solid var(--rule);
  border-radius: 12px;
}

.hist-check-q {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
}

.hist-check-no {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--indigo);
  color: #ffffff;
  font-weight: 800;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.hist-check-q p {
  margin: 0.15rem 0 0;
  font-weight: 700;
  font-size: 1rem;
  line-height: 1.55;
  color: var(--ink);
}

.hist-check-toggle {
  display: inline-flex;
  align-items: center;
  margin: 0.8rem 0 0 2.6rem;
  padding: 0.4rem 0.95rem;
  border: 1px solid var(--indigo-bd);
  border-radius: 8px;
  background: var(--paper);
  color: var(--indigo);
  font-weight: 700;
  font-size: 0.86rem;
  cursor: pointer;
  transition: all 0.15s ease;
}

.hist-check-toggle:hover {
  background: var(--indigo-soft);
  border-color: var(--indigo);
}

.hist-check-answer {
  margin: 0.85rem 0 0 2.6rem;
  padding: 0.95rem 1.2rem;
  background: var(--paper);
  border: 1px solid var(--rule);
  border-left: 4px solid var(--indigo);
  border-radius: 0 10px 10px 0;
  animation: fadeInAnswer 0.2s ease;
}

@keyframes fadeInAnswer {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.hist-check-source {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--indigo);
  display: flex;
  align-items: center;
  margin-bottom: 0.35rem;
}

.hist-check-answer p {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--ink-2);
}

/* ════════════════════════════════════════════════════════════════════
   RESPONSIVE DESIGN CHO THIẾT BỊ DI ĐỘNG & TABLET
   ════════════════════════════════════════════════════════════════════ */
@media (max-width: 820px) {
  .hist-banner {
    padding: 1.1rem 1.25rem;
  }
  .hist-banner-top,
  .hist-banner-bottom {
    flex-direction: column;
    align-items: flex-start;
  }
  .ruler-track {
    width: 30px;
  }
  .hist-section-head {
    padding: 1rem 1.2rem;
    flex-direction: column;
    align-items: flex-start;
    background-size: 60px;
  }
  .hist-section-badge {
    width: 46px;
    height: 46px;
  }
  .hist-section-title {
    font-size: 1.2rem;
  }
  .hist-body {
    padding: 1.2rem;
    gap: 1.2rem;
  }
  .hist-assess {
    grid-template-columns: 1fr;
  }
  .hist-chain {
    grid-auto-flow: row;
    gap: 1.8rem;
  }
  .hist-chain-step:not(:last-child)::after {
    top: auto;
    bottom: -1.3rem;
    right: auto;
    left: 50%;
    transform: translateX(-50%);
    border: 0.5rem solid transparent;
    border-top: 0.7rem solid var(--t);
    border-bottom: 0;
  }
  .hist-figure {
    flex-direction: column;
    align-items: flex-start;
  }
  .hist-labeled,
  .hist-fact {
    grid-template-columns: 1fr;
    row-gap: 0.2rem;
  }
  .hist-check-toggle,
  .hist-check-answer {
    margin-left: 0;
  }
}
</style>
