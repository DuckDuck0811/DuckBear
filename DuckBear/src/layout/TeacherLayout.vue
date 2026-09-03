<template>
  <v-app>
    <!-- Sidebar -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      permanent
      class="teacher-drawer"
      color="#ffffff"
    >
      <div class="drawer-brand" :class="{ 'justify-center': rail }">
        <v-icon icon="mdi-book-open-page-variant" size="26" color="#6366F1" />
        <span v-if="!rail" class="brand-text">Lớp học của tôi</span>
        <v-spacer v-if="!rail" />
        <v-btn
          v-if="!rail"
          icon="mdi-chevron-left"
          variant="text"
          size="small"
          color="#8A8DA6"
          @click="rail = true"
        />
      </div>
      <v-btn
        v-if="rail"
        icon="mdi-chevron-right"
        variant="text"
        size="small"
        color="#8A8DA6"
        class="rail-expand-btn"
        @click="rail = false"
      />

      <div class="drawer-scroll">
        <v-list nav density="comfortable" class="mt-2">
          <div
            v-for="section in menuSections"
            :key="section.title"
            class="menu-section"
          >
            <div
              v-if="!rail"
              class="section-label"
              @click="toggleSection(section.title)"
            >
              <span>{{ section.title }}</span>
              <v-icon
                icon="mdi-chevron-down"
                size="16"
                class="section-caret"
                :class="{
                  'section-caret--collapsed': !openSections[section.title],
                }"
              />
            </div>
            <v-expand-transition>
              <div v-show="rail || openSections[section.title]">
                <v-list-item
                  v-for="item in section.items"
                  :key="item.to"
                  :to="item.to"
                  :prepend-icon="item.icon"
                  :title="item.label"
                  rounded="lg"
                  class="menu-item"
                  active-class="menu-item--active"
                />
              </div>
            </v-expand-transition>
          </div>
        </v-list>

        <div v-if="!rail" class="drawer-illustration">
          <img src="/book.png" alt="" class="drawer-illustration-img" />
        </div>
      </div>
    </v-navigation-drawer>

    <!-- Header -->
    <v-app-bar flat color="white" class="teacher-appbar" height="64">
      <v-app-bar-title class="page-title">{{ pageTitle }}</v-app-bar-title>
      <v-spacer />

      <v-btn icon variant="text" class="mr-1">
        <v-badge dot color="#6366F1" offset-x="2" offset-y="2">
          <v-icon icon="mdi-bell-outline" color="#8A8DA6" />
        </v-badge>
      </v-btn>

      <v-menu location="bottom end">
        <template #activator="{ props }">
          <div class="teacher-chip" v-bind="props">
            <v-avatar size="36" color="#6366F1">
              <span class="avatar-initial">{{ initials }}</span>
            </v-avatar>
            <div class="teacher-meta">
              <span class="teacher-name">{{ teacher.name }}</span>
              <span class="teacher-role">Giáo viên</span>
            </div>
            <v-icon icon="mdi-chevron-down" size="18" color="#8A8DA6" />
          </div>
        </template>
        <v-list density="compact" min-width="180">
          <v-list-item
            prepend-icon="mdi-account-outline"
            title="Hồ sơ cá nhân"
            :to="{ name: 'teacher-profile' }"
          />
          <v-list-item
            prepend-icon="mdi-logout"
            title="Đăng xuất"
            @click="$emit('logout')"
          />
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Content -->
    <v-main class="teacher-main">
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";

const props = defineProps({
  teacher: {
    type: Object,
    default: () => ({ name: "Giáo viên" }),
  },
});
defineEmits(["logout"]);

const drawer = ref(true);
const rail = ref(false);
const route = useRoute();

const menuSections = [
  {
    title: "Học liệu",
    items: [
      {
        label: "Sách / Môn học",
        icon: "mdi-bookshelf",
        to: { name: "teacher-books" },
      },
      {
        label: "Chương - Bài học",
        icon: "mdi-file-tree-outline",
        to: { name: "teacher-lessons" },
      },
      {
        label: "Ngân hàng câu hỏi",
        icon: "mdi-help-box-multiple-outline",
        to: { name: "teacher-questions" },
      },
      {
        label: "Scan tài liệu (OCR)",
        icon: "mdi-camera-document",
        to: { name: "teacher-ocr" },
      },
    ],
  },
  {
    title: "Bài tập",
    items: [
      {
        label: "Tạo bài tập",
        icon: "mdi-clipboard-edit-outline",
        to: { name: "teacher-assignments-create" },
      },
      {
        label: "Sinh đề tổng hợp",
        icon: "mdi-shuffle-variant",
        to: { name: "teacher-assignments-generate" },
      },
      {
        label: "Ngân hàng đề",
        icon: "mdi-archive-outline",
        to: { name: "teacher-assignments-bank" },
      },
    ],
  },
  {
    title: "Lớp học",
    items: [
      {
        label: "Lớp / Niên khóa",
        icon: "mdi-google-classroom",
        to: { name: "teacher-classes" },
      },
      {
        label: "Nhật ký hoạt động",
        icon: "mdi-history",
        to: { name: "teacher-logs" },
      },
    ],
  },
  {
    label: "Xem sách (lật trang)",
    icon: "mdi-book-open-variant",
    to: { name: "teacher-book-viewer" }, 
  },
];

// Accordion state: all sections open by default
const openSections = ref(
  Object.fromEntries(menuSections.map((s) => [s.title, true])),
);

function toggleSection(title) {
  openSections.value[title] = !openSections.value[title];
}

const pageTitle = computed(() => route.meta?.title || "Tổng quan");

const initials = computed(() => {
  const parts = (props.teacher.name || "GV").trim().split(" ");
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
});
</script>

<style scoped>
.teacher-drawer {
  border-right: 1px solid #ececf3;
  position: relative;
}

.teacher-drawer :deep(.v-navigation-drawer__content) {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.teacher-drawer :deep(.v-list) {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: visible;
}

.drawer-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.drawer-scroll::-webkit-scrollbar {
  width: 6px;
}

.drawer-scroll::-webkit-scrollbar-thumb {
  background: #d7d8e6;
  border-radius: 3px;
}

.drawer-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.drawer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 16px;
  flex: 0 0 auto;
}

.brand-text {
  color: #4338ca;
  font-weight: 700;
  font-size: 16px;
  letter-spacing: 0.1px;
}

.rail-expand-btn {
  display: flex;
  margin: 8px auto 0;
  flex: 0 0 auto;
}

.menu-section {
  margin-bottom: 8px;
}

.section-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #9a9caf;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
    sans-serif;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.4px;
  padding: 14px 16px 8px;
  cursor: pointer;
  user-select: none;
  transition: color 0.15s ease;
}

.section-label:hover {
  color: #6366f1;
}

.section-caret {
  color: #b7b9cc;
  transition: transform 0.2s ease;
}

.section-caret--collapsed {
  transform: rotate(-90deg);
}

.menu-item {
  color: #4b4d63 !important;
  margin: 2px 8px;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial,
    sans-serif;
  font-size: 14px;
}

.menu-item :deep(.v-icon) {
  color: #9a9caf;
}

/* Active item: light purple background, purple text/icon —
    matches the "Sách / Môn học" state in the screenshot */
.menu-item--active {
  background: #eef0fe !important;
  color: #4f46e5 !important;
  font-weight: 600;
}

.menu-item--active :deep(.v-icon) {
  color: #6366f1 !important;
}

.teacher-appbar {
  border-bottom: 1px solid #ececf3;
}

.page-title {
  font-weight: 700;
  color: #1b1b2e;
  font-size: 20px;
}

.teacher-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 10px;
  cursor: pointer;
}

.teacher-chip:hover {
  background: #f4f5fb;
}

.avatar-initial {
  color: #ffffff;
  font-weight: 700;
  font-size: 13px;
}

.teacher-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.teacher-name {
  font-size: 13px;
  font-weight: 600;
  color: #1b1b1f;
}

.teacher-role {
  font-size: 11px;
  color: #8a8a92;
}

.teacher-main {
  background: #f8f8fc;
}

.drawer-illustration {
  position: relative;
  padding: 12px 12px 8px;
  pointer-events: none;
  margin-top: auto;
  flex: 0 0 auto;
}

.drawer-illustration-img {
  width: 100%;
  height: auto;
  display: block;
  opacity: 0.9;
}
</style>
