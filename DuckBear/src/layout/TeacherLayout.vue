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
        <div class="brand-logo">
          <v-icon icon="mdi-book-open-page-variant" size="22" color="#4F7CFF" />
        </div>
        <span v-if="!rail" class="brand-text">Lớp học của tôi</span>
        <v-spacer v-if="!rail" />
        <v-btn
          v-if="!rail"
          icon="mdi-chevron-left"
          variant="text"
          size="small"
          color="#9CA3AF"
          @click="rail = true"
        />
      </div>

      <v-btn
        v-if="rail"
        icon="mdi-chevron-right"
        variant="text"
        size="small"
        color="#9CA3AF"
        class="rail-expand-btn"
        @click="rail = false"
      />

      <div class="drawer-scroll">
        <v-list nav density="comfortable" class="mt-1 drawer-list">
          <div
            v-for="section in menuSections"
            :key="section.title"
            class="menu-section"
          >
            <div
              v-if="!rail && section.title"
              class="section-label"
              @click="toggleSection(section.title)"
            >
              <span>{{ section.title }}</span>
              <v-icon
                icon="mdi-chevron-down"
                size="15"
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
                  :key="item.to.name"
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

    <!-- Appbar -->
    <v-app-bar flat color="white" class="teacher-appbar" height="60">
      <v-app-bar-title class="page-title">{{ pageTitle }}</v-app-bar-title>
      <v-spacer />

      <v-btn icon variant="text" class="mr-1" size="small">
        <v-badge dot color="#4F7CFF" offset-x="2" offset-y="2">
          <v-icon icon="mdi-bell-outline" color="#9CA3AF" size="20" />
        </v-badge>
      </v-btn>

      <v-menu location="bottom end">
        <template #activator="{ props }">
          <div class="teacher-chip" v-bind="props">
            <v-avatar size="32" color="#4F7CFF">
              <span class="avatar-initial">{{ initials }}</span>
            </v-avatar>
            <div class="teacher-meta" v-if="!isMobile">
              <span class="teacher-name">{{ teacher.name }}</span>
              <span class="teacher-role">Giáo viên</span>
            </div>
            <v-icon icon="mdi-chevron-down" size="16" color="#9CA3AF" />
          </div>
        </template>
        <v-list density="compact" min-width="190" class="menu-dropdown">
          <v-list-item
            prepend-icon="mdi-account-outline"
            title="Hồ sơ cá nhân"
            :to="{ name: 'teacher-profile' }"
          />
          <v-divider class="my-1" />
          <v-list-item
            prepend-icon="mdi-logout"
            title="Đăng xuất"
            class="text-error"
            @click="$emit('logout')"
          />
        </v-list>
      </v-menu>
      <div class="mr-2" />
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
import { useDisplay } from "vuetify";

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
const { mobile: isMobile } = useDisplay();

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
        label: "Sinh đề AI",
        icon: "mdi-creation",
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
    title: "Gamification",
    items: [
      {
        label: "Quản lý huy hiệu",
        icon: "mdi-medal-outline",
        to: { name: "teacher-badges" },
      },
    ],
  },
];

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
/* ---- Drawer ---- */
.teacher-drawer {
  position: fixed !important;
  top: 0 !important;
  bottom: 0 !important;
  height: 100vh !important;
  height: 100dvh !important;
  max-height: 100dvh;
  border-right: 1px solid #e8ecf4;
}

.teacher-drawer :deep(.v-navigation-drawer__content) {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* ---- Brand ---- */
.drawer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 14px 14px;
  flex: 0 0 auto;
  border-bottom: 1px solid #f0f2f8;
  margin-bottom: 4px;
}

.brand-logo {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: #eef3ff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.brand-text {
  color: #1a1d2e;
  font-weight: 700;
  font-size: 15px;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  letter-spacing: -0.1px;
}

.rail-expand-btn {
  display: flex;
  margin: 10px auto 0;
  flex: 0 0 auto;
}

/* ---- Scroll area ---- */
.drawer-scroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

.drawer-scroll::-webkit-scrollbar {
  width: 4px;
}

.drawer-scroll::-webkit-scrollbar-thumb {
  background: #e0e4ef;
  border-radius: 4px;
}

.drawer-scroll::-webkit-scrollbar-track {
  background: transparent;
}

/* ---- List ---- */
.drawer-list {
  padding: 4px 8px;
}

/* ---- Section label ---- */
.menu-section {
  margin-bottom: 4px;
}

.section-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #9ca3af;
  padding: 12px 10px 6px;
  cursor: pointer;
  user-select: none;
  transition: color 0.15s;
}

.section-label:hover {
  color: #4f7cff;
}

.section-caret {
  color: #c4c9d8;
  transition: transform 0.2s ease;
}

.section-caret--collapsed {
  transform: rotate(-90deg);
}

/* ---- Menu items ---- */
.menu-item {
  color: #6b7280 !important;
  margin: 1px 0;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-size: 13.5px;
  font-weight: 500;
  border-radius: 8px !important;
}

.menu-item :deep(.v-icon) {
  color: #9ca3af !important;
  font-size: 18px !important;
}

.menu-item :deep(.v-list-item-title) {
  font-size: 13.5px !important;
  font-weight: 500;
}

.menu-item--active {
  background: #eef3ff !important;
  color: #4f7cff !important;
  font-weight: 600 !important;
}

.menu-item--active :deep(.v-icon) {
  color: #4f7cff !important;
}

.menu-item--active :deep(.v-list-item-title) {
  font-weight: 600 !important;
  color: #4f7cff !important;
}

/* ---- Appbar ---- */
.teacher-appbar {
  border-bottom: 1px solid #e8ecf4 !important;
}

.page-title :deep(.v-app-bar-title__content) {
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  font-weight: 600;
  font-size: 17px;
  color: #1a1d2e;
  letter-spacing: -0.1px;
}

/* ---- Teacher chip ---- */
.teacher-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
}

.teacher-chip:hover {
  background: #f3f6ff;
}

.avatar-initial {
  color: #ffffff;
  font-weight: 700;
  font-size: 12px;
  font-family: "Inter", sans-serif;
}

.teacher-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.25;
}

.teacher-name {
  font-family: "Inter", sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #1a1d2e;
}

.teacher-role {
  font-family: "Inter", sans-serif;
  font-size: 11px;
  color: #9ca3af;
}

/* ---- Dropdown ---- */
.menu-dropdown {
  border: 1px solid #e8ecf4;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(20, 30, 80, 0.08);
}

/* ---- Main content ---- */
.teacher-main {
  background: #f8f9fc;
}

/* ---- Illustration ---- */
.drawer-illustration {
  padding: 12px 10px 10px;
  pointer-events: none;
  margin-top: auto;
  flex: 0 0 auto;
}

.drawer-illustration-img {
  width: 100%;
  height: auto;
  display: block;
  opacity: 0.85;
  border-radius: 10px;
}
</style>
