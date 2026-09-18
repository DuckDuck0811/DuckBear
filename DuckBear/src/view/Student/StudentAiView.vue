<template>
  <v-app>
    <v-main class="ai-shell">
      <v-container max-width="1000" class="py-8">
        <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="goBack">Về dashboard</v-btn>

        <v-card class="mb-6" elevation="1">
          <v-card-item>
            <v-card-title class="text-h4">Trợ lý học tập</v-card-title>
            <v-card-subtitle>Hỏi đáp nhanh, gợi ý ôn tập và phương pháp học hiệu quả.</v-card-subtitle>
          </v-card-item>
        </v-card>

        <v-card class="pa-4" elevation="1">
          <v-text-field v-model="question" label="Bạn muốn hỏi gì về bài học hôm nay?" variant="outlined" append-inner-icon="mdi-send" @click:append-inner="askAi" @keydown.enter.prevent="askAi" />

          <div v-if="loading" class="d-flex justify-center py-6">
            <v-progress-circular indeterminate color="primary" />
          </div>

          <div v-else-if="messages.length" class="chat-box">
            <div v-for="(msg, idx) in messages" :key="idx" :class="['chat-row', msg.role]">
              <div class="chat-bubble">
                <strong>{{ msg.role === 'user' ? 'Bạn' : 'DuckBear AI' }}</strong>
                <p>{{ msg.text }}</p>
              </div>
            </div>
          </div>

          <v-empty-state v-else icon="mdi-robot-happy" title="Bắt đầu hỏi" text="Ví dụ: Hãy giải thích cách làm bài tập này, giúp tôi nhớ nhanh định lý, hoặc hỏi phương pháp học cho chủ đề hôm nay." />
        </v-card>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const question = ref("");
const loading = ref(false);
const messages = ref([
  {
    role: "assistant",
    text: "Xin chào! Tôi có thể giúp bạn tóm tắt bài học, gợi ý cách làm bài, hoặc giải thích nhanh kiến thức trọng tâm.",
  },
]);

function goBack() {
  router.push({ name: "student-dashboard" });
}

function buildSuggestion(input) {
  const text = (input || "").toLowerCase();

  if (text.includes("ôn tập") || text.includes("review") || text.includes("nhớ")) {
    return "Hãy chia bài học thành 3 phần: kiến thức trọng tâm, ví dụ mẫu, bài tập mini. Học 20 phút rồi tự giải 3 câu tương tự để củng cố.";
  }

  if (text.includes("bài tập") || text.includes("làm bài") || text.includes("câu hỏi")) {
    return "Bước 1: đọc đề thật kỹ. Bước 2: gạch từ khóa. Bước 3: làm các câu dễ trước. Bước 4: quay lại câu khó sau. Đừng bỏ qua bước kiểm tra lại đáp án.";
  }

  if (text.includes("định lý") || text.includes("công thức") || text.includes("khái niệm")) {
    return "Hãy nhớ theo 3 câu: định nghĩa, công thức, ví dụ. Mỗi khi học một khái niệm, hãy tự giải thích lại bằng lời của mình rồi áp dụng vào 1 ví dụ cụ thể.";
  }

  if (text.includes("học") || text.includes("hiệu quả") || text.includes("phương pháp")) {
    return "Phương pháp học hiệu quả là: 25 phút học, 5 phút nghỉ, lập checklist, và làm lại 3 câu hỏi cuối mỗi buổi. Cách này giúp bạn nhớ lâu hơn rất nhiều.";
  }

  return "Bạn có thể bắt đầu bằng cách tóm tắt chủ đề học trong 3 ý chính, viết 1 ví dụ minh họa và giải 2 câu hỏi ngắn để kiểm tra hiểu biết.";
}

function askAi() {
  const text = question.value.trim();
  if (!text) return;

  loading.value = true;
  messages.value.push({ role: "user", text });
  question.value = "";

  setTimeout(() => {
    messages.value.push({
      role: "assistant",
      text: buildSuggestion(text),
    });
    loading.value = false;
  }, 400);
}
</script>

<style scoped>
.ai-shell {
  min-height: 100vh;
  background: #f5f7fb;
}
.chat-box {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 18px;
}
.chat-row {
  display: flex;
}
.chat-row.user {
  justify-content: flex-end;
}
.chat-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 16px;
  background: #eef3ff;
  color: #1d2940;
}
.chat-row.user .chat-bubble {
  background: #dfe9ff;
}
.chat-bubble p {
  margin: 8px 0 0;
  white-space: pre-line;
}
</style>
