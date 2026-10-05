<template>
  <div class="gw" :class="{ 'gw--loading': loading }">
    <div v-if="error" class="gw__error">{{ error }}</div>

    <template v-else>
      <div class="gw__stat gw__stat--points">
        <span class="gw__value">{{ formattedPoints }}</span>
        <span class="gw__label">điểm</span>
      </div>

      <div class="gw__divider" />

      <div class="gw__stat">
        <span
          class="gw__flame"
          :class="{ 'gw__flame--off': !summary?.currentStreak }"
          >🔥</span
        >
        <span class="gw__value">{{ summary?.currentStreak ?? 0 }}</span>
        <span class="gw__label">ngày liên tiếp</span>
      </div>

      <div class="gw__divider" />

      <div class="gw__stat">
        <span class="gw__value">#{{ summary?.rank ?? "–" }}</span>
        <span class="gw__label">thứ hạng</span>
      </div>

      <div class="gw__badges">
        <span
          v-for="badge in visibleBadges"
          :key="badge.id"
          class="gw__badge-icon"
          :title="badge.name"
        >
          <img v-if="badge.iconUrl" :src="badge.iconUrl" :alt="badge.name" />
          <span v-else>🏅</span>
        </span>
        <span v-if="extraBadgeCount > 0" class="gw__badge-more"
          >+{{ extraBadgeCount }}</span
        >
      </div>

      <button
        v-if="showCheckIn"
        class="gw__checkin"
        :disabled="checkingIn || hasCheckedInToday"
        @click="doCheckIn"
      >
        {{
          hasCheckedInToday
            ? "Đã điểm danh"
            : checkingIn
              ? "Đang gửi…"
              : "Điểm danh hôm nay"
        }}
      </button>

      <RouterLink v-if="showDetailLink" class="gw__link" :to="detailRoute">
        Xem chi tiết →
      </RouterLink>
    </template>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useGamification } from "../service/useGamification";
import "../styles/gamification-tokens.css";

const props = defineProps({
  userId: { type: [String, Number], required: true },
  showCheckIn: { type: Boolean, default: true },
  showDetailLink: { type: Boolean, default: true },
  detailRoute: { type: [String, Object], default: () => ({ name: "student-gamification" }) },
  maxBadges: { type: Number, default: 4 },
});

const {
  summary,
  loading,
  error,
  checkingIn,
  hasCheckedInToday,
  loadSummary,
  doCheckIn,
} = useGamification(props.userId);

const formattedPoints = computed(() =>
  (summary.value?.totalPoints ?? 0).toLocaleString("vi-VN"),
);

const visibleBadges = computed(() =>
  (summary.value?.badges ?? []).slice(0, props.maxBadges),
);
const extraBadgeCount = computed(() =>
  Math.max((summary.value?.badges?.length ?? 0) - props.maxBadges, 0),
);

onMounted(loadSummary);
</script>

<style scoped>
.gw {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 16px 20px;
  background: var(--gam-surface);
  border: 1px solid var(--gam-line);
  border-radius: var(--gam-radius-md);
  box-shadow: var(--gam-shadow);
  font-family: var(--gam-font);
  flex-wrap: wrap;
}

.gw--loading {
  opacity: 0.6;
}

.gw__error {
  color: var(--gam-ember);
  font-size: 14px;
}

.gw__stat {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.1;
}

.gw__stat--points .gw__value {
  color: var(--gam-gold);
}

.gw__value {
  font-size: 22px;
  font-weight: 700;
  color: var(--gam-ink);
}

.gw__label {
  font-size: 12px;
  color: var(--gam-slate);
  margin-top: 2px;
}

.gw__flame {
  font-size: 14px;
  margin-bottom: 2px;
}

.gw__flame--off {
  filter: grayscale(1);
  opacity: 0.5;
}

.gw__divider {
  width: 1px;
  align-self: stretch;
  background: var(--gam-line);
}

.gw__badges {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

.gw__badge-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--gam-gold-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  overflow: hidden;
}

.gw__badge-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gw__badge-more {
  font-size: 12px;
  color: var(--gam-slate);
}

.gw__checkin {
  font-family: var(--gam-font);
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  background: var(--gam-ink);
  border: none;
  border-radius: 999px;
  padding: 8px 16px;
  cursor: pointer;
  white-space: nowrap;
}

.gw__checkin:disabled {
  background: var(--gam-locked);
  cursor: default;
}

.gw__link {
  font-size: 13px;
  font-weight: 600;
  color: var(--gam-ink-soft);
  text-decoration: none;
  white-space: nowrap;
}

.gw__link:hover {
  color: var(--gam-ink);
}



</style>
