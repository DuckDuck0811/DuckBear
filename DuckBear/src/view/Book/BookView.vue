<template>
  <div class="t-page-wrap">
    <!-- Header -->
    <div class="t-page-heading">
      <div>
        <div class="t-eyebrow">HỌC LIỆU</div>
        <h1 class="t-page-title">Sách / Môn học</h1>
        <p class="t-page-subtitle">Quản lý sách học liệu theo môn học và khối lớp (1–12)</p>
      </div>
      <div class="d-flex" style="gap: 8px; flex-shrink: 0">
        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi-plus"
          class="text-none"
          style="border-radius: 8px; font-weight: 600"
          @click="openCreate"
        >
          Thêm sách mới
        </v-btn>
      </div>
    </div>

    <!-- Filters -->
    <div class="t-filter-bar">
      <v-row dense>
        <v-col cols="12" sm="5">
          <v-text-field
            v-model="filters.keyword"
            placeholder="Tìm theo tên sách hoặc tài liệu..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="comfortable"
            hide-details
            bg-color="white"
          />
        </v-col>
        <v-col cols="6" sm="4">
          <v-select
            v-model="filters.subject"
            :items="subjectOptions"
            item-title="title"
            item-value="value"
            placeholder="Tất cả môn học"
            variant="outlined"
            density="comfortable"
            hide-details
            clearable
            bg-color="white"
          />
        </v-col>
        <v-col cols="6" sm="3">
          <v-select
            v-model="filters.grade"
            :items="gradeFilterOptions"
            item-title="title"
            item-value="value"
            placeholder="Tất cả khối lớp"
            variant="outlined"
            density="comfortable"
            hide-details
            clearable
            bg-color="white"
          />
        </v-col>
      </v-row>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Empty state -->
    <div v-else-if="filteredBooks.length === 0" class="t-empty-state">
      <v-icon icon="mdi-bookshelf" size="48" color="#9CA3AF" class="t-empty-icon" />
      <p class="t-empty-title">Chưa có sách nào</p>
      <p class="t-empty-desc">
        Thêm sách đầu tiên để bắt đầu xây dựng chương, bài học và ngân hàng câu hỏi.
      </p>
      <v-btn color="primary" variant="flat" class="text-none" style="border-radius: 8px" @click="openCreate">
        Thêm sách mới
      </v-btn>
    </div>

    <!-- Book grid -->
    <v-row v-else>
      <v-col
        v-for="book in filteredBooks"
        :key="book.id"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <div class="book-card t-card t-card-hover" @click="goToLessons(book)">
          <!-- Dynamic Cover Image / Banner -->
          <div
            class="book-cover"
            :style="{
              background: book.coverUrl ? `url(${book.coverUrl}) center/cover no-repeat` : getThemeForBook(book).gradient,
            }"
          >
            <!-- Overlay pattern if no custom photo -->
            <div v-if="!book.coverUrl" class="book-cover-pattern" />

            <!-- Book spine ribbon accent -->
            <div class="book-spine-line" />

            <!-- Subject emblem icon -->
            <div class="book-emblem">
              <v-icon :icon="getThemeForBook(book).icon" size="32" color="white" />
            </div>

            <!-- Grade pill badge right on cover -->
            <span class="cover-grade-badge">
              Khối {{ book.grade }}
            </span>
          </div>

          <!-- Book body info -->
          <div class="book-body">
            <div class="book-tags">
              <span class="t-tag t-tag--subject">{{ book.subject || "Môn học" }}</span>
              <span class="t-tag t-tag--grade">Lớp {{ book.grade }}</span>
            </div>
            <p class="book-name" :title="book.name">{{ book.name }}</p>
            <div class="book-meta">
              <span class="meta-part">
                <v-icon size="14" color="#94A3B8">mdi-format-list-bulleted</v-icon>
                {{ book.chapterCount }} chương
              </span>
              <span class="meta-dot">·</span>
              <span class="meta-part">
                <v-icon size="14" color="#94A3B8">mdi-file-document-outline</v-icon>
                {{ book.lessonCount }} bài học
              </span>
            </div>
          </div>

          <!-- Quick menu -->
          <v-menu location="bottom end">
            <template #activator="{ props }">
              <v-btn
                icon="mdi-dots-vertical"
                variant="text"
                size="small"
                class="book-menu-btn"
                @click.stop
                v-bind="props"
              />
            </template>
            <v-list density="compact" min-width="170" class="book-menu-list">
              <v-list-item
                prepend-icon="mdi-pencil-outline"
                title="Sửa thông tin"
                @click="openEdit(book)"
              />
              <v-divider class="my-1" />
              <v-list-item
                prepend-icon="mdi-delete-outline"
                title="Xóa sách"
                class="text-error"
                @click="confirmDelete(book)"
              />
            </v-list>
          </v-menu>
        </div>
      </v-col>
    </v-row>

    <!-- Create / Edit Dialog with Live Preview -->
    <v-dialog v-model="dialog" max-width="580">
      <v-card class="pa-2" style="border-radius: 16px">
        <!-- Dialog Header -->
        <div class="d-flex align-center px-4 pt-4 pb-2">
          <div class="dialog-icon-box mr-3">
            <v-icon color="#4F7CFF" size="24">mdi-book-plus-outline</v-icon>
          </div>
          <div>
            <div class="t-dialog-title">
              {{ editingBook ? "Sửa thông tin sách" : "Thêm sách học liệu mới" }}
            </div>
            <div class="text-caption text-secondary">
              Tạo giáo trình ôn tập theo môn học và khối lớp
            </div>
          </div>
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" size="small" @click="dialog = false" />
        </div>

        <v-card-text class="px-4 py-2">
          <!-- LIVE PREVIEW CARD -->
          <div class="preview-container mb-4">
            <div class="text-caption font-weight-700 text-uppercase color-primary mb-2">
              <v-icon size="14" color="primary" start>mdi-eye-outline</v-icon>
              Xem trước hiển thị thẻ sách
            </div>
            <div class="preview-book-card">
              <div
                class="preview-cover"
                :style="{
                  background: form.coverUrl ? `url(${form.coverUrl}) center/cover no-repeat` : currentSelectedTheme.gradient,
                }"
              >
                <div v-if="!form.coverUrl" class="book-cover-pattern" />
                <div class="book-spine-line" />
                <div class="book-emblem">
                  <v-icon :icon="currentSelectedTheme.icon" size="28" color="white" />
                </div>
                <span class="cover-grade-badge">
                  Khối {{ form.grade || "-" }}
                </span>
              </div>
              <div class="preview-body">
                <div class="d-flex ga-1 mb-1">
                  <span class="t-tag t-tag--subject">{{ selectedSubjectName || "Môn học" }}</span>
                  <span class="t-tag t-tag--grade">Lớp {{ form.grade || "-" }}</span>
                </div>
                <div class="preview-name">{{ form.name || "Tên sách hiển thị ở đây..." }}</div>
                <div class="text-caption text-muted">0 chương · 0 bài học</div>
              </div>
            </div>
          </div>

          <v-form ref="formRef">
            <!-- Tên sách -->
            <div class="t-field-label">Tên sách / Giáo trình *</div>
            <v-text-field
              v-model="form.name"
              variant="outlined"
              density="comfortable"
              placeholder="VD: Ngữ văn 11 - Kết nối tri thức"
              :rules="[(v) => !!v || 'Không được để trống tên sách']"
              class="mb-3"
              prepend-inner-icon="mdi-book-outline"
            />

            <!-- Môn học & Khối lớp -->
            <v-row dense>
              <v-col cols="12" sm="6">
                <div class="t-field-label">Môn học *</div>
                <v-select
                  v-model="form.subject"
                  :items="subjectOptions"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  density="comfortable"
                  placeholder="Chọn môn học"
                  :rules="[(v) => !!v || 'Chọn môn học']"
                  class="mb-3"
                  prepend-inner-icon="mdi-school-outline"
                  @update:model-value="onSubjectChange"
                />
              </v-col>
              <v-col cols="12" sm="6">
                <div class="t-field-label">Khối lớp *</div>
                <v-select
                  v-model="form.grade"
                  :items="gradeSelectOptions"
                  item-title="title"
                  item-value="value"
                  variant="outlined"
                  density="comfortable"
                  placeholder="Chọn khối lớp"
                  :rules="[(v) => !!v || 'Chọn khối lớp']"
                  class="mb-3"
                  prepend-inner-icon="mdi-numeric"
                />
              </v-col>
            </v-row>

            <!-- Chọn mẫu ảnh bìa sách -->
            <div class="t-field-label font-weight-700 mt-1 mb-2 color-primary d-flex align-center justify-between">
              <span>
                <v-icon size="16" color="primary" start>mdi-palette-outline</v-icon>
                Chọn mẫu ảnh bìa & màu sắc
              </span>
              <span class="text-caption text-muted font-weight-normal">Nhấn để chọn mẫu</span>
            </div>

            <!-- Preset Themes Grid -->
            <div class="theme-picker-grid mb-3">
              <div
                v-for="theme in bookThemes"
                :key="theme.id"
                class="theme-picker-item"
                :class="{ active: form.themeId === theme.id && !form.coverUrl }"
                :style="{ background: theme.gradient }"
                :title="theme.name"
                @click="selectTheme(theme.id)"
              >
                <v-icon :icon="theme.icon" size="18" color="white" />
                <span class="theme-name">{{ theme.name }}</span>
                <v-icon
                  v-if="form.themeId === theme.id && !form.coverUrl"
                  size="14"
                  color="white"
                  class="theme-check-icon"
                >
                  mdi-check-circle
                </v-icon>
              </div>
            </div>

            <!-- Custom Cover Image URL (Optional) -->
            <div class="t-field-label">Hoặc dùng ảnh bìa từ liên kết URL (tùy chọn)</div>
            <v-text-field
              v-model="form.coverUrl"
              placeholder="https://example.com/anh-bia-sach.jpg"
              variant="outlined"
              density="compact"
              prepend-inner-icon="mdi-image-outline"
              clearable
              hint="Dán link ảnh bìa để hiển thị hình ảnh thật thay vì màu mẫu"
              persistent-hint
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="px-4 pb-4 pt-2">
          <v-spacer />
          <v-btn variant="text" class="text-none" color="secondary" @click="dialog = false">Hủy</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            class="text-none"
            style="border-radius: 8px; font-weight: 600"
            :loading="saving"
            @click="saveBook"
          >
            {{ editingBook ? "Lưu thay đổi" : "Thêm sách" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete confirm -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card class="pa-1" style="border-radius: 14px">
        <v-card-title class="t-dialog-title px-5 pt-5 pb-2">Xóa sách?</v-card-title>
        <v-card-text class="px-5" style="color: #6b7280; font-size: 14px">
          Toàn bộ chương, bài học và câu hỏi thuộc "<strong>{{ bookToDelete?.name }}</strong>"
          cũng sẽ bị xóa. Hành động này không thể hoàn tác.
        </v-card-text>
        <v-card-actions class="px-5 pb-4 pt-2">
          <v-spacer />
          <v-btn variant="text" class="text-none" color="secondary" @click="deleteDialog = false">Hủy</v-btn>
          <v-btn
            color="error"
            variant="flat"
            class="text-none"
            style="border-radius: 8px; font-weight: 600"
            @click="deleteBook"
          >Xóa</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";

import {
  getBooksApi,
  createBookApi,
  updateBookApi,
  deleteBookApi,
} from "@/api/book";
import { getSubjectsApi } from "@/api/subject";

const router = useRouter();

const loading = ref(false);
const books = ref([]);
const subjects = ref([]);

// Presets for Book Covers
const bookThemes = [
  {
    id: "math",
    name: "Toán",
    icon: "mdi-calculator-variant-outline",
    gradient: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
  },
  {
    id: "literature",
    name: "Văn",
    icon: "mdi-feather",
    gradient: "linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)",
  },
  {
    id: "english",
    name: "Tiếng Anh",
    icon: "mdi-translate",
    gradient: "linear-gradient(135deg, #10B981 0%, #047857 100%)",
  },
  {
    id: "physics",
    name: "Vật lý",
    icon: "mdi-atom",
    gradient: "linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)",
  },
  {
    id: "chemistry",
    name: "Hóa học",
    icon: "mdi-flask-round-bottom-outline",
    gradient: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
  },
  {
    id: "biology",
    name: "Sinh học",
    icon: "mdi-leaf",
    gradient: "linear-gradient(135deg, #14B8A6 0%, #0F766E 100%)",
  },
  {
    id: "informatics",
    name: "Tin học",
    icon: "mdi-laptop",
    gradient: "linear-gradient(135deg, #6366F1 0%, #4338CA 100%)",
  },
  {
    id: "history",
    name: "Lịch sử",
    icon: "mdi-history",
    gradient: "linear-gradient(135deg, #B45309 0%, #78350F 100%)",
  },
  {
    id: "geography",
    name: "Địa lý",
    icon: "mdi-earth",
    gradient: "linear-gradient(135deg, #EA580C 0%, #C2410C 100%)",
  },
  {
    id: "general",
    name: "Tổng hợp",
    icon: "mdi-book-open-page-variant",
    gradient: "linear-gradient(135deg, #4F7CFF 0%, #2563EB 100%)",
  },
];

function getThemeForBook(book) {
  if (book.themeId) {
    if (book.themeId === "history_geo") {
      const text = `${book.subject || ""} ${book.name || ""}`.toLowerCase();
      if (text.includes("địa")) return bookThemes.find((t) => t.id === "geography") || bookThemes[0];
      return bookThemes.find((t) => t.id === "history") || bookThemes[0];
    }
    const found = bookThemes.find((t) => t.id === book.themeId);
    if (found) return found;
  }
  const text = `${book.subject || ""} ${book.name || ""}`.toLowerCase();
  if (text.includes("toán") || text.includes("math")) return bookThemes.find((t) => t.id === "math");
  if (text.includes("văn") || text.includes("ngữ văn") || text.includes("tiếng việt")) return bookThemes.find((t) => t.id === "literature");
  if (text.includes("anh") || text.includes("ngoại ngữ") || text.includes("english")) return bookThemes.find((t) => t.id === "english");
  if (text.includes("lý") || text.includes("vật lý") || text.includes("physics")) return bookThemes.find((t) => t.id === "physics");
  if (text.includes("hóa") || text.includes("chemistry")) return bookThemes.find((t) => t.id === "chemistry");
  if (text.includes("sinh") || text.includes("biology")) return bookThemes.find((t) => t.id === "biology");
  if (text.includes("tin") || text.includes("công nghệ") || text.includes("it")) return bookThemes.find((t) => t.id === "informatics");
  if (text.includes("sử") || text.includes("history")) return bookThemes.find((t) => t.id === "history");
  if (text.includes("địa") || text.includes("geography")) return bookThemes.find((t) => t.id === "geography");
  return bookThemes.find((t) => t.id === "general") || bookThemes[0];
}

const subjectOptions = computed(() =>
  subjects.value.map((s) => ({ title: s.name, value: s.id })),
);

// Clear grade options with friendly titles instead of bare numbers
const gradeSelectOptions = [
  { title: "Khối 1 (Tiểu học)", value: "1" },
  { title: "Khối 2 (Tiểu học)", value: "2" },
  { title: "Khối 3 (Tiểu học)", value: "3" },
  { title: "Khối 4 (Tiểu học)", value: "4" },
  { title: "Khối 5 (Tiểu học)", value: "5" },
  { title: "Khối 6 (THCS)", value: "6" },
  { title: "Khối 7 (THCS)", value: "7" },
  { title: "Khối 8 (THCS)", value: "8" },
  { title: "Khối 9 (THCS)", value: "9" },
  { title: "Khối 10 (THPT)", value: "10" },
  { title: "Khối 11 (THPT)", value: "11" },
  { title: "Khối 12 (THPT)", value: "12" },
];

const gradeFilterOptions = [
  { title: "Khối 1", value: "1" },
  { title: "Khối 2", value: "2" },
  { title: "Khối 3", value: "3" },
  { title: "Khối 4", value: "4" },
  { title: "Khối 5", value: "5" },
  { title: "Khối 6", value: "6" },
  { title: "Khối 7", value: "7" },
  { title: "Khối 8", value: "8" },
  { title: "Khối 9", value: "9" },
  { title: "Khối 10", value: "10" },
  { title: "Khối 11", value: "11" },
  { title: "Khối 12", value: "12" },
];

const customCovers = JSON.parse(localStorage.getItem("duckbear_book_covers") || "{}");

async function fetchBooks() {
  loading.value = true;
  try {
    const res = await getBooksApi();
    books.value = res.data.map((b) => {
      const local = customCovers[b.id] || {};
      return {
        id: b.id,
        name: b.title,
        subject: b.subjectName,
        subjectId: b.subjectId,
        grade: b.gradeLevel,
        chapterCount: b.chapterCount ?? 0,
        lessonCount: b.lessonCount ?? 0,
        coverUrl: b.coverUrl || b.imageUrl || local.coverUrl || "",
        themeId: local.themeId || null,
      };
    });
  } catch (err) {
    console.error("Lỗi tải danh sách sách:", err);
  } finally {
    loading.value = false;
  }
}

async function fetchSubjects() {
  try {
    const res = await getSubjectsApi();
    subjects.value = res.data;
  } catch (err) {
    console.error("Lỗi tải môn học:", err);
  }
}

onMounted(() => {
  fetchBooks();
  fetchSubjects();
});

const filters = reactive({ keyword: "", subject: null, grade: null });

const filteredBooks = computed(() =>
  books.value.filter((b) => {
    const matchKeyword = b.name
      .toLowerCase()
      .includes(filters.keyword.toLowerCase());
    const matchSubject = !filters.subject || b.subjectId === filters.subject;
    const matchGrade = !filters.grade || String(b.grade) === String(filters.grade);
    return matchKeyword && matchSubject && matchGrade;
  }),
);

const dialog = ref(false);
const deleteDialog = ref(false);
const editingBook = ref(null);
const bookToDelete = ref(null);
const formRef = ref(null);
const saving = ref(false);

const form = reactive({
  name: "",
  subject: null,
  grade: null,
  themeId: "math",
  coverUrl: "",
});

const currentSelectedTheme = computed(() => {
  const found = bookThemes.find((t) => t.id === form.themeId);
  return found || bookThemes[0];
});

const selectedSubjectName = computed(() => {
  const s = subjects.value.find((sub) => sub.id === form.subject);
  return s?.name || "";
});

function selectTheme(themeId) {
  form.themeId = themeId;
  form.coverUrl = "";
}

function onSubjectChange(subjectId) {
  const s = subjects.value.find((sub) => sub.id === subjectId);
  if (!s) return;
  const name = s.name.toLowerCase();
  if (name.includes("toán")) form.themeId = "math";
  else if (name.includes("văn")) form.themeId = "literature";
  else if (name.includes("anh")) form.themeId = "english";
  else if (name.includes("lý")) form.themeId = "physics";
  else if (name.includes("hóa")) form.themeId = "chemistry";
  else if (name.includes("sinh")) form.themeId = "biology";
  else if (name.includes("tin")) form.themeId = "informatics";
  else if (name.includes("sử") && !name.includes("địa")) form.themeId = "history";
  else if (name.includes("địa") && !name.includes("sử")) form.themeId = "geography";
  else if (name.includes("sử")) form.themeId = "history";
  else if (name.includes("địa")) form.themeId = "geography";
  else form.themeId = "general";
}

function openCreate() {
  editingBook.value = null;
  form.name = "";
  form.subject = subjects.value[0]?.id || null;
  form.grade = "10";
  form.themeId = "math";
  form.coverUrl = "";
  dialog.value = true;
}

function openEdit(book) {
  editingBook.value = book;
  form.name = book.name;
  form.subject = book.subjectId;
  form.grade = String(book.grade);
  form.themeId = book.themeId || getThemeForBook(book).id;
  form.coverUrl = book.coverUrl || "";
  dialog.value = true;
}

async function saveBook() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  saving.value = true;
  try {
    const payload = {
      title: form.name,
      subjectId: form.subject,
      gradeLevel: form.grade,
      coverUrl: form.coverUrl || "",
    };

    let savedId = null;
    if (editingBook.value) {
      await updateBookApi(editingBook.value.id, payload);
      savedId = editingBook.value.id;
    } else {
      const res = await createBookApi(payload);
      savedId = res.data?.id;
    }

    if (savedId) {
      customCovers[savedId] = {
        themeId: form.themeId,
        coverUrl: form.coverUrl || "",
      };
      localStorage.setItem("duckbear_book_covers", JSON.stringify(customCovers));
    }

    dialog.value = false;
    await fetchBooks();
  } catch (err) {
    console.error("Lỗi lưu sách:", err);
  } finally {
    saving.value = false;
  }
}

function confirmDelete(book) {
  bookToDelete.value = book;
  deleteDialog.value = true;
}

async function deleteBook() {
  if (!bookToDelete.value) return;
  try {
    await deleteBookApi(bookToDelete.value.id);
    delete customCovers[bookToDelete.value.id];
    localStorage.setItem("duckbear_book_covers", JSON.stringify(customCovers));
    deleteDialog.value = false;
    await fetchBooks();
  } catch (err) {
    console.error("Lỗi xóa sách:", err);
  }
}

function goToLessons(book) {
  router.push({ name: "teacher-lessons", query: { bookId: book.id } });
}
</script>

<style scoped>
/* Book card */
.book-card {
  position: relative;
  overflow: hidden;
  cursor: pointer;
  border-radius: 14px;
}

.book-cover {
  height: 110px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.book-cover-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.25) 0%, transparent 60%);
  pointer-events: none;
}

.book-spine-line {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 6px;
  background: rgba(0, 0, 0, 0.15);
}

.book-emblem {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid rgba(255, 255, 255, 0.35);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.cover-grade-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  font-size: 11px;
  font-weight: 700;
  color: #1e293b;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(4px);
  padding: 2px 8px;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.book-body {
  padding: 14px 16px 14px;
}

.book-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.t-tag--subject {
  background: #eef3ff;
  color: #4f7cff;
  font-weight: 600;
}

.book-name {
  font-weight: 700;
  color: #1a1d2e;
  font-size: 15px;
  margin-bottom: 6px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 42px;
}

.book-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #64748b;
}

.meta-part {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.meta-dot {
  color: #cbd5e1;
}

.book-menu-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.book-menu-list {
  border: 1px solid #e8ecf4;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(20, 30, 80, 0.08);
}

/* Dialog Styles */
.dialog-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #eef3ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.t-dialog-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1d2e;
  line-height: 1.2;
}

.preview-container {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
}

.preview-book-card {
  display: flex;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.preview-cover {
  width: 130px;
  min-height: 90px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.preview-body {
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  flex: 1;
}

.preview-name {
  font-weight: 700;
  font-size: 14px;
  color: #1a1d2e;
  line-height: 1.3;
  margin-bottom: 4px;
}

.color-primary {
  color: #4f7cff;
}

/* Theme Picker Grid */
.theme-picker-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.theme-picker-item {
  position: relative;
  height: 42px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  padding: 0 10px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  user-select: none;
}

.theme-picker-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

.theme-picker-item.active {
  box-shadow: 0 0 0 2.5px #ffffff, 0 0 0 4.5px #4f7cff;
}

.theme-name {
  font-size: 12px;
  font-weight: 600;
  color: #ffffff;
}

.theme-check-icon {
  position: absolute;
  top: 4px;
  right: 4px;
}

@media (max-width: 600px) {
  .theme-picker-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
