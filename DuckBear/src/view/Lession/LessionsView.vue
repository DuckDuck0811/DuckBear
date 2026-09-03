<template>
  <div class="lessons-view">
    <div class="view-header">
      <div>
        <div class="breadcrumb" @click="goBack">
          <v-icon icon="mdi-arrow-left" size="18" />
          Sách / Môn học
        </div>
        <h1 class="view-title">{{ book?.title || "Đang tải..." }}</h1>
        <p class="view-subtitle" v-if="book">
          {{ book.subjectName }} · Lớp {{ book.gradeLevel }}
        </p>
      </div>
      <v-btn
        color="#1B2A4A"
        variant="flat"
        prepend-icon="mdi-plus"
        class="text-none"
        @click="openCreateChapter"
      >
        Thêm chương
      </v-btn>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && chapters.length === 0" class="empty-state">
      <v-icon icon="mdi-format-list-numbered" size="48" color="#c7cbd6" />
      <p class="empty-title">Chưa có chương nào</p>
      <p class="empty-desc">
        Thêm chương đầu tiên để bắt đầu tạo bài học và câu hỏi.
      </p>
      <v-btn
        color="#1B2A4A"
        variant="flat"
        class="text-none mt-2"
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
        <v-expansion-panel-title>
          <div class="chapter-title-row">
            <span class="chapter-index">{{ chapter.orderIndex }}</span>
            <span class="chapter-name">{{ chapter.title }}</span>
          </div>
          <template #actions>
            <v-btn
              icon="mdi-pencil-outline"
              variant="text"
              size="small"
              @click.stop="openEditChapter(chapter)"
            />
            <v-btn
              icon="mdi-delete-outline"
              variant="text"
              size="small"
              @click.stop="confirmDeleteChapter(chapter)"
            />
          </template>
        </v-expansion-panel-title>

        <v-expansion-panel-text>
          <div v-if="chapter.loadingLessons" class="lesson-loading">
            <v-progress-circular indeterminate size="20" color="#1B2A4A" />
          </div>

          <div v-else>
            <div
              v-for="lesson in chapter.lessons"
              :key="lesson.id"
              class="lesson-row"
            >
              <v-icon icon="mdi-book-open-outline" size="18" color="#8A93A6" />
              <span class="lesson-name">{{ lesson.title }}</span>
              <v-spacer />
              <v-btn
                icon="mdi-pencil-outline"
                variant="text"
                size="x-small"
                @click="openEditLesson(chapter, lesson)"
              />
              <v-btn
                icon="mdi-delete-outline"
                variant="text"
                size="x-small"
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
              color="#1B2A4A"
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
      <v-card class="pa-2">
        <v-card-title class="dialog-title">
          {{ editingChapter ? "Sửa chương" : "Thêm chương mới" }}
        </v-card-title>
        <v-card-text>
          <v-form ref="chapterFormRef">
            <div class="field-label">Tên chương</div>
            <v-text-field
              v-model="chapterForm.title"
              variant="outlined"
              density="comfortable"
              placeholder="VD: Chương 1: Số tự nhiên"
              :rules="[(v) => !!v || 'Không được để trống']"
              class="mb-3"
            />
            <div class="field-label">Thứ tự</div>
            <v-text-field
              v-model.number="chapterForm.orderIndex"
              type="number"
              variant="outlined"
              density="comfortable"
              :rules="[(v) => !!v || 'Không được để trống']"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" class="text-none" @click="chapterDialog = false"
            >Hủy</v-btn
          >
          <v-btn
            color="#1B2A4A"
            variant="flat"
            class="text-none"
            :loading="savingChapter"
            @click="saveChapter"
          >
            {{ editingChapter ? "Lưu" : "Thêm chương" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Lesson dialog -->
    <v-dialog v-model="lessonDialog" max-width="440">
      <v-card class="pa-2">
        <v-card-title class="dialog-title">
          {{ editingLesson ? "Sửa bài học" : "Thêm bài học mới" }}
        </v-card-title>
        <v-card-text>
          <v-form ref="lessonFormRef">
            <div class="field-label">Tên bài học</div>
            <v-text-field
              v-model="lessonForm.title"
              variant="outlined"
              density="comfortable"
              placeholder="VD: Bài 1: Tập hợp"
              :rules="[(v) => !!v || 'Không được để trống']"
              class="mb-3"
            />
            <div class="field-label">Thứ tự</div>
            <v-text-field
              v-model.number="lessonForm.orderIndex"
              type="number"
              variant="outlined"
              density="comfortable"
              :rules="[(v) => !!v || 'Không được để trống']"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="pa-4 pt-0">
          <v-spacer />
          <v-btn variant="text" class="text-none" @click="lessonDialog = false"
            >Hủy</v-btn
          >
          <v-btn
            color="#1B2A4A"
            variant="flat"
            class="text-none"
            :loading="savingLesson"
            @click="saveLesson"
          >
            {{ editingLesson ? "Lưu" : "Thêm bài học" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete confirm (dùng chung cho chapter/lesson) -->
    <v-dialog v-model="deleteDialog" max-width="380">
      <v-card class="pa-2">
        <v-card-title class="dialog-title">{{
          deleteTarget?.label
        }}</v-card-title>
        <v-card-text class="text-body-2" style="color: #6b7383">
          {{ deleteTarget?.message }}
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
            @click="executeDelete"
            >Xóa</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Import material dialog -->
    <v-dialog v-model="materialDialog" max-width="460">
      <v-card class="pa-2">
        <v-card-title class="dialog-title">
          Nhập file PDF
          <div class="import-target-label">{{ importTargetLabel }}</div>
        </v-card-title>
        <v-card-text>
          <v-form ref="materialFormRef">
            <div class="field-label">Tiêu đề tài liệu</div>
            <v-text-field
              v-model="materialForm.title"
              variant="outlined"
              density="comfortable"
              placeholder="VD: Sách giáo khoa (bản scan)"
              :rules="[(v) => !!v || 'Không được để trống']"
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
            >Hủy</v-btn
          >
          <v-btn
            color="#1B2A4A"
            variant="flat"
            class="text-none"
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
  router.push({ name: "teacher-books" }); // đổi lại đúng tên route trang Sách của bro nếu khác
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
const importTarget = ref(null); // { type: 'book'|'chapter'|'lesson', chapter, lesson }

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
const deleteTarget = ref(null); // { type: 'chapter'|'lesson', data, chapter, label, message }

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
.lessons-view {
  padding: 28px;
}

.view-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #8a93a6;
  cursor: pointer;
  margin-bottom: 6px;
}

.breadcrumb:hover {
  color: #1b2a4a;
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

.chapter-panels {
  border-radius: 14px;
  overflow: hidden;
}

.chapter-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.chapter-index {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #eef0f6;
  color: #4c5670;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chapter-name {
  font-weight: 600;
  color: #1a2540;
  font-size: 14px;
}

.lesson-loading {
  display: flex;
  justify-content: center;
  padding: 12px;
}

.lesson-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 4px;
  border-bottom: 1px solid #f0f1f5;
}

.lesson-name {
  font-size: 13.5px;
  color: #2d3650;
}

.lesson-empty {
  font-size: 13px;
  color: #8a93a6;
  padding: 8px 4px;
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
