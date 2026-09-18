<!--
  AssignmentPlayGrade1.vue
  Giao diện làm bài kiểu "Bản đồ phiêu lưu" — dành riêng cho học sinh LỚP 1.
  Giữ nguyên toàn bộ logic nghiệp vụ (fetch detail, startSubmission, answerFor, submit)
  từ file gốc — chỉ thay phần hiển thị (template + style).

  Cách tích hợp:
  - Copy file này vào src/views/Student/Assignment/styles/AssignmentPlayGrade1.vue
  - Ở component cha (nơi biết được gradeLevel của lớp học), dùng <component :is="...">
    để chọn AssignmentPlayGrade1 khi classRoom.gradeLevel === '1', hoặc render
    trực tiếp component này nếu route đã tách riêng theo lớp.
  - Các lớp 2-5 sẽ là 4 file song song (Grade2..Grade5) dùng chung logic này,
    chỉ khác phần template/style, tránh lặp code logic.
-->
<template>
  <div class="adventure-shell">
    <!-- ================= LOADING ================= -->
    <div v-if="loading" class="state-screen">
      <div class="sun-spinner">🌞</div>
      <p class="state-text">Đang chuẩn bị chuyến phiêu lưu cho bé...</p>
    </div>

    <!-- ================= ERROR ================= -->
    <div v-else-if="errorMessage && !detail && !result" class="state-screen">
      <div class="state-emoji">🙈</div>
      <p class="state-text">Ối, có gì đó chưa ổn rồi!</p>
      <p class="state-subtext">{{ errorMessage }}</p>
      <button class="pill-btn coral" @click="goBack">Quay về danh sách</button>
    </div>

    <!-- ================= RESULT / CELEBRATION ================= -->
    <div v-else-if="result" class="state-screen result-screen">
      <div class="confetti-row" aria-hidden="true">🎉 🌟 🎈 🌟 🎉</div>
      <div class="mascot-big">🐿️</div>
      <h1 class="result-title">Bé đã hoàn thành rồi!</h1>
      <div class="stars-row" aria-hidden="true">
        <span
          v-for="n in 3"
          :key="n"
          class="star"
          :class="{ dim: n > starsEarned }"
          >⭐</span
        >
      </div>
      <p class="result-line">
        Bé trả lời đúng <strong>{{ result.correctCount }}</strong> /
        {{ result.totalQuestions }} câu
      </p>
      <p v-if="result.score !== null" class="result-score">
        Điểm: {{ result.score }}/10
      </p>
      <button class="pill-btn coral big" @click="goBack">
        Về danh sách bài tập
      </button>
    </div>

    <!-- ================= MAIN PLAY SCREEN ================= -->
    <div v-else-if="detail" class="play-screen">
      <div class="top-bar">
        <button
          class="back-chip"
          @click="goBack"
          aria-label="Quay lại danh sách"
        >
          ⬅ Danh sách bài
        </button>
        <h2 class="assignment-title">{{ detail.info.title }}</h2>
      </div>

      <!-- Bản đồ trạm -->
      <div class="station-track" role="list">
        <template v-for="(q, i) in detail.questions" :key="q.id">
          <button
            class="station"
            :class="stationClass(i)"
            role="listitem"
            :aria-current="i === currentIndex ? 'step' : undefined"
            :aria-label="`Câu ${i + 1}`"
            @click="goToStation(i)"
          >
            <span
              v-if="isAnswered(q) && i !== currentIndex"
              class="station-check"
              >✓</span
            >
            <span v-else>{{ i + 1 }}</span>
          </button>
          <span
            v-if="i < detail.questions.length - 1"
            class="track-dash"
            aria-hidden="true"
          ></span>
        </template>
      </div>
      <div class="mascot-track" :style="mascotStyle" aria-hidden="true">🐿️</div>

      <!-- Thẻ câu hỏi hiện tại -->
      <div class="question-card">
        <div class="question-badge">Câu {{ currentIndex + 1 }}</div>
        <p class="question-content">{{ currentQuestion.content }}</p>

        <!-- Trắc nghiệm: các ô lựa chọn to, nhiều màu -->
        <div v-if="currentQuestion.options?.length" class="choice-grid">
          <button
            v-for="(option, idx) in currentQuestion.options"
            :key="option.id"
            class="choice-pill"
            :class="[
              choiceColor(idx),
              {
                selected:
                  answerFor(currentQuestion).selectedOptionId === option.id,
              },
            ]"
            @click="selectOption(currentQuestion, option.id)"
          >
            <span class="choice-letter">{{ letters[idx] }}</span>
            <span class="choice-text">{{ option.content }}</span>
          </button>
        </div>

        <!-- Tự luận / điền khuyết: khung giấy viết tay -->
        <div v-else class="notepad">
          <textarea
            v-model="answerFor(currentQuestion).answerText"
            class="notepad-input"
            rows="3"
            placeholder="Bé viết câu trả lời vào đây nhé..."
          />
        </div>
      </div>

      <!-- Điều hướng -->
      <div class="nav-row">
        <button
          class="pill-btn ghost"
          :disabled="currentIndex === 0"
          @click="prevStation"
        >
          ⬅ Câu trước
        </button>

        <button
          v-if="currentIndex < detail.questions.length - 1"
          class="pill-btn coral"
          @click="nextStation"
        >
          Câu tiếp theo ➡
        </button>
        <button
          v-else
          class="pill-btn green big"
          :disabled="submitting"
          @click="submit"
        >
          {{ submitting ? "Đang nộp..." : "🚀 Nộp bài" }}
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
const choicePalette = ["sky", "sun", "leaf", "berry", "sky", "sun"];

const currentQuestion = computed(
  () => detail.value?.questions[currentIndex.value],
);

const starsEarned = computed(() => {
  if (!result.value || result.value.score === null) return 1;
  if (result.value.score >= 8) return 3;
  if (result.value.score >= 5) return 2;
  return 1;
});

const mascotStyle = computed(() => {
  const total = detail.value?.questions.length || 1;
  const pct = total <= 1 ? 0 : (currentIndex.value / (total - 1)) * 100;
  return { left: `calc(${pct}% )` };
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

function stationClass(i) {
  if (i === currentIndex.value) return "current";
  if (isAnswered(detail.value.questions[i])) return "done";
  return "upcoming";
}

function choiceColor(idx) {
  return choicePalette[idx % choicePalette.length];
}

function goToStation(i) {
  currentIndex.value = i;
}
function nextStation() {
  if (currentIndex.value < detail.value.questions.length - 1)
    currentIndex.value++;
}
function prevStation() {
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
@import url("https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Quicksand:wght@500;600;700&display=swap");

.adventure-shell {
  min-height: 100vh;
  background: linear-gradient(180deg, #9fe3ff 0%, #cdeeff 35%, #fff9e8 100%);
  font-family: "Quicksand", sans-serif;
  color: #3c3159;
  padding: 24px 16px 40px;
}

/* ---------- state screens (loading / error / result) ---------- */
.state-screen {
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 10px;
}
.sun-spinner {
  font-size: 3.5rem;
  animation: spin 3s linear infinite;
}
@media (prefers-reduced-motion: reduce) {
  .sun-spinner {
    animation: none;
  }
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.state-emoji {
  font-size: 3rem;
}
.state-text {
  font-family: "Baloo 2", sans-serif;
  font-size: 1.4rem;
  font-weight: 700;
}
.state-subtext {
  color: #6b6584;
}

.result-screen {
  gap: 6px;
}
.confetti-row {
  font-size: 1.6rem;
}
.mascot-big {
  font-size: 4rem;
}
.result-title {
  font-family: "Baloo 2", sans-serif;
  font-size: 2rem;
  font-weight: 800;
  color: #ff6f59;
  margin: 4px 0;
}
.stars-row {
  font-size: 2.2rem;
  margin: 6px 0;
}
.star.dim {
  opacity: 0.25;
  filter: grayscale(1);
}
.result-line {
  font-size: 1.15rem;
}
.result-score {
  font-weight: 700;
  color: #3c3159;
  margin-bottom: 12px;
}

/* ---------- top bar ---------- */
.play-screen {
  max-width: 720px;
  margin: 0 auto;
}
.top-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}
.back-chip {
  border: none;
  background: #ffffffcc;
  border-radius: 999px;
  padding: 8px 16px;
  font-weight: 700;
  font-family: "Quicksand", sans-serif;
  cursor: pointer;
  box-shadow: 0 2px 0 #d9d3ef;
}
.assignment-title {
  font-family: "Baloo 2", sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
}

/* ---------- station track ---------- */
.station-track {
  display: flex;
  align-items: center;
  overflow-x: auto;
  padding: 10px 4px 6px;
}
.station {
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid #fff;
  background: #d8ecff;
  color: #3c3159;
  font-weight: 800;
  font-family: "Baloo 2", sans-serif;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 0 rgba(60, 49, 89, 0.15);
}
.station.current {
  background: #ffd34d;
  transform: scale(1.15);
  box-shadow: 0 0 0 4px #fff2c9;
}
.station.done {
  background: #4caf7d;
  color: #fff;
}
.station-check {
  font-size: 1.1rem;
}
.track-dash {
  flex: 1 1 16px;
  min-width: 12px;
  height: 3px;
  background: repeating-linear-gradient(
    90deg,
    #d8b783 0 6px,
    transparent 6px 12px
  );
  margin: 0 2px;
}
.mascot-track {
  position: relative;
  height: 26px;
  margin-bottom: 6px;
}
.mascot-track {
  font-size: 1.6rem;
  transition: left 0.4s ease;
}

/* ---------- question card ---------- */
.question-card {
  background: #ffffff;
  border-radius: 28px;
  padding: 24px 22px;
  box-shadow:
    0 8px 0 #e3ddf5,
    0 8px 24px rgba(60, 49, 89, 0.08);
  margin-bottom: 20px;
}
.question-badge {
  display: inline-block;
  background: #ffe1b0;
  color: #a15c00;
  font-family: "Baloo 2", sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 4px 14px;
  border-radius: 999px;
  margin-bottom: 10px;
}
.question-content {
  font-size: 1.25rem;
  font-weight: 600;
  line-height: 1.5;
  margin: 0 0 18px;
}

.choice-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
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
  border: none;
  border-radius: 18px;
  padding: 14px 16px;
  font-family: "Quicksand", sans-serif;
  font-size: 1.05rem;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  color: #3c3159;
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.08);
}
.choice-pill.sky {
  background: #d9f1ff;
}
.choice-pill.sun {
  background: #fff2c2;
}
.choice-pill.leaf {
  background: #dcf3e2;
}
.choice-pill.berry {
  background: #ffe0e6;
}
.choice-pill.selected {
  outline: 3px solid #ff6f59;
  transform: translateY(-2px);
}
.choice-letter {
  flex: 0 0 auto;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #ffffffb0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Baloo 2", sans-serif;
  font-weight: 800;
}

.notepad {
  background: #fffdf3;
  border: 2px dashed #e3c08c;
  border-radius: 18px;
  padding: 12px;
}
.notepad-input {
  width: 100%;
  border: none;
  background: transparent;
  resize: vertical;
  font-family: "Quicksand", sans-serif;
  font-size: 1.05rem;
  outline: none;
}

/* ---------- nav buttons ---------- */
.nav-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.pill-btn {
  border: none;
  border-radius: 999px;
  padding: 12px 22px;
  font-family: "Baloo 2", sans-serif;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.12);
}
.pill-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}
.pill-btn.coral {
  background: #ff6f59;
  color: #fff;
}
.pill-btn.green {
  background: #4caf7d;
  color: #fff;
}
.pill-btn.ghost {
  background: #ffffffcc;
  color: #3c3159;
}
.pill-btn.big {
  font-size: 1.15rem;
  padding: 14px 28px;
}

.inline-error {
  margin-top: 14px;
  color: #d64550;
  font-weight: 600;
  text-align: center;
}
</style>
