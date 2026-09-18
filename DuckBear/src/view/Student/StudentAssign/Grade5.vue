<!--
  AssignmentPlayGrade5.vue
  Giao diện làm bài kiểu "Hành trình kho báu" — dành riêng cho học sinh LỚP 5.
  Con tàu đi dọc hải trình, mỗi câu là 1 chặng, đích đến là đảo kho báu.
  Giữ nguyên logic nghiệp vụ như file gốc.

  Tích hợp: copy vào src/views/Student/Assignment/styles/AssignmentPlayGrade5.vue
-->
<template>
  <div class="voyage-shell">
    <!-- ================= LOADING ================= -->
    <div v-if="loading" class="state-screen">
      <div class="compass-spin">🧭</div>
      <p class="state-text">Đang vẽ bản đồ kho báu cho bé...</p>
    </div>

    <!-- ================= ERROR ================= -->
    <div v-else-if="errorMessage && !detail && !result" class="state-screen">
      <div class="state-emoji">⚓</div>
      <p class="state-text">Con tàu bị mắc cạn rồi!</p>
      <p class="state-subtext">{{ errorMessage }}</p>
      <button class="pill-btn rust" @click="goBack">Quay về danh sách</button>
    </div>

    <!-- ================= RESULT ================= -->
    <div v-else-if="result" class="state-screen result-screen">
      <div class="chest-big">💰</div>
      <h1 class="result-title">Đã tìm thấy kho báu!</h1>
      <p class="rank-badge">{{ rank.label }}</p>
      <p class="result-line">
        Đúng <strong>{{ result.correctCount }}</strong> /
        {{ result.totalQuestions }} chặng
      </p>
      <p v-if="result.score !== null" class="result-score">
        Điểm: {{ result.score }}/10
      </p>
      <button class="pill-btn rust big" @click="goBack">
        Về danh sách bài tập
      </button>
    </div>

    <!-- ================= MAIN PLAY ================= -->
    <div v-else-if="detail" class="play-screen">
      <div class="top-bar">
        <button class="back-chip" @click="goBack">⬅ Danh sách bài</button>
        <h2 class="assignment-title">{{ detail.info.title }}</h2>
      </div>

      <!-- Hải trình -->
      <div class="voyage-track">
        <div class="route-line"></div>
        <div class="ship-icon" :style="shipStyle">⛵</div>
        <span
          v-for="(q, i) in detail.questions"
          :key="q.id"
          class="waypoint"
          :class="{ current: i === currentIndex, done: isAnswered(q) }"
          @click="goToWaypoint(i)"
        >
          {{ isAnswered(q) ? "🪙" : i + 1 }}
        </span>
      </div>
      <p class="voyage-caption">
        Chặng {{ currentIndex + 1 }}/{{ detail.questions.length }} · đảo kho báu
        ở phía trước 🏝️
      </p>

      <!-- Bản đồ giấy da -->
      <div class="map-card">
        <div class="map-badge">Chặng {{ currentIndex + 1 }}</div>
        <p class="map-question">{{ currentQuestion.content }}</p>

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
            <span class="choice-badge">{{ letters[idx] }}</span>
            <span>{{ option.content }}</span>
          </button>
        </div>

        <div v-else class="captain-log">
          <div class="log-label">📜 Nhật ký thuyền trưởng</div>
          <textarea
            v-model="answerFor(currentQuestion).answerText"
            class="log-input"
            rows="3"
            placeholder="Ghi lại câu trả lời của bé..."
          />
        </div>
      </div>

      <div class="nav-row">
        <button
          class="pill-btn ghost"
          :disabled="currentIndex === 0"
          @click="prevQuestion"
        >
          ⬅ Chặng trước
        </button>
        <button
          v-if="currentIndex < detail.questions.length - 1"
          class="pill-btn teal"
          @click="nextQuestion"
        >
          Tiếp tục hải trình ⛵
        </button>
        <button
          v-else
          class="pill-btn gold big"
          :disabled="submitting"
          @click="submit"
        >
          {{ submitting ? "Đang mở..." : "🏴‍☠️ Mở kho báu" }}
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

const shipStyle = computed(() => {
  const total = detail.value?.questions.length || 1;
  const pct = total <= 1 ? 0 : (currentIndex.value / (total - 1)) * 100;
  return { left: `calc(${pct}% - 14px)` };
});

const rank = computed(() => {
  const score = result.value?.score ?? 0;
  if (score >= 8) return { label: "🏆 Thuyền trưởng huyền thoại" };
  if (score >= 5) return { label: "⛵ Thủy thủ trưởng" };
  return { label: "🧭 Thủy thủ tập sự" };
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

function goToWaypoint(i) {
  currentIndex.value = i;
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
@import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@500;600;700;800&display=swap");

.voyage-shell {
  min-height: 100vh;
  background: linear-gradient(180deg, #fbefd9 0%, #f4dfaf 60%);
  font-family: "Be Vietnam Pro", sans-serif;
  color: #3e2b23;
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
.compass-spin {
  font-size: 3.4rem;
  animation: spin 4s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .compass-spin {
    animation: none;
  }
}
.state-emoji {
  font-size: 3rem;
}
.state-text {
  font-weight: 700;
  font-size: 1.25rem;
}
.state-subtext {
  color: #7a6653;
}

.result-screen {
  gap: 6px;
}
.chest-big {
  font-size: 4.2rem;
}
.result-title {
  font-weight: 800;
  font-size: 1.7rem;
  color: #116466;
  margin: 4px 0;
}
.rank-badge {
  font-weight: 700;
  background: #fdf1cf;
  color: #a1720c;
  padding: 6px 18px;
  border-radius: 8px;
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
  max-width: 700px;
  margin: 0 auto;
}
.top-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}
.back-chip {
  border: 2px solid #e3cf9c;
  background: #fffaf0;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 700;
  cursor: pointer;
}
.assignment-title {
  font-weight: 800;
  font-size: 1.2rem;
  margin: 0;
}

/* ---------- voyage track ---------- */
.voyage-track {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 8px 4px;
}
.route-line {
  position: absolute;
  left: 8px;
  right: 8px;
  top: 50%;
  height: 3px;
  background: repeating-linear-gradient(
    90deg,
    #116466 0 8px,
    transparent 8px 16px
  );
  z-index: 0;
}
.ship-icon {
  position: absolute;
  top: -6px;
  font-size: 1.5rem;
  transition: left 0.4s ease;
  z-index: 2;
}
.waypoint {
  position: relative;
  z-index: 1;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #fffaf0;
  border: 2px solid #e3cf9c;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  cursor: pointer;
}
.waypoint.current {
  border-color: #c1440e;
  background: #ffe3d3;
  transform: scale(1.15);
}
.waypoint.done {
  background: #fdf1cf;
  border-color: #e3b23c;
}
.voyage-caption {
  text-align: center;
  color: #7a6653;
  font-weight: 600;
  font-size: 0.9rem;
  margin: 6px 0 20px;
}

/* ---------- map card ---------- */
.map-card {
  background: #fffaf0;
  border: 2px solid #e3cf9c;
  border-radius: 14px;
  padding: 26px 22px;
  margin-bottom: 20px;
  box-shadow: 0 6px 0 #ecdcb2;
}
.map-badge {
  display: inline-block;
  background: #dff0ef;
  color: #0d4c4f;
  font-weight: 700;
  font-size: 0.82rem;
  padding: 4px 14px;
  border-radius: 6px;
  margin-bottom: 12px;
}
.map-question {
  font-size: 1.18rem;
  font-weight: 700;
  line-height: 1.55;
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
  border: 2px solid #ecdcb2;
  background: #fffdf6;
  border-radius: 8px;
  padding: 12px 14px;
  font-weight: 600;
  font-size: 1rem;
  text-align: left;
  cursor: pointer;
  color: #3e2b23;
}
.choice-pill.selected {
  border-color: #c1440e;
  background: #ffe9dd;
}
.choice-badge {
  flex: 0 0 auto;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: #116466;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 0.8rem;
}

.captain-log {
  background: #fffdf6;
  border: 2px dashed #d8c08a;
  border-radius: 10px;
  padding: 12px;
}
.log-label {
  font-weight: 700;
  font-size: 0.82rem;
  color: #a1720c;
  margin-bottom: 6px;
}
.log-input {
  width: 100%;
  border: none;
  background: transparent;
  resize: vertical;
  font-family: "Be Vietnam Pro", sans-serif;
  font-size: 1.02rem;
  outline: none;
}

.nav-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.pill-btn {
  border: none;
  border-radius: 8px;
  padding: 12px 22px;
  font-weight: 700;
  font-size: 0.94rem;
  cursor: pointer;
}
.pill-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.pill-btn.rust {
  background: #c1440e;
  color: #fff;
}
.pill-btn.teal {
  background: #116466;
  color: #fff;
}
.pill-btn.gold {
  background: #e3b23c;
  color: #3e2b23;
}
.pill-btn.ghost {
  background: #fffaf0;
  border: 2px solid #e3cf9c;
  color: #3e2b23;
}
.pill-btn.big {
  font-size: 1.04rem;
  padding: 14px 26px;
}

.inline-error {
  margin-top: 14px;
  color: #d64550;
  font-weight: 700;
  text-align: center;
}
</style>
