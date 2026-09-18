<!--
  AssignmentPlayGrade6.vue
  Giao diện làm bài kiểu "Danh sách cuộn + sidebar điều hướng" — dành riêng cho LỚP 6.
  Khác tiểu học: hiện TẤT CẢ câu hỏi trên 1 trang dài, sidebar để nhảy nhanh tới từng câu.
  Giữ nguyên logic nghiệp vụ như file gốc.

  Tích hợp: copy vào src/views/Student/Assignment/styles/AssignmentPlayGrade6.vue
-->
<template>
  <div class="app-shell">
    <!-- ================= LOADING ================= -->
    <div v-if="loading" class="state-screen">
      <v-progress-circular indeterminate color="#4F46E5" size="36" />
      <p class="state-text">Đang tải bài tập...</p>
    </div>

    <!-- ================= ERROR ================= -->
    <div v-else-if="errorMessage && !detail && !result" class="state-screen">
      <p class="state-text">Không thể mở bài tập</p>
      <p class="state-subtext">{{ errorMessage }}</p>
      <button class="btn primary" @click="goBack">Quay về danh sách</button>
    </div>

    <!-- ================= RESULT ================= -->
    <div v-else-if="result" class="state-screen result-screen">
      <svg class="score-ring" viewBox="0 0 120 120">
        <circle class="ring-bg" cx="60" cy="60" r="52" />
        <circle
          class="ring-fill"
          cx="60"
          cy="60"
          r="52"
          :style="{ strokeDashoffset: ringOffset }"
        />
        <text x="60" y="58" class="ring-score">
          {{ result.correctCount }}/{{ result.totalQuestions }}
        </text>
        <text x="60" y="76" class="ring-label">câu đúng</text>
      </svg>
      <h1 class="result-title">Đã nộp bài</h1>
      <p v-if="result.score !== null" class="result-score">
        Điểm: {{ result.score }}/10
      </p>
      <button class="btn primary" @click="goBack">Về danh sách bài tập</button>
    </div>

    <!-- ================= MAIN PLAY ================= -->
    <div v-else-if="detail" class="play-layout">
      <!-- Sidebar (desktop) / chip strip (mobile) -->
      <aside class="sidebar">
        <button class="back-link" @click="goBack">⬅ Danh sách bài</button>
        <h2 class="sidebar-title">{{ detail.info.title }}</h2>
        <p class="sidebar-meta">
          {{ detail.info.totalQuestions }} câu
          <span v-if="detail.info.timeLimit">
            · Thời gian gợi ý: {{ detail.info.timeLimit }} phút</span
          >
        </p>
        <div class="overall-progress">
          <div class="progress-track">
            <div
              class="progress-fill"
              :style="{ width: progressPct + '%' }"
            ></div>
          </div>
          <span class="progress-label"
            >{{ answeredCount }}/{{ detail.questions.length }} đã làm</span
          >
        </div>

        <nav class="question-nav" aria-label="Điều hướng câu hỏi">
          <button
            v-for="(q, i) in detail.questions"
            :key="q.id"
            class="nav-chip"
            :class="{ done: isAnswered(q), active: i === activeIndex }"
            @click="scrollToQuestion(i)"
          >
            {{ i + 1 }}
          </button>
        </nav>

        <button
          class="btn primary submit-btn"
          :disabled="submitting"
          @click="submit"
        >
          {{ submitting ? "Đang nộp..." : "Nộp bài" }}
        </button>
        <p v-if="errorMessage" class="inline-error">{{ errorMessage }}</p>
      </aside>

      <!-- Danh sách câu hỏi cuộn dài -->
      <main class="question-list">
        <article
          v-for="(question, index) in detail.questions"
          :key="question.id"
          :ref="(el) => setQuestionRef(el, index)"
          class="question-card"
          :class="{ answered: isAnswered(question) }"
        >
          <div class="question-head">
            <span class="question-index">Câu {{ index + 1 }}</span>
            <span v-if="isAnswered(question)" class="answered-tag"
              >✓ Đã trả lời</span
            >
          </div>
          <p class="question-content">{{ question.content }}</p>

          <div v-if="question.options?.length" class="option-list">
            <button
              v-for="option in question.options"
              :key="option.id"
              class="option-row"
              :class="{
                selected: answerFor(question).selectedOptionId === option.id,
              }"
              @click="selectOption(question, option.id)"
            >
              <span class="option-dot"></span>
              <span>{{ option.content }}</span>
            </button>
          </div>

          <textarea
            v-else
            v-model="answerFor(question).answerText"
            class="answer-textarea"
            rows="3"
            placeholder="Nhập câu trả lời..."
          />
        </article>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getAssignmentDetailApi } from "@/api/assignment";
import { startSubmissionApi, submitSubmissionApi } from "@/api/submission";

const route = useRoute();
const router = useRouter();

const detail = ref(null);
const submission = ref(null);
const result = ref(null);
const answers = reactive({});
const loading = ref(true);
const submitting = ref(false);
const errorMessage = ref("");
const activeIndex = ref(0);

const questionEls = [];
let observer = null;

const RING_CIRCUMFERENCE = 2 * Math.PI * 52;

const answeredCount = computed(() =>
  detail.value ? detail.value.questions.filter((q) => isAnswered(q)).length : 0,
);
const progressPct = computed(() => {
  const total = detail.value?.questions.length || 1;
  return Math.round((answeredCount.value / total) * 100);
});
const ringOffset = computed(() => {
  const total = result.value?.totalQuestions || 1;
  const correct = result.value?.correctCount || 0;
  const pct = correct / total;
  return RING_CIRCUMFERENCE * (1 - pct);
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

function setQuestionRef(el, index) {
  if (el) questionEls[index] = el;
}

function scrollToQuestion(i) {
  questionEls[i]?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function setupScrollSpy() {
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) {
        const idx = questionEls.indexOf(visible.target);
        if (idx !== -1) activeIndex.value = idx;
      }
    },
    { threshold: [0.4, 0.6], rootMargin: "-20% 0px -40% 0px" },
  );
  questionEls.forEach((el) => el && observer.observe(el));
}

function goBack() {
  router.push({ name: "student-dashboard" });
}

async function submit() {
  submitting.value = true;
  errorMessage.value = "";
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
    await new Promise((r) => setTimeout(r, 0)); // đợi DOM render xong các question-card
    setupScrollSpy();
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Không thể mở bài tập";
  } finally {
    loading.value = false;
  }
});

onBeforeUnmount(() => observer?.disconnect());
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@400;500;600&display=swap");

.app-shell {
  min-height: 100vh;
  background: #f5f7fa;
  font-family: "Inter", sans-serif;
  color: #1e293b;
}

.state-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
  padding: 24px;
}
.state-text {
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
}
.state-subtext {
  color: #64748b;
}

.result-screen {
  gap: 8px;
}
.score-ring {
  width: 140px;
  height: 140px;
}
.ring-bg {
  fill: none;
  stroke: #e2e8f0;
  stroke-width: 10;
}
.ring-fill {
  fill: none;
  stroke: #4f46e5;
  stroke-width: 10;
  stroke-linecap: round;
  stroke-dasharray: 326.7;
  transform: rotate(-90deg);
  transform-origin: 60px 60px;
  transition: stroke-dashoffset 0.6s ease;
}
.ring-score {
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 18px;
  font-weight: 800;
  fill: #1e293b;
  text-anchor: middle;
}
.ring-label {
  font-size: 10px;
  fill: #64748b;
  text-anchor: middle;
}
.result-title {
  font-family: "Plus Jakarta Sans", sans-serif;
  font-weight: 800;
  font-size: 1.4rem;
  margin: 6px 0 0;
}
.result-score {
  color: #4f46e5;
  font-weight: 700;
  margin-bottom: 8px;
}

.btn {
  border: none;
  border-radius: 10px;
  padding: 12px 22px;
  font-family: "Plus Jakarta Sans", sans-serif;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn.primary {
  background: #4f46e5;
  color: #fff;
}

/* ---------- layout ---------- */
.play-layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 24px;
  max-width: 1080px;
  margin: 0 auto;
  padding: 24px 16px 60px;
  align-items: start;
}
@media (max-width: 860px) {
  .play-layout {
    grid-template-columns: 1fr;
  }
}

/* ---------- sidebar ---------- */
.sidebar {
  position: sticky;
  top: 16px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
@media (max-width: 860px) {
  .sidebar {
    position: static;
  }
}
.back-link {
  align-self: flex-start;
  border: none;
  background: none;
  color: #4f46e5;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
}
.sidebar-title {
  font-family: "Plus Jakarta Sans", sans-serif;
  font-size: 1.1rem;
  margin: 0;
}
.sidebar-meta {
  color: #64748b;
  font-size: 0.85rem;
  margin: -6px 0 0;
}

.overall-progress {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.progress-track {
  height: 8px;
  background: #e2e8f0;
  border-radius: 999px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  background: #0ea5a4;
  transition: width 0.3s ease;
}
.progress-label {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 600;
}

.question-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.nav-chip {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  font-weight: 700;
  font-size: 0.8rem;
  cursor: pointer;
  color: #475569;
}
.nav-chip.done {
  background: #e6fbf6;
  border-color: #0ea5a4;
  color: #0ea5a4;
}
.nav-chip.active {
  background: #f59e0b;
  border-color: #f59e0b;
  color: #fff;
}

.submit-btn {
  width: 100%;
  margin-top: 4px;
}
.inline-error {
  color: #dc2626;
  font-size: 0.85rem;
  font-weight: 600;
}

/* ---------- question list ---------- */
.question-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.question-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 20px;
  scroll-margin-top: 20px;
}
.question-card.answered {
  border-color: #0ea5a4;
}
.question-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.question-index {
  font-family: "Plus Jakarta Sans", sans-serif;
  font-weight: 700;
  color: #4f46e5;
}
.answered-tag {
  font-size: 0.78rem;
  color: #0ea5a4;
  font-weight: 700;
}
.question-content {
  font-size: 1.05rem;
  line-height: 1.55;
  margin: 0 0 14px;
}

.option-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.option-row {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  border-radius: 10px;
  padding: 10px 14px;
  text-align: left;
  cursor: pointer;
  font-size: 0.98rem;
  color: #1e293b;
}
.option-row.selected {
  border-color: #4f46e5;
  background: #eef2ff;
}
.option-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  flex: 0 0 auto;
}
.option-row.selected .option-dot {
  border-color: #4f46e5;
  background: #4f46e5;
}

.answer-textarea {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
  font-family: "Inter", sans-serif;
  font-size: 0.98rem;
  resize: vertical;
  outline: none;
}
.answer-textarea:focus {
  border-color: #4f46e5;
}
</style>
