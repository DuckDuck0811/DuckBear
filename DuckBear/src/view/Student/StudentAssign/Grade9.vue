<!--
  AssignmentPlayGrade9.vue
  Giao diện làm bài kiểu "Phòng thi mô phỏng" — dành riêng cho LỚP 9.
  Layout giống thi thật: đồng hồ đếm ngược nổi bật, lưới số câu hỏi bên phải,
  cho phép đánh dấu "cần xem lại" từng câu, nhảy tự do giữa các câu như phòng thi.
  Giữ nguyên logic nghiệp vụ (API, state, answerFor, submit) như file gốc.

  Tích hợp: copy vào src/views/Student/Assignment/styles/AssignmentPlayGrade9.vue
-->
<template>
  <div class="exam-shell">
    <!-- ================= LOADING ================= -->
    <div v-if="loading" class="state-screen">
      <div class="loading-spinner"></div>
      <p class="state-text">Đang chuẩn bị phòng thi...</p>
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

    <!-- ================= MAIN PLAY (PHÒNG THI) ================= -->
    <div v-else-if="detail" class="exam-screen">
      <header class="exam-header">
        <button class="back-link" @click="goBack">⬅ Danh sách</button>
        <h2 class="assignment-title">{{ detail.info.title }}</h2>
      </header>

      <div class="exam-layout">
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
              class="btn ghost"
              :disabled="currentIndex === detail.questions.length - 1"
              @click="goToIndex(currentIndex + 1)"
            >
              Câu sau
            </button>
          </div>

          <p v-if="errorMessage" class="inline-error">{{ errorMessage }}</p>
        </section>

        <!-- ===== Bảng điều khiển phòng thi ===== -->
        <aside class="exam-side">
          <div
            class="timer-card"
            :class="{ warning: timeWarning, critical: timeCritical }"
          >
            <p class="timer-label">Thời gian còn lại</p>
            <p class="timer-value">{{ formattedTime }}</p>
          </div>

          <div class="grid-card">
            <p class="grid-title">Bảng câu hỏi</p>
            <div class="question-grid">
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
            <ul class="grid-legend">
              <li><span class="dot done"></span> Đã làm</li>
              <li><span class="dot flagged"></span> Cần xem lại</li>
              <li><span class="dot"></span> Chưa làm</li>
            </ul>
          </div>

          <button
            class="btn primary submit-btn"
            :disabled="submitting"
            @click="confirmSubmit"
          >
            {{ submitting ? "Đang nộp..." : "Nộp bài" }}
          </button>
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

const letters = ["A", "B", "C", "D", "E", "F"];

// --- đồng hồ đếm ngược ---
const DEFAULT_DURATION_MINUTES = 45;
const remainingSeconds = ref(0);
let timerId = null;

const currentQuestion = computed(
  () => detail.value?.questions[currentIndex.value],
);

const tier = computed(() => {
  const score = result.value?.score ?? 0;
  if (score >= 8) return { emoji: "🥇", label: "Kết quả xuất sắc!" };
  if (score >= 5) return { emoji: "📝", label: "Đạt yêu cầu" };
  return { emoji: "🔁", label: "Cần ôn tập thêm" };
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

const answeredCount = computed(() => {
  if (!detail.value) return 0;
  return detail.value.questions.filter((q) => isAnswered(q)).length;
});

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
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@700;800&family=IBM+Plex+Sans:wght@400;500;600&display=swap");

.exam-shell {
  min-height: 100vh;
  background: #f4f5f7;
  font-family: "IBM Plex Sans", sans-serif;
  color: #1b2430;
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
  border: 4px solid #dbe3ef;
  border-top-color: #2b4c7e;
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
  font-family: "Manrope", sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
}
.state-subtext {
  color: #5b6472;
}

.result-screen {
  gap: 6px;
}
.tier-icon {
  font-size: 3.4rem;
}
.result-title {
  font-family: "Manrope", sans-serif;
  font-weight: 800;
  font-size: 1.5rem;
  margin: 4px 0;
}
.result-line {
  font-size: 1.05rem;
}
.result-score {
  font-weight: 700;
  color: #2b4c7e;
  margin-bottom: 10px;
}

.btn {
  border: none;
  border-radius: 8px;
  padding: 12px 22px;
  font-family: "Manrope", sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
}
.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.btn.primary {
  color: #fff;
  background: #2b4c7e;
}
.btn.primary:hover:not(:disabled) {
  background: #223e69;
}
.btn.ghost {
  color: #1b2430;
  background: #fff;
  border: 1px solid #dce1e8;
}
.btn.ghost:hover:not(:disabled) {
  border-color: #2b4c7e;
}

.exam-screen {
  max-width: 1040px;
  margin: 0 auto;
}

.exam-header {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.back-link {
  border: none;
  background: #fff;
  border-radius: 999px;
  padding: 8px 16px;
  font-family: "Manrope", sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  color: #1b2430;
}
.assignment-title {
  flex: 1;
  min-width: 160px;
  font-family: "Manrope", sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
}

.exam-layout {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 22px;
  align-items: start;
}

.question-panel {
  background: #fff;
  border-radius: 14px;
  padding: 26px 26px 22px;
  box-shadow: 0 6px 20px rgba(27, 36, 48, 0.06);
  border: 1px solid #e5e9ef;
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
  color: #5b6472;
  margin: 0;
}
.flag-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #dce1e8;
  background: #fff;
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #5b6472;
  cursor: pointer;
}
.flag-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #dce1e8;
}
.flag-toggle.active {
  border-color: #d98a2b;
  color: #a86419;
  background: #fbeedc;
}
.flag-toggle.active .flag-dot {
  background: #d98a2b;
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
  border: 1px solid #dce1e8;
  background: #fafbfc;
  border-radius: 10px;
  padding: 12px 16px;
  font-family: "IBM Plex Sans", sans-serif;
  font-weight: 500;
  font-size: 0.96rem;
  text-align: left;
  cursor: pointer;
  color: #1b2430;
}
.choice-row:hover {
  border-color: #2b4c7e;
}
.choice-row.selected {
  border-color: #2b4c7e;
  background: #e7edf6;
}
.choice-tag {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #2b4c7e;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Manrope", sans-serif;
  font-size: 0.75rem;
  flex: 0 0 auto;
}

.answer-textarea {
  display: block;
  width: 100%;
  border: 1px solid #dce1e8;
  border-radius: 10px;
  padding: 12px 14px;
  font-family: "IBM Plex Sans", sans-serif;
  font-size: 0.98rem;
  resize: vertical;
  outline: none;
  margin-bottom: 22px;
  box-sizing: border-box;
}
.answer-textarea:focus {
  border-color: #2b4c7e;
}

.panel-nav {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.inline-error {
  margin-top: 14px;
  color: #c23b3b;
  font-weight: 600;
}

.exam-side {
  position: sticky;
  top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timer-card {
  background: #1b2430;
  border-radius: 14px;
  padding: 16px 18px;
  text-align: center;
}
.timer-label {
  margin: 0 0 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #aab4c4;
}
.timer-value {
  margin: 0;
  font-family: "Manrope", sans-serif;
  font-weight: 800;
  font-size: 1.9rem;
  color: #fff;
  letter-spacing: 1px;
}
.timer-card.warning .timer-value {
  color: #f0b429;
}
.timer-card.critical {
  animation: pulse-critical 1s ease-in-out infinite;
}
.timer-card.critical .timer-value {
  color: #ff6b6b;
}
@keyframes pulse-critical {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.4);
  }
  50% {
    box-shadow: 0 0 0 8px rgba(255, 107, 107, 0);
  }
}
@media (prefers-reduced-motion: reduce) {
  .timer-card.critical {
    animation: none;
  }
}

.grid-card {
  background: #fff;
  border: 1px solid #e5e9ef;
  border-radius: 14px;
  padding: 16px;
}
.grid-title {
  margin: 0 0 12px;
  font-family: "Manrope", sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  color: #1b2430;
}
.question-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 14px;
}
.grid-cell {
  aspect-ratio: 1 / 1;
  border-radius: 8px;
  border: 1px solid #dce1e8;
  background: #fafbfc;
  font-family: "Manrope", sans-serif;
  font-weight: 700;
  font-size: 0.82rem;
  color: #5b6472;
  cursor: pointer;
}
.grid-cell:hover {
  border-color: #2b4c7e;
}
.grid-cell.done {
  background: #2f9e63;
  border-color: #2f9e63;
  color: #fff;
}
.grid-cell.flagged {
  background: #fbeedc;
  border-color: #d98a2b;
  color: #a86419;
}
.grid-cell.current {
  outline: 2px solid #2b4c7e;
  outline-offset: 2px;
}

.grid-legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.78rem;
  color: #5b6472;
}
.grid-legend li {
  display: flex;
  align-items: center;
  gap: 8px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #dce1e8;
  display: inline-block;
}
.dot.done {
  background: #2f9e63;
}
.dot.flagged {
  background: #d98a2b;
}

.submit-btn {
  width: 100%;
}

@media (max-width: 760px) {
  .exam-layout {
    grid-template-columns: 1fr;
  }
  .exam-side {
    position: static;
  }
  .question-grid {
    grid-template-columns: repeat(8, 1fr);
  }
  .question-panel {
    padding: 20px 18px;
  }
}
</style>
