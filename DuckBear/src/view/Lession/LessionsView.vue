<template>
  <div class="t-page-wrap">
    <!-- Header -->
    <div class="t-page-heading">
      <div>
        <div class="t-breadcrumb" @click="goBack">
          <v-icon icon="mdi-arrow-left" size="16" />
          Sách / Môn học
        </div>
        <h1 class="t-page-title">{{ book?.title || "Đang tải..." }}</h1>
        <p v-if="book" class="t-page-subtitle">
          {{ book.subjectName }} · Lớp {{ book.gradeLevel }}
        </p>
      </div>
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-plus"
        class="text-none"
        style="border-radius: 8px; font-weight: 600; flex-shrink: 0"
        @click="openCreateChapter"
      >
        Thêm chương
      </v-btn>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Empty state -->
    <div v-else-if="chapters.length === 0" class="t-empty-state">
      <v-icon icon="mdi-format-list-numbered" size="48" color="#9CA3AF" class="t-empty-icon" />
      <p class="t-empty-title">Chưa có chương nào</p>
      <p class="t-empty-desc">
        Thêm chương đầu tiên để bắt đầu tạo bài học và câu hỏi.
      </p>
      <v-btn
        color="primary"
        variant="flat"
        class="text-none"
        style="border-radius: 8px"
        @click="openCreateChapter"
      >
        Thêm chương
      </v-btn>
    </div>

    <!-- Chapter list -->
    <v-expansion-panels v-else variant="accordion" class="chapter-panels">
      <v-expansion-panel
        v-for="chapter in chapters"
        :key="chapter.id"
        @group:selected="({ value }) => value && loadLessons(chapter)"
      >
        <v-expansion-panel-title class="chapter-panel-title">
          <div class="chapter-title-row">
            <span class="chapter-index">{{ chapter.orderIndex }}</span>
            <span class="chapter-name">{{ chapter.title }}</span>
          </div>
          <template #actions>
            <v-btn
              icon="mdi-pencil-outline"
              variant="text"
              size="small"
              color="secondary"
              @click.stop="openEditChapter(chapter)"
            />
            <v-btn
              icon="mdi-delete-outline"
              variant="text"
              size="small"
              color="error"
              @click.stop="confirmDeleteChapter(chapter)"
            />
          </template>
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <div v-if="chapter.loadingLessons" class="lesson-loading">
            <v-progress-circular indeterminate size="20" color="primary" />
          </div>

          <div v-else>
            <div
              v-for="lesson in chapter.lessons"
              :key="lesson.id"
              class="lesson-row"
            >
              <v-icon icon="mdi-book-open-outline" size="17" color="#9CA3AF" />
              <span class="lesson-name">{{ lesson.title }}</span>
              <v-spacer />
              <v-btn
                icon="mdi-pencil-outline"
                variant="text"
                size="x-small"
                color="secondary"
                @click="openEditLesson(chapter, lesson)"
              />
              <v-btn
                icon="mdi-delete-outline"
                variant="text"
                size="x-small"
                color="error"
                @click="confirmDeleteLesson(chapter, lesson)"
              />
            </div>

            <div v-if="chapter.lessons.length === 0" class="lesson-empty">
              Chưa có bài học nào trong chương này.
            </div>

            <v-btn
              variant="text"
              class="text-none mt-2"
              prepend-icon="mdi-plus"
              color="primary"
              size="small"
              @click="openCreateLesson(chapter)"
            >
              Thêm bài học
            </v-btn>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <!-- Chapter dialog -->
    <v-dialog v-model="chapterDialog" max-width="440">
      <v-card class="pa-1" style="border-radius: 14px">
        <v-card-title class="t-dialog-title px-5 pt-5 pb-2">
          {{ editingChapter ? "Sửa chương" : "Thêm chương mới" }}
        </v-card-title>
        <v-card-text class="px-5">
          <v-form ref="chapterFormRef">
            <div class="t-field-label">Tên chương</div>
            <v-text-field
              v-model="chapterForm.title"
              variant="outlined"
              density="comfortable"
              placeholder="VD: Chương 1: Số tự nhiên"
              :rules="[(v) => !!v || 'Không được để trống']"
              class="mb-3"
            />
            <div class="t-field-label">Thứ tự</div>
            <v-text-field
              v-model.number="chapterForm.orderIndex"
              type="number"
              variant="outlined"
              density="comfortable"
              :rules="[(v) => !!v || 'Không được để trống']"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="px-5 pb-4 pt-2">
          <v-spacer />
          <v-btn variant="text" class="text-none" color="secondary" @click="chapterDialog = false">Hủy</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            class="text-none"
            style="border-radius: 8px; font-weight: 600"
            :loading="savingChapter"
            @click="saveChapter"
          >
            {{ editingChapter ? "Lưu thay đổi" : "Thêm chương" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Lesson dialog -->
    <v-dialog v-model="lessonDialog" max-width="440">
      <v-card class="pa-1" style="border-radius: 14px">
        <v-card-title class="t-dialog-title px-5 pt-5 pb-2">
          {{ editingLesson ? "Sửa bài học" : "Thêm bài học mới" }}
        </v-card-title>
        <v-card-text class="px-5">
          <v-form ref="lessonFormRef">
            <div class="t-field-label">Tên bài học</div>
            <v-text-field
              v-model="lessonForm.title"
              variant="outlined"
              density="comfortable"
              placeholder="VD: Bài 1: Tập hợp"
              :rules="[(v) => !!v || 'Không được để trống']"
              class="mb-3"
            />
            <div class="t-field-label">Thứ tự</div>
            <v-text-field
              v-model.number="lessonForm.orderIndex"
              type="number"
              variant="outlined"
              density="comfortable"
              :rules="[(v) => !!v || 'Không được để trống']"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="px-5 pb-4 pt-2">
          <v-spacer />
          <v-btn variant="text" class="text-none" color="secondary" @click="lessonDialog = false">Hủy</v-btn>
          <v-btn
            color="primary"
            variant="flat"
            class="text-none"
            style="border-radius: 8px; font-weight: 600"
            :loading="savingLesson"
            @click="saveLesson"
          >
            {{ editingLesson ? "Lưu thay đổi" : "Thêm bài học" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete confirm -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card class="pa-1" style="border-radius: 14px">
        <v-card-title class="t-dialog-title px-5 pt-5 pb-2">{{ deleteTarget?.label }}</v-card-title>
        <v-card-text class="px-5" style="color: #6b7280; font-size: 14px">
          {{ deleteTarget?.message }}
        </v-card-text>
        <v-card-actions class="px-5 pb-4 pt-2">
          <v-spacer />
          <v-btn variant="text" class="text-none" color="secondary" @click="deleteDialog = false">Hủy</v-btn>
          <v-btn
            color="error"
            variant="flat"
            class="text-none"
            style="border-radius: 8px; font-weight: 600"
            @click="executeDelete"
          >Xóa</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Import material dialog -->
    <v-dialog v-model="materialDialog" max-width="460">
      <v-card class="pa-1" style="border-radius: 14px">
        <v-card-title class="t-dialog-title px-5 pt-5 pb-1">
          Nhập file PDF
          <div class="import-target-label">{{ importTargetLabel }}</div>
        </v-card-title>
        <v-card-text class="px-5">
          <v-form ref="materialFormRef">
            <div class="t-field-label">Tiêu đề tài liệu</div>
            <v-text-field
              v-model="materialForm.title"
              variant="outlined"
              density="comfortable"
              placeholder="VD: Sách giáo khoa (bản scan)"
              :rules="[(v) => !!v || 'Không được để trống']"
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
            @click="saveMaterial"
          >
            Tải lên
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getBookByIdApi } from "@/api/book";
import { uploadMaterialApi } from "@/api/material";
import {
  getChaptersByBookApi,
  createChapterApi,
  updateChapterApi,
  deleteChapterApi,
} from "@/api/chapter";
import {
  getLessonsByChapterApi,
  createLessonApi,
  updateLessonApi,
  deleteLessonApi,
} from "@/api/lesson";

const route = useRoute();
const router = useRouter();
const bookId = Number(route.query.bookId);

const loading = ref(false);
const book = ref(null);
const chapters = ref([]);

async function fetchBook() {
  try {
    const res = await getBookByIdApi(bookId);
    book.value = res.data;
  } catch (err) {
    console.error("Lỗi tải sách:", err);
  }
}

async function fetchChapters() {
  loading.value = true;
  try {
    const res = await getChaptersByBookApi(bookId);
    chapters.value = res.data.map((c) => ({
      ...c,
      lessons: [],
      lessonsLoaded: false,
      loadingLessons: false,
    }));
  } catch (err) {
    console.error("Lỗi tải chương:", err);
  } finally {
    loading.value = false;
  }
}

async function loadLessons(chapter) {
  if (chapter.lessonsLoaded) return;
  chapter.loadingLessons = true;
  try {
    const res = await getLessonsByChapterApi(chapter.id);
    chapter.lessons = res.data;
    chapter.lessonsLoaded = true;
  } catch (err) {
    console.error("Lỗi tải bài học:", err);
  } finally {
    chapter.loadingLessons = false;
  }
}

onMounted(() => {
  fetchBook();
  fetchChapters();
});

function goBack() {
  router.push({ name: "teacher-books" });
}

/* ---------- Chapter CRUD ---------- */
const chapterDialog = ref(false);
const editingChapter = ref(null);
const chapterFormRef = ref(null);
const savingChapter = ref(false);
const chapterForm = reactive({ title: "", orderIndex: 1 });

function openCreateChapter() {
  editingChapter.value = null;
  chapterForm.title = "";
  chapterForm.orderIndex = chapters.value.length + 1;
  chapterDialog.value = true;
}

function openEditChapter(chapter) {
  editingChapter.value = chapter;
  chapterForm.title = chapter.title;
  chapterForm.orderIndex = chapter.orderIndex;
  chapterDialog.value = true;
}

async function saveChapter() {
  const { valid } = await chapterFormRef.value.validate();
  if (!valid) return;

  savingChapter.value = true;
  const payload = {
    bookId,
    title: chapterForm.title,
    orderIndex: chapterForm.orderIndex,
  };

  try {
    if (editingChapter.value) {
      await updateChapterApi(editingChapter.value.id, payload);
    } else {
      await createChapterApi(payload);
    }
    chapterDialog.value = false;
    await fetchChapters();
  } catch (err) {
    console.error("Lỗi lưu chương:", err);
    alert(err.response?.data?.message || "Không thể lưu chương");
  } finally {
    savingChapter.value = false;
  }
}

/* ---------- Lesson CRUD ---------- */
const lessonDialog = ref(false);
const editingLesson = ref(null);
const activeChapterForLesson = ref(null);
const lessonFormRef = ref(null);
const savingLesson = ref(false);
const lessonForm = reactive({ title: "", orderIndex: 1 });

function openCreateLesson(chapter) {
  activeChapterForLesson.value = chapter;
  editingLesson.value = null;
  lessonForm.title = "";
  lessonForm.orderIndex = chapter.lessons.length + 1;
  lessonDialog.value = true;
}

function openEditLesson(chapter, lesson) {
  activeChapterForLesson.value = chapter;
  editingLesson.value = lesson;
  lessonForm.title = lesson.title;
  lessonForm.orderIndex = lesson.orderIndex;
  lessonDialog.value = true;
}

async function saveLesson() {
  const { valid } = await lessonFormRef.value.validate();
  if (!valid) return;

  savingLesson.value = true;
  const chapter = activeChapterForLesson.value;
  const payload = {
    chapterId: chapter.id,
    title: lessonForm.title,
    orderIndex: lessonForm.orderIndex,
  };

  try {
    if (editingLesson.value) {
      await updateLessonApi(editingLesson.value.id, payload);
    } else {
      await createLessonApi(payload);
    }
    lessonDialog.value = false;
    chapter.lessonsLoaded = false;
    await loadLessons(chapter);
  } catch (err) {
    console.error("Lỗi lưu bài học:", err);
    alert(err.response?.data?.message || "Không thể lưu bài học");
  } finally {
    savingLesson.value = false;
  }
}

/* ---------- Import material (PDF) ---------- */
const materialDialog = ref(false);
const materialFormRef = ref(null);
const savingMaterial = ref(false);
const materialForm = reactive({ title: "", file: null });
const importTarget = ref(null);

const importTargetLabel = computed(() => {
  if (!importTarget.value) return "";
  const t = importTarget.value;
  if (t.type === "book") return `Cho toàn bộ sách: ${book.value?.title || ""}`;
  if (t.type === "chapter") return `Cho chương: ${t.chapter.title}`;
  if (t.type === "lesson") return `Cho bài học: ${t.lesson.title}`;
  return "";
});

function openImportMaterial(target) {
  importTarget.value = target;
  materialForm.title = "";
  materialForm.file = null;
  materialDialog.value = true;
}

async function saveMaterial() {
  const { valid } = await materialFormRef.value.validate();
  if (!valid) return;

  savingMaterial.value = true;
  const target = importTarget.value;
  const formData = new FormData();
  formData.append("title", materialForm.title);

  const fileToUpload = Array.isArray(materialForm.file)
    ? materialForm.file[0]
    : materialForm.file;
  formData.append("file", fileToUpload);

  if (target.type === "book") formData.append("bookId", bookId);
  if (target.type === "chapter")
    formData.append("chapterId", target.chapter.id);
  if (target.type === "lesson") formData.append("lessonId", target.lesson.id);

  try {
    await uploadMaterialApi(formData);
    materialDialog.value = false;
  } catch (err) {
    console.error("Lỗi tải file:", err);
    alert(err.response?.data?.message || "Không thể tải file lên");
  } finally {
    savingMaterial.value = false;
  }
}

/* ---------- Delete (dùng chung) ---------- */
const deleteDialog = ref(false);
const deleteTarget = ref(null);

function confirmDeleteChapter(chapter) {
  deleteTarget.value = {
    type: "chapter",
    data: chapter,
    label: "Xóa chương?",
    message: `Toàn bộ bài học và câu hỏi trong "${chapter.title}" cũng sẽ bị xóa.`,
  };
  deleteDialog.value = true;
}

function confirmDeleteLesson(chapter, lesson) {
  deleteTarget.value = {
    type: "lesson",
    data: lesson,
    chapter,
    label: "Xóa bài học?",
    message: `Toàn bộ câu hỏi trong "${lesson.title}" cũng sẽ bị xóa.`,
  };
  deleteDialog.value = true;
}

async function executeDelete() {
  const target = deleteTarget.value;
  try {
    if (target.type === "chapter") {
      await deleteChapterApi(target.data.id);
      await fetchChapters();
    } else {
      await deleteLessonApi(target.data.id);
      target.chapter.lessonsLoaded = false;
      await loadLessons(target.chapter);
    }
    deleteDialog.value = false;
  } catch (err) {
    console.error("Lỗi xóa:", err);
    alert(err.response?.data?.message || "Không thể xóa");
  }
}
</script>

<style scoped>
/* Chapter panels */
.chapter-panels {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e8ecf4;
}

.chapter-panel-title :deep(.v-expansion-panel-title__overlay) {
  background: transparent;
}

.chapter-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chapter-index {
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: #eef3ff;
  color: #4f7cff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chapter-name {
  font-weight: 600;
  color: #1a1d2e;
  font-size: 14px;
}

/* Lesson rows */
.lesson-loading {
  display: flex;
  justify-content: center;
  padding: 16px;
}

.lesson-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 4px;
  border-bottom: 1px solid #f0f2f8;
  border-radius: 6px;
  transition: background 0.12s;
}

.lesson-row:hover {
  background: #fafbff;
}

.lesson-row:last-of-type {
  border-bottom: none;
}

.lesson-name {
  font-size: 13.5px;
  color: #374151;
}

.lesson-empty {
  font-size: 13px;
  color: #9ca3af;
  padding: 8px 4px;
}

.import-target-label {
  font-size: 12px;
  font-weight: 400;
  color: #9ca3af;
  margin-top: 2px;
}
</style>
