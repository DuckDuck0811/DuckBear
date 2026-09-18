<!--
  AssignmentPlayGrade7.vue
  Giao diện làm bài kiểu "Thẻ vuốt từng câu" (kiểu Tinder/Stories) — dành riêng cho LỚP 7.
  Kéo thẻ sang trái/phải để chuyển câu, có story-bar phân đoạn ở trên.
  Giữ nguyên logic nghiệp vụ như file gốc.

  Tích hợp: copy vào src/views/Student/Assignment/styles/AssignmentPlayGrade7.vue
-->
<template>
  <div class="swipe-shell">
    <!-- ================= LOADING ================= -->
    <div v-if="loading" class="state-screen">
      <div class="loading-ring"></div>
      <p class="state-text">Đang tải bộ thẻ câu hỏi...</p>
    </div>

    <!-- ================= ERROR ================= -->
    <div v-else-if="errorMessage && !detail && !result" class="state-screen">
      <p class="state-text">Không thể mở bài tập</p>
      <p class="state-subtext">{{ errorMessage }}</p>
      <button class="btn gradient" @click="goBack">Quay về danh sách</button>
    </div>

    <!-- ================= RESULT ================= -->
    <div v-else-if="result" class="state-screen result-screen">
      <div class="tier-emoji">{{ tier.emoji }}</div>
      <h1 class="result-title">{{ tier.label }}</h1>
      <p class="result-line">
        Đúng <strong>{{ result.correctCount }}</strong> /
        {{ result.totalQuestions }} câu
      </p>
      <p v-if="result.score !== null" class="result-score">
        Điểm: {{ result.score }}/10
      </p>
      <button class="btn gradient" @click="goBack">Về danh sách bài tập</button>
    </div>

    <!-- ================= MAIN PLAY ================= -->
    <div v-else-if="detail" class="play-screen">
      <div class="top-row">
        <button class="back-link" @click="goBack">⬅</button>
        <h2 class="assignment-title">{{ detail.info.title }}</h2>
        <span class="counter"
          >{{ currentIndex + 1 }}/{{ detail.questions.length }}</span
        >
      </div>

      <!-- Story bar -->
      <div class="story-bar">
        <span
          v-for="(q, i) in detail.questions"
          :key="q.id"
          class="story-seg"
          :class="{
            filled: i < currentIndex || isAnswered(q),
            current: i === currentIndex,
          }"
        ></span>
      </div>

      <!-- Sân khấu thẻ vuốt -->
      <div class="card-stage">
        <div class="card-peek"></div>
        <div
          class="swipe-card"
          :class="exitDirection"
          :style="dragStyle"
          @pointerdown="onPointerDown"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerUp"
        >
          <div class="card-ring">
            <div class="card-badge">Câu {{ currentIndex + 1 }}</div>
            <p class="card-question">{{ currentQuestion.content }}</p>

            <div v-if="currentQuestion.options?.length" class="choice-list">
              <button
                v-for="(option, idx) in currentQuestion.options"
                :key="option.id"
                class="choice-row"
                :class="{
                  selected:
                    answerFor(currentQuestion).selectedOptionId === option.id,
                }"
                @pointerdown.stop
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
              rows="3"
              placeholder="Nhập câu trả lời..."
              @pointerdown.stop
            />
          </div>
        </div>
      </div>

      <div class="nav-row">
        <button
          class="round-btn"
          :disabled="currentIndex === 0"
          @click="prevCard"
        >
          ✕
        </button>
        <button
          v-if="currentIndex < detail.questions.length - 1"
          class="round-btn accent"
          @click="nextCard"
        >
          ➜
        </button>
        <button
          v-else
          class="btn gradient submit-btn"
          :disabled="submitting"
          @click="submit"
        >
          {{ submitting ? "Đang nộp..." : "Nộp bài" }}
        </button>
      </div>

      <p v-if="errorMessage" class="inline-error">{{ errorMessage }}</p>
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

// --- kéo thẻ ---
const dragging = ref(false);
const dragX = ref(0);
const startX = ref(0);
const exitDirection = ref(""); // "" | "exit-left" | "exit-right"
const SWIPE_THRESHOLD = 90;

const currentQuestion = computed(
  () => detail.value?.questions[currentIndex.value],
);

const dragStyle = computed(() => {
  if (!dragging.value) return {};
  const rotate = dragX.value / 18;
  return {
    transform: `translateX(${dragX.value}px) rotate(${rotate}deg)`,
    transition: "none",
  };
});

const tier = computed(() => {
  const score = result.value?.score ?? 0;
  if (score >= 8) return { emoji: "🏅", label: "Học sinh xuất sắc!" };
  if (score >= 5) return { emoji: "🔥", label: "Đang bứt phá tốt!" };
  return { emoji: "🌱", label: "Cần luyện tập thêm" };
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

function onPointerDown(e) {
  dragging.value = true;
  startX.value = e.clientX;
  dragX.value = 0;
  e.currentTarget.setPointerCapture?.(e.pointerId);
}
function onPointerMove(e) {
  if (!dragging.value) return;
  dragX.value = e.clientX - startX.value;
}
function onPointerUp() {
  if (!dragging.value) return;
  dragging.value = false;
  if (dragX.value > SWIPE_THRESHOLD && currentIndex.value > 0) {
    animateExit("exit-right", () => currentIndex.value--);
  } else if (
    dragX.value < -SWIPE_THRESHOLD &&
    currentIndex.value < detail.value.questions.length - 1
  ) {
    animateExit("exit-left", () => currentIndex.value++);
  } else {
    dragX.value = 0;
  }
}

function animateExit(direction, after) {
  exitDirection.value = direction;
  setTimeout(() => {
    after();
    exitDirection.value = "";
    dragX.value = 0;
  }, 220);
}

function nextCard() {
  if (currentIndex.value < detail.value.questions.length - 1) {
    animateExit("exit-left", () => currentIndex.value++);
  }
}
function prevCard() {
  if (currentIndex.value > 0) {
    animateExit("exit-right", () => currentIndex.value--);
  }
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
@import url("https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap");

.swipe-shell {
  min-height: 100vh;
  background: linear-gradient(160deg, #fdeff9 0%, #eaf3ff 100%);
  font-family: "DM Sans", sans-serif;
  color: #241f3d;
  padding: 20px 16px 40px;
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
.loading-ring {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 4px solid #f0dbef;
  border-top-color: #ff5f9e;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .loading-ring {
    animation: none;
  }
}
.state-text {
  font-family: "Poppins", sans-serif;
  font-weight: 700;
  font-size: 1.1rem;
}
.state-subtext {
  color: #6b6484;
}

.result-screen {
  gap: 6px;
}
.tier-emoji {
  font-size: 3.6rem;
}
.result-title {
  font-family: "Poppins", sans-serif;
  font-weight: 800;
  font-size: 1.5rem;
  margin: 4px 0;
}
.result-line {
  font-size: 1.05rem;
}
.result-score {
  font-weight: 700;
  color: #ff5f9e;
  margin-bottom: 10px;
}

.btn.gradient {
  border: none;
  border-radius: 999px;
  padding: 12px 26px;
  font-family: "Poppins", sans-serif;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(120deg, #ff5f9e, #a06bff);
  cursor: pointer;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.play-screen {
  max-width: 480px;
  margin: 0 auto;
}
.top-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.back-link {
  border: none;
  background: #fff;
  border-radius: 50%;
  width: 34px;
  height: 34px;
  cursor: pointer;
  font-weight: 700;
}
.assignment-title {
  flex: 1;
  font-family: "Poppins", sans-serif;
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
}
.counter {
  font-size: 0.85rem;
  color: #6b6484;
  font-weight: 600;
}

.story-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 20px;
}
.story-seg {
  flex: 1;
  height: 4px;
  border-radius: 999px;
  background: #eadff0;
}
.story-seg.filled {
  background: #ff5f9e;
}
.story-seg.current {
  background: linear-gradient(90deg, #ff5f9e, #a06bff);
}

.card-stage {
  position: relative;
  min-height: 400px;
  margin-bottom: 16px;
}
.card-peek {
  position: absolute;
  inset: 10px 6px 0 6px;
  background: #fff;
  border-radius: 26px;
  opacity: 0.6;
  transform: scale(0.96);
}
.swipe-card {
  position: relative;
  touch-action: pan-y;
  cursor: grab;
  transition:
    transform 0.22s ease,
    opacity 0.22s ease;
}
.swipe-card.exit-left {
  transform: translateX(-260px) rotate(-14deg);
  opacity: 0;
}
.swipe-card.exit-right {
  transform: translateX(260px) rotate(14deg);
  opacity: 0;
}

.card-ring {
  padding: 3px;
  border-radius: 28px;
  background: linear-gradient(135deg, #ff5f9e, #ffb35f, #a06bff);
}
.card-ring {
  background-clip: padding-box;
}
.card-badge,
.card-question,
.choice-list,
.answer-textarea {
  position: relative;
}
.card-ring::after {
  content: "";
}
.card-ring {
  display: block;
}
.card-ring > .card-badge {
  margin-top: 4px;
}
.card-ring {
  box-shadow: 0 10px 30px rgba(160, 107, 255, 0.18);
}

.card-ring {
  background: linear-gradient(135deg, #ff5f9e, #ffb35f, #a06bff);
}
.card-ring {
  padding: 3px;
}
.card-ring {
  border-radius: 28px;
}

.card-ring {
  position: relative;
}
.card-ring::before {
  content: "";
  position: absolute;
  inset: 3px;
  background: #ffffff;
  border-radius: 25px;
  z-index: 0;
}
.card-badge,
.card-question,
.choice-list,
.answer-textarea {
  z-index: 1;
}

.card-badge {
  display: inline-block;
  margin: 20px 0 0 20px;
  background: #fff0f7;
  color: #d1367e;
  font-family: "Poppins", sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 14px;
  border-radius: 999px;
}
.card-question {
  font-size: 1.15rem;
  font-weight: 700;
  line-height: 1.5;
  margin: 12px 20px 16px;
}
.choice-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0 18px 18px;
}
.choice-row {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 2px solid #f3e6f7;
  background: #fffafd;
  border-radius: 14px;
  padding: 11px 14px;
  font-family: "DM Sans", sans-serif;
  font-weight: 600;
  font-size: 0.96rem;
  text-align: left;
  cursor: pointer;
  color: #241f3d;
}
.choice-row.selected {
  border-color: #ff5f9e;
  background: #fff0f7;
}
.choice-tag {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #a06bff;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Poppins", sans-serif;
  font-size: 0.72rem;
  flex: 0 0 auto;
}
.answer-textarea {
  display: block;
  width: calc(100% - 36px);
  margin: 0 18px 18px;
  border: 2px solid #f3e6f7;
  border-radius: 14px;
  padding: 10px 12px;
  font-family: "DM Sans", sans-serif;
  font-size: 0.98rem;
  resize: vertical;
  outline: none;
}
.answer-textarea:focus {
  border-color: #ff5f9e;
}

.nav-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
}
.round-btn {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: #fff;
  box-shadow: 0 4px 14px rgba(36, 31, 61, 0.12);
  font-size: 1.2rem;
  cursor: pointer;
  color: #6b6484;
}
.round-btn.accent {
  background: linear-gradient(120deg, #ff5f9e, #a06bff);
  color: #fff;
}
.round-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.submit-btn {
  flex: 1;
  max-width: 260px;
}

.inline-error {
  margin-top: 14px;
  color: #dc2626;
  font-weight: 600;
  text-align: center;
}
</style>
