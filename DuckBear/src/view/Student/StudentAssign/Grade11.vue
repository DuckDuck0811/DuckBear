<!--
  AssignmentPlayGrade11.vue
  Giao diện làm bài kiểu "Chế độ tập trung tối giản" — dành riêng cho LỚP 11.
  Chỉ hiện đúng 1 câu hỏi giữa màn hình, nền trắng/tối chuyển được, hỗ trợ phím tắt:
  - Enter: qua câu tiếp theo (hoặc nộp bài nếu là câu cuối)
  - Phím số 1-6: chọn nhanh đáp án trắc nghiệm theo thứ tự
  - ← / →: lùi / tiến giữa các câu
  Giữ nguyên logic nghiệp vụ (API, state, answerFor, submit) như file gốc.

  Tích hợp: copy vào src/views/Student/Assignment/styles/AssignmentPlayGrade11.vue
-->
<template>
  <div class="zen-shell" :class="theme">
    <!-- ================= LOADING ================= -->
    <div v-if="loading" class="state-screen">
      <div class="loading-spinner"></div>
      <p class="state-text">Đang chuẩn bị không gian tập trung...</p>
    </div>

    <!-- ================= ERROR ================= -->
    <div v-else-if="errorMessage && !detail && !result" class="state-screen">
      <p class="state-text">Không thể mở bài tập</p>
      <p class="state-subtext">{{ errorMessage }}</p>
      <button class="zen-btn primary" @click="goBack">Quay về danh sách</button>
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
      <button class="zen-btn primary" @click="goBack">
        Về danh sách bài tập
      </button>
    </div>

    <!-- ================= MAIN PLAY (ZEN MODE) ================= -->
    <div v-else-if="detail" class="zen-play">
      <div class="zen-topbar">
        <button class="back-link" @click="goBack">⬅</button>
        <div class="zen-progress-track">
          <div
            class="zen-progress-fill"
            :style="{ width: progressPercent + '%' }"
          ></div>
        </div>
        <button
          class="theme-toggle"
          type="button"
          @click="toggleTheme"
          :aria-label="
            theme === 'dark' ? 'Chuyển sang nền sáng' : 'Chuyển sang nền tối'
          "
        >
          {{ theme === "dark" ? "☀" : "☾" }}
        </button>
      </div>

      <div class="zen-stage">
        <p class="zen-counter">
          Câu {{ currentIndex + 1 }} / {{ detail.questions.length }}
        </p>

        <transition name="fade" mode="out-in">
          <div :key="currentQuestion.id" class="zen-card">
            <p class="zen-question">{{ currentQuestion.content }}</p>

            <div v-if="currentQuestion.options?.length" class="zen-choices">
              <button
                v-for="(option, idx) in currentQuestion.options"
                :key="option.id"
                type="button"
                class="zen-choice"
                :class="{
                  selected:
                    answerFor(currentQuestion).selectedOptionId === option.id,
                }"
                @click="selectOption(currentQuestion, option.id)"
              >
                <span class="zen-key">{{ idx + 1 }}</span>
                <span>{{ option.content }}</span>
              </button>
            </div>

            <textarea
              v-else
              v-model="answerFor(currentQuestion).answerText"
              class="zen-textarea"
              rows="4"
              placeholder="Nhập câu trả lời... (Ctrl + Enter để qua câu)"
            />
          </div>
        </transition>

        <div class="zen-footer">
          <button
            v-if="currentIndex < detail.questions.length - 1"
            class="zen-btn primary"
            @click="goNextOrSubmit"
          >
            Câu tiếp theo
          </button>
          <button
            v-else
            class="zen-btn primary"
            :disabled="submitting"
            @click="submit"
          >
            {{ submitting ? "Đang nộp..." : "Nộp bài" }}
          </button>

          <p class="zen-hint">
            Nhấn <kbd>Enter</kbd> để qua câu · <kbd>←</kbd><kbd>→</kbd> để
            lùi/tiến · phím <kbd>số</kbd> để chọn đáp án
          </p>
        </div>

        <p v-if="errorMessage" class="inline-error">{{ errorMessage }}</p>
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
const loading = ref(true);
const submitting = ref(false);
const errorMessage = ref("");
const currentIndex = ref(0);
const theme = ref("light"); // "light" | "dark"

const currentQuestion = computed(
  () => detail.value?.questions[currentIndex.value],
);

const tier = computed(() => {
  const score = result.value?.score ?? 0;
  if (score >= 8) return { emoji: "◐", label: "Tập trung rất tốt!" };
  if (score >= 5) return { emoji: "◑", label: "Ổn định, tiếp tục nhé" };
  return { emoji: "◒", label: "Cần luyện tập thêm" };
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
function goNextOrSubmit() {
  if (!detail.value) return;
  if (currentIndex.value < detail.value.questions.length - 1) {
    goToIndex(currentIndex.value + 1);
  } else {
    submit();
  }
}

function toggleTheme() {
  theme.value = theme.value === "light" ? "dark" : "light";
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

// --- phím tắt: Enter (qua câu), 1-6 (chọn đáp án), ←/→ (lùi/tiến) ---
function handleKeydown(e) {
  const target = e.target;
  const isTyping =
    target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT");

  if (e.key === "Enter") {
    if (isTyping && !(e.ctrlKey || e.metaKey)) return; // để xuống dòng bình thường trong textarea
    e.preventDefault();
    goNextOrSubmit();
    return;
  }

  if (!isTyping && /^[1-6]$/.test(e.key)) {
    const options = currentQuestion.value?.options;
    const idx = Number(e.key) - 1;
    if (options && options[idx]) {
      selectOption(currentQuestion.value, options[idx].id);
    }
    return;
  }

  if (!isTyping && e.key === "ArrowLeft") {
    goToIndex(currentIndex.value - 1);
  }
  if (!isTyping && e.key === "ArrowRight") {
    goNextOrSubmit();
  }
}

onMounted(async () => {
  window.addEventListener("keydown", handleKeydown);
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

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Newsreader:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap");

.zen-shell {
  --bg: #ffffff;
  --surface: #fafafa;
  --ink: #16171a;
  --ink-soft: #767b85;
  --border: #e7e8eb;
  --accent: #3d4fd6;
  --accent-soft: #eaecfb;

  min-height: 100vh;
  background: var(--bg);
  color: var(--ink);
  font-family: "Inter", sans-serif;
  transition:
    background-color 0.25s ease,
    color 0.25s ease;
  padding: 20px 16px 40px;
}
.zen-shell.dark {
  --bg: #15161a;
  --surface: #1d1f24;
  --ink: #f2f3f5;
  --ink-soft: #9096a1;
  --border: #2c2f36;
  --accent: #7c8cff;
  --accent-soft: #262a45;
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
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
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
  font-family: "Newsreader", serif;
  font-weight: 600;
  font-size: 1.15rem;
}
.state-subtext {
  color: var(--ink-soft);
}

.result-screen {
  gap: 6px;
}
.tier-icon {
  font-size: 2.6rem;
  color: var(--accent);
}
.result-title {
  font-family: "Newsreader", serif;
  font-weight: 700;
  font-size: 1.5rem;
  margin: 6px 0;
}
.result-line {
  font-size: 1.05rem;
}
.result-score {
  font-weight: 700;
  color: var(--accent);
  margin-bottom: 10px;
}

.zen-btn {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 24px;
  font-family: "Inter", sans-serif;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  background: var(--surface);
  color: var(--ink);
}
.zen-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.zen-btn.primary {
  border-color: var(--accent);
  background: var(--accent);
  color: #fff;
}
.zen-btn.primary:hover:not(:disabled) {
  opacity: 0.92;
}

.zen-play {
  max-width: 640px;
  margin: 0 auto;
}

.zen-topbar {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 40px;
}
.back-link {
  border: none;
  background: transparent;
  color: var(--ink-soft);
  font-size: 1.1rem;
  cursor: pointer;
  flex: 0 0 auto;
}
.zen-progress-track {
  flex: 1;
  height: 3px;
  border-radius: 999px;
  background: var(--border);
  overflow: hidden;
}
.zen-progress-fill {
  height: 100%;
  width: 0%;
  background: var(--accent);
  transition: width 0.25s ease;
}
.theme-toggle {
  flex: 0 0 auto;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--ink);
  width: 34px;
  height: 34px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.95rem;
}

.zen-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 55vh;
  justify-content: center;
}
.zen-counter {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--ink-soft);
  margin: 0 0 18px;
  letter-spacing: 0.02em;
}

.zen-card {
  width: 100%;
}
.zen-question {
  font-family: "Newsreader", serif;
  font-weight: 600;
  font-size: 1.55rem;
  line-height: 1.5;
  margin: 0 0 32px;
}

.zen-choices {
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
  max-width: 460px;
  margin: 0 auto;
}
.zen-choice {
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: 12px;
  padding: 13px 16px;
  font-family: "Inter", sans-serif;
  font-weight: 500;
  font-size: 1rem;
  color: var(--ink);
  cursor: pointer;
}
.zen-choice:hover {
  border-color: var(--accent);
}
.zen-choice.selected {
  border-color: var(--accent);
  background: var(--accent-soft);
}
.zen-key {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: var(--border);
  color: var(--ink-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.78rem;
  font-weight: 700;
  flex: 0 0 auto;
}
.zen-choice.selected .zen-key {
  background: var(--accent);
  color: #fff;
}

.zen-textarea {
  display: block;
  width: 100%;
  max-width: 460px;
  margin: 0 auto;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 13px 16px;
  font-family: "Inter", sans-serif;
  font-size: 1rem;
  color: var(--ink);
  background: var(--surface);
  resize: vertical;
  outline: none;
  box-sizing: border-box;
}
.zen-textarea:focus {
  border-color: var(--accent);
}

.zen-footer {
  margin-top: 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}
.zen-hint {
  font-size: 0.78rem;
  color: var(--ink-soft);
  margin: 0;
}
.zen-hint kbd {
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 1px 6px;
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  background: var(--surface);
}

.inline-error {
  margin-top: 16px;
  color: #d64545;
  font-weight: 600;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active {
    transition: none;
  }
}

@media (max-width: 520px) {
  .zen-question {
    font-size: 1.3rem;
  }
}
</style>
