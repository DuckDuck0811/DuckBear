<!--
  AssignmentPlayGrade2.vue
  Giao diện làm bài kiểu "Thẻ lật hình phép thuật" — dành riêng cho học sinh LỚP 2.
  Giữ nguyên logic nghiệp vụ như file gốc (fetch detail, startSubmission, answerFor, submit).
  Chuyển câu = hiệu ứng lật thẻ 3D thật (rotateY), mặt sau là hình trang trí sao/trăng.

  Tích hợp: copy vào src/views/Student/Assignment/styles/AssignmentPlayGrade2.vue
-->
<template>
  <div class="deck-shell">
    <!-- ================= LOADING ================= -->
    <div v-if="loading" class="state-screen">
      <div class="owl-spin">🦉</div>
      <p class="state-text">Cú mèo đang xào bộ thẻ cho bé...</p>
    </div>

    <!-- ================= ERROR ================= -->
    <div v-else-if="errorMessage && !detail && !result" class="state-screen">
      <div class="state-emoji">🙀</div>
      <p class="state-text">Bộ thẻ bị rơi mất rồi!</p>
      <p class="state-subtext">{{ errorMessage }}</p>
      <button class="pill-btn magenta" @click="goBack">
        Quay về danh sách
      </button>
    </div>

    <!-- ================= RESULT ================= -->
    <div v-else-if="result" class="state-screen result-screen">
      <div class="owl-spin">🦉</div>
      <h1 class="result-title">Bé đã lật hết bộ thẻ!</h1>
      <div class="medal">{{ medal.icon }}</div>
      <p class="medal-label">{{ medal.label }}</p>
      <p class="result-line">
        Đúng <strong>{{ result.correctCount }}</strong> /
        {{ result.totalQuestions }} thẻ
      </p>
      <p v-if="result.score !== null" class="result-score">
        Điểm: {{ result.score }}/10
      </p>
      <button class="pill-btn magenta big" @click="goBack">
        Về danh sách bài tập
      </button>
    </div>

    <!-- ================= MAIN PLAY ================= -->
    <div v-else-if="detail" class="play-screen">
      <div class="top-bar">
        <button class="back-chip" @click="goBack">⬅ Danh sách bài</button>
        <h2 class="assignment-title">{{ detail.info.title }}</h2>
      </div>

      <!-- Chỉ báo bộ thẻ -->
      <div class="deck-strip" role="list">
        <span
          v-for="(q, i) in detail.questions"
          :key="q.id"
          class="mini-card"
          :class="{
            current: i === currentIndex,
            done: isAnswered(q) && i !== currentIndex,
          }"
          role="listitem"
        >
          <span v-if="isAnswered(q) && i !== currentIndex">✓</span>
        </span>
      </div>
      <p class="deck-count">
        Thẻ {{ currentIndex + 1 }}/{{ detail.questions.length }}
      </p>

      <!-- Thẻ lật 3D -->
      <div class="flip-stage">
        <div
          class="flip-card"
          :style="{ transform: `rotateY(${rotation}deg)` }"
        >
          <!-- Mặt trước: câu hỏi -->
          <div class="face face-front">
            <div class="face-badge">Câu {{ displayIndex + 1 }}</div>
            <p class="face-question">{{ displayQuestion?.content }}</p>

            <div v-if="displayQuestion?.options?.length" class="choice-grid">
              <button
                v-for="(option, idx) in displayQuestion.options"
                :key="option.id"
                class="choice-pill"
                :class="{
                  selected:
                    answerFor(displayQuestion).selectedOptionId === option.id,
                }"
                @click="selectOption(displayQuestion, option.id)"
              >
                <span class="choice-letter">{{ letters[idx] }}</span>
                <span>{{ option.content }}</span>
              </button>
            </div>
            <div v-else class="notepad">
              <textarea
                v-model="answerFor(displayQuestion).answerText"
                class="notepad-input"
                rows="3"
                placeholder="Bé viết câu trả lời vào đây..."
              />
            </div>
          </div>

          <!-- Mặt sau: trang trí, hiện ra lúc đang lật -->
          <div class="face face-back">
            <div class="back-pattern">✨ 🌙 ⭐ 🌙 ✨</div>
            <div class="back-owl">🦉</div>
            <p class="back-text">Đang lật thẻ...</p>
          </div>
        </div>
      </div>

      <div class="nav-row">
        <button
          class="pill-btn ghost"
          :disabled="currentIndex === 0 || flipping"
          @click="goPrev"
        >
          ⬅ Thẻ trước
        </button>
        <button
          v-if="currentIndex < detail.questions.length - 1"
          class="pill-btn magenta"
          :disabled="flipping"
          @click="goNext"
        >
          Thẻ tiếp theo ➡
        </button>
        <button
          v-else
          class="pill-btn teal big"
          :disabled="submitting || flipping"
          @click="submit"
        >
          {{ submitting ? "Đang nộp..." : "🪄 Nộp bài" }}
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

const letters = ["A", "B", "C", "D", "E", "F"];

// currentIndex = câu đang thực sự chọn; displayIndex = câu đang hiển thị trên mặt thẻ
// (khác nhau trong khoảnh khắc đang lật, để nội dung đổi đúng lúc mặt trước bị úp xuống)
const currentIndex = ref(0);
const displayIndex = ref(0);
const rotation = ref(0);
const flipping = ref(false);

const displayQuestion = computed(
  () => detail.value?.questions[displayIndex.value],
);

const medal = computed(() => {
  const score = result.value?.score ?? 0;
  if (score >= 8) return { icon: "🥇", label: "Huy chương Vàng!" };
  if (score >= 5) return { icon: "🥈", label: "Huy chương Bạc!" };
  return { icon: "🥉", label: "Huy chương Đồng!" };
});

function answerFor(question) {
  if (!question) return { selectedOptionId: null, answerText: "" };
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

function flipTo(newIndex) {
  if (flipping.value) return;
  flipping.value = true;
  rotation.value += 180; // lật úp xuống mặt sau
  setTimeout(() => {
    displayIndex.value = newIndex; // đổi nội dung khi mặt trước đang bị úp (không nhìn thấy)
    currentIndex.value = newIndex;
    rotation.value += 180; // lật tiếp để mặt trước (nội dung mới) quay lại
    setTimeout(() => {
      flipping.value = false;
    }, 450);
  }, 450);
}

function goNext() {
  if (currentIndex.value < detail.value.questions.length - 1)
    flipTo(currentIndex.value + 1);
}
function goPrev() {
  if (currentIndex.value > 0) flipTo(currentIndex.value - 1);
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
@import url("https://fonts.googleapis.com/css2?family=Fredoka:wght@600;700&family=Nunito:wght@500;600;700&display=swap");

.deck-shell {
  min-height: 100vh;
  background: linear-gradient(180deg, #f6e9ff 0%, #ffffff 60%);
  font-family: "Nunito", sans-serif;
  color: #2e2657;
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
.owl-spin {
  font-size: 3.4rem;
}
.state-text {
  font-family: "Fredoka", sans-serif;
  font-size: 1.35rem;
  font-weight: 700;
}
.state-subtext {
  color: #7a6f9e;
}

.result-screen {
  gap: 4px;
}
.result-title {
  font-family: "Fredoka", sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: #ff4fa3;
  margin: 6px 0 0;
}
.medal {
  font-size: 3.4rem;
  margin-top: 8px;
}
.medal-label {
  font-family: "Fredoka", sans-serif;
  font-weight: 700;
  color: #c98a00;
}
.result-line {
  font-size: 1.1rem;
  margin-top: 6px;
}
.result-score {
  font-weight: 700;
  margin-bottom: 12px;
}

.play-screen {
  max-width: 640px;
  margin: 0 auto;
}
.top-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}
.back-chip {
  border: none;
  background: #ffffff;
  border: 2px solid #efe2ff;
  border-radius: 999px;
  padding: 8px 16px;
  font-weight: 700;
  cursor: pointer;
}
.assignment-title {
  font-family: "Fredoka", sans-serif;
  font-size: 1.25rem;
  margin: 0;
}

.deck-strip {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 4px;
}
.mini-card {
  width: 18px;
  height: 24px;
  border-radius: 4px;
  background: #e7dcff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: #fff;
}
.mini-card.current {
  background: #ff4fa3;
  transform: scale(1.2);
}
.mini-card.done {
  background: #29c7ac;
}
.deck-count {
  text-align: center;
  font-weight: 700;
  color: #7a6f9e;
  margin: 4px 0 18px;
}

.flip-stage {
  perspective: 1400px;
  margin-bottom: 22px;
}
.flip-card {
  position: relative;
  min-height: 320px;
  transform-style: preserve-3d;
  transition: transform 0.45s ease;
}
.face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 26px;
  padding: 24px 22px;
}
.face-front {
  background: #ffffff;
  border: 2px solid #f0e4ff;
  box-shadow:
    0 10px 0 #ece2fb,
    0 10px 24px rgba(46, 38, 87, 0.08);
}
.face-back {
  background: #2e2657;
  color: #fff;
  transform: rotateY(180deg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
}
.back-pattern {
  font-size: 1.4rem;
  letter-spacing: 4px;
}
.back-owl {
  font-size: 3rem;
}
.back-text {
  font-family: "Fredoka", sans-serif;
  opacity: 0.85;
}

.face-badge {
  display: inline-block;
  background: #ffe1f2;
  color: #c2317c;
  font-family: "Fredoka", sans-serif;
  font-weight: 700;
  font-size: 0.85rem;
  padding: 4px 14px;
  border-radius: 999px;
  margin-bottom: 10px;
}
.face-question {
  font-size: 1.2rem;
  font-weight: 600;
  line-height: 1.5;
  margin-bottom: 16px;
}

.choice-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}
@media (min-width: 520px) {
  .choice-grid {
    grid-template-columns: 1fr 1fr;
  }
}
.choice-pill {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 2px solid #f0e4ff;
  background: #fbf7ff;
  border-radius: 16px;
  padding: 12px 14px;
  font-family: "Nunito", sans-serif;
  font-weight: 600;
  font-size: 1rem;
  text-align: left;
  cursor: pointer;
  color: #2e2657;
}
.choice-pill.selected {
  border-color: #ff4fa3;
  background: #ffe6f3;
}
.choice-letter {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #2e2657;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Fredoka", sans-serif;
  font-size: 0.8rem;
  flex: 0 0 auto;
}

.notepad {
  background: #fbf7ff;
  border: 2px dashed #d9c4ff;
  border-radius: 16px;
  padding: 12px;
}
.notepad-input {
  width: 100%;
  border: none;
  background: transparent;
  resize: vertical;
  font-family: "Nunito", sans-serif;
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
  font-family: "Fredoka", sans-serif;
  font-weight: 700;
  font-size: 0.98rem;
  cursor: pointer;
}
.pill-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.pill-btn.magenta {
  background: #ff4fa3;
  color: #fff;
}
.pill-btn.teal {
  background: #29c7ac;
  color: #fff;
}
.pill-btn.ghost {
  background: #fff;
  border: 2px solid #f0e4ff;
  color: #2e2657;
}
.pill-btn.big {
  font-size: 1.1rem;
  padding: 14px 26px;
}

.inline-error {
  margin-top: 14px;
  color: #d64550;
  font-weight: 600;
  text-align: center;
}

@media (prefers-reduced-motion: reduce) {
  .flip-card {
    transition: none;
  }
}
</style>
