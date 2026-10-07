<template>
  <div class="t-page-wrap">
    <!-- Header -->
    <div class="t-page-heading">
      <div>
        <div class="t-eyebrow">HỆ THỐNG</div>
        <h1 class="t-page-title">Nhật ký hoạt động</h1>
        <p class="t-page-subtitle">
          Theo dõi lịch sử thao tác tạo đề, điểm danh, chấm bài và quản lý lớp học.
        </p>
      </div>
      <v-btn
        variant="outlined"
        color="secondary"
        prepend-icon="mdi-refresh"
        class="text-none"
        style="border-radius: 8px; font-weight: 600"
        @click="refreshLogs"
      >
        Làm mới
      </v-btn>
    </div>

    <!-- Filter Bar -->
    <div class="t-filter-bar">
      <div class="d-flex flex-wrap align-center justify-between ga-3">
        <!-- Filter Tabs -->
        <div class="d-flex flex-wrap ga-2">
          <v-chip
            v-for="cat in categories"
            :key="cat.value"
            :color="selectedCategory === cat.value ? 'primary' : 'default'"
            :variant="selectedCategory === cat.value ? 'flat' : 'tonal'"
            class="text-none font-weight-600"
            @click="selectedCategory = cat.value"
          >
            {{ cat.label }}
          </v-chip>
        </div>

        <div style="min-width: 260px">
          <v-text-field
            v-model="searchQuery"
            placeholder="Tìm theo nội dung nhật ký..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="compact"
            hide-details
            bg-color="white"
          />
        </div>
      </div>
    </div>

    <!-- Activity Log Card -->
    <div class="t-card">
      <div class="px-5 py-4 border-b d-flex align-center">
        <span class="section-title">Lịch sử sự kiện gần đây</span>
        <v-spacer />
        <span class="text-caption text-muted">Hiển thị {{ filteredLogs.length }} bản ghi</span>
      </div>

      <div v-if="!filteredLogs.length" class="t-empty-state">
        <v-icon icon="mdi-history" size="48" color="#9CA3AF" />
        <p class="t-empty-title">Không tìm thấy hoạt động nào</p>
        <p class="t-empty-desc">Thử tìm kiếm với từ khóa khác hoặc chuyển danh mục.</p>
      </div>

      <v-table v-else class="t-table">
        <thead>
          <tr>
            <th style="width: 220px">Thời gian</th>
            <th style="width: 140px">Phân loại</th>
            <th>Nội dung thao tác</th>
            <th>Đối tượng liên quan</th>
            <th class="text-right">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in filteredLogs" :key="log.id">
            <td>
              <div class="d-flex align-center ga-2">
                <v-icon size="16" color="#94A3B8">mdi-clock-time-four-outline</v-icon>
                <span class="text-caption text-secondary font-weight-500">{{ log.timestamp }}</span>
              </div>
            </td>
            <td>
              <span class="t-badge" :class="getCategoryBadgeClass(log.category)">
                {{ log.categoryLabel }}
              </span>
            </td>
            <td>
              <div class="font-weight-600 color-primary">{{ log.action }}</div>
              <div class="text-caption text-secondary">{{ log.detail }}</div>
            </td>
            <td>
              <span class="target-chip">{{ log.target }}</span>
            </td>
            <td class="text-right">
              <span class="t-badge t-badge--success">
                <v-icon start size="12">mdi-check</v-icon>
                Thành công
              </span>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";

const selectedCategory = ref("all");
const searchQuery = ref("");

const categories = [
  { value: "all", label: "Tất cả" },
  { value: "assignment", label: "Bài tập & Đề thi" },
  { value: "attendance", label: "Điểm danh" },
  { value: "grading", label: "Chấm điểm" },
  { value: "class", label: "Lớp học" },
];

const sampleLogs = ref([
  {
    id: 1,
    timestamp: "Hôm nay, 10:45",
    category: "grading",
    categoryLabel: "Chấm điểm",
    action: "Chấm điểm bài tập",
    detail: "Đã chấm điểm 8.5/10 cho học sinh Nguyễn Văn An",
    target: "Bài kiểm tra Đại số 10",
  },
  {
    id: 2,
    timestamp: "Hôm nay, 08:15",
    category: "attendance",
    categoryLabel: "Điểm danh",
    action: "Lưu buổi điểm danh",
    detail: "Ghi nhận 34/35 học sinh có mặt, 1 học sinh trễ",
    target: "Lớp 10A1",
  },
  {
    id: 3,
    timestamp: "Hôm qua, 16:30",
    category: "assignment",
    categoryLabel: "Bài tập",
    action: "Giao bài tập mới",
    detail: "Tạo và giao bài tập ôn tập tuần 4 cho học sinh",
    target: "Lớp 10A1",
  },
  {
    id: 4,
    timestamp: "Hôm qua, 14:10",
    category: "assignment",
    categoryLabel: "Bài tập",
    action: "Sinh đề bằng AI",
    detail: "Sinh thành công 10 câu hỏi trắc nghiệm chương Tập hợp",
    target: "Bài 1: Mệnh đề và tập hợp",
  },
  {
    id: 5,
    timestamp: "02/10/2026, 09:20",
    category: "class",
    categoryLabel: "Lớp học",
    action: "Cập nhật danh sách học sinh",
    detail: "Thêm 3 học sinh mới vào niên khóa 2025-2026",
    target: "Lớp 10A2",
  },
]);

function getCategoryBadgeClass(category) {
  switch (category) {
    case "grading":
      return "t-badge--accent";
    case "attendance":
      return "t-badge--warning";
    case "assignment":
      return "t-badge--accent";
    case "class":
      return "t-badge--neutral";
    default:
      return "t-badge--neutral";
  }
}

function refreshLogs() {
  // refresh feedback
}

const filteredLogs = computed(() => {
  return sampleLogs.value.filter((log) => {
    if (selectedCategory.value !== "all" && log.category !== selectedCategory.value) {
      return false;
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase();
      return (
        log.action.toLowerCase().includes(q) ||
        log.detail.toLowerCase().includes(q) ||
        log.target.toLowerCase().includes(q)
      );
    }
    return true;
  });
});
</script>

<style scoped>
.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1d2e;
}

.color-primary {
  color: #1e293b;
}

.target-chip {
  display: inline-block;
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  background: #f1f5f9;
  padding: 3px 10px;
  border-radius: 6px;
}
</style>
