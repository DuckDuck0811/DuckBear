<template>
  <div class="t-page-wrap">
    <!-- Header -->
    <div class="t-page-heading">
      <div>
        <div class="t-eyebrow">HỌC LIỆU</div>
        <h1 class="t-page-title">Sách / Môn học</h1>
        <p class="t-page-subtitle">Quản lý sách theo môn học và khối lớp (1–12)</p>
      </div>
      <div class="d-flex" style="gap: 8px; flex-shrink: 0">
        <v-btn
          variant="outlined"
          prepend-icon="mdi-file-pdf-box"
          class="text-none"
          style="border-color: #e8ecf4; color: #6b7280; border-radius: 8px"
          @click="openImportMaterial({ type: 'book' })"
        >
          Nhập file PDF
        </v-btn>
        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="mdi-plus"
          class="text-none"
          style="border-radius: 8px; font-weight: 600"
          @click="openCreate"
        >
          Thêm sách
        </v-btn>
      </div>
    </div>

    <!-- Filters -->
    <div class="t-filter-bar">
      <v-row dense>
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="filters.keyword"
            placeholder="Tìm theo tên sách..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="comfortable"
            hide-details
            bg-color="white"
          />
        </v-col>
        <v-col cols="6" sm="3">
          <v-select
            v-model="filters.subject"
            :items="subjectOptions"
            item-title="title"
            item-value="value"
            placeholder="Môn học"
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
            :items="gradeOptions"
            placeholder="Khối lớp"
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
        Thêm sách
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
          <div class="book-cover" :style="{ background: book.color }">
            <v-icon icon="mdi-book-open-page-variant" size="30" color="white" />
          </div>
          <div class="book-body">
            <div class="book-tags">
              <span class="t-tag">{{ book.subject }}</span>
              <span class="t-tag t-tag--grade">Lớp {{ book.grade }}</span>
            </div>
            <p class="book-name">{{ book.name }}</p>
            <p class="book-meta">
              {{ book.chapterCount }} chương · {{ book.lessonCount }} bài học
            </p>
          </div>
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
                prepend-icon="mdi-file-pdf-box"
                title="Nhập file PDF"
                @click="openImportMaterial({ type: 'book', book })"
              />
              <v-list-item
                prepend-icon="mdi-book-open-page-variant"
                title="Xem sách (lật trang)"
                @click.stop="openFlipViewer(book)"
              />
              <v-list-item
                prepend-icon="mdi-pencil-outline"
                title="Sửa"
                @click="openEdit(book)"
              />
              <v-divider class="my-1" />
              <v-list-item
                prepend-icon="mdi-delete-outline"
                title="Xóa"
                class="text-error"
                @click="confirmDelete(book)"
              />
            </v-list>
          </v-menu>
        </div>
      </v-col>
    </v-row>

    <!-- Create / Edit dialog -->
    <v-dialog v-model="dialog" max-width="480">
      <v-card class="pa-1" style="border-radius: 14px">
        <v-card-title class="t-dialog-title px-5 pt-5 pb-2">
          {{ editingBook ? "Sửa sách" : "Thêm sách mới" }}
        </v-card-title>
        <v-card-text class="px-5">
          <v-form ref="formRef">
            <div class="t-field-label">Tên sách</div>
            <v-text-field
              v-model="form.name"
              variant="outlined"
              density="comfortable"
              placeholder="VD: Toán 6 - Tập 1"
              :rules="[(v) => !!v || 'Không được để trống']"
              class="mb-3"
            />
            <div class="t-field-label">Môn học</div>
            <v-select
              v-model="form.subject"
              :items="subjectOptions"
              item-title="title"
              item-value="value"
              variant="outlined"
              density="comfortable"
              :rules="[(v) => !!v || 'Chọn môn học']"
              class="mb-3"
            />
            <div class="t-field-label">Khối lớp</div>
            <v-select
              v-model="form.grade"
              :items="gradeOptions"
              variant="outlined"
              density="comfortable"
              :rules="[(v) => !!v || 'Chọn khối lớp']"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="px-5 pb-4 pt-2">
          <v-spacer />
          <v-btn variant="text" class="text-none" color="secondary" @click="dialog = false">Hủy</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            class="text-none"
            style="border-radius: 8px; font-weight: 600"
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

    <!-- Import material dialog -->
    <v-dialog v-model="materialDialog" max-width="560">
      <v-card class="pa-1" style="border-radius: 14px">
        <v-card-title class="t-dialog-title px-5 pt-5 pb-1">
          Nhập file PDF
          <div class="import-target-label">{{ importTargetLabel }}</div>
        </v-card-title>
        <v-card-text class="px-5">
          <v-form ref="materialFormRef">
            <template v-if="importTarget?.type === 'book' && !importTarget?.book">
              <div class="t-field-label">Chọn sách</div>
              <v-select
                v-model="materialForm.bookId"
                :items="books"
                item-title="name"
                item-value="id"
                variant="outlined"
                density="comfortable"
                placeholder="Chọn sách cần nhập tài liệu"
                :rules="[(v) => !!v || 'Vui lòng chọn sách']"
                class="mb-3"
              />
            </template>

            <div class="t-field-label">Tên tài liệu</div>
            <v-text-field
              v-model="materialForm.title"
              variant="outlined"
              density="comfortable"
              placeholder="VD: Toán 6 - Tập 1 (Full)"
              :rules="[(v) => !!v || 'Vui lòng nhập tên tài liệu']"
              class="mb-3"
            />

            <div class="t-field-label">File PDF</div>
            <v-file-input
              v-model="materialForm.file"
              variant="outlined"
              density="comfortable"
              accept="application/pdf"
              prepend-icon=""
              prepend-inner-icon="mdi-paperclip"
              placeholder="Chọn file PDF (tối đa 50MB)"
              :rules="[(v) => !!v || 'Vui lòng chọn file']"
              show-size
            />

            <div v-if="parsedPreview" class="preview-output">
              <div class="t-field-label">Dữ liệu đọc được</div>
              <pre>{{ formattedPreview }}</pre>
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions class="px-5 pb-4 pt-2">
          <v-spacer />
          <v-btn variant="text" class="text-none" color="secondary" @click="materialDialog = false">Hủy</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            class="text-none"
            style="border-radius: 8px; font-weight: 600"
            :loading="savingMaterial"
            @click="submitMaterial"
          >
            Đọc mục lục
          </v-btn>
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
  previewImportApi,
} from "@/api/book";
import { getSubjectsApi } from "@/api/subject";

const router = useRouter();

const loading = ref(false);
const books = ref([]);
const subjects = ref([]);

const subjectOptions = computed(() =>
  subjects.value.map((s) => ({ title: s.name, value: s.id })),
);
const gradeOptions = Array.from({ length: 12 }, (_, i) => String(i + 1));

const coverColors = ["#4F7CFF", "#22C55E", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4"];
function colorForBook(id) {
  return coverColors[id % coverColors.length];
}

async function fetchBooks() {
  loading.value = true;
  try {
    const res = await getBooksApi();
    books.value = res.data.map((b) => ({
      id: b.id,
      name: b.title,
      subject: b.subjectName,
      subjectId: b.subjectId,
      grade: b.gradeLevel,
      chapterCount: b.chapterCount ?? 0,
      lessonCount: b.lessonCount ?? 0,
      color: colorForBook(b.id),
    }));
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
    const matchGrade = !filters.grade || b.grade === filters.grade;
    return matchKeyword && matchSubject && matchGrade;
  }),
);

const dialog = ref(false);
const deleteDialog = ref(false);
const editingBook = ref(null);
const bookToDelete = ref(null);
const formRef = ref(null);
const saving = ref(false);

const form = reactive({ name: "", subject: null, grade: null });

function openCreate() {
  editingBook.value = null;
  form.name = "";
  form.subject = null;
  form.grade = null;
  dialog.value = true;
}

function openEdit(book) {
  editingBook.value = book;
  form.name = book.name;
  form.subject = book.subjectId;
  form.grade = book.grade;
  dialog.value = true;
}

async function saveBook() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  saving.value = true;
  const payload = {
    title: form.name,
    subjectId: form.subject,
    gradeLevel: form.grade,
  };

  try {
    if (editingBook.value) {
      await updateBookApi(editingBook.value.id, payload);
    } else {
      await createBookApi(payload);
    }
    dialog.value = false;
    await fetchBooks();
  } catch (err) {
    console.error("Lỗi lưu sách:", err);
    alert(err.response?.data?.message || "Không thể lưu sách");
  } finally {
    saving.value = false;
  }
}

function confirmDelete(book) {
  bookToDelete.value = book;
  deleteDialog.value = true;
}

async function deleteBook() {
  try {
    await deleteBookApi(bookToDelete.value.id);
    deleteDialog.value = false;
    await fetchBooks();
  } catch (err) {
    console.error("Lỗi xóa sách:", err);
    alert(err.response?.data?.message || "Không thể xóa sách");
  }
}

function goToLessons(book) {
  router.push({ name: "teacher-lessons", query: { bookId: book.id } });
}

function openFlipViewer(book) {
  router.push({ name: "teacher-book-viewer", query: { bookId: book.id } });
}

/* ---------- Import material (PDF) ---------- */
const materialDialog = ref(false);
const materialFormRef = ref(null);
const savingMaterial = ref(false);
const materialForm = reactive({ title: "", file: null, bookId: null });
const importTarget = ref(null);
const parsedPreview = ref(null);

const formattedPreview = computed(() =>
  JSON.stringify(parsedPreview.value, null, 2),
);

const importTargetLabel = computed(() => {
  if (!importTarget.value) return "";
  const t = importTarget.value;
  if (t.type === "book") {
    return t.book ? `Cho sách: ${t.book.name}` : "Cho toàn bộ sách";
  }
  if (t.type === "chapter") return `Cho chương: ${t.chapter.title}`;
  if (t.type === "lesson") return `Cho bài học: ${t.lesson.title}`;
  return "";
});

function openImportMaterial(target) {
  importTarget.value = target;
  materialForm.title = "";
  materialForm.file = null;
  materialForm.bookId = target.book?.id || null;
  parsedPreview.value = null;
  materialDialog.value = true;
}

async function submitMaterial() {
  const { valid } = await materialFormRef.value.validate();
  if (!valid) return;

  if (importTarget.value?.type !== "book") {
    alert("Chức năng đọc mục lục hiện chỉ áp dụng cho toàn bộ sách");
    return;
  }

  const fileToUpload = Array.isArray(materialForm.file)
    ? materialForm.file[0]
    : materialForm.file;
  const formData = new FormData();
  formData.append("file", fileToUpload);

  savingMaterial.value = true;
  try {
    const response = await previewImportApi(formData);
    parsedPreview.value = response.data;
    console.log("Dữ liệu mục lục đọc được:", response.data);
  } catch (err) {
    console.error("Lỗi đọc mục lục PDF:", err);
    alert(err.response?.data?.message || "Không thể đọc mục lục PDF");
  } finally {
    savingMaterial.value = false;
  }
}
</script>

<style scoped>
/* Book card */
.book-card {
  position: relative;
  overflow: hidden;
  cursor: pointer;
}

.book-cover {
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-body {
  padding: 14px 14px 12px;
}

.book-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.book-name {
  font-weight: 600;
  color: #1a1d2e;
  font-size: 14px;
  margin-bottom: 4px;
  line-height: 1.4;
}

.book-meta {
  font-size: 12px;
  color: #9ca3af;
}

.book-menu-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(255, 255, 255, 0.88);
  border-radius: 6px;
}

.book-menu-list {
  border: 1px solid #e8ecf4;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(20, 30, 80, 0.08);
}

/* Import preview */
.import-target-label {
  font-size: 12px;
  font-weight: 400;
  color: #9ca3af;
  margin-top: 2px;
}

.preview-output {
  margin-top: 12px;
}

.preview-output pre {
  background: #f8f9fc;
  border: 1px solid #e8ecf4;
  border-radius: 8px;
  padding: 12px;
  font-size: 12px;
  overflow-x: auto;
  color: #374151;
  max-height: 200px;
}
</style>
