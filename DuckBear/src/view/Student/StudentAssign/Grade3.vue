<!--
  AssignmentPlayGrade3.vue
  Giao diện làm bài kiểu "Xưởng ghép Robot" — dành riêng cho học sinh LỚP 3.
  Mỗi câu trả lời xong = 1 mảnh ghép được lắp vào bảng, hoàn thành bài = robot lắp xong.
  Giữ nguyên logic nghiệp vụ như file gốc.

  Tích hợp: copy vào src/views/Student/Assignment/styles/AssignmentPlayGrade3.vue
-->
<template>
  <div class="workshop-shell">
    <!-- ================= LOADING ================= -->
    <div v-if="loading" class="state-screen">
      <div class="gear-spin">⚙️</div>
      <p class="state-text">Xưởng đang khởi động cho bé...</p>
    </div>

    <!-- ================= ERROR ================= -->
    <div v-else-if="errorMessage && !detail && !result" class="state-screen">
      <div class="state-emoji">🔧</div>
      <p class="state-text">Máy móc gặp trục trặc rồi!</p>
      <p class="state-subtext">{{ errorMessage }}</p>
      <button class="pill-btn orange" @click="goBack">Quay về danh sách</button>
    </div>

    <!-- ================= RESULT ================= -->
    <div v-else-if="result" class="state-screen result-screen">
      <div class="robot-big">🤖</div>
      <h1 class="result-title">Robot đã lắp ráp xong!</h1>
      <p class="rank-badge">{{ rank.label }}</p>
      <p class="result-line">
        Ghép đúng <strong>{{ result.correctCount }}</strong> /
        {{ result.totalQuestions }} mảnh
      </p>
      <p v-if="result.score !== null" class="result-score">
        Điểm: {{ result.score }}/10
      </p>
      <button class="pill-btn orange big" @click="goBack">
        Về danh sách bài tập
      </button>
    </div>

    <!-- ================= MAIN PLAY ================= -->
    <div v-else-if="detail" class="play-screen">
      <div class="top-bar">
        <button class="back-chip" @click="goBack">⬅ Danh sách bài</button>
        <h2 class="assignment-title">{{ detail.info.title }}</h2>
      </div>

      <!-- Bảng ghép robot -->
      <div class="puzzle-board">
        <span
          v-for="(q, i) in detail.questions"
          :key="q.id"
          class="puzzle-slot"
          :class="{ current: i === currentIndex, filled: isAnswered(q) }"
        >
          <span v-if="isAnswered(q)">🧩</span>
        </span>
      </div>
      <p class="puzzle-caption">
        Đã lắp {{ answeredCount }}/{{ detail.questions.length }} mảnh ghép
      </p>

      <!-- Bàn làm việc -->
      <div class="workbench-card">
        <span class="bolt tl">●</span><span class="bolt tr">●</span>
        <span class="bolt bl">●</span><span class="bolt br">●</span>

        <div class="workbench-badge">Mảnh số {{ currentIndex + 1 }}</div>
        <p class="workbench-question">{{ currentQuestion.content }}</p>

        <div v-if="currentQuestion.options?.length" class="choice-grid">
          <button
            v-for="(option, idx) in currentQuestion.options"
            :key="option.id"
            class="choice-pill"
            :class="{
              selected:
                answerFor(currentQuestion).selectedOptionId === option.id,
            }"
            @click="selectOption(currentQuestion, option.id)"
          >
            <span class="choice-hex">{{ letters[idx] }}</span>
            <span>{{ option.content }}</span>
          </button>
        </div>

        <div v-else class="control-panel">
          <div class="panel-label">Nhập vào bảng điều khiển</div>
          <textarea
            v-model="answerFor(currentQuestion).answerText"
            class="panel-input"
            rows="3"
            placeholder="Bé gõ câu trả lời ở đây..."
          />
        </div>
      </div>

      <div class="nav-row">
        <button
          class="pill-btn ghost"
          :disabled="currentIndex === 0"
          @click="prevQuestion"
        >
          ⬅ Mảnh trước
        </button>
        <button
          v-if="currentIndex < detail.questions.length - 1"
          class="pill-btn orange"
          @click="nextQuestion"
        >
          Ghép mảnh tiếp ➡
        </button>
        <button
          v-else
          class="pill-btn blue big"
          :disabled="submitting"
          @click="submit"
        >
          {{ submitting ? "Đang lắp..." : "🔩 Hoàn thành robot" }}
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

const currentQuestion = computed(
  () => detail.value?.questions[currentIndex.value],
);

const answeredCount = computed(() =>
  detail.value ? detail.value.questions.filter((q) => isAnswered(q)).length : 0,
);

const rank = computed(() => {
  const score = result.value?.score ?? 0;
  if (score >= 8) return { label: "🏆 Kỹ sư xuất sắc" };
  if (score >= 5) return { label: "🔧 Kỹ sư giỏi" };
  return { label: "🛠️ Kỹ sư tập sự" };
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

function nextQuestion() {
  if (currentIndex.value < detail.value.questions.length - 1)
    currentIndex.value++;
}
function prevQuestion() {
  if (currentIndex.value > 0) currentIndex.value--;
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
@import url("https://fonts.googleapis.com/css2?family=Varela+Round&family=Mulish:wght@500;600;700;800&display=swap");

.workshop-shell {
  min-height: 100vh;
  background: linear-gradient(180deg, #eaf4ff 0%, #ffffff 55%);
  font-family: "Mulish", sans-serif;
  color: #1f2a44;
  padding: 24px 16px 40px;
}

.state-screen {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
}
.gear-spin {
  font-size: 3.4rem;
  animation: spin 2.5s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .gear-spin {
    animation: none;
  }
}
.state-emoji {
  font-size: 3rem;
}
.state-text {
  font-family: "Varela Round", sans-serif;
  font-size: 1.3rem;
}
.state-subtext {
  color: #5b6b8c;
}

.result-screen {
  gap: 6px;
}
.robot-big {
  font-size: 4rem;
}
.result-title {
  font-family: "Varela Round", sans-serif;
  font-size: 1.8rem;
  color: #2d6cdf;
  margin: 4px 0;
}
.rank-badge {
  font-family: "Varela Round", sans-serif;
  font-weight: 700;
  font-size: 1.2rem;
  background: #fff3d6;
  color: #a15c00;
  padding: 6px 18px;
  border-radius: 999px;
  display: inline-block;
  margin: 6px 0;
}
.result-line {
  font-size: 1.1rem;
}
.result-score {
  font-weight: 800;
  margin-bottom: 12px;
}

.play-screen {
  max-width: 680px;
  margin: 0 auto;
}
.top-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}
.back-chip {
  border: 2px solid #d7e7ff;
  background: #fff;
  border-radius: 10px;
  padding: 8px 16px;
  font-weight: 700;
  cursor: pointer;
}
.assignment-title {
  font-family: "Varela Round", sans-serif;
  font-size: 1.25rem;
  margin: 0;
}

/* ---------- puzzle board ---------- */
.puzzle-board {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  margin-bottom: 4px;
}
.puzzle-slot {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  border: 2px dashed #b9d3f6;
  background: #f3f8ff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
}
.puzzle-slot.current {
  border-color: #ff8c42;
  border-style: solid;
  background: #fff2e6;
}
.puzzle-slot.filled {
  border-style: solid;
  border-color: #2d6cdf;
  background: #e2ecff;
}
.puzzle-caption {
  text-align: center;
  color: #5b6b8c;
  font-weight: 700;
  margin: 6px 0 20px;
}

/* ---------- workbench card ---------- */
.workbench-card {
  position: relative;
  background: #ffffff;
  border: 2px solid #d7e7ff;
  border-radius: 18px;
  padding: 28px 24px;
  margin-bottom: 20px;
  box-shadow: 0 6px 0 #dbe9ff;
}
.bolt {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #b9c8e0;
  font-size: 0;
}
.bolt.tl {
  top: 10px;
  left: 10px;
}
.bolt.tr {
  top: 10px;
  right: 10px;
}
.bolt.bl {
  bottom: 10px;
  left: 10px;
}
.bolt.br {
  bottom: 10px;
  right: 10px;
}

.workbench-badge {
  display: inline-block;
  background: #ffe6cf;
  color: #b45800;
  font-family: "Varela Round", sans-serif;
  font-size: 0.85rem;
  padding: 4px 14px;
  border-radius: 999px;
  margin-bottom: 12px;
}
.workbench-question {
  font-size: 1.2rem;
  font-weight: 700;
  line-height: 1.5;
  margin: 0 0 18px;
}

.choice-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
@media (min-width: 560px) {
  .choice-grid {
    grid-template-columns: 1fr 1fr;
  }
}
.choice-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 2px solid #e3edfa;
  background: #f7faff;
  border-radius: 10px;
  padding: 12px 14px;
  font-weight: 600;
  font-size: 1rem;
  text-align: left;
  cursor: pointer;
  color: #1f2a44;
}
.choice-pill.selected {
  border-color: #ff8c42;
  background: #fff2e6;
}
.choice-hex {
  flex: 0 0 auto;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #2d6cdf;
  color: #fff;
  font-family: "Varela Round", sans-serif;
  font-size: 0.8rem;
  border-radius: 6px;
}

.control-panel {
  background: #12213e;
  border-radius: 12px;
  padding: 14px;
}
.panel-label {
  color: #8fd3ff;
  font-family: "Varela Round", sans-serif;
  font-size: 0.75rem;
  margin-bottom: 6px;
}
.panel-input {
  width: 100%;
  border: none;
  background: transparent;
  color: #eaf4ff;
  resize: vertical;
  font-family: "Mulish", sans-serif;
  font-size: 1rem;
  outline: none;
}
.panel-input::placeholder {
  color: #6f8cb8;
}

.nav-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.pill-btn {
  border: none;
  border-radius: 10px;
  padding: 12px 22px;
  font-family: "Varela Round", sans-serif;
  font-size: 0.95rem;
  cursor: pointer;
}
.pill-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.pill-btn.orange {
  background: #ff8c42;
  color: #fff;
}
.pill-btn.blue {
  background: #2d6cdf;
  color: #fff;
}
.pill-btn.ghost {
  background: #fff;
  border: 2px solid #d7e7ff;
  color: #1f2a44;
}
.pill-btn.big {
  font-size: 1.05rem;
  padding: 14px 26px;
}

.inline-error {
  margin-top: 14px;
  color: #d64550;
  font-weight: 700;
  text-align: center;
}
</style>
