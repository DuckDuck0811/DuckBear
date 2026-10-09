<template>
  <main class="other-lesson-page">
    <header class="reader-toolbar">
      <v-btn
        variant="text"
        prepend-icon="mdi-arrow-left"
        class="text-none"
        @click="goBack"
      >
        Quay lại danh sách chương
      </v-btn>
      <div class="reader-tools">
        <v-btn-toggle
          v-model="viewMode"
          mandatory
          density="compact"
          rounded="lg"
          class="view-mode-toggle"
        >
          <v-btn
            value="visual"
            class="text-none text-caption font-weight-bold"
            prepend-icon="mdi-view-dashboard-outline"
          >
            Trực quan
          </v-btn>
          <v-btn
            value="raw"
            class="text-none text-caption font-weight-bold"
            prepend-icon="mdi-text"
          >
            Văn bản gốc
          </v-btn>
        </v-btn-toggle>
        <v-btn-group density="compact" variant="outlined" class="font-size-group">
          <v-btn size="x-small" :color="fontSize === 'small' ? 'primary' : undefined" @click="fontSize = 'small'">A-</v-btn>
          <v-btn size="x-small" :color="fontSize === 'normal' ? 'primary' : undefined" @click="fontSize = 'normal'">A</v-btn>
          <v-btn size="x-small" :color="fontSize === 'large' ? 'primary' : undefined" @click="fontSize = 'large'">A+</v-btn>
        </v-btn-group>
        <v-btn
          color="primary"
          variant="flat"
          size="small"
          prepend-icon="mdi-creation"
          class="text-none ai-gen-btn"
          :to="{ name: 'teacher-assignments-generate' }"
        >
          Sinh câu hỏi AI
        </v-btn>
      </div>
    </header>

    <div v-if="loading" class="state-panel">
      <v-progress-circular indeterminate color="primary" />
      <p>Đang tải nội dung bài học...</p>
    </div>
    <v-alert v-else-if="error" type="error" variant="tonal" rounded="lg">
      {{ error }}
    </v-alert>
    <template v-else-if="lesson && chapter">
      <header class="lesson-hero-card">
        <div class="hero-top-row">
          <div class="lesson-breadcrumbs">
            <span class="subject-pill">
              <v-icon icon="mdi-book-open-page-variant" size="14" class="mr-1" />
              {{ chapter.bookTitle || subjectName || "Học liệu" }}
            </span>
            <v-icon icon="mdi-chevron-right" size="15" color="#94A3B8" />
            <span class="chapter-pill">{{ chapter.title }}</span>
          </div>
          <div class="lesson-meta-chips">
            <span class="meta-chip">
              <v-icon icon="mdi-clock-outline" size="14" class="mr-1" />
              Khoảng {{ estimatedMinutes }} phút học
            </span>
            <span v-if="headerSections.length" class="meta-chip meta-chip--highlight">
              <v-icon icon="mdi-layers-outline" size="14" class="mr-1" />
              {{ headerSections.length }} phần trọng tâm
            </span>
          </div>
        </div>

        <h1 class="hero-lesson-title">{{ lesson.title }}</h1>

        <div v-if="headerSections.length > 1" class="section-quick-jump">
          <span class="quick-jump-label">
            <v-icon icon="mdi-format-list-bulleted" size="15" class="mr-1" />
            Mục lục:
          </span>
          <div class="quick-jump-tags">
            <button
              v-for="(section, index) in headerSections"
              :key="index"
              type="button"
              class="jump-tag-btn"
              @click="scrollToSection(index)"
            >
              <span class="jump-num">{{ index + 1 }}</span>
              <span class="jump-text">{{ section.cleanTitle || section.title }}</span>
            </button>
          </div>
        </div>
      </header>

      <article v-if="viewMode === 'raw'" class="raw-content">
        <div class="raw-header">
          <v-icon icon="mdi-text-box-outline" size="18" color="#64748B" class="mr-2" />
          <span>Văn bản gốc bài học</span>
        </div>
        <div class="raw-body-content" :class="`font-${fontSize}`">
          {{ lesson.content || "Bài học chưa có nội dung." }}
        </div>
      </article>
      <component
        :is="contentComponent"
        v-else
        :lesson="lesson"
        :chapter="chapter"
        :font-size="fontSize"
      />

      <nav class="lesson-navigation-bar" aria-label="Điều hướng bài học">
        <v-btn
          variant="outlined"
          color="secondary"
          prepend-icon="mdi-arrow-left"
          class="text-none nav-action-btn"
          :disabled="currentIndex <= 0"
          @click="navigateTo(sequence[currentIndex - 1])"
        >
          <div class="text-left">
            <div class="nav-btn-sub">Bài trước</div>
            <div v-if="sequence[currentIndex - 1]" class="nav-btn-title">
              {{ sequence[currentIndex - 1].title }}
            </div>
          </div>
        </v-btn>

        <div v-if="currentIndex >= 0" class="nav-progress-center">
          <div class="progress-pill">
            Bài {{ currentIndex + 1 }} / {{ sequence.length }}
          </div>
          <v-progress-linear
            :model-value="((currentIndex + 1) / (sequence.length || 1)) * 100"
            color="primary"
            height="5"
            rounded
            class="progress-bar-line"
          />
        </div>

        <v-btn
          variant="flat"
          color="primary"
          append-icon="mdi-arrow-right"
          class="text-none nav-action-btn"
          :disabled="currentIndex < 0 || currentIndex >= sequence.length - 1"
          @click="navigateTo(sequence[currentIndex + 1])"
        >
          <div class="text-right">
            <div class="nav-btn-sub">Bài tiếp theo</div>
            <div v-if="sequence[currentIndex + 1]" class="nav-btn-title">
              {{ sequence[currentIndex + 1].title }}
            </div>
          </div>
        </v-btn>
      </nav>
    </template>
  </main>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getChapterByIdApi, getChaptersByBookApi } from "@/api/chapter";
import { getLessonByIdApi, getLessonsByChapterApi } from "@/api/lesson";
import GeographyLessonContent from "@/view/Lession/subjects/GeographyLessonContent.vue";
import GenericLessonContent from "@/view/Lession/subjects/GenericLessonContent.vue";
import HistoryLessonContent from "@/view/Lession/subjects/HistoryLessonContent.vue";
import LiteratureLessonContent from "@/view/Lession/subjects/Literature/LiteratureLessonContent.vue";
import { parseLiteratureSections } from "@/view/Lession/subjects/Literature/Literatureparser";

const route = useRoute();
const router = useRouter();
const lesson = ref(null);
const chapter = ref(null);
const sequence = ref([]);
const loading = ref(true);
const error = ref("");
const viewMode = ref("visual");
const fontSize = ref("normal");
let requestId = 0;

const currentIndex = computed(() =>
  sequence.value.findIndex(
    (item) =>
      Number(item.id) === Number(route.params.lessonId) &&
      Number(item.chapterId) === Number(lesson.value?.chapterId),
  ),
);

const subjectName = computed(() => String(route.query.subjectName || ""));
const estimatedMinutes = computed(() => {
  const words = (lesson.value?.content || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.min(10, Math.ceil(words / 100)));
});
const normalizedSubject = computed(() =>
  subjectName.value.toLocaleLowerCase("vi").normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
);
const contentComponent = computed(() => {
  const subject = normalizedSubject.value;
  if (subject.includes("ngu van") || subject.includes("van hoc")) return LiteratureLessonContent;
  if (subject.includes("lich su")) return HistoryLessonContent;
  if (subject.includes("dia li") || subject.includes("dia ly")) return GeographyLessonContent;
  return GenericLessonContent;
});
const headerSections = computed(() =>
  contentComponent.value === LiteratureLessonContent
    ? parseLiteratureSections(lesson.value?.content)
    : [],
);

function scrollToSection(index) {
  document
    .getElementById(`lesson-section-${index}`)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function loadLesson() {
  const currentRequest = ++requestId;
  loading.value = true;
  error.value = "";
  lesson.value = null;
  chapter.value = null;
  sequence.value = [];
  try {
    const lessonResponse = await getLessonByIdApi(
      route.params.lessonId,
      route.query.chapterId,
    );
    const chapterResponse = await getChapterByIdApi(lessonResponse.data.chapterId);
    if (currentRequest !== requestId) return;
    lesson.value = lessonResponse.data;
    chapter.value = chapterResponse.data;
    sequence.value = [lessonResponse.data];
    loading.value = false;

    try {
      const chaptersResponse = await getChaptersByBookApi(
        chapterResponse.data.bookId,
      );
      const chapterLessons = await Promise.all(
        chaptersResponse.data.map(async (item) => {
          const lessonsResponse = await getLessonsByChapterApi(item.id);
          return lessonsResponse.data || [];
        }),
      );
      if (currentRequest !== requestId) return;
      const allLessons = chapterLessons.flat();
      sequence.value = allLessons.some(
        (item) => Number(item.id) === Number(lessonResponse.data.id),
      )
        ? allLessons
        : [lessonResponse.data, ...allLessons];
    } catch (sequenceError) {
      console.warn("Không thể tải danh sách điều hướng bài học:", sequenceError);
    }
  } catch (err) {
    if (currentRequest !== requestId) return;
    error.value = err.response?.data?.message || err.message || "Không thể tải nội dung bài học.";
  } finally {
    if (currentRequest === requestId) loading.value = false;
  }
}

function goBack() {
  const bookId = route.query.bookId || chapter.value?.bookId;
  if (bookId) {
    router.push({ name: "teacher-lessons", query: { bookId } });
  } else {
    router.push({ name: "teacher-books" });
  }
}

function navigateTo(target) {
  if (!target) return;
  router.push({
    name: "teacher-lesson-detail",
    params: { lessonId: target.id },
    query: {
      ...route.query,
      chapterId: String(target.chapterId),
    },
  });
}

watch(() => route.params.lessonId, loadLesson, { immediate: true });
</script>

<style scoped>
.other-lesson-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 20px 80px;
  font-family: var(--t-font, "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
}
.reader-toolbar,
.lesson-breadcrumbs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.reader-toolbar {
  flex-wrap: wrap;
  margin-bottom: 24px;
}
.reader-tools {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  flex-wrap: wrap;
}
.view-mode-toggle,
.font-size-group {
  border: 1px solid #dbe3ef;
  border-radius: 10px;
  background: #ffffff;
}
.ai-gen-btn {
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%) !important;
  color: #ffffff !important;
  border-radius: 8px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25);
}
.lesson-hero-card {
  padding: 28px 32px;
  margin-bottom: 24px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
}
.hero-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
}
.lesson-breadcrumbs {
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 8px;
}
.subject-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border: 1px solid #dbeafe;
  border-radius: 999px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 12px;
  font-weight: 700;
}
.chapter-pill {
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}
.lesson-meta-chips {
  display: flex;
  align-items: center;
  gap: 8px;
}
.meta-chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 6px;
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  font-weight: 600;
}
.meta-chip--highlight {
  background: #fef3c7;
  color: #b45309;
}
.hero-lesson-title {
  margin: 0 0 20px;
  color: #0f172a;
  font-family: var(--t-font, "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
  font-size: clamp(22px, 3.2vw, 30px);
  font-weight: 800;
  line-height: 1.35;
  letter-spacing: -0.02em;
}
.section-quick-jump {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 16px;
  border-top: 1px dashed #e2e8f0;
}
.quick-jump-label {
  display: flex;
  align-items: center;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}
.quick-jump-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.jump-tag-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #ffffff;
  color: #334155;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.jump-tag-btn:hover {
  border-color: #93c5fd;
  background: #eff6ff;
  color: #1d4ed8;
}
.jump-num {
  display: inline-flex;
  width: 22px;
  height: 22px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e2e8f0;
  color: #475569;
  font-size: 11px;
}
.jump-text {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lesson-navigation-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 24px;
  margin-bottom: 20px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
}
.lesson-navigation-bar:last-child {
  margin-top: 20px;
  margin-bottom: 0;
}
.nav-action-btn {
  height: auto !important;
  min-height: 48px;
  padding: 12px 20px !important;
  border-radius: 10px !important;
}
.nav-btn-sub {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  opacity: 0.8;
}
.nav-btn-title {
  max-width: 180px;
  overflow: hidden;
  font-size: 12px;
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.nav-progress-center {
  display: flex;
  min-width: 140px;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.progress-pill {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}
.progress-bar-line {
  width: 120px;
  border-radius: 999px;
}
.raw-content {
  padding: 24px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #fff;
  color: #334155;
  line-height: 1.85;
}
.raw-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
  color: #64748b;
  font-size: 13px;
  font-weight: 700;
}
.raw-body-content {
  color: #334155;
  line-height: 1.85;
  white-space: pre-wrap;
  word-break: break-word;
}
.font-small { font-size: 14px; }
.font-normal { font-size: 16px; }
.font-large { font-size: 19px; }
.state-panel {
  padding: 48px 20px;
  text-align: center;
  color: #64748b;
}
@media (max-width: 768px) {
  .reader-toolbar {
    align-items: stretch;
  }
  .reader-tools {
    justify-content: flex-start;
  }
  .lesson-hero-card {
    padding: 20px;
  }
  .lesson-meta-chips {
    flex-wrap: wrap;
  }
  .jump-text {
    max-width: 180px;
  }
  .lesson-navigation-bar {
    flex-direction: column;
    align-items: stretch;
  }
  .nav-btn-title {
    max-width: none;
  }
  .nav-progress-center {
    order: -1;
    margin-bottom: 8px;
  }
}
</style>
