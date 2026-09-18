<!--
  AssignmentPlayGrade4.vue
  Giao diện làm bài kiểu "Thú cưng đồng hành" — dành riêng cho học sinh LỚP 4.
  Khủng long lớn dần (trứng -> con -> trưởng thành) theo % số câu đã trả lời.
  Giữ nguyên logic nghiệp vụ như file gốc.

  Tích hợp: copy vào src/views/Student/Assignment/styles/AssignmentPlayGrade4.vue
-->
<template>
  <div class="habitat-shell">
    <!-- ================= LOADING ================= -->
    <div v-if="loading" class="state-screen">
      <div class="egg-wiggle">🥚</div>
      <p class="state-text">Quả trứng đang chờ bé đánh thức...</p>
    </div>

    <!-- ================= ERROR ================= -->
    <div v-else-if="errorMessage && !detail && !result" class="state-screen">
      <div class="state-emoji">🌿</div>
      <p class="state-text">Khu vườn gặp trục trặc rồi!</p>
      <p class="state-subtext">{{ errorMessage }}</p>
      <button class="pill-btn orange" @click="goBack">Quay về danh sách</button>
    </div>

    <!-- ================= RESULT ================= -->
    <div v-else-if="result" class="state-screen result-screen">
      <div class="pet-big">🦕</div>
      <h1 class="result-title">Khủng long đã lớn thật rồi!</h1>
      <p class="rank-badge">{{ rank.label }}</p>
      <p class="result-line">
        Đúng <strong>{{ result.correctCount }}</strong> /
        {{ result.totalQuestions }} câu
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

      <!-- Khu nuôi thú -->
      <div class="pet-habitat">
        <div class="pet-emoji" :class="{ bump: bumpPet }">
          {{ petStage.emoji }}
        </div>
        <div class="energy-track">
          <div class="energy-fill" :style="{ width: progressPct + '%' }"></div>
        </div>
        <p class="energy-label">
          {{ petStage.label }} · {{ answeredCount }}/{{
            detail.questions.length
          }}
          lần cho ăn
        </p>
      </div>

      <!-- Thẻ câu hỏi -->
      <div class="journal-card">
        <div class="journal-badge">Câu {{ currentIndex + 1 }}</div>
        <p class="journal-question">{{ currentQuestion.content }}</p>

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
            <span class="choice-leaf">{{ letters[idx] }}</span>
            <span>{{ option.content }}</span>
          </button>
        </div>

        <div v-else class="care-journal">
          <div class="journal-label">🖊️ Nhật ký chăm sóc</div>
          <textarea
            v-model="answerFor(currentQuestion).answerText"
            class="journal-input"
            rows="3"
            placeholder="Bé viết câu trả lời vào nhật ký..."
          />
        </div>
      </div>

      <div class="nav-row">
        <button
          class="pill-btn ghost"
          :disabled="currentIndex === 0"
          @click="prevQuestion"
        >
          ⬅ Câu trước
        </button>
        <button
          v-if="currentIndex < detail.questions.length - 1"
          class="pill-btn orange"
          @click="nextQuestion"
        >
          Cho ăn tiếp 🍃
        </button>
        <button
          v-else
          class="pill-btn green big"
          :disabled="submitting"
          @click="submit"
        >
          {{ submitting ? "Đang nộp..." : "🍽️ Hoàn thành nuôi dưỡng" }}
        </button>
      </div>

      <p v-if="errorMessage" class="inline-error">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from "vue";
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
const bumpPet = ref(false);

const letters = ["A", "B", "C", "D", "E", "F"];

const currentQuestion = computed(
  () => detail.value?.questions[currentIndex.value],
);

const answeredCount = computed(() =>
  detail.value ? detail.value.questions.filter((q) => isAnswered(q)).length : 0,
);

const progressPct = computed(() => {
  const total = detail.value?.questions.length || 1;
  return Math.round((answeredCount.value / total) * 100);
});

const petStage = computed(() => {
  const pct = progressPct.value;
  if (pct >= 100) return { emoji: "🦕", label: "Khủng long trưởng thành" };
  if (pct >= 67) return { emoji: "🦖", label: "Khủng long đang lớn nhanh" };
  if (pct >= 34) return { emoji: "🐣", label: "Khủng long con mới nở" };
  return { emoji: "🥚", label: "Trứng đang ấm dần" };
});

const rank = computed(() => {
  const score = result.value?.score ?? 0;
  if (score >= 8) return { label: "🦕 Khủng Long Siêu Cấp!" };
  if (score >= 5) return { label: "🦖 Khủng Long Trưởng Thành" };
  return { label: "🐣 Khủng Long Con" };
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

function playBump() {
  bumpPet.value = false;
  nextTick(() => {
    bumpPet.value = true;
    setTimeout(() => (bumpPet.value = false), 400);
  });
}

function selectOption(question, optionId) {
  const wasAnswered = isAnswered(question);
  answerFor(question).selectedOptionId = optionId;
  if (!wasAnswered) playBump();
}

watch(
  () => currentQuestion.value && answerFor(currentQuestion.value).answerText,
  (val, oldVal) => {
    if (val && val.trim() && !(oldVal && oldVal.trim())) playBump();
  },
);

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
@import url("https://fonts.googleapis.com/css2?family=Comfortaa:wght@600;700&family=Karla:wght@500;600;700&display=swap");

.habitat-shell {
  min-height: 100vh;
  background: linear-gradient(180deg, #e9f7ef 0%, #fffdf5 60%);
  font-family: "Karla", sans-serif;
  color: #3a2e22;
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
.egg-wiggle {
  font-size: 3.4rem;
  animation: wiggle 1.6s ease-in-out infinite;
}
@keyframes wiggle {
  0%,
  100% {
    transform: rotate(-6deg);
  }
  50% {
    transform: rotate(6deg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .egg-wiggle {
    animation: none;
  }
}
.state-emoji {
  font-size: 3rem;
}
.state-text {
  font-family: "Comfortaa", sans-serif;
  font-size: 1.25rem;
}
.state-subtext {
  color: #78705f;
}

.result-screen {
  gap: 6px;
}
.pet-big {
  font-size: 4.2rem;
}
.result-title {
  font-family: "Comfortaa", sans-serif;
  font-size: 1.6rem;
  color: #2f855a;
  margin: 4px 0;
}
.rank-badge {
  font-family: "Comfortaa", sans-serif;
  font-weight: 700;
  background: #fff0da;
  color: #b45800;
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
  max-width: 660px;
  margin: 0 auto;
}
.top-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}
.back-chip {
  border: 2px solid #d7ecdc;
  background: #fff;
  border-radius: 999px;
  padding: 8px 16px;
  font-weight: 700;
  cursor: pointer;
}
.assignment-title {
  font-family: "Comfortaa", sans-serif;
  font-size: 1.15rem;
  margin: 0;
}

/* ---------- pet habitat ---------- */
.pet-habitat {
  background: #ffffffb0;
  border: 2px dashed #bfe3c9;
  border-radius: 22px;
  padding: 16px;
  text-align: center;
  margin-bottom: 18px;
}
.pet-emoji {
  font-size: 3.4rem;
  transition: transform 0.2s ease;
}
.pet-emoji.bump {
  transform: scale(1.25);
}
.energy-track {
  height: 14px;
  background: #e4f2e8;
  border-radius: 999px;
  overflow: hidden;
  margin: 10px auto 6px;
  max-width: 320px;
}
.energy-fill {
  height: 100%;
  background: linear-gradient(90deg, #f6c445, #ff7a45);
  transition: width 0.4s ease;
}
.energy-label {
  font-weight: 700;
  color: #4d6b57;
  font-size: 0.9rem;
}

/* ---------- journal card ---------- */
.journal-card {
  background: #ffffff;
  border-radius: 22px;
  padding: 24px 22px;
  box-shadow:
    0 6px 0 #e4f0e6,
    0 8px 20px rgba(58, 46, 34, 0.06);
  margin-bottom: 20px;
}
.journal-badge {
  display: inline-block;
  background: #ffe7d3;
  color: #b45800;
  font-family: "Comfortaa", sans-serif;
  font-size: 0.8rem;
  padding: 4px 14px;
  border-radius: 999px;
  margin-bottom: 12px;
}
.journal-question {
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
  border: 2px solid #e4f0e6;
  background: #f8fcf9;
  border-radius: 999px;
  padding: 12px 16px;
  font-weight: 600;
  font-size: 1rem;
  text-align: left;
  cursor: pointer;
  color: #3a2e22;
}
.choice-pill.selected {
  border-color: #ff7a45;
  background: #fff0e6;
}
.choice-leaf {
  flex: 0 0 auto;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #2f855a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Comfortaa", sans-serif;
  font-size: 0.75rem;
}

.care-journal {
  background: #fffaf0;
  border: 2px dashed #f0d9a8;
  border-radius: 16px;
  padding: 12px;
}
.journal-label {
  font-family: "Comfortaa", sans-serif;
  font-size: 0.8rem;
  color: #b45800;
  margin-bottom: 6px;
}
.journal-input {
  width: 100%;
  border: none;
  background: transparent;
  resize: vertical;
  font-family: "Karla", sans-serif;
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
  border-radius: 999px;
  padding: 12px 22px;
  font-family: "Comfortaa", sans-serif;
  font-size: 0.92rem;
  cursor: pointer;
}
.pill-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.pill-btn.orange {
  background: #ff7a45;
  color: #fff;
}
.pill-btn.green {
  background: #2f855a;
  color: #fff;
}
.pill-btn.ghost {
  background: #fff;
  border: 2px solid #e4f0e6;
  color: #3a2e22;
}
.pill-btn.big {
  font-size: 1.02rem;
  padding: 14px 26px;
}

.inline-error {
  margin-top: 14px;
  color: #d64550;
  font-weight: 700;
  text-align: center;
}
</style>
