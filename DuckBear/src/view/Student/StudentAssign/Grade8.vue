<!--
  AssignmentPlayGrade8.vue
  Giao diện làm bài kiểu "Dòng thời gian bài học" (timeline dọc) — dành riêng cho LỚP 8.
  Câu hỏi được xếp theo thứ tự bài học/chương trên một trục thời gian dọc,
  học sinh nhấp vào từng mốc để làm và nhìn thấy tiến trình kiến thức của mình.
  Giữ nguyên logic nghiệp vụ (API, state, answerFor, submit) như file gốc lớp 7.

  Tích hợp: copy vào src/views/Student/Assignment/styles/AssignmentPlayGrade8.vue
-->
<template>
  <div class="timeline-shell">
    <!-- ================= LOADING ================= -->
    <div v-if="loading" class="state-screen">
      <div class="loading-spinner"></div>
      <p class="state-text">Đang dựng dòng thời gian bài học...</p>
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

    <!-- ================= MAIN PLAY ================= -->
    <div v-else-if="detail" class="play-screen">
      <header class="top-bar">
        <button class="back-link" @click="goBack">⬅ Danh sách</button>
        <h2 class="assignment-title">{{ detail.info.title }}</h2>
        <div class="progress-pill">
          <span
            class="progress-fill"
            :style="{ width: progressPercent + '%' }"
          ></span>
          <span class="progress-label"
            >{{ answeredCount }}/{{ detail.questions.length }} câu</span
          >
        </div>
      </header>

      <div class="timeline-layout">
        <!-- ===== Trục thời gian ===== -->
        <nav class="timeline-track" aria-label="Dòng thời gian bài học">
          <div
            v-for="(group, gIdx) in timelineGroups"
            :key="'group-' + gIdx"
            class="timeline-group"
          >
            <p class="chapter-label">{{ group.label }}</p>
            <div class="timeline-spine">
              <button
                v-for="item in group.items"
                :key="item.question.id"
                type="button"
                class="timeline-node"
                :class="{
                  current: item.index === currentIndex,
                  done: isAnswered(item.question),
                }"
                @click="goToIndex(item.index)"
              >
                <span class="node-dot">
                  <span v-if="isAnswered(item.question)">✓</span>
                  <span v-else>{{ item.index + 1 }}</span>
                </span>
                <span class="node-caption">Câu {{ item.index + 1 }}</span>
              </button>
            </div>
          </div>
        </nav>

        <!-- ===== Câu hỏi hiện tại ===== -->
        <section class="question-panel">
          <p class="panel-eyebrow">{{ currentGroupLabel }}</p>
          <p class="question-count">
            Câu {{ currentIndex + 1 }} / {{ detail.questions.length }}
          </p>
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
            rows="4"
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
              class="btn primary"
              @click="goToIndex(currentIndex + 1)"
            >
              Câu tiếp theo
            </button>
            <button
              v-else
              class="btn primary"
              :disabled="submitting"
              @click="submit"
            >
              {{ submitting ? "Đang nộp..." : "Nộp bài" }}
            </button>
          </div>

          <p v-if="errorMessage" class="inline-error">{{ errorMessage }}</p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
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
const currentIndex = ref(0);

const letters = ["A", "B", "C", "D", "E", "F"];

const currentQuestion = computed(
  () => detail.value?.questions[currentIndex.value],
);

const tier = computed(() => {
  const score = result.value?.score ?? 0;
  if (score >= 8) return { emoji: "🏆", label: "Nắm chắc kiến thức!" };
  if (score >= 5) return { emoji: "📈", label: "Tiến bộ rõ rệt!" };
  return { emoji: "🧭", label: "Cần ôn lại thêm" };
});

// Gom câu hỏi liên tiếp cùng bài học/chương thành một chặng trên dòng thời gian.
// Nếu API chưa trả kèm thông tin bài học/chương cho từng câu, mỗi câu sẽ tự
// đứng thành một mốc dưới nhãn mặc định.
function chapterLabelOf(question) {
  return (
    question.lesson?.title ||
    question.chapterTitle ||
    question.lessonTitle ||
    "Nội dung bài học"
  );
}

const timelineGroups = computed(() => {
  if (!detail.value) return [];
  const groups = [];
  detail.value.questions.forEach((question, index) => {
    const label = chapterLabelOf(question);
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.items.push({ question, index });
    } else {
      groups.push({ label, items: [{ question, index }] });
    }
  });
  return groups;
});

const currentGroupLabel = computed(() => {
  if (!detail.value) return "";
  return chapterLabelOf(detail.value.questions[currentIndex.value]);
});

const answeredCount = computed(() => {
  if (!detail.value) return 0;
  return detail.value.questions.filter((q) => isAnswered(q)).length;
});

const progressPercent = computed(() => {
  if (!detail.value || detail.value.questions.length === 0) return 0;
  return Math.round(
    (answeredCount.value / detail.value.questions.length) * 100,
  );
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

function goToIndex(index) {
  if (!detail.value) return;
  if (index < 0 || index > detail.value.questions.length - 1) return;
  currentIndex.value = index;
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
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || "Không thể mở bài tập";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Work+Sans:wght@400;500;600;700&display=swap");

.timeline-shell {
  min-height: 100vh;
  background: #eff3ec;
  font-family: "Work Sans", sans-serif;
  color: #16241d;
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
  border: 4px solid #dcefe8;
  border-top-color: #1f6f5c;
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
  font-family: "Sora", sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
}
.state-subtext {
  color: #4b5b52;
}

.result-screen {
  gap: 6px;
}
.tier-icon {
  font-size: 3.4rem;
}
.result-title {
  font-family: "Sora", sans-serif;
  font-weight: 800;
  font-size: 1.5rem;
  margin: 4px 0;
}
.result-line {
  font-size: 1.05rem;
}
.result-score {
  font-weight: 700;
  color: #1f6f5c;
  margin-bottom: 10px;
}

.btn {
  border: none;
  border-radius: 10px;
  padding: 12px 22px;
  font-family: "Sora", sans-serif;
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
  background: #1f6f5c;
}
.btn.primary:hover:not(:disabled) {
  background: #185a4a;
}
.btn.ghost {
  color: #16241d;
  background: #fff;
  border: 1px solid #d8e2da;
}
.btn.ghost:hover:not(:disabled) {
  border-color: #1f6f5c;
}

.play-screen {
  max-width: 980px;
  margin: 0 auto;
}

.top-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 22px;
}
.back-link {
  border: none;
  background: #fff;
  border-radius: 999px;
  padding: 8px 16px;
  font-family: "Sora", sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  color: #16241d;
}
.assignment-title {
  flex: 1;
  min-width: 160px;
  font-family: "Sora", sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
}
.progress-pill {
  position: relative;
  width: 160px;
  height: 30px;
  border-radius: 999px;
  background: #fff;
  overflow: hidden;
  flex: 0 0 auto;
}
.progress-fill {
  position: absolute;
  inset: 0;
  width: 0%;
  background: #dcefe8;
  transition: width 0.25s ease;
}
.progress-label {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  font-size: 0.78rem;
  font-weight: 600;
  color: #16241d;
}

.timeline-layout {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 24px;
  align-items: start;
}

.timeline-track {
  position: sticky;
  top: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.chapter-label {
  font-family: "Sora", sans-serif;
  font-weight: 700;
  font-size: 0.82rem;
  color: #4b5b52;
  margin: 0 0 10px 2px;
}
.timeline-spine {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 4px;
}
.timeline-spine::before {
  content: "";
  position: absolute;
  left: 15px;
  top: 18px;
  bottom: 18px;
  width: 2px;
  background: #d8e2da;
}
.timeline-node {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  border: none;
  background: transparent;
  padding: 6px 4px;
  cursor: pointer;
  text-align: left;
}
.node-dot {
  position: relative;
  z-index: 1;
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #fff;
  border: 2px solid #d8e2da;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Sora", sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  color: #4b5b52;
}
.timeline-node.done .node-dot {
  background: #e3a857;
  border-color: #e3a857;
  color: #fff;
}
.timeline-node.current .node-dot {
  border-color: #1f6f5c;
  color: #1f6f5c;
  box-shadow: 0 0 0 4px #dcefe8;
}
.timeline-node.current.done .node-dot {
  background: #1f6f5c;
  border-color: #1f6f5c;
  color: #fff;
  box-shadow: 0 0 0 4px #dcefe8;
}
.node-caption {
  font-size: 0.85rem;
  font-weight: 600;
  color: #4b5b52;
}
.timeline-node.current .node-caption {
  color: #16241d;
}

.question-panel {
  background: #fff;
  border-radius: 18px;
  padding: 28px 26px;
  box-shadow: 0 8px 24px rgba(22, 36, 29, 0.08);
}
.panel-eyebrow {
  font-family: "Sora", sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  color: #1f6f5c;
  margin: 0 0 4px;
}
.question-count {
  font-size: 0.8rem;
  color: #4b5b52;
  margin: 0 0 14px;
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
  border: 1px solid #d8e2da;
  background: #fafaf6;
  border-radius: 12px;
  padding: 12px 16px;
  font-family: "Work Sans", sans-serif;
  font-weight: 500;
  font-size: 0.96rem;
  text-align: left;
  cursor: pointer;
  color: #16241d;
}
.choice-row:hover {
  border-color: #1f6f5c;
}
.choice-row.selected {
  border-color: #1f6f5c;
  background: #dcefe8;
}
.choice-tag {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #1f6f5c;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Sora", sans-serif;
  font-size: 0.75rem;
  flex: 0 0 auto;
}

.answer-textarea {
  display: block;
  width: 100%;
  border: 1px solid #d8e2da;
  border-radius: 12px;
  padding: 12px 14px;
  font-family: "Work Sans", sans-serif;
  font-size: 0.98rem;
  resize: vertical;
  outline: none;
  margin-bottom: 22px;
  box-sizing: border-box;
}
.answer-textarea:focus {
  border-color: #1f6f5c;
}

.panel-nav {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.inline-error {
  margin-top: 14px;
  color: #c0392b;
  font-weight: 600;
}

@media (max-width: 760px) {
  .timeline-layout {
    grid-template-columns: 1fr;
  }
  .timeline-track {
    position: static;
    flex-direction: row;
    overflow-x: auto;
    gap: 24px;
    padding-bottom: 8px;
  }
  .timeline-group {
    flex: 0 0 auto;
  }
  .timeline-spine {
    flex-direction: row;
  }
  .timeline-spine::before {
    left: 18px;
    right: 18px;
    top: 15px;
    bottom: auto;
    width: auto;
    height: 2px;
  }
  .timeline-node {
    flex-direction: column;
    gap: 4px;
  }
  .node-caption {
    font-size: 0.72rem;
  }
  .question-panel {
    padding: 22px 18px;
  }
}
</style>
