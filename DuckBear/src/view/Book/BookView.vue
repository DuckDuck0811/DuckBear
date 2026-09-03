<template>
  <div class="books-view">
    <div class="view-header">
      <div>
        <h1 class="view-title">Sách / Môn học</h1>
        <p class="view-subtitle">
          Quản lý sách theo môn học và khối lớp (1–12)
        </p>
      </div>
      <div class="d-flex" style="gap: 8px">
        <v-btn
          variant="outlined"
          prepend-icon="mdi-file-pdf-box"
          class="text-none"
          @click="openImportMaterial({ type: 'book' })"
        >
          Nhập file PDF
        </v-btn>
        <v-btn
          color="#1B2A4A"
          variant="flat"
          prepend-icon="mdi-plus"
          class="text-none"
          @click="openCreate"
        >
          Thêm sách
        </v-btn>
      </div>
    </div>

    <!-- Filters -->
    <v-card flat class="filter-bar mb-4">
      <v-row dense>
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="filters.keyword"
            placeholder="Tìm theo tên sách..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="comfortable"
            hide-details
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
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- Empty state -->
    <div v-if="!loading && filteredBooks.length === 0" class="empty-state">
      <v-icon icon="mdi-bookshelf" size="48" color="#c7cbd6" />
      <p class="empty-title">Chưa có sách nào</p>
      <p class="empty-desc">
        Thêm sách đầu tiên để bắt đầu xây dựng chương, bài học và ngân hàng câu
        hỏi.
      </p>
      <v-btn
        color="#1B2A4A"
        variant="flat"
        class="text-none mt-2"
        @click="openCreate"
      >
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
        <v-card flat class="book-card" @click="goToLessons(book)">
          <div class="book-cover" :style="{ background: book.color }">
            <v-icon icon="mdi-book-open-page-variant" size="32" color="white" />
          </div>
          <div class="book-body">
            <div class="book-tags">
              <span class="tag">{{ book.subject }}</span>
              <span class="tag tag--grade">Lớp {{ book.grade }}</span>
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
            <v-list density="compact" min-width="160">
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
              <v-list-item
                prepend-icon="mdi-delete-outline"
                title="Xóa"
                @click="confirmDelete(book)"
              />
            </v-list>
          </v-menu>
        </v-card>
      </v-col>
    </v-row>

    <!-- Create / Edit dialog -->
    <v-dialog v-model="dialog" max-width="480">
      <v-card class="pa-2">
        <v-card-title class="dialog-title">
          {{ editingBook ? "Sửa sách" : "Thêm sách mới" }}
        </v-card-title>
        <v-card-text>
          <v-form ref="formRef">
            <div class="field-label">Tên sách</div>
            <v-text-field
              v-model="form.name"
              variant="outlined"
              density="comfortable"
              placeholder="VD: Toán 6 - Tập 1"
              :rules="[(v) => !!v || 'Không được để trống']"
              class="mb-3"
            />
            <div class="field-label">Môn học</div>
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
            <div class="field-label">Khối lớp</div>
            <v-select
              v-model="form.grade"
              :items="gradeOptions"
              variant="outlined"
              density="comfortable"
              :rules="[(v) => !!v || 'Chọn khối lớp']"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" class="text-none" @click="dialog = false"
            >Hủy</v-btn
          >
          <v-btn
            color="#1B2A4A"
            variant="flat"
            class="text-none"
            @click="saveBook"
          >
            {{ editingBook ? "Lưu" : "Thêm sách" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete confirm -->
    <v-dialog v-model="deleteDialog" max-width="380">
      <v-card class="pa-2">
        <v-card-title class="dialog-title">Xóa sách?</v-card-title>
        <v-card-text class="text-body-2" style="color: #6b7383">
          Toàn bộ chương, bài học và câu hỏi thuộc "{{ bookToDelete?.name }}"
          cũng sẽ bị xóa. Hành động này không thể hoàn tác.
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" class="text-none" @click="deleteDialog = false"
            >Hủy</v-btn
          >
          <v-btn
            color="error"
            variant="flat"
            class="text-none"
            @click="deleteBook"
            >Xóa</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Import material dialog -->
    <v-dialog v-model="materialDialog" max-width="560">
      <v-card class="pa-2">
        <v-card-title class="dialog-title">
          Nhập file PDF
          <div class="import-target-label">{{ importTargetLabel }}</div>
        </v-card-title>

        <v-card-text>
          <v-form ref="materialFormRef">
            <template
              v-if="importTarget?.type === 'book' && !importTarget?.book"
            >
              <div class="field-label">Chọn sách</div>
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

            <div class="field-label">Tên tài liệu</div>
            <v-text-field
              v-model="materialForm.title"
              variant="outlined"
              density="comfortable"
              placeholder="VD: Toán 6 - Tập 1 (Full)"
              :rules="[(v) => !!v || 'Vui lòng nhập tên tài liệu']"
              class="mb-3"
            />

            <div class="field-label">File PDF</div>
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
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn
            variant="text"
            class="text-none"
            @click="materialDialog = false"
          >
            Hủy
          </v-btn>
          <v-btn
            color="#1B2A4A"
            variant="flat"
            class="text-none"
            :loading="savingMaterial"
            @click="submitMaterial"
          >
            Tải lên
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
} from "@/api/book";
import { uploadMaterialApi } from "@/api/material";
import { getSubjectsApi } from "@/api/subject";

const router = useRouter();

const loading = ref(false);
const books = ref([]);
const subjects = ref([]);

const subjectOptions = computed(() =>
  subjects.value.map((s) => ({ title: s.name, value: s.id })),
);
const gradeOptions = Array.from({ length: 12 }, (_, i) => String(i + 1));

const coverColors = ["#3D5AFE", "#F2B84B", "#22B07D", "#E4572E", "#7C5CFF"];
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
  materialDialog.value = true;
}

async function submitMaterial() {
  const { valid } = await materialFormRef.value.validate();
  if (!valid) return;

  const bookId =
    importTarget.value?.type === "book" ? materialForm.bookId : null;
  const chapterId =
    importTarget.value?.type === "chapter"
      ? importTarget.value.chapter.id
      : null;
  const lessonId =
    importTarget.value?.type === "lesson" ? importTarget.value.lesson.id : null;

  if (importTarget.value?.type === "book" && !bookId) {
    alert("Vui lòng chọn sách trước khi tải lên");
    return;
  }

  const fileToUpload = Array.isArray(materialForm.file)
    ? materialForm.file[0]
    : materialForm.file;

  const formData = new FormData();
  formData.append("title", materialForm.title);
  formData.append("file", fileToUpload);
  if (bookId) formData.append("bookId", bookId);
  if (chapterId) formData.append("chapterId", chapterId);
  if (lessonId) formData.append("lessonId", lessonId);

  savingMaterial.value = true;
  try {
    await uploadMaterialApi(formData);
    materialDialog.value = false;
    await fetchBooks();
  } catch (err) {
    console.error("Lỗi tải lên file PDF:", err);
    alert(err.response?.data?.message || "Không thể tải lên file");
  } finally {
    savingMaterial.value = false;
  }
}
</script>

<style scoped>
.books-view {
  padding: 28px;
}

.view-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.view-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a2540;
}

.view-subtitle {
  font-size: 13px;
  color: #8a93a6;
  margin-top: 2px;
}

.filter-bar {
  background: #ffffff;
  border: 1px solid #e9ecf3;
  border-radius: 14px;
  padding: 14px 16px;
}

.empty-state {
  text-align: center;
  padding: 64px 24px;
  background: #ffffff;
  border: 1px dashed #d9dce5;
  border-radius: 16px;
}

.empty-title {
  font-weight: 600;
  color: #1a2540;
  margin-top: 12px;
}

.empty-desc {
  font-size: 13px;
  color: #8a93a6;
  max-width: 360px;
  margin: 6px auto 0;
}

.book-card {
  position: relative;
  border: 1px solid #e9ecf3;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition:
    box-shadow 0.15s ease,
    transform 0.15s ease;
}

.book-card:hover {
  box-shadow: 0 10px 24px -12px rgba(20, 30, 60, 0.18);
  transform: translateY(-2px);
}

.book-cover {
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.book-body {
  padding: 14px;
}

.book-tags {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.tag {
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
  background: #eef0f6;
  color: #4c5670;
}

.tag--grade {
  background: #fff4e6;
  color: #c47a1f;
}

.book-name {
  font-weight: 600;
  color: #1a2540;
  font-size: 14px;
  margin-bottom: 4px;
}

.book-meta {
  font-size: 12px;
  color: #8a93a6;
}

.book-menu-btn {
  position: absolute;
  top: 6px;
  right: 6px;
  background: rgba(255, 255, 255, 0.85);
}

.dialog-title {
  font-weight: 700;
  color: #1a2540;
}

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: #1a2540;
  margin-bottom: 4px;
}

.import-target-label {
  font-size: 12px;
  font-weight: 400;
  color: #8a93a6;
  margin-top: 2px;
}
</style>
