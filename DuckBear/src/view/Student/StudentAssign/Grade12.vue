<!--
  AssignmentPlayGrade12.vue
  Giao diện làm bài kiểu "Bảng điều khiển học thuật" — dành riêng cho LỚP 12.
  Panel bên phải hoạt động như dashboard, cập nhật real-time: số câu đã làm,
  thời gian còn lại, số câu đã đánh dấu cần xem lại, và tiến độ theo từng dạng câu.
  Giữ nguyên logic nghiệp vụ (API, state, answerFor, submit) như file gốc.

  Tích hợp: copy vào src/views/Student/Assignment/styles/AssignmentPlayGrade12.vue
-->
<template>
  <div class="dash-shell">
    <!-- ================= LOADING ================= -->
    <div v-if="loading" class="state-screen">
      <div class="loading-spinner"></div>
      <p class="state-text">Đang khởi động bảng điều khiển...</p>
    </div>

    <!-- ================= ERROR ================= -->
    <div v-else-if="errorMessage && !detail && !result" class="state-screen">
      <p class="state-text">Không thể mở bài tập</p>
      <p class="state-subtext">{{ errorMessage }}</p>
      <button class="btn primary" @click="goBack">Quay về danh sách</button>
    </div>

    <!-- ================= RESULT ================= -->
    <div v-else-if="result" class="state-screen result-screen">
      <div class="tier-icon">{{ tier.emoji }}</div>
      <h1 class="result-title">{{ tier.label }}</h1>
      <p class="result-line">
        Đúng <strong>{{ result.correctCount }}</strong> /
        {{ result.totalQuestions }} câu
      </p>
      <p v-if="result.score !== null" class="result-score">
        Điểm: {{ result.score }}/10
      </p>
      <button class="btn primary" @click="goBack">Về danh sách bài tập</button>
    </div>

    <!-- ================= MAIN PLAY (DASHBOARD) ================= -->
    <div v-else-if="detail" class="dash-screen">
      <header class="dash-header">
        <button class="back-link" @click="goBack">⬅ Danh sách</button>
        <div class="header-text">
          <h1 class="assignment-title">{{ detail.info.title }}</h1>
          <p class="header-sub">Bảng điều khiển học thuật</p>
        </div>
      </header>

      <div class="dash-layout">
        <!-- ===== Khu vực làm bài ===== -->
        <section class="question-panel">
          <div class="panel-top">
            <p class="question-count">
              Câu {{ currentIndex + 1 }} / {{ detail.questions.length }}
            </p>
            <button
              type="button"
              class="flag-toggle"
              :class="{ active: isFlagged(currentQuestion) }"
              @click="toggleFlag(currentQuestion)"
            >
              <span class="flag-dot"></span>
              {{
                isFlagged(currentQuestion)
                  ? "Đã đánh dấu xem lại"
                  : "Đánh dấu cần xem lại"
              }}
            </button>
          </div>

          <p class="question-text">{{ currentQuestion.content }}</p>

          <div v-if="currentQuestion.options?.length" class="choice-list">
            <button
              v-for="(option, idx) in currentQuestion.options"
              :key="option.id"
              type="button"
              class="choice-row"
              :class="{
                selected:
                  answerFor(currentQuestion).selectedOptionId === option.id,
              }"
              @click="selectOption(currentQuestion, option.id)"
            >
              <span class="choice-tag">{{ letters[idx] }}</span>
              <span>{{ option.content }}</span>
            </button>
          </div>

          <textarea
            v-else
            v-model="answerFor(currentQuestion).answerText"
            class="answer-textarea"
            rows="5"
            placeholder="Nhập câu trả lời..."
          />

          <div class="panel-nav">
            <button
              class="btn ghost"
              :disabled="currentIndex === 0"
              @click="goToIndex(currentIndex - 1)"
            >
              Câu trước
            </button>
            <button
              v-if="currentIndex < detail.questions.length - 1"
              class="btn ghost"
              @click="goToIndex(currentIndex + 1)"
            >
              Câu sau
            </button>
            <button
              v-else
              class="btn primary"
              :disabled="submitting"
              @click="confirmSubmit"
            >
              {{ submitting ? "Đang nộp..." : "Nộp bài" }}
            </button>
          </div>

          <p v-if="errorMessage" class="inline-error">{{ errorMessage }}</p>
        </section>

        <!-- ===== Bảng điều khiển real-time ===== -->
        <aside class="dash-panel">
          <div class="stat-card">
            <p class="stat-label">Đã hoàn thành</p>
            <p class="stat-value">
              {{ answeredCount
              }}<span class="stat-unit">/{{ detail.questions.length }}</span>
            </p>
            <div class="mini-bar">
              <div
                class="mini-bar-fill"
                :style="{ width: overallPercent + '%' }"
              ></div>
            </div>
          </div>

          <div
            class="stat-card"
            :class="{ warning: timeWarning, critical: timeCritical }"
          >
            <p class="stat-label">Thời gian còn lại</p>
            <p class="stat-value mono">{{ formattedTime }}</p>
          </div>

          <div class="stat-card">
            <p class="stat-label">Cần xem lại</p>
            <p class="stat-value">{{ flaggedList.length }}</p>
            <div v-if="flaggedList.length" class="chip-row">
              <button
                v-for="item in flaggedList"
                :key="item.index"
                type="button"
                class="chip"
                @click="goToIndex(item.index)"
              >
                {{ item.index + 1 }}
              </button>
            </div>
            <p v-else class="stat-empty">Chưa đánh dấu câu nào</p>
          </div>

          <div class="stat-card breakdown-card">
            <p class="stat-label">Theo dạng câu</p>
            <ul class="breakdown-list">
              <li v-for="row in typeBreakdown" :key="row.key">
                <span class="breakdown-name">{{ row.title }}</span>
                <span class="breakdown-frac mono"
                  >{{ row.done }}/{{ row.total }}</span
                >
              </li>
            </ul>
          </div>

          <button
            type="button"
            class="grid-jump-toggle"
            @click="showGrid = !showGrid"
          >
            {{ showGrid ? "Ẩn bảng câu hỏi" : "Xem toàn bộ câu hỏi" }}
          </button>
          <div v-if="showGrid" class="question-grid">
            <button
              v-for="(q, idx) in detail.questions"
              :key="q.id"
              type="button"
              class="grid-cell"
              :class="{
                current: idx === currentIndex,
                done: isAnswered(q) && !isFlagged(q),
                flagged: isFlagged(q),
              }"
              @click="goToIndex(idx)"
            >
              {{ idx + 1 }}
            </button>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getAssignmentDetailApi } from "@/api/assignment";
import { startSubmissionApi, submitSubmissionApi } from "@/api/submission";

const route = useRoute();
const router = useRouter();

const detail = ref(null);
const submission = ref(null);
const result = ref(null);
const answers = reactive({});
const flagged = reactive({});
const loading = ref(true);
const submitting = ref(false);
const errorMessage = ref("");
const currentIndex = ref(0);
const showGrid = ref(false);

const letters = ["A", "B", "C", "D", "E", "F"];

const TYPE_TITLES = {
  multiple_choice: "Trắc nghiệm",
  fill_blank: "Điền khuyết",
  matching: "Nối / ghép",
  drag_drop: "Kéo thả",
  essay: "Tự luận",
};
const TYPE_ORDER = [
  "multiple_choice",
  "fill_blank",
  "matching",
  "drag_drop",
  "essay",
];

// --- đồng hồ đếm ngược ---
const DEFAULT_DURATION_MINUTES = 45;
const remainingSeconds = ref(0);
let timerId = null;

const currentQuestion = computed(
  () => detail.value?.questions[currentIndex.value],
);

const tier = computed(() => {
  const score = result.value?.score ?? 0;
  if (score >= 8) return { emoji: "📊", label: "Chỉ số học tập rất tốt!" };
  if (score >= 5) return { emoji: "📈", label: "Đạt yêu cầu" };
  return { emoji: "📉", label: "Cần cải thiện thêm" };
});

const formattedTime = computed(() => {
  const total = Math.max(0, remainingSeconds.value);
  const m = Math.floor(total / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(total % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
});
const timeWarning = computed(
  () => remainingSeconds.value <= 300 && remainingSeconds.value > 60,
);
const timeCritical = computed(() => remainingSeconds.value <= 60);

const answeredCount = computed(() => {
  if (!detail.value) return 0;
  return detail.value.questions.filter((q) => isAnswered(q)).length;
});
const overallPercent = computed(() => {
  if (!detail.value || detail.value.questions.length === 0) return 0;
  return Math.round(
    (answeredCount.value / detail.value.questions.length) * 100,
  );
});

const flaggedList = computed(() => {
  if (!detail.value) return [];
  return detail.value.questions
    .map((q, index) => ({ question: q, index }))
    .filter((item) => isFlagged(item.question));
});

// Thống kê tiến độ theo từng dạng câu hỏi (trắc nghiệm / điền khuyết / tự luận...)
const typeBreakdown = computed(() => {
  if (!detail.value) return [];
  const groups = {};
  detail.value.questions.forEach((q) => {
    const key = q.type || "essay";
    if (!groups[key]) groups[key] = { total: 0, done: 0 };
    groups[key].total++;
    if (isAnswered(q)) groups[key].done++;
  });
  const orderedKeys = TYPE_ORDER.filter((key) => groups[key]);
  Object.keys(groups).forEach((key) => {
    if (!orderedKeys.includes(key)) orderedKeys.push(key);
  });
  return orderedKeys.map((key) => ({
    key,
    title: TYPE_TITLES[key] || "Khác",
    total: groups[key].total,
    done: groups[key].done,
  }));
});

function answerFor(question) {
  if (!answers[question.id]) {
    answers[question.id] = {
      questionId: question.id,
      selectedOptionId: null,
      answerText: "",
    };
  }
  return answers[question.id];
}
function isAnswered(question) {
  const a = answers[question.id];
  return !!(a && (a.selectedOptionId || a.answerText?.trim()));
}
function selectOption(question, optionId) {
  answerFor(question).selectedOptionId = optionId;
}
function isFlagged(question) {
  return !!flagged[question.id];
}
function toggleFlag(question) {
  flagged[question.id] = !flagged[question.id];
}

function goToIndex(index) {
  if (!detail.value) return;
  if (index < 0 || index > detail.value.questions.length - 1) return;
  currentIndex.value = index;
}

function goBack() {
  router.push({ name: "student-dashboard" });
}

function confirmSubmit() {
  const unanswered = detail.value.questions.length - answeredCount.value;
  if (unanswered > 0) {
    const ok = window.confirm(
      `Bạn còn ${unanswered} câu chưa làm. Vẫn muốn nộp bài?`,
    );
    if (!ok) return;
  }
  submit();
}

async function submit() {
  submitting.value = true;
  errorMessage.value = "";
  stopTimer();
  try {
    const payload = detail.value.questions.map((question) =>
      answerFor(question),
    );
    const response = await submitSubmissionApi(submission.value.id, payload);
    result.value = response.data;
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Không thể nộp bài";
  } finally {
    submitting.value = false;
  }
}

function startTimer() {
  const minutes =
    detail.value?.info?.durationMinutes || DEFAULT_DURATION_MINUTES;
  remainingSeconds.value = minutes * 60;
  timerId = setInterval(() => {
    if (remainingSeconds.value <= 0) {
      stopTimer();
      if (!result.value && !submitting.value) {
        submit();
      }
      return;
    }
    remainingSeconds.value--;
  }, 1000);
}
function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
}

onMounted(async () => {
  try {
    const assignmentId = Number(route.params.id);
    const [detailResponse, submissionResponse] = await Promise.all([
      getAssignmentDetailApi(assignmentId),
      startSubmissionApi(assignmentId),
    ]);
    detail.value = detailResponse.data;
    submission.value = submissionResponse.data;
    detail.value.questions.forEach(answerFor);
    startTimer();
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Không thể mở bài tập";
  } finally {
    loading.value = false;
  }
});

onUnmounted(() => {
  stopTimer();
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=JetBrains+Mono:wght@500;600;700&family=Inter:wght@400;500;600&display=swap");

.dash-shell {
  min-height: 100vh;
  background: #f5f6f8;
  font-family: "Inter", sans-serif;
  color: #1a1d23;
  padding: 24px 16px 48px;
}

.state-screen {
  min-height: 80vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
}
.loading-spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 4px solid #d9f5f0;
  border-top-color: #0e9c86;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .loading-spinner {
    animation: none;
  }
}
.state-text {
  font-family: "Space Grotesk", sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
}
.state-subtext {
  color: #656b76;
}

.result-screen {
  gap: 6px;
}
.tier-icon {
  font-size: 3rem;
}
.result-title {
  font-family: "Space Grotesk", sans-serif;
  font-weight: 700;
  font-size: 1.5rem;
  margin: 4px 0;
}
.result-line {
  font-size: 1.05rem;
}
.result-score {
  font-weight: 700;
  color: #0e9c86;
  margin-bottom: 10px;
}

.btn {
  border: none;
  border-radius: 8px;
  padding: 12px 22px;
  font-family: "Space Grotesk", sans-serif;
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;
}
.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.btn.primary {
  color: #fff;
  background: #0e9c86;
}
.btn.primary:hover:not(:disabled) {
  background: #0b7d6c;
}
.btn.ghost {
  color: #1a1d23;
  background: #fff;
  border: 1px solid #dfe2e7;
}
.btn.ghost:hover:not(:disabled) {
  border-color: #0e9c86;
}

.dash-screen {
  max-width: 1060px;
  margin: 0 auto;
}

.dash-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}
.back-link {
  border: none;
  background: #fff;
  border-radius: 999px;
  padding: 8px 16px;
  font-family: "Space Grotesk", sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  color: #1a1d23;
  flex: 0 0 auto;
}
.header-text {
  flex: 1;
}
.assignment-title {
  font-family: "Space Grotesk", sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0;
}
.header-sub {
  margin: 2px 0 0;
  font-size: 0.8rem;
  color: #656b76;
}

.dash-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 22px;
  align-items: start;
}

.question-panel {
  background: #fff;
  border-radius: 14px;
  padding: 26px 26px 22px;
  border: 1px solid #e4e7eb;
}
.panel-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.question-count {
  font-size: 0.85rem;
  font-weight: 600;
  color: #656b76;
  margin: 0;
}
.flag-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #dfe2e7;
  background: #fff;
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #656b76;
  cursor: pointer;
}
.flag-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #dfe2e7;
}
.flag-toggle.active {
  border-color: #d8823a;
  color: #a9601f;
  background: #fbeddc;
}
.flag-toggle.active .flag-dot {
  background: #d8823a;
}

.question-text {
  font-size: 1.15rem;
  font-weight: 600;
  line-height: 1.55;
  margin: 0 0 20px;
}

.choice-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 22px;
}
.choice-row {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #dfe2e7;
  background: #fafbfc;
  border-radius: 10px;
  padding: 12px 16px;
  font-weight: 500;
  font-size: 0.96rem;
  text-align: left;
  cursor: pointer;
  color: #1a1d23;
}
.choice-row:hover {
  border-color: #0e9c86;
}
.choice-row.selected {
  border-color: #0e9c86;
  background: #d9f5f0;
}
.choice-tag {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #0e9c86;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Space Grotesk", sans-serif;
  font-size: 0.75rem;
  flex: 0 0 auto;
}

.answer-textarea {
  display: block;
  width: 100%;
  border: 1px solid #dfe2e7;
  border-radius: 10px;
  padding: 12px 14px;
  font-family: "Inter", sans-serif;
  font-size: 0.98rem;
  resize: vertical;
  outline: none;
  margin-bottom: 22px;
  box-sizing: border-box;
}
.answer-textarea:focus {
  border-color: #0e9c86;
}

.panel-nav {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.inline-error {
  margin-top: 14px;
  color: #c0392b;
  font-weight: 600;
}

.dash-panel {
  position: sticky;
  top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-card {
  background: #1a1d23;
  border-radius: 14px;
  padding: 16px 18px;
  color: #f2f3f5;
}
.stat-label {
  margin: 0 0 6px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #9aa0ab;
  text-transform: none;
}
.stat-value {
  margin: 0;
  font-family: "JetBrains Mono", monospace;
  font-weight: 600;
  font-size: 1.7rem;
  line-height: 1;
}
.stat-value.mono {
  letter-spacing: 0.5px;
}
.stat-unit {
  font-size: 1rem;
  color: #9aa0ab;
  margin-left: 2px;
}
.mini-bar {
  margin-top: 10px;
  height: 5px;
  border-radius: 999px;
  background: #2b2f38;
  overflow: hidden;
}
.mini-bar-fill {
  height: 100%;
  width: 0%;
  background: #33d6c0;
  transition: width 0.25s ease;
}

.stat-card.warning .stat-value {
  color: #f2b705;
}
.stat-card.critical {
  animation: pulse-critical 1s ease-in-out infinite;
}
.stat-card.critical .stat-value {
  color: #ff6b6b;
}
@keyframes pulse-critical {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.35);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(255, 107, 107, 0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .stat-card.critical {
    animation: none;
  }
}

.chip-row {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.chip {
  border: 1px solid #3a3f4a;
  background: #23262e;
  color: #f2f3f5;
  border-radius: 6px;
  width: 26px;
  height: 26px;
  font-family: "JetBrains Mono", monospace;
  font-size: 0.72rem;
  cursor: pointer;
}
.chip:hover {
  border-color: #d8823a;
}
.stat-empty {
  margin: 8px 0 0;
  font-size: 0.78rem;
  color: #6f7580;
}

.breakdown-card .breakdown-list {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.breakdown-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.82rem;
  color: #d5d8dd;
}
.breakdown-frac {
  color: #33d6c0;
  font-size: 0.8rem;
}

.grid-jump-toggle {
  border: 1px solid #dfe2e7;
  background: #fff;
  border-radius: 10px;
  padding: 10px 14px;
  font-family: "Space Grotesk", sans-serif;
  font-weight: 600;
  font-size: 0.82rem;
  color: #1a1d23;
  cursor: pointer;
}
.question-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
  background: #fff;
  border: 1px solid #e4e7eb;
  border-radius: 12px;
  padding: 12px;
}
.grid-cell {
  aspect-ratio: 1 / 1;
  border-radius: 6px;
  border: 1px solid #dfe2e7;
  background: #fafbfc;
  font-family: "JetBrains Mono", monospace;
  font-weight: 600;
  font-size: 0.76rem;
  color: #656b76;
  cursor: pointer;
}
.grid-cell.done {
  background: #0e9c86;
  border-color: #0e9c86;
  color: #fff;
}
.grid-cell.flagged {
  background: #fbeddc;
  border-color: #d8823a;
  color: #a9601f;
}
.grid-cell.current {
  outline: 2px solid #1a1d23;
  outline-offset: 1px;
}

@media (max-width: 780px) {
  .dash-layout {
    grid-template-columns: 1fr;
  }
  .dash-panel {
    position: static;
  }
  .question-panel {
    padding: 20px 18px;
  }
}
</style>
