<template>
  <!-- Visual Structured view mode -->
  <div class="visual-content-flow" :class="`font-${fontSize}`">
    <!-- Render each parsed section -->
    <section
      v-for="(sec, secIdx) in parsedSections"
      :key="secIdx"
      :id="`lesson-section-${secIdx}`"
      class="section-card"
    >
      <!-- Section Title Bar -->
      <div class="section-card-header">
        <div class="section-index-badge">
          <span>0{{ secIdx + 1 }}</span>
        </div>
        <div class="section-heading-wrap">
          <span class="section-sub-label">Phần {{ secIdx + 1 }}</span>
          <h2 class="section-heading-title">
            {{ sec.cleanTitle || sec.title }}
          </h2>
        </div>
      </div>

      <!-- Section Content Blocks -->
      <div class="section-card-body">
        <!-- 1. CASE: Stepper Workflow (e.g. "Các bước giải") -->
        <div v-if="sec.type === 'stepper'" class="stepper-workflow">
          <div class="stepper-intro-banner">
            <v-icon
              icon="mdi-transit-connection-variant"
              size="20"
              color="#3B82F6"
              class="mr-2"
            />
            <span>Quy trình giải bài toán từng bước</span>
          </div>

          <div class="stepper-timeline">
            <div
              v-for="(step, sIdx) in sec.steps"
              :key="sIdx"
              class="stepper-node"
            >
              <div class="step-num-bubble">
                <span>{{ sIdx + 1 }}</span>
              </div>
              <div class="step-details-card">
                <h3 class="step-main-title">{{ step.title }}</h3>
                <div v-if="step.items?.length" class="step-sub-items">
                  <div
                    v-for="(item, iIdx) in step.items"
                    :key="iIdx"
                    class="step-sub-bullet"
                  >
                    <v-icon
                      icon="mdi-chevron-right-circle"
                      size="16"
                      color="#3B82F6"
                      class="mr-2 flex-shrink-0 mt-1"
                    />
                    <span>{{ item }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2. CASE: Topic Cards Grid (e.g. "Một số dạng thường gặp") -->
        <div
          v-else-if="sec.type === 'topic-grid'"
          class="topics-grid-container"
        >
          <div class="topics-intro-banner">
            <v-icon
              icon="mdi-shape-plus"
              size="20"
              color="#7C3AED"
              class="mr-2"
            />
            <span>Tổng hợp công thức & dạng toán thực tế thường gặp</span>
          </div>

          <div class="topics-cards-grid">
            <div
              v-for="(topic, tIdx) in sec.topics"
              :key="tIdx"
              class="topic-feature-card"
              :class="`topic-theme--${topic.theme}`"
            >
              <div class="topic-card-top">
                <div class="topic-icon-wrap">
                  <v-icon
                    :icon="topic.icon"
                    size="22"
                    :color="topic.color"
                  />
                </div>
                <h4 class="topic-title">{{ topic.name }}</h4>
              </div>

              <div v-if="topic.formula" class="topic-formula-badge">
                <code>{{ topic.formula }}</code>
              </div>

              <p class="topic-desc">{{ topic.desc }}</p>
            </div>
          </div>
        </div>

        <!-- 3. Standard / Mixed Blocks -->
        <template v-else>
          <div
            v-for="(block, bIdx) in sec.blocks"
            :key="bIdx"
            class="content-block"
            :class="`block--${block.type}`"
          >
            <!-- A. Procedure Flow Card (Cách làm, Quy tắc, Phương pháp) -->
            <div
              v-if="block.type === 'procedure'"
              class="procedure-flow-card"
            >
              <div class="procedure-header">
                <div class="proc-title-wrap">
                  <div class="proc-icon-box">
                    <v-icon icon="mdi-cog-play-outline" size="20" />
                  </div>
                  <h3 class="proc-title">{{ block.title }}</h3>
                </div>
                <v-chip
                  size="small"
                  color="primary"
                  variant="tonal"
                  class="font-weight-bold"
                >
                  {{ block.steps.length }} bước thực hiện
                </v-chip>
              </div>

              <div class="procedure-steps-timeline">
                <div
                  v-for="(st, stIdx) in block.steps"
                  :key="stIdx"
                  class="proc-step-item"
                >
                  <div class="proc-step-num">
                    {{ stIdx + 1 }}
                  </div>
                  <div class="proc-step-card">
                    <div class="proc-step-tag">Bước {{ stIdx + 1 }}</div>
                    <div class="proc-step-text">{{ st.text }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- B. Definition / Core Formula Block -->
            <div
              v-else-if="block.type === 'definition'"
              class="definition-box"
            >
              <div class="def-header">
                <div class="def-icon-wrap">
                  <v-icon icon="mdi-function" size="18" color="#3B82F6" />
                </div>
                <span class="def-title">{{
                  block.title || "Khái niệm & Định nghĩa"
                }}</span>
              </div>
              <div v-if="block.formula" class="def-formula-display">
                <span class="math-expr">{{ block.formula }}</span>
              </div>
              <p class="def-desc">{{ block.text }}</p>
              <div v-if="block.badges?.length" class="def-badges">
                <span
                  v-for="(badge, bi) in block.badges"
                  :key="bi"
                  class="def-chip"
                >
                  {{ badge }}
                </span>
              </div>
            </div>

            <!-- C. System of Equations Block -->
            <div
              v-else-if="block.type === 'system-equation'"
              class="system-box"
            >
              <div class="system-header">
                <v-icon
                  icon="mdi-code-brackets"
                  size="18"
                  color="#8B5CF6"
                  class="mr-2"
                />
                <span>{{ block.title || "Hệ phương trình" }}</span>
              </div>
              <div class="system-brace-display">
                <div class="curly-brace">{</div>
                <div class="system-lines">
                  <div class="system-line">
                    {{ block.eq1 || "ax + by = c" }}
                  </div>
                  <div class="system-line">
                    {{ block.eq2 || "a'x + b'y = c'" }}
                  </div>
                </div>
              </div>
              <p v-if="block.text" class="system-desc">{{ block.text }}</p>
            </div>

            <!-- D. Rich Example Card -->
            <div v-else-if="block.type === 'example'" class="example-box">
              <div class="example-badge-row">
                <span
                  class="example-tag"
                  :style="{
                    backgroundColor: block.themeColor || '#10B981',
                  }"
                >
                  <v-icon
                    :icon="block.themeIcon || 'mdi-play-circle-outline'"
                    size="14"
                    class="mr-1"
                  />
                  {{ block.badgeTitle || "Ví dụ minh họa" }}
                </span>
                <span v-if="block.subtitle" class="example-sub">{{
                  block.subtitle
                }}</span>
              </div>

              <!-- Problem Statement -->
              <div class="example-problem-panel">
                <div class="problem-label">
                  <v-icon
                    icon="mdi-help-circle-outline"
                    size="16"
                    color="#2563EB"
                    class="mr-1"
                  />
                  <strong>Đề bài:</strong>
                </div>
                <p class="example-main-text">
                  {{ block.problemText || block.text }}
                </p>
              </div>

              <!-- Detailed Step-by-Step Solution -->
              <div
                v-if="block.solutionPhases?.length"
                class="example-solution-phases"
              >
                <div class="solution-phases-heading">
                  <v-icon
                    icon="mdi-format-list-checks"
                    size="17"
                    color="#4F46E5"
                    class="mr-1"
                  />
                  <span>Các bước giải chi tiết:</span>
                </div>

                <div
                  v-for="(phase, pIdx) in block.solutionPhases"
                  :key="pIdx"
                  class="solution-phase-card"
                  :class="`phase--${phase.type}`"
                >
                  <div class="phase-header">
                    <v-icon :icon="phase.icon" size="16" class="mr-1" />
                    <span class="phase-title">{{ phase.label }}</span>
                  </div>

                  <div class="phase-body">
                    <!-- Sub-steps line by line -->
                    <div
                      v-if="phase.steps?.length"
                      class="phase-steps-list"
                    >
                      <div
                        v-for="(subStep, ssIdx) in phase.steps"
                        :key="ssIdx"
                        class="phase-sub-step-row"
                        :class="{
                          'is-math-line': subStep.isMath,
                          'is-prompt-line': subStep.isPrompt,
                        }"
                      >
                        <v-icon
                          :icon="
                            subStep.isMath
                              ? 'mdi-subdirectory-arrow-right'
                              : 'mdi-circle-small'
                          "
                          size="16"
                          :color="subStep.isMath ? '#2563EB' : '#64748B'"
                          class="mr-2 flex-shrink-0 mt-1"
                        />
                        <div class="step-text-wrapper">
                          <span
                            v-if="subStep.prefix"
                            class="step-prefix font-weight-bold mr-1"
                            >{{ subStep.prefix }}:</span
                          >
                          <span class="step-content">{{
                            subStep.text
                          }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Formula lines -->
                    <div
                      v-else-if="phase.formulaLines?.length"
                      class="phase-equation-box"
                    >
                      <div
                        v-for="(line, lIdx) in phase.formulaLines"
                        :key="lIdx"
                        class="eq-math-line"
                      >
                        <span class="eq-bullet">•</span>
                        <span class="eq-code">{{ line }}</span>
                      </div>
                    </div>

                    <!-- Fallback single content -->
                    <p v-else class="phase-text">{{ phase.content }}</p>
                  </div>
                </div>
              </div>

              <!-- Step verification checks -->
              <div
                v-if="block.stepChecks?.length"
                class="example-steps-grid"
              >
                <div
                  v-for="(st, sIdx) in block.stepChecks"
                  :key="sIdx"
                  class="step-check-card"
                  :class="{
                    'step-check--valid': st.valid,
                    'step-check--invalid': !st.valid,
                  }"
                >
                  <div class="step-check-icon">
                    <v-icon
                      :icon="
                        st.valid ? 'mdi-check-circle' : 'mdi-close-circle'
                      "
                      size="18"
                      :color="st.valid ? '#10B981' : '#EF4444'"
                    />
                  </div>
                  <div class="step-check-content">
                    <div class="step-calc">{{ st.calc }}</div>
                    <div class="step-label">{{ st.label }}</div>
                  </div>
                </div>
              </div>

              <!-- Highlighted Conclusion -->
              <div v-if="block.conclusion" class="example-conclusion">
                <v-icon
                  icon="mdi-check-decagram"
                  size="20"
                  color="#10B981"
                  class="mr-2 flex-shrink-0"
                />
                <div><strong>Kết luận:</strong> {{ block.conclusion }}</div>
              </div>
            </div>

            <!-- E. Cases Block -->
            <div v-else-if="block.type === 'cases'" class="cases-container">
              <div class="cases-title">
                <v-icon
                  icon="mdi-axis-arrow"
                  size="18"
                  color="#0EA5E9"
                  class="mr-2"
                />
                Các trường hợp & điều kiện xét
              </div>
              <div class="cases-grid">
                <div
                  v-for="(caseItem, cIdx) in block.cases"
                  :key="cIdx"
                  class="case-card"
                >
                  <div class="case-header">
                    <span class="case-condition">{{
                      caseItem.condition
                    }}</span>
                    <span v-if="caseItem.badge" class="case-badge">{{
                      caseItem.badge
                    }}</span>
                  </div>
                  <p class="case-desc">{{ caseItem.desc }}</p>
                </div>
              </div>
            </div>

            <!-- F. Visual Graph Widget (Oxy) -->
            <div
              v-else-if="block.type === 'visual-graph'"
              class="oxy-visual-widget"
            >
              <div class="oxy-widget-header">
                <div class="d-flex align-center">
                  <div class="oxy-icon-badge">
                    <v-icon
                      icon="mdi-chart-line"
                      size="18"
                      color="#2563EB"
                    />
                  </div>
                  <div>
                    <div class="oxy-title">
                      Minh họa đồ thị trên mặt phẳng Oxy
                    </div>
                    <div class="oxy-subtitle">Đường thẳng x + 2y = 4</div>
                  </div>
                </div>
                <v-chip
                  size="small"
                  color="primary"
                  variant="tonal"
                  class="font-weight-bold"
                >
                  Trực quan hình học
                </v-chip>
              </div>

              <div class="oxy-interactive-area">
                <div class="svg-container">
                  <svg viewBox="0 0 360 260" class="oxy-svg">
                    <defs>
                      <marker
                        id="arrow-x"
                        viewBox="0 0 10 10"
                        refX="6"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto"
                      >
                        <path d="M 0 1 L 8 5 L 0 9 z" fill="#64748B" />
                      </marker>
                      <marker
                        id="arrow-y"
                        viewBox="0 0 10 10"
                        refX="6"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto"
                      >
                        <path d="M 0 1 L 8 5 L 0 9 z" fill="#64748B" />
                      </marker>
                    </defs>

                    <g class="grid-lines" stroke="#F1F5F9" stroke-width="1">
                      <line
                        v-for="x in [40, 80, 120, 160, 200, 240, 280, 320]"
                        :key="`gx-${x}`"
                        :x1="x"
                        y1="20"
                        :x2="x"
                        y2="240"
                      />
                      <line
                        v-for="y in [40, 80, 120, 160, 200, 240]"
                        :key="`gy-${y}`"
                        x1="20"
                        :y1="y"
                        x2="340"
                        :y2="y"
                      />
                    </g>

                    <!-- Axes -->
                    <line x1="40" y1="200" x2="330" y2="200" stroke="#64748B" stroke-width="2" marker-end="url(#arrow-x)" />
                    <line x1="80" y1="230" x2="80" y2="30" stroke="#64748B" stroke-width="2" marker-end="url(#arrow-y)" />
                    <text x="68" y="214" font-size="12" font-weight="700" fill="#64748B">O</text>
                    <text x="325" y="218" font-size="13" font-weight="800" fill="#2563EB">x</text>
                    <text x="62" y="32" font-size="13" font-weight="800" fill="#2563EB">y</text>
                    <text x="160" y="215" font-size="11" fill="#94A3B8" text-anchor="middle">2</text>
                    <text x="240" y="215" font-size="11" fill="#94A3B8" text-anchor="middle">4</text>
                    <circle cx="240" cy="200" r="3" fill="#64748B" />
                    <text x="68" y="124" font-size="11" fill="#94A3B8" text-anchor="end">2</text>
                    <circle cx="80" cy="120" r="3" fill="#64748B" />
                    <line x1="30" y1="107" x2="280" y2="210" stroke="#2563EB" stroke-width="3" stroke-linecap="round" />

                    <!-- Point A(0, 2) -->
                    <g class="svg-point">
                      <circle cx="80" cy="120" r="7" fill="#3B82F6" class="point-pulse" />
                      <circle cx="80" cy="120" r="4.5" fill="#FFFFFF" stroke="#2563EB" stroke-width="2" />
                      <text x="92" y="116" font-size="12" font-weight="700" fill="#1D4ED8">A(0; 2)</text>
                    </g>

                    <!-- Point B(4, 0) -->
                    <g class="svg-point">
                      <circle cx="240" cy="200" r="7" fill="#10B981" class="point-pulse" />
                      <circle cx="240" cy="200" r="4.5" fill="#FFFFFF" stroke="#059669" stroke-width="2" />
                      <text x="242" y="188" font-size="12" font-weight="700" fill="#047857">B(4; 0)</text>
                    </g>

                    <rect x="150" y="135" width="105" height="24" rx="12" fill="#EEF2FF" stroke="#C7D2FE" />
                    <text x="202" y="151" font-size="11" font-weight="700" fill="#3730A3" text-anchor="middle">d: x + 2y = 4</text>
                  </svg>
                </div>

                <div class="oxy-explanation">
                  <div class="point-explanation-card">
                    <div class="pt-badge pt-blue">Điểm A</div>
                    <div>
                      <strong>Cho x = 0:</strong> y = 4/2 =
                      <strong>2</strong>
                      <div class="text-caption text-secondary">
                        Tọa độ: A(0; 2) trên trục Oy
                      </div>
                    </div>
                  </div>

                  <div class="point-explanation-card mt-2">
                    <div class="pt-badge pt-green">Điểm B</div>
                    <div>
                      <strong>Cho y = 0:</strong> x = <strong>4</strong>
                      <div class="text-caption text-secondary">
                        Tọa độ: B(4; 0) trên trục Ox
                      </div>
                    </div>
                  </div>

                  <div class="draw-tip-card mt-3">
                    <v-icon
                      icon="mdi-pencil-ruler"
                      size="16"
                      color="#4F46E5"
                      class="mr-1"
                    />
                    <span
                      ><strong>Cách vẽ nhanh:</strong> Xác định 2 giao điểm
                      A và B với 2 trục tọa độ, dùng thước nối A và B.</span
                    >
                  </div>
                </div>
              </div>
            </div>

            <!-- G. Key concept note -->
            <div v-else-if="block.type === 'concept'" class="concept-box">
              <div class="concept-icon-wrap">
                <v-icon icon="mdi-lightbulb-on" size="18" color="#F59E0B" />
              </div>
              <div class="concept-text-content">
                <strong v-if="block.label" class="concept-label"
                  >{{ block.label }}:
                </strong>
                <span>{{ block.text }}</span>
              </div>
            </div>

            <!-- H. Equations or Calculation Lines -->
            <div
              v-else-if="block.type === 'math-lines'"
              class="math-lines-box"
            >
              <div
                v-for="(line, mIdx) in block.lines"
                :key="mIdx"
                class="math-line-row"
              >
                <v-icon
                  icon="mdi-equal"
                  size="14"
                  color="#64748B"
                  class="mr-2"
                />
                <code>{{ line }}</code>
              </div>
            </div>

            <!-- I. Inline Note -->
            <div
              v-else-if="block.type === 'note'"
              class="lesson-inline-note"
              :class="`note--${block.tone}`"
            >
              <div class="note-icon-wrap">
                <v-icon :icon="block.icon" size="16" />
              </div>
              <div class="note-text-wrap">
                <strong>{{ block.title }}:</strong> {{ block.desc }}
              </div>
            </div>

            <!-- J. Table Block -->
            <div v-else-if="block.type === 'table'" class="lesson-table-card">
              <div v-if="block.title" class="table-card-title">
                <v-icon icon="mdi-table" size="16" class="mr-2" color="#475569" />
                {{ block.title }}
              </div>
              <div class="table-responsive-wrapper">
                <table class="lesson-data-table">
                  <thead>
                    <tr>
                      <th v-for="(h, hIdx) in block.headers" :key="hIdx">{{ h }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, rIdx) in block.rows" :key="rIdx">
                      <td v-for="(cell, cIdx) in row" :key="cIdx">{{ cell }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- K. Exercise Card -->
            <div v-else-if="block.type === 'exercise'" class="exercise-card">
              <div class="exercise-header">
                <v-icon icon="mdi-pencil-box-outline" size="18" class="mr-2" />
                {{ block.title || "Bài tập tự luyện" }}
              </div>
              <div
                v-for="(item, eIdx) in block.items"
                :key="eIdx"
                class="exercise-item-row"
              >
                <span class="exercise-bullet">{{ eIdx + 1 }}.</span>
                <span>{{ item }}</span>
              </div>
              <div v-if="block.answers" class="exercise-answers-panel">
                <v-icon icon="mdi-check-circle-outline" size="16" class="mr-1" />
                <span><strong>Đáp số:</strong> {{ block.answers }}</span>
              </div>
            </div>

            <!-- L. Standard Paragraph -->
            <p v-else class="content-paragraph">{{ block.text }}</p>
          </div>
        </template>
      </div>
    </section>

    <!-- Dynamic Lesson Recap -->
    <div v-if="extractedTips.length" class="recap-section">
      <div class="recap-header">
        <v-icon
          icon="mdi-bookmark-check-outline"
          size="22"
          color="#4F46E5"
          class="mr-2"
        />
        <h3 class="recap-title">Lưu ý & Ghi nhớ của bài này</h3>
      </div>
      <div class="recap-cards-grid">
        <div
          v-for="(tip, tIdx) in extractedTips"
          :key="tIdx"
          class="recap-card"
        >
          <div class="recap-card-icon" :class="`recap-${tip.color}`">
            <v-icon :icon="tip.icon" size="20" />
          </div>
          <h4>{{ tip.title }}</h4>
          <p>{{ tip.desc }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  lesson: { type: Object, required: true },
  chapter: { type: Object, default: null },
  fontSize: { type: String, default: "normal" },
});

/**
 * Splits complex Vietnamese mathematical calculation sentences into clean,
 * line-by-line discrete algebraic steps.
 */
function splitIntoSteps(rawText) {
  if (!rawText) return [];

  const stepPrefixMatch = rawText.match(/^(bước\s*\d+[:\.]?)\s*(.*)$/i);
  if (stepPrefixMatch) {
    return [
      {
        prefix: stepPrefixMatch[1],
        text: stepPrefixMatch[2],
        isMath:
          /[0-9a-z]\s*[\=\+\-\*\/\<\>\≤\≥≠]\s*[0-9a-z]/i.test(
            stepPrefixMatch[2],
          ) || stepPrefixMatch[2].includes("="),
      },
    ];
  }

  const normalized = rawText
    .replace(/;\s+/g, " __SPLIT__ ")
    .replace(/\.\s+(?=[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝĐ0-9a-z])/g, " __SPLIT__ ")
    .replace(
      /,\s*(nên|suy ra|tức|do đó|thay vào|thế vào|được|chia cả|nhân cả)\s+/gi,
      " __SPLIT__ $1 ",
    );

  const parts = normalized
    .split("__SPLIT__")
    .map((s) => s.trim())
    .filter(Boolean);
  const result = [];

  for (const part of parts) {
    const colonIdx = part.indexOf(":");
    if (colonIdx > 0 && colonIdx < 40 && !/^\d+:\d+$/.test(part)) {
      const prefix = part.substring(0, colonIdx).trim();
      const content = part.substring(colonIdx + 1).trim();
      if (content) {
        result.push({
          prefix,
          text: content,
          isMath:
            /[0-9a-z]\s*[\=\+\-\*\/\<\>\≤\≥≠]\s*[0-9a-z]/i.test(content) ||
            content.includes("="),
        });
        continue;
      }
    }

    result.push({
      prefix: "",
      text: part,
      isMath:
        /[0-9a-z]\s*[\=\+\-\*\/\<\>\≤\≥≠]\s*[0-9a-z]/i.test(part) ||
        part.includes("="),
    });
  }

  return result;
}

/**
 * Universal Semantic Parser: works for all subjects generically.
 */
const parsedSections = computed(() => {
  if (!props.lesson?.content?.trim()) return [];

  const raw = props.lesson.content;
  const rawLines = raw.split("\n").map((l) => l.trim());

  const sectionGroups = [];
  let currentGroup = null;

  const isSectionHeading = (line) => {
    if (!line || line.length > 80) return false;
    if (/^([0-9]+|[I|V|X]+)[\.\)]\s*(.+)$/i.test(line)) return true;

    const majorTitles = [
      "các bước giải",
      "quy trình giải",
      "một số dạng thường gặp",
      "các dạng thường gặp",
      "các dạng toán",
      "dạng toán thường gặp",
      "tóm tắt lý thuyết",
      "bài tập tự luyện",
      "bài tập áp dụng",
      "ví dụ minh họa",
      "luyện tập",
    ];
    const clean = line
      .toLowerCase()
      .replace(/[:\.\-]/g, "")
      .trim();
    return majorTitles.some((t) => clean === t || clean.startsWith(t));
  };

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];
    if (!line) continue;

    if (isSectionHeading(line)) {
      currentGroup = {
        title: line,
        cleanTitle: line.replace(/^([0-9]+|[I|V|X]+)[\.\)]\s*/i, "").trim(),
        lines: [],
      };
      sectionGroups.push(currentGroup);
    } else {
      if (!currentGroup) {
        currentGroup = {
          title: "1. Khái niệm mở đầu",
          cleanTitle: "Khái niệm mở đầu",
          lines: [],
        };
        sectionGroups.push(currentGroup);
      }
      currentGroup.lines.push(line);
    }
  }

  const parsed = [];

  for (const group of sectionGroups) {
    const groupTitleLower = group.title.toLowerCase();
    const lines = group.lines;

    // 1. STEPPER WORKFLOW
    const hasExplicitSteps = lines.some((l) => /^bước\s*\d+/i.test(l));
    if (
      (groupTitleLower.includes("các bước") ||
        groupTitleLower.includes("quy trình giải")) &&
      hasExplicitSteps
    ) {
      const steps = [];
      let currentStep = null;

      for (const line of lines) {
        const stepMatch = line.match(/^(bước\s*\d+[:\.]?)\s*(.*)$/i);
        if (stepMatch) {
          currentStep = {
            stepLabel: stepMatch[1],
            title: stepMatch[2] || stepMatch[1],
            items: [],
          };
          steps.push(currentStep);
        } else {
          if (!currentStep) {
            currentStep = {
              stepLabel: "Chuẩn bị",
              title: "Lưu ý ban đầu",
              items: [],
            };
            steps.push(currentStep);
          }
          currentStep.items.push(line);
        }
      }

      parsed.push({
        type: "stepper",
        title: group.title,
        cleanTitle: group.cleanTitle,
        steps,
      });
      continue;
    }

    // 2. TOPIC CARDS GRID
    if (
      groupTitleLower.includes("dạng thường gặp") ||
      groupTitleLower.includes("các dạng toán")
    ) {
      const topics = [];
      const topicThemes = [
        { theme: "blue", color: "#2563EB", icon: "mdi-numeric" },
        { theme: "amber", color: "#D97706", icon: "mdi-speedometer" },
        { theme: "emerald", color: "#059669", icon: "mdi-cog-sync" },
        { theme: "purple", color: "#7C3AED", icon: "mdi-percent" },
        { theme: "indigo", color: "#4F46E5", icon: "mdi-shape" },
      ];

      for (let tIdx = 0; tIdx < lines.length; tIdx++) {
        const line = lines[tIdx];
        const colonIdx = line.indexOf(":");
        const themeObj = topicThemes[topics.length % topicThemes.length];

        if (colonIdx > 0 && colonIdx < 40) {
          const name = line.substring(0, colonIdx).trim();
          const desc = line.substring(colonIdx + 1).trim();
          topics.push({
            name,
            desc,
            theme: themeObj.theme,
            icon: themeObj.icon,
            color: themeObj.color,
          });
        } else {
          topics.push({
            name: `Dạng ${topics.length + 1}`,
            desc: line,
            theme: themeObj.theme,
            icon: themeObj.icon,
            color: themeObj.color,
          });
        }
      }

      parsed.push({
        type: "topic-grid",
        title: group.title,
        cleanTitle: group.cleanTitle,
        topics,
      });
      continue;
    }

    // 3. DETAILED THEORY & EXAMPLES
    const blocks = [];

    for (let j = 0; j < lines.length; j++) {
      const line = lines[j];
      if (!line) continue;

      // A. Procedure block
      const procMatch = line.match(
        /^(cách làm|cách giải|quy tắc[^:\.]*|phương pháp[^:\.]*|các bước[^:\.]*)[:\.]?$/i,
      );
      if (
        procMatch ||
        line.toLowerCase().startsWith("cách làm:") ||
        line.toLowerCase().startsWith("cách giải:") ||
        line.toLowerCase().startsWith("các bước:")
      ) {
        const procSteps = [];
        while (j + 1 < lines.length) {
          const nextL = lines[j + 1];
          if (
            isSectionHeading(nextL) ||
            /^ví dụ/i.test(nextL) ||
            /^(cách làm|cách giải|quy tắc|phương pháp|các bước)[:\.]?$/i.test(nextL) ||
            /^bài tập/i.test(nextL)
          ) {
            break;
          }
          j++;
          procSteps.push({ text: nextL });
        }
        blocks.push({
          type: "procedure",
          title: line.replace(/[:\.]?\s*$/, "").trim() || "Cách thực hiện",
          steps: procSteps,
        });
        continue;
      }

      // B. Table block
      const isTableRow = (l) => {
        if (!l) return false;
        const cols = l
          .split(/\t|\s{2,}/)
          .map((s) => s.trim())
          .filter(Boolean);
        return cols.length >= 2;
      };

      if (
        isTableRow(line) &&
        j + 1 < lines.length &&
        isTableRow(lines[j + 1])
      ) {
        const headerCols = line
          .split(/\t|\s{2,}/)
          .map((s) => s.trim())
          .filter(Boolean);
        const rows = [];
        while (j + 1 < lines.length && isTableRow(lines[j + 1])) {
          j++;
          const rowCols = lines[j]
            .split(/\t|\s{2,}/)
            .map((s) => s.trim())
            .filter(Boolean);
          rows.push(rowCols);
        }
        blocks.push({
          type: "table",
          title: "",
          headers: headerCols,
          rows,
        });
        continue;
      }

      // C. Consecutive Condition / Cases block
      const isConditionLine = (l) => {
        if (!l) return false;
        if (/^nếu\s+/i.test(l)) return true;
        if (
          /^[A-Za-z0-9\s]{1,15}\s*[\<\>\=\≤\≥≠]\s*[A-Za-z0-9\s]{1,15}[:\.]/.test(l)
        )
          return true;
        if (/^với\s+[a-z0-9\s\<\>\=\≤\≥≠]+[:.]/i.test(l)) return true;
        return false;
      };

      if (
        isConditionLine(line) &&
        (j + 1 >= lines.length ||
          isConditionLine(lines[j + 1]) ||
          line.startsWith("Nếu"))
      ) {
        const casesList = [];
        const parseCaseItem = (l) => {
          let cond = "";
          let desc = l;
          if (l.includes(":")) {
            const idx = l.indexOf(":");
            cond = l.substring(0, idx).trim();
            desc = l.substring(idx + 1).trim();
          } else if (/thì\s+/i.test(l)) {
            const parts = l.split(/thì\s+/i);
            cond = parts[0].trim();
            desc = parts.slice(1).join("thì ").trim();
          }
          return { condition: cond || l, desc: desc || "" };
        };

        casesList.push(parseCaseItem(line));
        while (j + 1 < lines.length && isConditionLine(lines[j + 1])) {
          j++;
          casesList.push(parseCaseItem(lines[j]));
        }

        blocks.push({
          type: "cases",
          title: "Các trường hợp & điều kiện xét",
          cases: casesList,
        });
        continue;
      }

      // D. Practice / Exercise block
      if (/^bài tập[:\.]?/i.test(line) || /^luyện tập[:\.]?/i.test(line)) {
        const problemPart = line
          .replace(/^(bài tập|luyện tập)[:\.]?\s*/i, "")
          .trim();
        let answers = "";
        const items = problemPart ? [problemPart] : [];

        while (j + 1 < lines.length) {
          const nextL = lines[j + 1];
          if (isSectionHeading(nextL) || /^ví dụ/i.test(nextL)) break;
          j++;
          if (/^đáp số[:\.]?/i.test(nextL) || /^hướng dẫn[:\.]?/i.test(nextL)) {
            answers = nextL.replace(/^(đáp số|hướng dẫn)[:\.]?\s*/i, "").trim();
          } else {
            items.push(nextL);
          }
        }

        blocks.push({
          type: "exercise",
          title: "Bài tập tự luyện",
          items,
          answers,
        });
        continue;
      }

      // E. Inline Note / Warning / Tip
      if (
        /^(chú ý|lưu ý|nhận xét|ghi nhớ|lỗi hay gặp|cảnh báo|mẹo)[:\.]?\s*/i.test(line)
      ) {
        const colonIdx = line.indexOf(":");
        const title = line.substring(0, colonIdx).trim();
        const desc = line.substring(colonIdx + 1).trim();
        let tone = "amber";
        let icon = "mdi-alert-circle-outline";
        if (/lỗi|cảnh báo/i.test(title)) {
          tone = "red";
          icon = "mdi-alert-octagon-outline";
        } else if (/ghi nhớ/i.test(title)) {
          tone = "purple";
          icon = "mdi-star-outline";
        } else if (/nhận xét/i.test(title)) {
          tone = "blue";
          icon = "mdi-information-outline";
        }

        blocks.push({
          type: "note",
          title,
          desc,
          tone,
          icon,
        });
        continue;
      }

      // F. Definition of general form
      const formMatch = line.match(/^(.+?)\s+có dạng\s+([^,]+)(?:,\s*(.+))?$/i);
      if (
        formMatch &&
        (j === 0 ||
          groupTitleLower.includes("khái niệm") ||
          groupTitleLower.includes("định nghĩa") ||
          groupTitleLower.includes("phương trình bậc nhất"))
      ) {
        blocks.push({
          type: "definition",
          title: formMatch[1].trim(),
          formula: formMatch[2].trim(),
          text: formMatch[3] ? `Trong đó ${formMatch[3].trim()}` : "",
        });
        continue;
      }

      // G. System of equations
      if (line.toLowerCase().startsWith("hệ có dạng")) {
        const eqLines = [];
        while (
          j + 1 < lines.length &&
          (lines[j + 1].includes("=") ||
            lines[j + 1].includes("+") ||
            lines[j + 1].includes("-")) &&
          !lines[j + 1].includes(":") &&
          !isSectionHeading(lines[j + 1])
        ) {
          j++;
          eqLines.push(lines[j]);
        }
        if (eqLines.length >= 2) {
          blocks.push({
            type: "system-equation",
            eq1: eqLines[0],
            eq2: eqLines[1],
            text: line.includes(":")
              ? line.substring(0, line.indexOf(":")).trim()
              : line,
          });
          continue;
        }
      }

      // H. Definition / Theorem / Concept
      const defMatch = line.match(
        /^(định nghĩa|khái niệm|định lí|hệ quả|tính chất|quy tắc[^:]*|nghiệm của hệ|nghiệm)[:\.]?\s*(.*)$/i,
      );
      if (defMatch) {
        const label = defMatch[1];
        const body = defMatch[2];
        blocks.push({
          type: "concept",
          label: label.charAt(0).toUpperCase() + label.slice(1),
          text: body,
        });
        continue;
      }

      // I. RICH EXAMPLES
      const egMatch = line.match(
        /^ví dụ(\s*\d+)?\s*(\([^\)]+\))?[:\.]?\s*(.*)$/i,
      );
      if (egMatch) {
        const egNum = egMatch[1]?.trim() || "";
        const tag = egMatch[2]?.trim() || "";
        let problemDesc = egMatch[3]?.trim() || "";

        let themeColor = "#10B981";
        let themeIcon = "mdi-play-circle-outline";
        if (tag.includes("hình")) {
          themeColor = "#4F46E5";
          themeIcon = "mdi-shape";
        } else if (tag.includes("chuyển động")) {
          themeColor = "#D97706";
          themeIcon = "mdi-car";
        }

        const solutionPhases = [];
        const stepChecks = [];
        let conclusion = "";

        const hasTopLevelSemicolon = problemDesc
          .replace(/\([^)]*\)/g, "")
          .includes(";");
        if (hasTopLevelSemicolon && !problemDesc.toLowerCase().includes("hệ")) {
          const subItems = problemDesc
            .split(/;\s*(?![^()]*\))/)
            .map((s) => s.trim().replace(/\.$/, ""))
            .filter(Boolean);
          problemDesc = "Các phương trình mẫu:";
          solutionPhases.push({
            type: "general",
            label: "Phương trình ví dụ",
            icon: "mdi-format-list-checks",
            steps: subItems.map((item) => ({
              isMath: true,
              text: item,
            })),
          });
        } else if (/\.\s+(?=[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝĐ0-9])/.test(problemDesc)) {
          const sentences = problemDesc
            .split(/\.\s+(?=[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝĐ0-9])/)
            .map((s) => s.trim())
            .filter(Boolean);
          if (sentences.length > 1) {
            problemDesc = sentences[0];
            for (let sIdx = 1; sIdx < sentences.length; sIdx++) {
              const sLine = sentences[sIdx];
              if (
                /^(kết luận[:\.]?|đáp số[:\.]?|vậy)\s*/i.test(sLine) ||
                sLine.endsWith("∎")
              ) {
                conclusion = sLine
                  .replace(/^(kết luận[:\.]?|đáp số[:\.]?|vậy)\s*/i, "")
                  .trim();
              } else {
                const subSteps = splitIntoSteps(sLine);
                solutionPhases.push({
                  type: "general",
                  label: "Thao tác giải",
                  icon: "mdi-arrow-right-thin",
                  steps: subSteps,
                });
              }
            }
          }
        }

        while (j + 1 < lines.length) {
          const nextL = lines[j + 1];
          if (
            isSectionHeading(nextL) ||
            /^ví dụ/i.test(nextL) ||
            /^bài tập/i.test(nextL) ||
            /^(chú ý|lưu ý|lỗi hay gặp|cảnh báo)[:.]/i.test(nextL) ||
            /^(định nghĩa|khái niệm|định lí|hệ quả|tính chất|nghiệm của hệ|nghiệm)[:.]/i.test(nextL) ||
            /^(cách làm|cách giải|quy tắc|phương pháp|các bước)[:.]/i.test(nextL) ||
            /^hệ có dạng/i.test(nextL)
          ) {
            break;
          }
          j++;

          if (
            /^(kết luận[:\.]?|đáp số[:\.]?|vậy)\s*/i.test(nextL) ||
            nextL.endsWith("∎")
          ) {
            conclusion = nextL
              .replace(/^(kết luận[:\.]?|đáp số[:\.]?|vậy)\s*/i, "")
              .trim();
            continue;
          }

          if (nextL.includes("✓") || nextL.includes("✗")) {
            const isValid = nextL.includes("✓");
            stepChecks.push({
              calc: nextL.replace(/[✓✗]/g, "").trim(),
              label: isValid ? "Thỏa mãn điều kiện" : "Không thỏa mãn",
              valid: isValid,
            });
            continue;
          }

          const subSteps = splitIntoSteps(nextL);
          let phaseLabel = "Thao tác giải";
          let phaseType = "general";
          let phaseIcon = "mdi-arrow-right-thin";

          if (/^gọi\s+/i.test(nextL)) {
            phaseLabel = "Chọn ẩn & Điều kiện";
            phaseType = "variable";
            phaseIcon = "mdi-variable";
          } else if (/^ta có hệ|^hệ phương trình/i.test(nextL)) {
            phaseLabel = "Lập hệ phương trình";
            phaseType = "system";
            phaseIcon = "mdi-code-brackets";
          } else if (/cộng|trừ|nhân|chia|thế|thay|khử/i.test(nextL)) {
            phaseLabel = "Biến đổi & Tính toán";
            phaseType = "solve";
            phaseIcon = "mdi-calculator-variant-outline";
          }

          solutionPhases.push({
            type: phaseType,
            label: phaseLabel,
            icon: phaseIcon,
            steps: subSteps,
          });
        }

        blocks.push({
          type: "example",
          badgeTitle: `Ví dụ ${egNum} ${tag}`.trim() || "Ví dụ minh họa",
          subtitle: tag ? `Dạng bài ${tag.replace(/[\(\)]/g, "")}` : "",
          problemText: problemDesc,
          themeColor,
          themeIcon,
          solutionPhases,
          stepChecks,
          conclusion,
        });

        if (
          problemDesc.includes("Vẽ đường thẳng x + 2y = 4") ||
          (lines.some((l) => l.includes("x + 2y = 4")) &&
            group.lines.some((l) => l.includes("Oxy")))
        ) {
          blocks.push({
            type: "visual-graph",
            text: "x + 2y = 4",
          });
        }
        continue;
      }

      // J. Fallback paragraph
      blocks.push({
        type: "paragraph",
        text: line,
      });
    }

    parsed.push({
      type: "standard",
      title: group.title,
      cleanTitle: group.cleanTitle,
      blocks,
    });
  }

  return parsed;
});

/**
 * Extract genuine tips and notes strictly from the current lesson text.
 */
const extractedTips = computed(() => {
  if (!props.lesson?.content) return [];
  const lines = props.lesson.content.split("\n").map((l) => l.trim());
  const tips = [];

  const icons = [
    { icon: "mdi-alert-circle-outline", color: "amber" },
    { icon: "mdi-lightbulb-on-outline", color: "blue" },
    { icon: "mdi-checkbox-marked-circle-outline", color: "emerald" },
    { icon: "mdi-alert-octagon-outline", color: "red" },
    { icon: "mdi-star-outline", color: "purple" },
  ];

  for (const line of lines) {
    if (!line) continue;
    const lower = line.toLowerCase();

    if (
      lower.startsWith("chú ý:") ||
      lower.startsWith("lưu ý:") ||
      lower.startsWith("nhận xét:") ||
      lower.startsWith("ghi nhớ:") ||
      lower.startsWith("lỗi hay gặp:") ||
      lower.startsWith("cảnh báo:") ||
      lower.startsWith("mẹo:")
    ) {
      const colonIdx = line.indexOf(":");
      let title = "Lưu ý quan trọng";
      let desc = line;

      if (colonIdx > 0 && colonIdx < 35) {
        title = line.substring(0, colonIdx).trim();
        desc = line.substring(colonIdx + 1).trim();
      }

      const style = icons[tips.length % icons.length];
      tips.push({
        title,
        desc,
        icon: style.icon,
        color: style.color,
      });
    }
  }

  return tips;
});
</script>

<style scoped>
/* Font Size Modifiers */
.font-small { font-size: 14.5px; }
.font-normal { font-size: 16px; }
.font-large { font-size: 18px; }

/* Section Card */
.section-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 28px 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.03);
  transition: border-color 0.2s ease;
}
.section-card:hover { border-color: #cbd5e1; }

.section-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.section-index-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  color: #2563eb;
  border-radius: 12px;
  font-size: 17px;
  font-weight: 800;
  flex-shrink: 0;
  box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.15);
}

.section-heading-wrap { display: flex; flex-direction: column; }

.section-sub-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #3b82f6;
}

.section-heading-title {
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  color: #0f172a;
}

.section-card-body { display: flex; flex-direction: column; gap: 20px; }

/* 1. Stepper Workflow */
.stepper-workflow {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px 24px;
}
.stepper-intro-banner {
  display: flex;
  align-items: center;
  font-size: 13.5px;
  font-weight: 700;
  color: #1e40af;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}
.stepper-timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}
.stepper-timeline::before {
  content: "";
  position: absolute;
  top: 15px;
  bottom: 20px;
  left: 17px;
  width: 2px;
  background: #cbd5e1;
}
.stepper-node {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
  z-index: 1;
}
.step-num-bubble {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.3);
  flex-shrink: 0;
}
.step-details-card {
  flex: 1;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
}
.step-main-title { margin: 0 0 8px 0; font-size: 15px; font-weight: 700; color: #0f172a; }
.step-sub-items { display: flex; flex-direction: column; gap: 6px; }
.step-sub-bullet { display: flex; align-items: flex-start; font-size: 13.5px; color: #334155; line-height: 1.55; }

/* 2. Procedure Flow Card */
.procedure-flow-card {
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  border: 1px solid #bfdbfe;
  border-radius: 14px;
  padding: 22px 26px;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.04);
}
.procedure-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}
.proc-title-wrap { display: flex; align-items: center; gap: 10px; }
.proc-icon-box {
  width: 32px; height: 32px; border-radius: 8px;
  background: #eff6ff; color: #2563eb;
  display: flex; align-items: center; justify-content: center;
}
.proc-title { font-size: 15px; font-weight: 800; color: #0f172a; margin: 0; }
.procedure-steps-timeline {
  display: flex; flex-direction: column; gap: 14px; position: relative;
}
.procedure-steps-timeline::before {
  content: "";
  position: absolute;
  top: 18px; bottom: 20px; left: 17px; width: 2px;
  background: linear-gradient(180deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%);
}
.proc-step-item {
  display: flex; align-items: flex-start; gap: 16px; position: relative; z-index: 1;
}
.proc-step-num {
  width: 36px; height: 36px; border-radius: 50%;
  background: #ffffff; border: 2px solid #3b82f6;
  color: #2563eb; font-weight: 800; font-size: 14px;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.15); transition: all 0.2s ease;
}
.proc-step-card {
  flex: 1; background: #ffffff; border: 1px solid #e2e8f0;
  border-radius: 10px; padding: 12px 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03); transition: all 0.2s ease;
}
.proc-step-tag {
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  color: #3b82f6; letter-spacing: 0.5px; margin-bottom: 4px;
}
.proc-step-text { font-size: 14.5px; color: #1e293b; font-weight: 600; line-height: 1.6; }
.proc-step-item:hover .proc-step-card { border-color: #93c5fd; transform: translateX(3px); }

/* 3. Topics Grid */
.topics-grid-container { background: #ffffff; border: 1px solid #f1f5f9; border-radius: 14px; }
.topics-intro-banner { display: flex; align-items: center; font-size: 13.5px; font-weight: 700; color: #6b21a8; margin-bottom: 16px; }
.topics-cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
.topic-feature-card {
  border-radius: 12px; padding: 18px 20px; border: 1px solid #e2e8f0;
  background: #f8fafc; display: flex; flex-direction: column; gap: 8px; transition: all 0.2s ease;
}
.topic-feature-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
.topic-theme--blue { border-color: #bfdbfe; background: #f0f7ff; }
.topic-theme--amber { border-color: #fde68a; background: #fffdf5; }
.topic-theme--emerald { border-color: #a7f3d0; background: #f0fdf4; }
.topic-theme--purple { border-color: #e9d5ff; background: #faf5ff; }
.topic-theme--indigo { border-color: #c7d2fe; background: #eef2ff; }
.topic-card-top { display: flex; align-items: center; gap: 10px; }
.topic-icon-wrap { width: 32px; height: 32px; border-radius: 8px; background: #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05); }
.topic-title { margin: 0; font-size: 14.5px; font-weight: 800; color: #0f172a; }
.topic-formula-badge { display: inline-block; padding: 4px 10px; background: #ffffff; border-radius: 6px; border: 1px solid #e2e8f0; font-weight: 700; font-size: 12px; color: #1e293b; }
.topic-desc { margin: 0; font-size: 13px; color: #475569; line-height: 1.6; }

/* 4. Rich Example Box */
.example-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 22px 26px; }
.example-badge-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.example-tag { display: inline-flex; align-items: center; padding: 4px 10px; color: #ffffff; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
.example-sub { font-size: 13px; font-weight: 700; color: #64748b; }
.example-problem-panel { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 18px; margin-bottom: 18px; }
.problem-label { display: flex; align-items: center; font-size: 13px; color: #1e40af; margin-bottom: 6px; }
.example-main-text { color: #1e293b; font-weight: 600; font-size: 15px; line-height: 1.65; margin: 0; }
.solution-phases-heading { display: flex; align-items: center; font-size: 13px; font-weight: 700; color: #4338ca; margin-bottom: 10px; }
.example-solution-phases { display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px; }
.solution-phase-card { padding: 14px 18px; background: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; }
.phase--variable { border-left: 4px solid #3b82f6; }
.phase--system { border-left: 4px solid #8b5cf6; }
.phase--solve { border-left: 4px solid #f59e0b; }
.phase--general { border-left: 4px solid #94a3b8; }
.phase-header { font-size: 12.5px; font-weight: 700; color: #475569; display: flex; align-items: center; margin-bottom: 8px; }
.phase-steps-list { display: flex; flex-direction: column; gap: 8px; }
.phase-sub-step-row { display: flex; align-items: flex-start; font-size: 14px; line-height: 1.6; }
.phase-sub-step-row.is-math-line { background: #f8fafc; padding: 6px 12px; border-radius: 6px; font-family: "Cambria Math", "Consolas", monospace; font-weight: 600; color: #1e293b; border-left: 2px solid #3b82f6; }
.phase-sub-step-row.is-prompt-line { color: #4338ca; font-weight: 700; margin-bottom: 2px; }
.step-prefix { color: #2563eb; }
.phase-equation-box { display: flex; flex-direction: column; gap: 6px; padding: 10px 14px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
.eq-math-line { display: flex; align-items: center; gap: 8px; }
.eq-bullet { color: #8b5cf6; font-weight: 800; }
.eq-code { font-family: "Cambria Math", "Consolas", monospace; font-weight: 700; color: #1e293b; font-size: 14.5px; }
.example-conclusion { display: flex; align-items: center; padding: 14px 18px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; color: #065f46; font-size: 14px; }
.example-steps-grid { display: flex; flex-direction: column; gap: 8px; margin-bottom: 12px; }
.step-check-card { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; }
.step-check--valid { border-left: 4px solid #10b981; background: #f0fdf4; }
.step-check--invalid { border-left: 4px solid #ef4444; background: #fef2f2; }
.step-calc { font-family: monospace; font-weight: 700; font-size: 14px; color: #0f172a; }
.step-label { font-size: 11px; color: #64748b; }

/* 5. Definition Box */
.definition-box { background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%); border: 1px solid #bfdbfe; border-left: 5px solid #3b82f6; border-radius: 12px; padding: 20px 24px; }
.def-header { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; }
.def-icon-wrap { width: 28px; height: 28px; border-radius: 6px; background: #ffffff; display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); }
.def-title { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #1e40af; }
.def-formula-display { display: inline-flex; align-items: center; background: #ffffff; padding: 10px 20px; border-radius: 10px; border: 1px solid #dbeafe; box-shadow: 0 2px 6px rgba(37, 99, 235, 0.06); margin-bottom: 12px; }
.math-expr { font-family: "Cambria Math", "Latin Modern Math", serif; font-size: 1.45em; font-weight: 700; color: #1d4ed8; letter-spacing: 0.5px; }
.def-desc { color: #334155; line-height: 1.7; margin-bottom: 12px; }
.def-badges { display: flex; flex-wrap: wrap; gap: 8px; }
.def-chip { padding: 4px 10px; background: #ffffff; color: #2563eb; border: 1px solid #bfdbfe; border-radius: 6px; font-size: 12px; font-weight: 600; }

/* 6. System of Equations */
.system-box { background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border: 1px solid #e9d5ff; border-left: 5px solid #8b5cf6; border-radius: 12px; padding: 20px 24px; }
.system-header { display: flex; align-items: center; font-size: 13px; font-weight: 800; color: #6b21a8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; }
.system-brace-display { display: inline-flex; align-items: center; gap: 8px; background: #ffffff; padding: 12px 24px; border-radius: 10px; border: 1px solid #ddd6fe; margin-bottom: 12px; }
.curly-brace { font-size: 38px; line-height: 1; font-family: "Cambria Math", serif; color: #7c3aed; font-weight: 300; user-select: none; }
.system-lines { display: flex; flex-direction: column; gap: 6px; }
.system-line { font-family: "Cambria Math", serif; font-size: 1.25em; font-weight: 700; color: #5b21b6; }
.system-desc { color: #475569; line-height: 1.6; margin-bottom: 0; }

/* 7. Cases Grid */
.cases-container { background: #ffffff; border: 1px solid #e0f2fe; border-radius: 12px; padding: 20px 24px; }
.cases-title { display: flex; align-items: center; font-size: 14px; font-weight: 700; color: #0369a1; margin-bottom: 16px; }
.cases-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px; }
.case-card { padding: 14px; border-radius: 10px; background: #f0f9ff; border: 1px solid #bae6fd; }
.case-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.case-condition { font-family: monospace; font-weight: 800; color: #0284c7; font-size: 13px; }
.case-badge { font-size: 10px; font-weight: 700; padding: 2px 6px; background: #ffffff; border-radius: 4px; color: #0369a1; border: 1px solid #bae6fd; }
.case-desc { font-size: 12.5px; color: #334155; line-height: 1.5; margin-bottom: 0; }

/* 8. Oxy Visual Widget */
.oxy-visual-widget { background: #ffffff; border: 2px solid #dbeafe; border-radius: 14px; padding: 20px 24px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.05); }
.oxy-widget-header { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 18px; padding-bottom: 14px; border-bottom: 1px solid #f1f5f9; }
.oxy-icon-badge { width: 36px; height: 36px; border-radius: 10px; background: #eff6ff; display: flex; align-items: center; justify-content: center; margin-right: 12px; }
.oxy-title { font-size: 15px; font-weight: 800; color: #0f172a; }
.oxy-subtitle { font-size: 12px; color: #64748b; font-weight: 600; }
.oxy-interactive-area { display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; align-items: center; }
.svg-container { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 8px; }
.oxy-svg { width: 100%; height: auto; display: block; }
.svg-point { cursor: pointer; }
.point-pulse { opacity: 0.25; animation: pulse 2s infinite; }
@keyframes pulse {
  0% { r: 6; opacity: 0.35; }
  50% { r: 12; opacity: 0.1; }
  100% { r: 6; opacity: 0.35; }
}
.point-explanation-card { display: flex; align-items: center; gap: 12px; padding: 10px 14px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
.pt-badge { padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 800; color: #ffffff; }
.pt-blue { background: #2563eb; }
.pt-green { background: #059669; }
.draw-tip-card { padding: 10px 12px; background: #eef2ff; border-radius: 8px; color: #3730a3; font-size: 12px; line-height: 1.55; }

/* 9. Concept Box */
.concept-box { display: flex; align-items: flex-start; gap: 12px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 14px 18px; }
.concept-icon-wrap { width: 28px; height: 28px; border-radius: 50%; background: #fef3c7; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.concept-text-content { color: #92400e; line-height: 1.65; }
.concept-label { color: #78350f; }

/* 10. Recap Section */
.recap-section { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px 28px; margin-bottom: 24px; }
.recap-header { display: flex; align-items: center; margin-bottom: 18px; }
.recap-title { margin: 0; font-size: 17px; font-weight: 800; color: #1e1b4b; }
.recap-cards-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
.recap-card { padding: 18px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; }
.recap-card-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
.recap-blue { background: #eff6ff; color: #2563eb; }
.recap-emerald { background: #ecfdf5; color: #059669; }
.recap-purple { background: #f5f3ff; color: #7c3aed; }
.recap-amber { background: #fffbeb; color: #d97706; }
.recap-card h4 { margin: 0 0 6px 0; font-size: 14px; font-weight: 800; color: #0f172a; }
.recap-card p { margin: 0; font-size: 12.5px; color: #475569; line-height: 1.6; }

/* Inline Note */
.lesson-inline-note { display: flex; align-items: flex-start; gap: 12px; padding: 14px 18px; border-radius: 10px; margin-bottom: 14px; }
.note--amber { background: #fffbeb; border: 1px solid #fde68a; border-left: 4px solid #f59e0b; color: #92400e; }
.note--red { background: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #ef4444; color: #991b1b; }
.note--blue { background: #eff6ff; border: 1px solid #bfdbfe; border-left: 4px solid #3b82f6; color: #1e40af; }
.note--purple { background: #faf5ff; border: 1px solid #e9d5ff; border-left: 4px solid #8b5cf6; color: #6b21a8; }
.note-icon-wrap { width: 26px; height: 26px; border-radius: 6px; background: rgba(255, 255, 255, 0.7); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.note-text-wrap { line-height: 1.6; font-size: 13.5px; }

/* Table Block */
.lesson-table-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 16px; }
.table-card-title { display: flex; align-items: center; padding: 12px 18px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-weight: 700; font-size: 13.5px; color: #1e293b; }
.table-responsive-wrapper { overflow-x: auto; }
.lesson-data-table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
.lesson-data-table th { background: #f1f5f9; color: #334155; font-weight: 700; padding: 10px 16px; text-align: left; border-bottom: 1px solid #cbd5e1; }
.lesson-data-table td { padding: 10px 16px; border-bottom: 1px solid #f1f5f9; color: #1e293b; }
.lesson-data-table tr:last-child td { border-bottom: none; }
.lesson-data-table tr:hover td { background: #f8fafc; }

/* Exercise Block */
.exercise-card { background: #f0fdf4; border: 1px solid #bbf7d0; border-left: 4px solid #10b981; border-radius: 12px; padding: 18px 20px; margin-bottom: 16px; }
.exercise-header { display: flex; align-items: center; font-weight: 800; font-size: 14px; color: #065f46; margin-bottom: 12px; }
.exercise-item-row { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; color: #1e293b; font-size: 13.5px; }
.exercise-bullet { font-weight: 700; color: #059669; }
.exercise-answers-panel { margin-top: 12px; padding-top: 10px; border-top: 1px dashed #86efac; display: flex; align-items: flex-start; gap: 8px; font-size: 13px; color: #047857; }

/* Content Paragraph */
.content-paragraph { color: #334155; line-height: 1.75; margin: 0; }

/* Responsive */
@media (max-width: 768px) {
  .section-card { padding: 20px; }
  .oxy-interactive-area { grid-template-columns: 1fr; }
}
</style>

