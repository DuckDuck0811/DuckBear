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

    <div v-if="chapters.length" class="chapter-list-heading">
      <h2>Danh sách chương</h2>
      <span>{{ chapters.length }} chương</span>
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
            <div class="chapter-heading-text">
              <span class="chapter-name">{{ chapter.title }}</span>
              <span v-if="chapter.description" class="chapter-description">
                {{ chapter.description }}
              </span>
            </div>
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
              <button type="button" class="lesson-name" @click="openLesson(lesson)">
                {{ lesson.title }}
              </button>
              <v-spacer />
              <v-btn
                icon="mdi-pencil-outline"
                variant="text"
                size="x-small"
                color="secondary"
                @click.stop="openEditLesson(chapter, lesson)"
              />
              <v-btn
                icon="mdi-delete-outline"
                variant="text"
                size="x-small"
                color="error"
                @click.stop="confirmDeleteLesson(chapter, lesson)"
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
              :rules="[(v) => !!v?.trim() || 'Không được để trống']"
              class="mb-3"
            />
            <div class="t-field-label">Mô tả ngắn (không bắt buộc)</div>
            <v-textarea
              v-model="chapterForm.description"
              variant="outlined"
              density="comfortable"
              rows="2"
              auto-grow
              maxlength="5000"
              class="mb-3"
            />
            <div class="t-field-label">Thứ tự</div>
            <v-text-field
              v-model.number="chapterForm.orderIndex"
              type="number"
              variant="outlined"
              density="comfortable"
              :rules="[(v) => Number(v) > 0 || 'Thứ tự phải lớn hơn 0']"
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
              :rules="[(v) => !!v?.trim() || 'Không được để trống']"
              class="mb-3"
            />
            <div class="t-field-label">Nội dung bài</div>
            <v-textarea
              v-model="lessonForm.content"
              variant="outlined"
              density="comfortable"
              rows="5"
              auto-grow
              placeholder="Nhập nội dung bài học..."
              class="mb-3"
            />
            <div class="t-field-label">Thứ tự</div>
            <v-text-field
              v-model.number="lessonForm.orderIndex"
              type="number"
              variant="outlined"
              density="comfortable"
              :rules="[(v) => Number(v) > 0 || 'Thứ tự phải lớn hơn 0']"
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

  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getBookByIdApi } from "@/api/book";
import {
  getChaptersByBookApi,
  createChapterApi,
  updateChapterApi,
  deleteChapterApi,
} from "@/api/chapter";
import {
  getLessonByIdApi,
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
const chapterForm = reactive({ title: "", description: "", orderIndex: 1 });

function openCreateChapter() {
  editingChapter.value = null;
  chapterForm.title = "";
  chapterForm.description = "";
  chapterForm.orderIndex = chapters.value.length + 1;
  chapterDialog.value = true;
}

function openEditChapter(chapter) {
  editingChapter.value = chapter;
  chapterForm.title = chapter.title;
  chapterForm.description = chapter.description || "";
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
    description: chapterForm.description,
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
const lessonForm = reactive({ title: "", content: "", orderIndex: 1 });

function openCreateLesson(chapter) {
  activeChapterForLesson.value = chapter;
  editingLesson.value = null;
  lessonForm.title = "";
  lessonForm.content = "";
  lessonForm.orderIndex = chapter.lessons.length + 1;
  lessonDialog.value = true;
}

async function openEditLesson(chapter, lesson) {
  try {
    const response = await getLessonByIdApi(lesson.id);
    activeChapterForLesson.value = chapter;
    editingLesson.value = lesson;
    lessonForm.title = response.data.title;
    lessonForm.content = response.data.content || "";
    lessonForm.orderIndex = response.data.orderIndex;
    lessonDialog.value = true;
  } catch (err) {
    console.error("Lỗi tải nội dung bài học:", err);
    alert(err.response?.data?.message || "Không thể tải nội dung bài học");
  }
}

async function saveLesson() {
  const { valid } = await lessonFormRef.value.validate();
  if (!valid) return;

  savingLesson.value = true;
  const chapter = activeChapterForLesson.value;
  const payload = {
    chapterId: chapter.id,
    title: lessonForm.title,
    content: lessonForm.content,
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

function openLesson(lesson) {
  router.push({ name: "teacher-lesson-detail", params: { lessonId: lesson.id } });
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

.chapter-heading-text {
  display: grid;
  gap: 3px;
}

.chapter-list-heading {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 10px 0 14px;
}

.chapter-list-heading h2 {
  margin: 0;
  color: #1a1d2e;
  font-size: 18px;
}

.chapter-list-heading span,
.chapter-description {
  color: #6b7280;
  font-size: 12px;
}

.chapter-description {
  white-space: normal;
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
  cursor: pointer;
}

.lesson-row:hover {
  background: #fafbff;
}

.lesson-row:last-of-type {
  border-bottom: none;
}

.lesson-name {
  border: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
  font-size: 13.5px;
  color: #374151;
  text-align: left;
}

.lesson-name:hover {
  color: #4f7cff;
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
