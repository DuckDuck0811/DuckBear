<template>
  <v-app>
    <v-main class="resources-shell">
      <v-container max-width="1100" class="py-8">
        <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="goBack">Về dashboard</v-btn>

        <v-card class="mb-6" elevation="1">
          <v-card-item>
            <v-card-title class="text-h4">Tài liệu học tập</v-card-title>
            <v-card-subtitle>Danh sách sách và tài liệu theo môn học của bạn.</v-card-subtitle>
          </v-card-item>
        </v-card>

        <v-alert v-if="errorMessage" type="error" class="mb-4">{{ errorMessage }}</v-alert>

        <div v-if="loading" class="d-flex justify-center py-12">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <v-row v-else-if="books.length">
          <v-col v-for="book in books" :key="book.id" cols="12" md="6" lg="4">
            <v-card class="resource-card" elevation="1">
              <div class="resource-cover" :style="{ background: getBookColor(book.id) }">
                <v-icon size="42" color="white">mdi-book-open-page-variant</v-icon>
              </div>
              <v-card-item>
                <v-card-title>{{ book.name }}</v-card-title>
                <v-card-subtitle>{{ book.subject }} · Lớp {{ book.grade }}</v-card-subtitle>
              </v-card-item>
              <v-card-text>
                <div class="resource-meta">
                  <span><v-icon size="16">mdi-book-outline</v-icon> {{ book.chapterCount || 0 }} chương</span>
                  <span><v-icon size="16">mdi-school-outline</v-icon> {{ book.lessonCount || 0 }} bài</span>
                </div>
              </v-card-text>
              <v-card-actions>
                <v-btn color="primary" variant="tonal" block @click="openBook(book.id)">Mở tài liệu</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>

        <v-empty-state v-else icon="mdi-book-open-variant" title="Chưa có tài liệu" text="Giáo viên sẽ thêm sách và bài học cho bạn ở đây." />
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { getBooksApi } from "@/api/book";

const router = useRouter();
const books = ref([]);
const loading = ref(true);
const errorMessage = ref("");

const palette = [
  "linear-gradient(135deg, #3566d4, #5d8bff)",
  "linear-gradient(135deg, #ff9f43, #ffbf69)",
  "linear-gradient(135deg, #2ab673, #3bd392)",
  "linear-gradient(135deg, #7e57c2, #9c75d9)",
  "linear-gradient(135deg, #ff6d8a, #ff8aa0)",
  "linear-gradient(135deg, #00a9a5, #44c6bd)",
];

function getBookColor(id) {
  return palette[id % palette.length];
}

function goBack() {
  router.push({ name: "student-dashboard" });
}

function openBook(bookId) {
  router.push({ name: "student-book-viewer", query: { bookId } });
}

onMounted(async () => {
  try {
    const { data } = await getBooksApi();
    books.value = data;
  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Không tải được tài liệu";
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.resources-shell {
  min-height: 100vh;
  background: #f5f7fb;
}
.resource-card {
  border-radius: 16px;
  overflow: hidden;
}
.resource-cover {
  display: grid;
  place-items: center;
  height: 150px;
}
.resource-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #687286;
  font-size: 13px;
}
</style>
