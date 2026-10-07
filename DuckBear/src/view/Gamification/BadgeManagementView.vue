<template>
  <div class="t-page-wrap">
    <!-- Header -->
    <div class="t-page-heading">
      <div>
        <div class="t-eyebrow">GAMIFICATION</div>
        <h1 class="t-page-title">Quản lý huy hiệu</h1>
        <p class="t-page-subtitle">Tạo điều kiện mở khóa và tra cứu lịch sử đạt huy hiệu của học sinh.</p>
      </div>
      <v-btn
        color="primary"
        variant="flat"
        prepend-icon="mdi-plus"
        class="text-none"
        style="border-radius: 8px; font-weight: 600"
        @click="openCreate"
      >
        Tạo huy hiệu mới
      </v-btn>
    </div>

    <!-- Alerts -->
    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      class="mb-4"
      closable
      @click:close="error = ''"
    >
      {{ error }}
    </v-alert>

    <v-alert
      v-if="notice"
      type="success"
      variant="tonal"
      class="mb-4"
      closable
      @click:close="notice = ''"
    >
      {{ notice }}
    </v-alert>

    <!-- Badge list card -->
    <div class="t-card mb-6">
      <div class="px-5 py-4 border-b d-flex align-center">
        <span class="section-title">Danh sách huy hiệu hiện có</span>
        <v-spacer />
        <span class="text-caption text-muted">{{ badges.length }} huy hiệu</span>
      </div>

      <v-progress-linear v-if="loading" indeterminate color="primary" />

      <div v-if="!loading && !badges.length" class="t-empty-state">
        <v-icon icon="mdi-medal-outline" size="48" color="#9CA3AF" />
        <p class="t-empty-title">Chưa có huy hiệu nào</p>
        <p class="t-empty-desc">Tạo huy hiệu đầu tiên để khuyến khích học sinh tích cực học tập.</p>
        <v-btn
          color="primary"
          variant="flat"
          class="text-none"
          style="border-radius: 8px"
          @click="openCreate"
        >
          Tạo huy hiệu
        </v-btn>
      </div>

      <v-table v-else class="t-table">
        <thead>
          <tr>
            <th style="width: 40%">Huy hiệu</th>
            <th>Điều kiện mở khóa</th>
            <th class="text-right" style="width: 140px">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="badge in badges" :key="badge.id">
            <td>
              <div class="d-flex align-center ga-3 py-1">
                <v-avatar color="#eef3ff" size="44" rounded="lg">
                  <img v-if="badge.iconUrl" :src="badge.iconUrl" :alt="badge.name" class="badge-icon-img" />
                  <v-icon v-else color="#4F7CFF" size="24">mdi-medal-outline</v-icon>
                </v-avatar>
                <div>
                  <div class="font-weight-600 color-primary">{{ badge.name }}</div>
                  <div class="text-caption text-secondary">{{ badge.description || 'Chưa có mô tả' }}</div>
                </div>
              </div>
            </td>
            <td>
              <div class="d-flex flex-wrap ga-2">
                <span
                  v-for="(label, index) in criteriaLabels(badge.criteria)"
                  :key="index"
                  class="t-badge t-badge--accent"
                >
                  <v-icon start size="12">mdi-check-circle-outline</v-icon>
                  {{ label }}
                </span>
              </div>
            </td>
            <td class="text-right">
              <v-btn
                icon="mdi-pencil-outline"
                variant="text"
                size="small"
                color="primary"
                aria-label="Sửa"
                @click="openEdit(badge)"
              />
              <v-btn
                icon="mdi-delete-outline"
                variant="text"
                size="small"
                color="error"
                aria-label="Xóa"
                @click="removeBadge(badge)"
              />
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <!-- Student Badge History Lookup -->
    <div class="t-card pa-5">
      <div class="section-title mb-1">Tra cứu lịch sử huy hiệu theo học sinh</div>
      <p class="text-caption text-muted mb-4">
        Nhập ID học sinh để kiểm tra các huy hiệu mà em đó đã đạt được.
      </p>

      <div class="d-flex flex-wrap align-center ga-3 mb-4" style="max-width: 500px">
        <v-text-field
          v-model.number="studentId"
          placeholder="Nhập mã học sinh (ID)..."
          type="number"
          min="1"
          variant="outlined"
          density="comfortable"
          hide-details
          prepend-inner-icon="mdi-magnify"
          bg-color="white"
          @keyup.enter="loadHistory"
        />
        <v-btn
          color="primary"
          variant="flat"
          :loading="historyLoading"
          :disabled="!studentId"
          class="text-none"
          style="border-radius: 8px; font-weight: 600; height: 44px"
          @click="loadHistory"
        >
          Tra cứu
        </v-btn>
      </div>

      <v-table v-if="history.length" class="t-table mt-2">
        <thead>
          <tr>
            <th>Huy hiệu đạt được</th>
            <th>Mô tả</th>
            <th>Thời gian đạt</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in history" :key="item.id">
            <td>
              <div class="d-flex align-center ga-2">
                <v-icon color="#4F7CFF" size="18">mdi-medal</v-icon>
                <span class="font-weight-600">{{ item.name }}</span>
              </div>
            </td>
            <td>{{ item.description || '—' }}</td>
            <td>
              <span class="t-badge t-badge--neutral">
                {{ formatDate(item.earnedAt) }}
              </span>
            </td>
          </tr>
        </tbody>
      </v-table>
      <div v-else-if="historyLoaded" class="t-empty-state py-8">
        <v-icon icon="mdi-emoticon-neutral-outline" size="36" color="#9CA3AF" />
        <p class="t-empty-desc mt-2">Học sinh này chưa đạt huy hiệu nào.</p>
      </div>
      <div v-else class="t-empty-state py-8">
        <v-icon icon="mdi-account-search-outline" size="36" color="#9CA3AF" />
        <p class="t-empty-desc mt-2">Nhập mã học sinh ở trên và nhấn "Tra cứu" để xem kết quả.</p>
      </div>
    </div>

    <!-- Create / Edit Badge Dialog -->
    <v-dialog v-model="dialog" max-width="560">
      <v-card class="pa-1" style="border-radius: 14px">
        <v-card-title class="t-dialog-title px-5 pt-5 pb-2">
          {{ editing ? 'Sửa thông tin huy hiệu' : 'Tạo huy hiệu mới' }}
        </v-card-title>
        <v-card-text class="px-5">
          <div class="t-field-label">Tên huy hiệu *</div>
          <v-text-field
            v-model="form.name"
            placeholder="VD: Chăm chỉ, Thần đồng Toán học..."
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />

          <div class="t-field-label">Mô tả huy hiệu</div>
          <v-textarea
            v-model="form.description"
            placeholder="Mô tả ý nghĩa của huy hiệu này..."
            rows="2"
            variant="outlined"
            density="comfortable"
            class="mb-3"
          />

          <div class="t-field-label">URL biểu tượng (tùy chọn)</div>
          <v-text-field
            v-model="form.iconUrl"
            placeholder="https://example.com/badge.png"
            variant="outlined"
            density="comfortable"
            class="mb-4"
          />

          <div class="t-field-label font-weight-700" style="color: #4F7CFF">
            Điều kiện mở khóa (có thể kết hợp)
          </div>

          <v-row dense class="mt-1">
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.totalPoints"
                label="Tổng điểm tối thiểu"
                type="number"
                min="0"
                variant="outlined"
                density="comfortable"
                hint="Để trống nếu không áp dụng"
                persistent-hint
                class="mb-3"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model.number="form.streakDays"
                label="Chuỗi ngày tối thiểu"
                type="number"
                min="0"
                variant="outlined"
                density="comfortable"
                hint="Để trống nếu không áp dụng"
                persistent-hint
                class="mb-3"
              />
            </v-col>
          </v-row>

          <v-checkbox
            v-model="form.perfectScore"
            label="Có ít nhất một bài tập đạt điểm tuyệt đối"
            density="compact"
            color="primary"
            hide-details
            class="mt-1"
          />

          <v-alert
            v-if="formError"
            type="error"
            variant="tonal"
            density="compact"
            class="mt-3"
          >
            {{ formError }}
          </v-alert>
        </v-card-text>
        <v-card-actions class="px-5 pb-4 pt-2">
          <v-spacer />
          <v-btn variant="text" class="text-none" color="secondary" @click="dialog = false">
            Hủy
          </v-btn>
          <v-btn
            color="primary"
            variant="flat"
            :loading="saving"
            class="text-none"
            style="border-radius: 8px; font-weight: 600"
            @click="saveBadge"
          >
            Lưu huy hiệu
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import * as api from '@/api/gamification';

const badges = ref([]);
const history = ref([]);
const loading = ref(false);
const saving = ref(false);
const historyLoading = ref(false);
const error = ref('');
const notice = ref('');
const dialog = ref(false);
const editing = ref(null);
const formError = ref('');
const studentId = ref(null);
const historyLoaded = ref(false);

const blankForm = () => ({
  name: '',
  description: '',
  iconUrl: '',
  totalPoints: null,
  streakDays: null,
  perfectScore: false,
});
const form = reactive(blankForm());

async function loadBadges() {
  loading.value = true;
  try {
    const { data } = await api.getAllBadges();
    badges.value = data ?? [];
  } catch (e) {
    error.value = e.response?.data?.message || 'Không tải được danh sách huy hiệu.';
  } finally {
    loading.value = false;
  }
}

function criteriaObject(raw) {
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : (raw || {});
  } catch {
    return {};
  }
}

function criteriaLabels(raw) {
  const c = criteriaObject(raw);
  const labels = [];
  if (c.total_points) labels.push(`Tổng điểm từ ${c.total_points}`);
  if (c.streak_days) labels.push(`Chuỗi ngày từ ${c.streak_days}`);
  if (c.perfect_score) labels.push('Có bài đạt điểm tuyệt đối');
  return labels.length ? labels : ['Chưa cấu hình'];
}

function openCreate() {
  editing.value = null;
  Object.assign(form, blankForm());
  formError.value = '';
  dialog.value = true;
}

function openEdit(badge) {
  const c = criteriaObject(badge.criteria);
  editing.value = badge;
  Object.assign(form, {
    name: badge.name,
    description: badge.description || '',
    iconUrl: badge.iconUrl || '',
    totalPoints: c.total_points ?? null,
    streakDays: c.streak_days ?? null,
    perfectScore: !!c.perfect_score,
  });
  formError.value = '';
  dialog.value = true;
}

async function saveBadge() {
  formError.value = '';
  const criteria = {};
  if (form.totalPoints !== null && form.totalPoints !== '') criteria.total_points = Number(form.totalPoints);
  if (form.streakDays !== null && form.streakDays !== '') criteria.streak_days = Number(form.streakDays);
  if (form.perfectScore) criteria.perfect_score = true;

  if (!form.name.trim()) {
    formError.value = 'Vui lòng nhập tên huy hiệu.';
    return;
  }
  if (!Object.keys(criteria).length) {
    formError.value = 'Hãy cấu hình ít nhất một điều kiện.';
    return;
  }
  if (Object.entries(criteria).some(([k, v]) => k !== 'perfect_score' && (!Number.isInteger(v) || v < 1))) {
    formError.value = 'Các ngưỡng điểm và ngày phải là số nguyên lớn hơn 0.';
    return;
  }

  saving.value = true;
  const payload = {
    name: form.name.trim(),
    description: form.description,
    iconUrl: form.iconUrl,
    criteria: JSON.stringify(criteria),
  };

  try {
    if (editing.value) {
      await api.updateBadge(editing.value.id, payload);
    } else {
      await api.createBadge(payload);
    }
    dialog.value = false;
    notice.value = editing.value ? 'Đã cập nhật huy hiệu thành công.' : 'Đã tạo huy hiệu mới thành công.';
    await loadBadges();
  } catch (e) {
    formError.value = e.response?.data?.message || 'Không lưu được huy hiệu.';
  } finally {
    saving.value = false;
  }
}

async function removeBadge(badge) {
  if (!window.confirm(`Xóa huy hiệu “${badge.name}”?`)) return;
  try {
    await api.deleteBadge(badge.id);
    notice.value = 'Đã xóa huy hiệu.';
    await loadBadges();
  } catch (e) {
    error.value = e.response?.data?.message || 'Không xóa được huy hiệu.';
  }
}

async function loadHistory() {
  if (!Number.isInteger(Number(studentId.value)) || Number(studentId.value) < 1) return;
  historyLoading.value = true;
  historyLoaded.value = false;
  try {
    const { data } = await api.getStudentBadgeHistory(studentId.value);
    history.value = data ?? [];
    historyLoaded.value = true;
  } catch (e) {
    error.value = e.response?.data?.message || 'Không tải được lịch sử huy hiệu.';
    history.value = [];
  } finally {
    historyLoading.value = false;
  }
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString('vi-VN') : '—';
}

onMounted(loadBadges);
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

.badge-icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.t-dialog-title {
  font-size: 17px;
  font-weight: 700;
  color: #1a1d2e;
}
</style>
