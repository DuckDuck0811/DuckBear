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

              <div
                v-if="chapter.description"
                class="chapter-desc-card"
                :class="{ 'is-expanded': expandedDesc[chapter.id] }"
              >
                <div class="chapter-desc-header">
                  <span class="desc-badge">
                    <v-icon size="13" class="mr-1">mdi-bullseye-arrow</v-icon>
                    {{ parseChapterDesc(chapter.description).prefix }}
                  </span>
                  <button
                    v-if="parseChapterDesc(chapter.description).items.length > 1 || chapter.description.length > 90"
                    type="button"
                    class="desc-toggle-btn"
                    @click.stop="toggleDesc(chapter.id)"
                  >
                    {{ expandedDesc[chapter.id] ? "Thu gọn" : "Xem chi tiết" }}
                    <v-icon size="14">
                      {{ expandedDesc[chapter.id] ? "mdi-chevron-up" : "mdi-chevron-down" }}
                    </v-icon>
                  </button>
                </div>

                <div class="chapter-desc-body">
                  <template v-if="expandedDesc[chapter.id]">
                    <div
                      v-for="(item, idx) in parseChapterDesc(chapter.description).items"
                      :key="idx"
                      class="desc-item"
                    >
                      <v-icon size="11" class="desc-dot">mdi-circle-medium</v-icon>
                      <span>{{ item }}</span>
                    </div>
                  </template>
                  <template v-else>
                    <p class="desc-preview">
                      {{ parseChapterDesc(chapter.description).preview }}
                    </p>
                  </template>
                </div>
              </div>
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
              <button type="button" class="lesson-name" @click="openLesson(lesson, chapter)">
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
const expandedDesc = reactive({});

function toggleDesc(chapterId) {
  expandedDesc[chapterId] = !expandedDesc[chapterId];
}

function parseChapterDesc(desc) {
  if (!desc) return { prefix: "Mục tiêu", items: [], preview: "" };
  let raw = desc.trim();
  let prefix = "Yêu cầu cần đạt";

  // Check prefix
  const prefixMatch = raw.match(/^(Yêu cầu cần đạt|Mục tiêu|Nội dung|Giới thiệu)\s*:\s*/i);
  if (prefixMatch) {
    prefix = prefixMatch[1];
    raw = raw.slice(prefixMatch[0].length).trim();
  }

  // Split into structured items: by newlines, semicolons or period before capital letter
  let items = [];
  if (raw.includes("\n")) {
    items = raw.split("\n").map(s => s.trim().replace(/^[-*•\d+.]\s*/, "")).filter(Boolean);
  } else if (raw.includes(";") && raw.split(";").length > 1) {
    items = raw.split(";").map(s => s.trim().replace(/\.$/, "")).filter(Boolean);
  } else {
    // Split sentences by dot followed by whitespace and capital letter
    const sentences = raw.split(/(?<=\.)\s+(?=[A-ZÀ-Ỹ0-9])/).map(s => s.trim()).filter(Boolean);
    items = sentences.length > 1 ? sentences : [raw];
  }

  const preview = items[0] || raw;
  return { prefix, items, preview };
}

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
    const response = await getLessonByIdApi(lesson.id, chapter.id);
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

async function openLesson(lesson, chapter) {
  if (!book.value) {
    try {
      const response = await getBookByIdApi(bookId);
      book.value = response.data;
    } catch (err) {
      console.error("Không thể tải thông tin môn học:", err);
    }
  }
  router.push({
    name: "teacher-lesson-detail",
    params: { lessonId: lesson.id },
    query: {
      bookId: String(bookId),
      chapterId: String(chapter.id),
      subjectName: book.value?.subjectName || "",
    },
  });
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
  align-items: flex-start;
  gap: 12px;
  flex: 1;
  min-width: 0;
  padding: 2px 0;
}

.chapter-heading-text {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 0;
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

.chapter-list-heading span {
  color: #6b7280;
  font-size: 12px;
}

.chapter-index {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: linear-gradient(135deg, #eef3ff 0%, #e0e9fe 100%);
  color: #3b66f5;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
  box-shadow: 0 1px 2px rgba(59, 102, 245, 0.08);
}

.chapter-name {
  font-weight: 700;
  color: #1e293b;
  font-size: 15px;
  line-height: 1.4;
}

/* Chapter Description Card */
.chapter-desc-card {
  margin-top: 2px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-left: 3px solid #4f7cff;
  border-radius: 8px;
  padding: 8px 12px;
  transition: all 0.2s ease;
  max-width: 100%;
}

.chapter-desc-card:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  border-left-color: #3b66f5;
}

.chapter-desc-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 4px;
}

.desc-badge {
  display: inline-flex;
  align-items: center;
  font-size: 11px;
  font-weight: 700;
  color: #3b66f5;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.desc-toggle-btn {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  transition: all 0.15s ease;
}

.desc-toggle-btn:hover {
  color: #1e293b;
  background: rgba(0, 0, 0, 0.04);
}

.chapter-desc-body {
  font-size: 12.5px;
  color: #475569;
  line-height: 1.55;
}

.desc-preview {
  margin: 0;
  color: #475569;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.desc-item {
  display: flex;
  align-items: flex-start;
  gap: 4px;
  margin-bottom: 4px;
  color: #334155;
}

.desc-item:last-child {
  margin-bottom: 0;
}

.desc-dot {
  color: #6366f1;
  flex-shrink: 0;
  margin-top: 3px;
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
