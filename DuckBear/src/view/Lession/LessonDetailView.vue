<template>
  <div class="t-page-wrap lesson-detail-page">
    <!-- Top Action Bar -->
    <div class="top-nav-bar mb-4">
      <v-btn
        variant="text"
        prepend-icon="mdi-arrow-left"
        class="text-none back-btn"
        color="secondary"
        size="small"
        @click="goBack"
      >
        Quay lại danh sách chương
      </v-btn>

      <div class="d-flex align-center gap-2 flex-wrap">
        <!-- View Mode Toggle -->
        <div class="view-mode-toggle">
          <v-btn
            size="small"
            variant="flat"
            :color="viewMode === 'visual' ? 'primary' : 'default'"
            class="text-none text-caption font-weight-bold"
            prepend-icon="mdi-view-dashboard-outline"
            @click="viewMode = 'visual'"
          >
            Trực quan
          </v-btn>
          <v-btn
            size="small"
            variant="flat"
            :color="viewMode === 'raw' ? 'primary' : 'default'"
            class="text-none text-caption font-weight-bold"
            prepend-icon="mdi-text"
            @click="viewMode = 'raw'"
          >
            Văn bản gốc
          </v-btn>
        </div>

        <!-- Font size toggle -->
        <v-btn-group density="compact" variant="outlined" class="font-size-group">
          <v-btn
            size="x-small"
            :color="fontSize === 'small' ? 'primary' : undefined"
            @click="fontSize = 'small'"
          >
            A-
          </v-btn>
          <v-btn
            size="x-small"
            :color="fontSize === 'normal' ? 'primary' : undefined"
            @click="fontSize = 'normal'"
          >
            A
          </v-btn>
          <v-btn
            size="x-small"
            :color="fontSize === 'large' ? 'primary' : undefined"
            @click="fontSize = 'large'"
          >
            A+
          </v-btn>
        </v-btn-group>

        <!-- Generate AI questions button -->
        <v-btn
          v-if="lesson"
          color="primary"
          variant="flat"
          size="small"
          prepend-icon="mdi-creation"
          class="text-none ai-gen-btn"
          :to="{ name: 'teacher-assignments-generate' }"
        >
          Sinh câu hỏi AI
        </v-btn>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-16">
      <v-progress-circular indeterminate color="primary" size="48" width="4" />
      <p class="mt-3 text-secondary text-body-2 font-weight-medium">Đang tải nội dung bài học...</p>
    </div>

    <!-- Error alert -->
    <v-alert v-else-if="error" type="error" variant="tonal" class="mb-5" rounded="lg">
      {{ error }}
    </v-alert>

    <!-- Main Reader Container -->
    <div v-else-if="lesson && chapter" class="lesson-reader-container">
      <!-- Hero Banner Card -->
      <header class="lesson-hero-card">
        <div class="hero-top-row">
          <div class="lesson-breadcrumbs">
            <span class="subject-pill">
              <v-icon icon="mdi-book-open-page-variant" size="14" class="mr-1" />
              {{ chapter.bookTitle || "Sách học" }}
            </span>
            <v-icon icon="mdi-chevron-right" size="15" color="#94A3B8" />
            <span class="chapter-pill">{{ chapter.title }}</span>
          </div>

          <div class="lesson-meta-chips">
            <span class="meta-chip">
              <v-icon icon="mdi-clock-outline" size="14" class="mr-1" />
              Khoảng {{ estimatedMinutes }} phút học
            </span>
            <span v-if="parsedSections.length" class="meta-chip meta-chip--highlight">
              <v-icon icon="mdi-layers-outline" size="14" class="mr-1" />
              {{ parsedSections.length }} phần trọng tâm
            </span>
          </div>
        </div>

        <h1 class="hero-lesson-title">
          {{ lesson.title }}
        </h1>

        <!-- Quick Jump Section Tabs / Outline -->
        <div v-if="parsedSections.length > 1" class="section-quick-jump">
          <span class="quick-jump-label">
            <v-icon icon="mdi-format-list-bulleted" size="15" class="mr-1" />
            Mục lục:
          </span>
          <div class="quick-jump-tags">
            <button
              v-for="(sec, idx) in parsedSections"
              :key="idx"
              type="button"
              class="jump-tag-btn"
              @click="scrollToSection(idx)"
            >
              <span class="jump-num">{{ idx + 1 }}</span>
              <span class="jump-text">{{ sec.cleanTitle || sec.title }}</span>
            </button>
          </div>
        </div>
      </header>

      <!-- Raw text view mode -->
      <article v-if="viewMode === 'raw'" class="raw-content-card">
        <div class="raw-header">
          <v-icon icon="mdi-text-box-outline" size="18" color="#64748B" class="mr-2" />
          <span>Văn bản gốc bài học</span>
        </div>
        <div class="raw-body-content" :class="`font-${fontSize}`">
          {{ lesson.content }}
        </div>
      </article>

      <!-- Visual Structured view mode -->
      <div v-else class="visual-content-flow" :class="`font-${fontSize}`">
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
              <h2 class="section-heading-title">{{ sec.cleanTitle || sec.title }}</h2>
            </div>
          </div>

          <!-- Section Content Blocks -->
          <div class="section-card-body">
            <!-- 1. CASE: Stepper Workflow (e.g. "Các bước giải") -->
            <div v-if="sec.type === 'stepper'" class="stepper-workflow">
              <div class="stepper-intro-banner">
                <v-icon icon="mdi-transit-connection-variant" size="20" color="#3B82F6" class="mr-2" />
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
                        <v-icon icon="mdi-chevron-right-circle" size="16" color="#3B82F6" class="mr-2 flex-shrink-0 mt-1" />
                        <span>{{ item }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 2. CASE: Topic Cards Grid (e.g. "Một số dạng thường gặp") -->
            <div v-else-if="sec.type === 'topic-grid'" class="topics-grid-container">
              <div class="topics-intro-banner">
                <v-icon icon="mdi-shape-plus" size="20" color="#7C3AED" class="mr-2" />
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
                      <v-icon :icon="topic.icon" size="22" :color="topic.color" />
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
                <div v-if="block.type === 'procedure'" class="procedure-flow-card">
                  <div class="procedure-header">
                    <div class="proc-title-wrap">
                      <div class="proc-icon-box">
                        <v-icon icon="mdi-cog-play-outline" size="20" />
                      </div>
                      <h3 class="proc-title">{{ block.title }}</h3>
                    </div>
                    <v-chip size="small" color="primary" variant="tonal" class="font-weight-bold">
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
                <div v-else-if="block.type === 'definition'" class="definition-box">
                  <div class="def-header">
                    <div class="def-icon-wrap">
                      <v-icon icon="mdi-function" size="18" color="#3B82F6" />
                    </div>
                    <span class="def-title">{{ block.title || 'Dạng tổng quát' }}</span>
                  </div>
                  <div v-if="block.formula" class="def-formula-display">
                    <span class="math-expr">{{ block.formula }}</span>
                  </div>
                  <p class="def-desc">{{ block.text }}</p>
                  <div v-if="block.badges?.length" class="def-badges">
                    <span v-for="(badge, bi) in block.badges" :key="bi" class="def-chip">
                      {{ badge }}
                    </span>
                  </div>
                </div>

                <!-- C. System of Equations Block -->
                <div v-else-if="block.type === 'system-equation'" class="system-box">
                  <div class="system-header">
                    <v-icon icon="mdi-code-brackets" size="18" color="#8B5CF6" class="mr-2" />
                    <span>Dạng tổng quát hệ phương trình</span>
                  </div>
                  <div class="system-brace-display">
                    <div class="curly-brace">{</div>
                    <div class="system-lines">
                      <div class="system-line">{{ block.eq1 || 'ax + by = c' }}</div>
                      <div class="system-line">{{ block.eq2 || "a'x + b'y = c'" }}</div>
                    </div>
                  </div>
                  <p v-if="block.text" class="system-desc">{{ block.text }}</p>
                </div>

                <!-- D. Rich Example Card (In ĐẦY ĐỦ các bước, xuống dòng từng bước, trình bày đẹp) -->
                <div v-else-if="block.type === 'example'" class="example-box">
                  <div class="example-badge-row">
                    <span class="example-tag" :style="{ backgroundColor: block.themeColor || '#10B981' }">
                      <v-icon :icon="block.themeIcon || 'mdi-play-circle-outline'" size="14" class="mr-1" />
                      {{ block.badgeTitle || 'Ví dụ minh họa' }}
                    </span>
                    <span v-if="block.subtitle" class="example-sub">{{ block.subtitle }}</span>
                  </div>

                  <!-- Problem Statement / Đề bài -->
                  <div class="example-problem-panel">
                    <div class="problem-label">
                      <v-icon icon="mdi-help-circle-outline" size="16" color="#2563EB" class="mr-1" />
                      <strong>Đề bài:</strong>
                    </div>
                    <p class="example-main-text">{{ block.problemText || block.text }}</p>
                  </div>

                  <!-- Detailed Step-by-Step Solution / Lời giải chi tiết từng bước -->
                  <div v-if="block.solutionPhases?.length" class="example-solution-phases">
                    <div class="solution-phases-heading">
                      <v-icon icon="mdi-format-list-checks" size="17" color="#4F46E5" class="mr-1" />
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
                        <!-- If it has sub-steps / lines (xuống dòng từng dòng tính toán) -->
                        <div v-if="phase.steps?.length" class="phase-steps-list">
                          <div
                            v-for="(subStep, ssIdx) in phase.steps"
                            :key="ssIdx"
                            class="phase-sub-step-row"
                            :class="{ 'is-math-line': subStep.isMath, 'is-prompt-line': subStep.isPrompt }"
                          >
                            <v-icon
                              :icon="subStep.isMath ? 'mdi-subdirectory-arrow-right' : 'mdi-circle-small'"
                              size="16"
                              :color="subStep.isMath ? '#2563EB' : '#64748B'"
                              class="mr-2 flex-shrink-0 mt-1"
                            />
                            <div class="step-text-wrapper">
                              <span v-if="subStep.prefix" class="step-prefix font-weight-bold mr-1">{{ subStep.prefix }}:</span>
                              <span class="step-content">{{ subStep.text }}</span>
                            </div>
                          </div>
                        </div>

                        <!-- If it has system equations (hiển thị hệ rõ ràng) -->
                        <div v-else-if="phase.formulaLines?.length" class="phase-equation-box">
                          <div v-for="(line, lIdx) in phase.formulaLines" :key="lIdx" class="eq-math-line">
                            <span class="eq-bullet">•</span>
                            <span class="eq-code">{{ line }}</span>
                          </div>
                        </div>

                        <!-- Fallback single content -->
                        <p v-else class="phase-text">{{ phase.content }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Step verification checks if present -->
                  <div v-if="block.stepChecks?.length" class="example-steps-grid">
                    <div
                      v-for="(st, sIdx) in block.stepChecks"
                      :key="sIdx"
                      class="step-check-card"
                      :class="{ 'step-check--valid': st.valid, 'step-check--invalid': !st.valid }"
                    >
                      <div class="step-check-icon">
                        <v-icon
                          :icon="st.valid ? 'mdi-check-circle' : 'mdi-close-circle'"
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
                    <v-icon icon="mdi-check-decagram" size="20" color="#10B981" class="mr-2 flex-shrink-0" />
                    <div>
                      <strong>Kết luận:</strong> {{ block.conclusion }}
                    </div>
                  </div>
                </div>

                <!-- E. Geometric Rule / Cases Block -->
                <div v-else-if="block.type === 'cases'" class="cases-container">
                  <div class="cases-title">
                    <v-icon icon="mdi-axis-arrow" size="18" color="#0EA5E9" class="mr-2" />
                    Các trường hợp vị trí đường thẳng trên mặt phẳng tọa độ Oxy
                  </div>
                  <div class="cases-grid">
                    <div
                      v-for="(caseItem, cIdx) in block.cases"
                      :key="cIdx"
                      class="case-card"
                    >
                      <div class="case-header">
                        <span class="case-condition">{{ caseItem.condition }}</span>
                        <span class="case-badge">{{ caseItem.badge }}</span>
                      </div>
                      <p class="case-desc">{{ caseItem.desc }}</p>
                    </div>
                  </div>
                </div>

                <!-- F. Visual Graph Widget (Oxy Plane - ONLY when lesson teaches graphing) -->
                <div v-else-if="block.type === 'visual-graph'" class="oxy-visual-widget">
                  <div class="oxy-widget-header">
                    <div class="d-flex align-center">
                      <div class="oxy-icon-badge">
                        <v-icon icon="mdi-chart-line" size="18" color="#2563EB" />
                      </div>
                      <div>
                        <div class="oxy-title">Minh họa đồ thị trên mặt phẳng Oxy</div>
                        <div class="oxy-subtitle">Đường thẳng x + 2y = 4</div>
                      </div>
                    </div>
                    <v-chip size="small" color="primary" variant="tonal" class="font-weight-bold">
                      Trực quan hình học
                    </v-chip>
                  </div>

                  <div class="oxy-interactive-area">
                    <div class="svg-container">
                      <svg viewBox="0 0 360 260" class="oxy-svg">
                        <defs>
                          <marker id="arrow-x" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                            <path d="M 0 1 L 8 5 L 0 9 z" fill="#64748B" />
                          </marker>
                          <marker id="arrow-y" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                            <path d="M 0 1 L 8 5 L 0 9 z" fill="#64748B" />
                          </marker>
                        </defs>

                        <g class="grid-lines" stroke="#F1F5F9" stroke-width="1">
                          <line v-for="x in [40, 80, 120, 160, 200, 240, 280, 320]" :key="`gx-${x}`" :x1="x" y1="20" :x2="x" y2="240" />
                          <line v-for="y in [40, 80, 120, 160, 200, 240]" :key="`gy-${y}`" x1="20" :y1="y" x2="340" :y2="y" />
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
                        <text x="202" y="151" font-size="11" font-weight="700" fill="#3730A3" text-anchor="middle">
                          d: x + 2y = 4
                        </text>
                      </svg>
                    </div>

                    <div class="oxy-explanation">
                      <div class="point-explanation-card">
                        <div class="pt-badge pt-blue">Điểm A</div>
                        <div>
                          <strong>Cho x = 0:</strong> y = 4/2 = <strong>2</strong>
                          <div class="text-caption text-secondary">Tọa độ: A(0; 2) trên trục Oy</div>
                        </div>
                      </div>

                      <div class="point-explanation-card mt-2">
                        <div class="pt-badge pt-green">Điểm B</div>
                        <div>
                          <strong>Cho y = 0:</strong> x = <strong>4</strong>
                          <div class="text-caption text-secondary">Tọa độ: B(4; 0) trên trục Ox</div>
                        </div>
                      </div>

                      <div class="draw-tip-card mt-3">
                        <v-icon icon="mdi-pencil-ruler" size="16" color="#4F46E5" class="mr-1" />
                        <span><strong>Cách vẽ nhanh:</strong> Xác định 2 giao điểm A và B với 2 trục tọa độ, dùng thước nối A và B.</span>
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
                    <strong v-if="block.label" class="concept-label">{{ block.label }}: </strong>
                    <span>{{ block.text }}</span>
                  </div>
                </div>

                <!-- H. Equations or Calculation Lines -->
                <div v-else-if="block.type === 'math-lines'" class="math-lines-box">
                  <div v-for="(line, mIdx) in block.lines" :key="mIdx" class="math-line-row">
                    <v-icon icon="mdi-equal" size="14" color="#64748B" class="mr-2" />
                    <code>{{ line }}</code>
                  </div>
                </div>

                <!-- I. Standard Paragraph -->
                <p v-else class="content-paragraph">{{ block.text }}</p>
              </div>
            </template>
          </div>
        </section>

        <!-- Dynamic Lesson Recap (CHỈ HIỂN THỊ NẾU BÀI HỌC CÓ LƯU Ý/GHI NHỚ ĐƯỢC TRÍCH XUẤT) -->
        <div v-if="extractedTips.length" class="recap-section">
          <div class="recap-header">
            <v-icon icon="mdi-bookmark-check-outline" size="22" color="#4F46E5" class="mr-2" />
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

        <!-- Real Lesson Quiz (CHỈ HIỂN THỊ NẾU CÓ CÂU HỎI THẬT TỪ HỆ THỐNG CHO BÀI NÀY) -->
        <div v-if="currentQuiz" class="quiz-interactive-card">
          <div class="quiz-top">
            <div class="quiz-badge">
              <v-icon icon="mdi-head-question-outline" size="16" class="mr-1" />
              Kiểm tra nhanh bài học
            </div>
            <div class="d-flex align-center gap-2">
              <span v-if="lessonQuestions.length > 1" class="quiz-count">
                Câu {{ currentQuizIndex + 1 }} / {{ lessonQuestions.length }}
              </span>
              <span class="quiz-hint">Củng cố kiến thức vừa học</span>
            </div>
          </div>

          <h4 class="quiz-question">
            {{ currentQuiz.content }}
          </h4>

          <div class="quiz-options">
            <button
              v-for="(opt, optIdx) in currentQuiz.options"
              :key="opt.id || optIdx"
              type="button"
              class="quiz-opt-btn"
              :class="{
                'opt--selected': selectedOption === (opt.id || optIdx),
                'opt--correct': quizSubmitted && opt.isCorrect,
                'opt--wrong': quizSubmitted && selectedOption === (opt.id || optIdx) && !opt.isCorrect
              }"
              @click="handleSelectQuizOption(opt, optIdx)"
            >
              <span class="opt-key">{{ String.fromCharCode(65 + optIdx) }}</span>
              <span class="opt-text">{{ opt.content }}</span>
              <v-icon
                v-if="quizSubmitted && opt.isCorrect"
                icon="mdi-check-circle"
                size="18"
                color="#10B981"
                class="ml-auto"
              />
              <v-icon
                v-else-if="quizSubmitted && selectedOption === (opt.id || optIdx) && !opt.isCorrect"
                icon="mdi-close-circle"
                size="18"
                color="#EF4444"
                class="ml-auto"
              />
            </button>
          </div>

          <!-- Explanation -->
          <div v-if="quizSubmitted" class="quiz-feedback" :class="quizCorrect ? 'feedback--success' : 'feedback--retry'">
            <div class="d-flex align-center font-weight-bold mb-1">
              <v-icon :icon="quizCorrect ? 'mdi-check-decagram' : 'mdi-alert-circle'" size="18" class="mr-1" />
              {{ quizCorrect ? 'Chính xác! Làm rất tốt!' : 'Chưa chính xác! Xem lại giải thích:' }}
            </div>
            <p v-if="currentQuiz.explanation" class="text-caption mb-0">
              {{ currentQuiz.explanation }}
            </p>
            <div v-if="lessonQuestions.length > 1" class="mt-3">
              <v-btn
                size="small"
                variant="outlined"
                color="primary"
                class="text-none"
                @click="nextQuizQuestion"
              >
                Câu tiếp theo
              </v-btn>
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation footer bar -->
      <footer class="lesson-navigation-bar">
        <v-btn
          variant="outlined"
          color="secondary"
          prepend-icon="mdi-arrow-left"
          class="text-none nav-action-btn"
          :disabled="currentIndex <= 0"
          @click="navigateTo(sequence[currentIndex - 1])"
        >
          <div class="text-left">
            <div class="nav-btn-sub">Bài trước</div>
            <div v-if="sequence[currentIndex - 1]" class="nav-btn-title">
              {{ sequence[currentIndex - 1].title }}
            </div>
          </div>
        </v-btn>

        <!-- Progress tracker -->
        <div v-if="currentIndex >= 0" class="nav-progress-center">
          <div class="progress-pill">
            Bài {{ currentIndex + 1 }} / {{ sequence.length }}
          </div>
          <v-progress-linear
            :model-value="((currentIndex + 1) / (sequence.length || 1)) * 100"
            color="primary"
            height="5"
            rounded
            class="progress-bar-line"
          />
        </div>

        <v-btn
          variant="flat"
          color="primary"
          append-icon="mdi-arrow-right"
          class="text-none nav-action-btn"
          :disabled="currentIndex < 0 || currentIndex >= sequence.length - 1"
          @click="navigateTo(sequence[currentIndex + 1])"
        >
          <div class="text-right">
            <div class="nav-btn-sub">Bài tiếp theo</div>
            <div v-if="sequence[currentIndex + 1]" class="nav-btn-title">
              {{ sequence[currentIndex + 1].title }}
            </div>
          </div>
        </v-btn>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getChapterByIdApi, getChaptersByBookApi } from "@/api/chapter";
import { getLessonByIdApi, getLessonsByChapterApi } from "@/api/lesson";
import { getQuestionsByLessonApi } from "@/api/question";

const route = useRoute();
const router = useRouter();
const loading = ref(true);
const error = ref("");
const lesson = ref(null);
const chapter = ref(null);
const sequence = ref([]);
const viewMode = ref("visual"); // 'visual' | 'raw'
const fontSize = ref("normal"); // 'small' | 'normal' | 'large'
let loadRequestId = 0;

// Dynamic Real Questions from DB for this lesson
const lessonQuestions = ref([]);
const currentQuizIndex = ref(0);
const selectedOption = ref(null);
const quizSubmitted = ref(false);
const quizCorrect = ref(false);

const currentQuiz = computed(() => {
  if (!lessonQuestions.value?.length) return null;
  return lessonQuestions.value[currentQuizIndex.value] || null;
});

function handleSelectQuizOption(opt, optIdx) {
  selectedOption.value = opt.id || optIdx;
  quizSubmitted.value = true;
  quizCorrect.value = Boolean(opt.isCorrect);
}

function nextQuizQuestion() {
  if (currentQuizIndex.value < lessonQuestions.value.length - 1) {
    currentQuizIndex.value++;
    selectedOption.value = null;
    quizSubmitted.value = false;
    quizCorrect.value = false;
  }
}

const currentIndex = computed(() =>
  sequence.value.findIndex((item) => item.id === Number(route.params.lessonId)),
);

const estimatedMinutes = computed(() => {
  const words = (lesson.value?.content || "").trim().split(/\s+/).length;
  return Math.max(3, Math.min(10, Math.ceil(words / 100)));
});

/**
 * Splits complex Vietnamese mathematical calculation sentences into clean,
 * line-by-line discrete algebraic steps so that each number calculation is on its own row.
 */
function parseMathCalculationSteps(rawText) {
  if (!rawText) return [];

  const colonIdx = rawText.indexOf(":");
  let promptPrefix = "";
  let body = rawText;

  if (colonIdx > 0 && colonIdx < 45) {
    promptPrefix = rawText.substring(0, colonIdx).trim();
    body = rawText.substring(colonIdx + 1).trim();
  }

  const steps = [];

  if (promptPrefix) {
    steps.push({
      isPrompt: true,
      prefix: "Thực hiện",
      text: promptPrefix,
    });
  }

  const clauses = body
    .replace(/\.\s+/g, " | ")
    .replace(/;\s+/g, " | ")
    .replace(/,\s*(nên|suy ra|thay vào|thế vào|được)\s+/gi, " | $1 ")
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const clause of clauses) {
    const isMath = /[0-9a-z]\s*[\=\+\-\*\/]\s*[0-9a-z]/i.test(clause) || clause.includes("=");
    steps.push({
      isMath,
      text: clause,
    });
  }

  return steps;
}

/**
 * Universal Semantic Parser:
 * - Detects Section Headings
 * - Builds Stepper workflow for "Các bước giải"
 * - Builds Procedural card for "Cách làm:", "Quy tắc:", "Phương pháp..."
 * - Builds Topic Cards for "Một số dạng thường gặp"
 * - Expands every single example line-by-line with full steps without skipping or truncating
 */
const parsedSections = computed(() => {
  if (!lesson.value?.content?.trim()) return [];

  const raw = lesson.value.content;
  const rawLines = raw.split("\n").map((l) => l.trim());

  const sectionGroups = [];
  let currentGroup = null;

  const isSectionHeading = (line) => {
    if (!line || line.length > 80) return false;

    // Numbered headings like "1. Phương pháp thế", "2. Phương pháp cộng...", "I. ...", "Phần 1..."
    if (/^([0-9]+|[I|V|X]+)[\.\)]\s*(.+)$/i.test(line)) return true;

    const knownTitles = [
      "các bước giải",
      "quy trình giải",
      "quy trình thực hiện",
      "ví dụ minh họa",
      "ví dụ áp dụng",
      "bài tập mẫu",
      "một số dạng thường gặp",
      "các dạng thường gặp",
      "các dạng toán",
      "dạng toán thường gặp",
      "khái niệm và định nghĩa",
      "định lý và tính chất",
      "tóm tắt lý thuyết",
      "ghi nhớ cốt lõi",
    ];

    const clean = line.toLowerCase().replace(/[:\.\-]/g, "").trim();
    return knownTitles.some((kt) => clean === kt || clean.startsWith(kt));
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
          title: "Khái niệm mở đầu",
          cleanTitle: "Nội dung bài học",
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

    // 1. STEPPER WORKFLOW ("Các bước giải")
    if (
      groupTitleLower.includes("các bước") ||
      groupTitleLower.includes("quy trình giải") ||
      group.lines.some((l) => /^bước\s*\d+/i.test(l))
    ) {
      const steps = [];
      let currentStep = null;

      for (const line of group.lines) {
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

    // 2. TOPIC CARDS GRID ("Một số dạng thường gặp")
    if (
      groupTitleLower.includes("dạng thường gặp") ||
      groupTitleLower.includes("các dạng toán") ||
      group.lines.some((l) => /^(Toán về|Chuyển động|Năng suất|Phần trăm|Hình học)[:\-]/i.test(l))
    ) {
      const topics = [];

      for (const line of group.lines) {
        const colonIdx = line.indexOf(":");
        if (colonIdx > 0 && colonIdx < 35) {
          const name = line.substring(0, colonIdx).trim();
          const desc = line.substring(colonIdx + 1).trim();

          let theme = "blue";
          let icon = "mdi-lightbulb-outline";
          let color = "#3B82F6";
          let formula = "";

          const nameLower = name.toLowerCase();
          if (nameLower.includes("số")) {
            theme = "blue";
            icon = "mdi-numeric";
            color = "#2563EB";
            formula = "Dạng số: 10a + b";
          } else if (nameLower.includes("chuyển động")) {
            theme = "amber";
            icon = "mdi-speedometer";
            color = "#D97706";
            formula = "s = v × t (vận tốc × thời gian)";
          } else if (nameLower.includes("năng suất") || nameLower.includes("công việc")) {
            theme = "emerald";
            icon = "mdi-cog-sync";
            color = "#059669";
            formula = "Năng suất = 1 / t";
          } else if (nameLower.includes("phần trăm") || nameLower.includes("tăng giảm")) {
            theme = "purple";
            icon = "mdi-percent";
            color = "#7C3AED";
            formula = "Mới = (1 + p/100) × Cũ";
          } else if (nameLower.includes("hình")) {
            theme = "indigo";
            icon = "mdi-shape-polygon-plus";
            color = "#4F46E5";
            formula = "Chu vi = 2(a + b); S = a × b";
          }

          topics.push({
            name,
            desc,
            theme,
            icon,
            color,
            formula,
          });
        } else {
          topics.push({
            name: "Lưu ý dạng bài",
            desc: line,
            theme: "blue",
            icon: "mdi-information-outline",
            color: "#3B82F6",
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
    const lines = group.lines;

    for (let j = 0; j < lines.length; j++) {
      const line = lines[j];
      if (!line) continue;

      // Check if line introduces a Procedure ("Cách làm:", "Quy tắc:", "Phương pháp thế:") inside this section
      const procMatch = line.match(/^(cách làm|cách giải|quy tắc[^:\.]*|phương pháp[^:\.]*)[:\.]?$/i);
      if (procMatch || line.toLowerCase().startsWith("cách làm")) {
        const steps = [];
        while (j + 1 < lines.length) {
          const nextL = lines[j + 1];
          if (
            isSectionHeading(nextL) ||
            /^ví dụ/i.test(nextL) ||
            /^(cách làm|cách giải|quy tắc|phương pháp)[:\.]?$/i.test(nextL)
          ) {
            break;
          }
          j++;
          steps.push({ text: nextL });
        }
        blocks.push({
          type: "procedure",
          title: line.replace(/[:\.]\s*$/, "").trim() || "Cách làm",
          steps,
        });
        continue;
      }

      // Core formula definition
      if (line.includes("ax + by = c") && (line.includes("dạng") || line.includes("Phương trình"))) {
        blocks.push({
          type: "definition",
          title: "Dạng tổng quát",
          formula: "ax + by = c",
          text: line,
          badges: ["a, b, c là số cho trước", "a, b không đồng thời bằng 0"],
        });
        continue;
      }

      // System of equations
      if (line.includes("Hệ có dạng") || line.includes("hệ hai phương trình")) {
        let eq1 = "ax + by = c";
        let eq2 = "a'x + b'y = c'";
        if (lines[j + 1] && lines[j + 1].includes("ax + by")) {
          eq1 = lines[j + 1];
          j++;
        }
        if (lines[j + 1] && lines[j + 1].includes("a'x + b'y")) {
          eq2 = lines[j + 1];
          j++;
        }
        blocks.push({
          type: "system-equation",
          eq1,
          eq2,
          text: "Trong đó mỗi phương trình đều là phương trình bậc nhất hai ẩn.",
        });
        continue;
      }

      // RICH EXAMPLES (Ví dụ 1, Ví dụ 2, hoặc Ví dụ:)
      const egMatch = line.match(/^ví dụ(\s*\d+)?\s*(\([^\)]+\))?[:\.]?\s*(.*)$/i);
      if (egMatch) {
        const egNum = egMatch[1] || "";
        const tag = egMatch[2] || "";
        const problemDesc = egMatch[3] || "";

        let themeColor = "#10B981";
        let themeIcon = "mdi-play-circle-outline";
        if (tag.includes("hình học")) {
          themeColor = "#2563EB";
          themeIcon = "mdi-shape";
        } else if (tag.includes("mua bán")) {
          themeColor = "#D97706";
          themeIcon = "mdi-cart";
        } else if (tag.includes("chuyển động")) {
          themeColor = "#7C3AED";
          themeIcon = "mdi-car";
        }

        const solutionPhases = [];
        const stepChecks = [];
        let conclusion = "";

        while (j + 1 < lines.length) {
          const nextL = lines[j + 1];
          if (isSectionHeading(nextL) || /^ví dụ/i.test(nextL)) break;
          j++;

          if (/^(kết luận[:\.]?|vậy|đáp số[:\.]?)\s*/i.test(nextL)) {
            conclusion = nextL.replace(/^(kết luận[:\.]?|vậy|đáp số[:\.]?)\s*/i, "").trim();
            continue;
          }

          // Case: Choose variables and condition
          if (/^gọi\s+[a-z]/i.test(nextL)) {
            solutionPhases.push({
              type: "variable",
              label: "Bước 1: Chọn ẩn & Đặt điều kiện",
              icon: "mdi-variable",
              content: nextL,
              steps: [{ isMath: false, text: nextL }],
            });
            continue;
          }

          // Case: Set up system of equations
          if (/^ta có hệ[:\.]?/i.test(nextL) || /^hệ phương trình[:\.]?/i.test(nextL)) {
            const eqLines = [nextL.replace(/^ta có hệ[:\.]?\s*/i, "").trim()].filter(Boolean);
            while (
              j + 1 < lines.length &&
              (lines[j + 1].includes("=") || lines[j + 1].includes("+") || lines[j + 1].includes("-")) &&
              !lines[j + 1].includes(":") &&
              !lines[j + 1].toLowerCase().includes("kết luận") &&
              !lines[j + 1].toLowerCase().includes("cộng") &&
              !lines[j + 1].toLowerCase().includes("trừ") &&
              !lines[j + 1].toLowerCase().includes("nhân")
            ) {
              j++;
              eqLines.push(lines[j]);
            }
            solutionPhases.push({
              type: "system",
              label: "Bước 2: Lập hệ phương trình",
              icon: "mdi-code-brackets",
              formulaLines: eqLines,
            });
            continue;
          }

          // Case: Multi-step calculation with numbers (Cộng hai phương trình, Trừ từng vế, Nhân, Từ phương trình 1...)
          if (
            nextL.toLowerCase().includes("cộng") ||
            nextL.toLowerCase().includes("trừ") ||
            nextL.toLowerCase().includes("nhân") ||
            nextL.toLowerCase().includes("thế vào") ||
            nextL.toLowerCase().includes("thay vào") ||
            nextL.toLowerCase().includes("từ phương trình") ||
            nextL.toLowerCase().includes("từ đó")
          ) {
            const steps = parseMathCalculationSteps(nextL);

            while (
              j + 1 < lines.length &&
              /^[0-9a-z\s\+\-\*\/\=]{4,30}$/i.test(lines[j + 1]) &&
              lines[j + 1].includes("=") &&
              !lines[j + 1].includes(":")
            ) {
              j++;
              steps.push({
                isMath: true,
                text: lines[j],
              });
            }

            solutionPhases.push({
              type: "solve",
              label: "Biến đổi & Giải phương trình",
              icon: "mdi-calculator-variant-outline",
              steps,
            });
            continue;
          }

          // Case: Verification checks (Phương trình 1: 2 + 1 = 3 ✓)
          if (nextL.includes("✓") || nextL.includes("✗") || (nextL.includes("nghiệm") && nextL.includes("thỏa"))) {
            const isValid = nextL.includes("✓") || nextL.includes("thỏa") || nextL.includes("là nghiệm");
            stepChecks.push({
              calc: nextL.replace(/[✓✗]/g, "").trim(),
              label: isValid ? "Thỏa mãn điều kiện" : "Không thỏa mãn",
              valid: isValid,
            });
            continue;
          }

          // General step
          solutionPhases.push({
            type: "general",
            label: "Thao tác giải",
            icon: "mdi-arrow-right-thin",
            steps: [{ isMath: false, text: nextL }],
          });
        }

        blocks.push({
          type: "example",
          badgeTitle: `Ví dụ ${egNum} ${tag}`.trim(),
          subtitle: tag ? `Dạng bài ${tag.replace(/[\(\)]/g, "")}` : "",
          problemText: problemDesc,
          themeColor,
          themeIcon,
          solutionPhases,
          stepChecks,
          conclusion,
        });
        continue;
      }

      // Graphing Oxy (Only when lesson actually teaches graphing)
      if (line.includes("Vẽ đường thẳng x + 2y = 4") && group.lines.some((l) => l.includes("Oxy"))) {
        blocks.push({
          type: "visual-graph",
          text: line,
        });
        continue;
      }

      // Position cases
      if (line.startsWith("Nếu a ≠ 0") || line.startsWith("Nếu b = 0") || line.startsWith("Nếu a = 0")) {
        blocks.push({
          type: "cases",
          cases: [
            {
              condition: "a ≠ 0, b ≠ 0",
              badge: "Cắt cả 2 trục",
              desc: "Đường thẳng cắt Ox và Oy tại 2 điểm phân biệt. Nối 2 điểm này để vẽ đồ thị.",
            },
            {
              condition: "b = 0 (ax = c)",
              badge: "Song song với Oy",
              desc: "Đường thẳng x = c/a song song với trục tung Oy.",
            },
            {
              condition: "a = 0 (by = c)",
              badge: "Song song với Ox",
              desc: "Đường thẳng y = c/b song song với trục hoành Ox.",
            },
          ],
        });
        while (j + 1 < lines.length && (lines[j + 1].startsWith("Nếu b = 0") || lines[j + 1].startsWith("Nếu a = 0"))) {
          j++;
        }
        continue;
      }

      // Fallback paragraph
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
 * NEVER hardcoded. Returns empty array if no notes are found in the lesson.
 */
const extractedTips = computed(() => {
  if (!lesson.value?.content) return [];
  const lines = lesson.value.content.split("\n").map((l) => l.trim());
  const tips = [];

  const icons = [
    { icon: "mdi-alert-circle-outline", color: "amber" },
    { icon: "mdi-lightbulb-on-outline", color: "blue" },
    { icon: "mdi-checkbox-marked-circle-outline", color: "emerald" },
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
      lower.startsWith("đối chiếu nghiệm") ||
      lower.includes("chú ý chuyển động") ||
      lower.includes("coi cả công việc")
    ) {
      const colonIdx = line.indexOf(":");
      let title = "Lưu ý quan trọng";
      let desc = line;

      if (colonIdx > 0 && colonIdx < 30) {
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

function scrollToSection(idx) {
  const el = document.getElementById(`lesson-section-${idx}`);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

async function loadLesson() {
  const requestId = ++loadRequestId;
  loading.value = true;
  error.value = "";
  quizSubmitted.value = false;
  selectedOption.value = null;
  currentQuizIndex.value = 0;
  lessonQuestions.value = [];

  try {
    const lessonResponse = await getLessonByIdApi(route.params.lessonId);
    const chapterResponse = await getChapterByIdApi(lessonResponse.data.chapterId);
    const chaptersResponse = await getChaptersByBookApi(chapterResponse.data.bookId);
    const chapterLessons = await Promise.all(
      chaptersResponse.data.map(async (item) => {
        const lessonsResponse = await getLessonsByChapterApi(item.id);
        return lessonsResponse.data;
      }),
    );

    try {
      const questionsResponse = await getQuestionsByLessonApi(route.params.lessonId);
      lessonQuestions.value = questionsResponse.data || [];
    } catch (qErr) {
      console.warn("Không thể tải danh sách câu hỏi cho bài này:", qErr);
      lessonQuestions.value = [];
    }

    if (requestId !== loadRequestId) return;

    lesson.value = lessonResponse.data;
    chapter.value = chapterResponse.data;
    sequence.value = chapterLessons.flat();

    if (!sequence.value.some((item) => item.id === lessonResponse.data.id)) {
      throw new Error("Không tìm thấy bài học trong danh sách của sách.");
    }
  } catch (err) {
    if (requestId !== loadRequestId) return;
    console.error("Lỗi tải nội dung bài học:", err);
    error.value = err.response?.data?.message || err.message || "Không thể tải nội dung bài học.";
  } finally {
    if (requestId === loadRequestId) loading.value = false;
  }
}

function goBack() {
  if (chapter.value?.bookId) {
    router.push({ name: "teacher-lessons", query: { bookId: chapter.value.bookId } });
    return;
  }
  router.push({ name: "teacher-books" });
}

function navigateTo(target) {
  if (!target) return;
  router.push({ name: "teacher-lesson-detail", params: { lessonId: target.id } });
}

watch(() => route.params.lessonId, loadLesson, { immediate: true });
</script>

<style scoped>
.lesson-detail-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 20px 80px;
}

/* Top Navigation Bar */
.top-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.view-mode-toggle {
  display: flex;
  background: #f1f5f9;
  padding: 2px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.font-size-group {
  border-radius: 8px;
  background: #ffffff;
}

.ai-gen-btn {
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%) !important;
  color: #ffffff !important;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
  transition: all 0.2s ease;
}
.ai-gen-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
}

/* Hero Header Card */
.lesson-hero-card {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 28px 32px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
  margin-bottom: 24px;
}

.hero-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}

.lesson-breadcrumbs {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.subject-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #dbeafe;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.chapter-pill {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.lesson-meta-chips {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  background: #f1f5f9;
  color: #475569;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}

.meta-chip--highlight {
  background: #fef3c7;
  color: #b45309;
}

.hero-lesson-title {
  color: #0f172a;
  font-size: clamp(22px, 3.2vw, 30px);
  font-weight: 800;
  line-height: 1.35;
  margin: 0 0 20px 0;
  letter-spacing: -0.02em;
}

/* Quick Jump Bar */
.section-quick-jump {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px dashed #e2e8f0;
}

.quick-jump-label {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  display: flex;
  align-items: center;
}

.quick-jump-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.jump-tag-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  transition: all 0.2s ease;
}

.jump-tag-btn:hover {
  border-color: #3b82f6;
  color: #1d4ed8;
  background: #eff6ff;
  transform: translateY(-1px);
}

.jump-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #e2e8f0;
  color: #475569;
  font-size: 10px;
  font-weight: 700;
}

.jump-tag-btn:hover .jump-num {
  background: #3b82f6;
  color: #ffffff;
}

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

.section-card:hover {
  border-color: #cbd5e1;
}

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

.section-heading-wrap {
  display: flex;
  flex-direction: column;
}

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

.section-card-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

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

.step-main-title {
  margin: 0 0 8px 0;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
}

.step-sub-items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.step-sub-bullet {
  display: flex;
  align-items: flex-start;
  font-size: 13.5px;
  color: #334155;
  line-height: 1.55;
}

/* 2. Procedure Flow Card (Cách làm / Quy tắc) */
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

.proc-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.proc-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #eff6ff;
  color: #2563eb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.proc-title {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.procedure-steps-timeline {
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
}

.procedure-steps-timeline::before {
  content: "";
  position: absolute;
  top: 18px;
  bottom: 20px;
  left: 17px;
  width: 2px;
  background: linear-gradient(180deg, #3b82f6 0%, #8b5cf6 50%, #10b981 100%);
}

.proc-step-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  position: relative;
  z-index: 1;
}

.proc-step-num {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #ffffff;
  border: 2px solid #3b82f6;
  color: #2563eb;
  font-weight: 800;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.15);
  transition: all 0.2s ease;
}

.proc-step-card {
  flex: 1;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 12px 18px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  transition: all 0.2s ease;
}

.proc-step-tag {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #3b82f6;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.proc-step-text {
  font-size: 14.5px;
  color: #1e293b;
  font-weight: 600;
  line-height: 1.6;
}

.proc-step-item:hover .proc-step-card {
  border-color: #93c5fd;
  transform: translateX(3px);
}

/* 3. Topics Grid */
.topics-grid-container {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
}

.topics-intro-banner {
  display: flex;
  align-items: center;
  font-size: 13.5px;
  font-weight: 700;
  color: #6b21a8;
  margin-bottom: 16px;
}

.topics-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}

.topic-feature-card {
  border-radius: 12px;
  padding: 18px 20px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.2s ease;
}

.topic-feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.topic-theme--blue { border-color: #bfdbfe; background: #f0f7ff; }
.topic-theme--amber { border-color: #fde68a; background: #fffdf5; }
.topic-theme--emerald { border-color: #a7f3d0; background: #f0fdf4; }
.topic-theme--purple { border-color: #e9d5ff; background: #faf5ff; }
.topic-theme--indigo { border-color: #c7d2fe; background: #eef2ff; }

.topic-card-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.topic-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.topic-title {
  margin: 0;
  font-size: 14.5px;
  font-weight: 800;
  color: #0f172a;
}

.topic-formula-badge {
  display: inline-block;
  padding: 4px 10px;
  background: #ffffff;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  font-weight: 700;
  font-size: 12px;
  color: #1e293b;
}

.topic-desc {
  margin: 0;
  font-size: 13px;
  color: #475569;
  line-height: 1.6;
}

/* 4. Rich Example Box */
.example-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 22px 26px;
}

.example-badge-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.example-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  color: #ffffff;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.example-sub {
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
}

.example-problem-panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px 18px;
  margin-bottom: 18px;
}

.problem-label {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #1e40af;
  margin-bottom: 6px;
}

.example-main-text {
  color: #1e293b;
  font-weight: 600;
  font-size: 15px;
  line-height: 1.65;
  margin: 0;
}

.solution-phases-heading {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 700;
  color: #4338ca;
  margin-bottom: 10px;
}

.example-solution-phases {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.solution-phase-card {
  padding: 14px 18px;
  background: #ffffff;
  border-radius: 10px;
  border: 1px solid #e2e8f0;
}

.phase--variable { border-left: 4px solid #3b82f6; }
.phase--system { border-left: 4px solid #8b5cf6; }
.phase--solve { border-left: 4px solid #f59e0b; }
.phase--general { border-left: 4px solid #94a3b8; }

.phase-header {
  font-size: 12.5px;
  font-weight: 700;
  color: #475569;
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.phase-steps-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.phase-sub-step-row {
  display: flex;
  align-items: flex-start;
  font-size: 14px;
  line-height: 1.6;
}

.phase-sub-step-row.is-math-line {
  background: #f8fafc;
  padding: 6px 12px;
  border-radius: 6px;
  font-family: "Cambria Math", "Consolas", monospace;
  font-weight: 600;
  color: #1e293b;
  border-left: 2px solid #3b82f6;
}

.phase-sub-step-row.is-prompt-line {
  color: #4338ca;
  font-weight: 700;
  margin-bottom: 2px;
}

.step-prefix {
  color: #2563eb;
}

.phase-equation-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 14px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.eq-math-line {
  display: flex;
  align-items: center;
  gap: 8px;
}

.eq-bullet {
  color: #8b5cf6;
  font-weight: 800;
}

.eq-code {
  font-family: "Cambria Math", "Consolas", monospace;
  font-weight: 700;
  color: #1e293b;
  font-size: 14.5px;
}

.example-conclusion {
  display: flex;
  align-items: center;
  padding: 14px 18px;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 10px;
  color: #065f46;
  font-size: 14px;
}

/* 5. Definition Box */
.definition-box {
  background: linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%);
  border: 1px solid #bfdbfe;
  border-left: 5px solid #3b82f6;
  border-radius: 12px;
  padding: 20px 24px;
}

.def-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.def-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.def-title {
  font-size: 13px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #1e40af;
}

.def-formula-display {
  display: inline-flex;
  align-items: center;
  background: #ffffff;
  padding: 10px 20px;
  border-radius: 10px;
  border: 1px solid #dbeafe;
  box-shadow: 0 2px 6px rgba(37, 99, 235, 0.06);
  margin-bottom: 12px;
}

.math-expr {
  font-family: "Cambria Math", "Latin Modern Math", serif;
  font-size: 1.45em;
  font-weight: 700;
  color: #1d4ed8;
  letter-spacing: 0.5px;
}

.def-desc {
  color: #334155;
  line-height: 1.7;
  margin-bottom: 12px;
}

.def-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.def-chip {
  padding: 4px 10px;
  background: #ffffff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

/* 6. System of Equations */
.system-box {
  background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%);
  border: 1px solid #e9d5ff;
  border-left: 5px solid #8b5cf6;
  border-radius: 12px;
  padding: 20px 24px;
}

.system-header {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 800;
  color: #6b21a8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.system-brace-display {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  padding: 12px 24px;
  border-radius: 10px;
  border: 1px solid #ddd6fe;
  margin-bottom: 12px;
}

.curly-brace {
  font-size: 38px;
  line-height: 1;
  font-family: "Cambria Math", serif;
  color: #7c3aed;
  font-weight: 300;
  user-select: none;
}

.system-lines {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.system-line {
  font-family: "Cambria Math", serif;
  font-size: 1.25em;
  font-weight: 700;
  color: #5b21b6;
}

.system-desc {
  color: #475569;
  line-height: 1.6;
  margin-bottom: 0;
}

/* 7. Cases Grid */
.cases-container {
  background: #ffffff;
  border: 1px solid #e0f2fe;
  border-radius: 12px;
  padding: 20px 24px;
}

.cases-title {
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 700;
  color: #0369a1;
  margin-bottom: 16px;
}

.cases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 14px;
}

.case-card {
  padding: 14px;
  border-radius: 10px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
}

.case-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.case-condition {
  font-family: monospace;
  font-weight: 800;
  color: #0284c7;
  font-size: 13px;
}

.case-badge {
  font-size: 10px;
  font-weight: 700;
  padding: 2px 6px;
  background: #ffffff;
  border-radius: 4px;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.case-desc {
  font-size: 12.5px;
  color: #334155;
  line-height: 1.5;
  margin-bottom: 0;
}

/* 8. Oxy Visual Widget */
.oxy-visual-widget {
  background: #ffffff;
  border: 2px solid #dbeafe;
  border-radius: 14px;
  padding: 20px 24px;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.05);
}

.oxy-widget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid #f1f5f9;
}

.oxy-icon-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.oxy-title {
  font-size: 15px;
  font-weight: 800;
  color: #0f172a;
}

.oxy-subtitle {
  font-size: 12px;
  color: #64748b;
  font-weight: 600;
}

.oxy-interactive-area {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 20px;
  align-items: center;
}

.svg-container {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 8px;
}

.oxy-svg {
  width: 100%;
  height: auto;
  display: block;
}

.svg-point { cursor: pointer; }

.point-pulse {
  opacity: 0.25;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { r: 6; opacity: 0.35; }
  50% { r: 12; opacity: 0.1; }
  100% { r: 6; opacity: 0.35; }
}

.point-explanation-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.pt-badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 800;
  color: #ffffff;
}
.pt-blue { background: #2563eb; }
.pt-green { background: #059669; }

.draw-tip-card {
  padding: 10px 12px;
  background: #eef2ff;
  border-radius: 8px;
  color: #3730a3;
  font-size: 12px;
  line-height: 1.55;
}

/* 9. Concept Box */
.concept-box {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 10px;
  padding: 14px 18px;
}

.concept-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #fef3c7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.concept-text-content {
  color: #92400e;
  line-height: 1.65;
}

.concept-label {
  color: #78350f;
}

.step-check-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #ffffff;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}
.step-check--valid { border-left: 4px solid #10b981; background: #f0fdf4; }
.step-check--invalid { border-left: 4px solid #ef4444; background: #fef2f2; }
.step-calc { font-family: monospace; font-weight: 700; font-size: 14px; color: #0f172a; }
.step-label { font-size: 11px; color: #64748b; }

/* 10. Recap Section */
.recap-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px 28px;
  margin-bottom: 24px;
}

.recap-header {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}

.recap-title {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: #1e1b4b;
}

.recap-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.recap-card {
  padding: 18px;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.recap-card-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}
.recap-blue { background: #eff6ff; color: #2563eb; }
.recap-emerald { background: #ecfdf5; color: #059669; }
.recap-purple { background: #f5f3ff; color: #7c3aed; }
.recap-amber { background: #fffbeb; color: #d97706; }

.recap-card h4 {
  margin: 0 0 6px 0;
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
}

.recap-card p {
  margin: 0;
  font-size: 12.5px;
  color: #475569;
  line-height: 1.6;
}

/* Quiz Interactive Card */
.quiz-interactive-card {
  background: linear-gradient(135deg, #f8fafc 0%, #ffffff 100%);
  border: 2px dashed #cbd5e1;
  border-radius: 16px;
  padding: 24px 28px;
  margin-bottom: 32px;
}

.quiz-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.quiz-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  background: #4f46e5;
  color: #ffffff;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.quiz-count {
  font-size: 12px;
  font-weight: 700;
  color: #4f46e5;
  background: #eef2ff;
  padding: 2px 8px;
  border-radius: 4px;
}

.quiz-hint {
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
}

.quiz-question {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.5;
}

.quiz-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}

.quiz-opt-btn {
  display: flex;
  align-items: center;
  padding: 10px 14px;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.quiz-opt-btn:hover {
  border-color: #3b82f6;
  background: #f8fafc;
}

.opt-key {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  flex-shrink: 0;
}

.opt-text {
  font-size: 13px;
  font-weight: 600;
  color: #1e293b;
}

.opt--selected {
  border-color: #3b82f6;
  background: #eff6ff;
}

.opt--correct {
  border-color: #10b981 !important;
  background: #ecfdf5 !important;
}

.opt--wrong {
  border-color: #ef4444 !important;
  background: #fef2f2 !important;
}

.quiz-feedback {
  padding: 12px 16px;
  border-radius: 10px;
  margin-top: 10px;
}
.feedback--success {
  background: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}
.feedback--retry {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

/* Raw Content Card */
.raw-content-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 28px 32px;
  margin-bottom: 24px;
}

.raw-header {
  display: flex;
  align-items: center;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.raw-body-content {
  color: #334155;
  line-height: 1.85;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Navigation Footer Bar */
.lesson-navigation-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 24px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
}

.nav-action-btn {
  border-radius: 10px !important;
  padding: 12px 20px !important;
  height: auto !important;
  min-height: 48px;
}

.nav-btn-sub {
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
  opacity: 0.8;
}

.nav-btn-title {
  font-size: 12px;
  font-weight: 600;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-progress-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  min-width: 140px;
}

.progress-pill {
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
}

.progress-bar-line {
  width: 120px;
  border-radius: 999px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .lesson-hero-card,
  .section-card,
  .recap-section,
  .quiz-interactive-card,
  .raw-content-card,
  .procedure-flow-card {
    padding: 20px;
  }

  .oxy-interactive-area {
    grid-template-columns: 1fr;
  }

  .lesson-navigation-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .nav-btn-title {
    max-width: none;
  }

  .nav-progress-center {
    order: -1;
    margin-bottom: 8px;
  }
}
</style>
