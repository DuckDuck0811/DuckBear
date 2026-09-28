<template>
  <div class="bg-grid">
    <div
      v-for="badge in badges"
      :key="badge.id"
      class="bg-tile"
      :class="{ 'bg-tile--locked': !isEarned(badge.id) }"
    >
      <div class="bg-tile__icon">
        <img v-if="badge.iconUrl" :src="badge.iconUrl" :alt="badge.name" />
        <span v-else>{{ isEarned(badge.id) ? "🏅" : "🔒" }}</span>
      </div>
      <div class="bg-tile__name">{{ badge.name }}</div>
      <div class="bg-tile__desc">{{ badge.description }}</div>
      <div v-if="isEarned(badge.id)" class="bg-tile__earned">
        Đạt được {{ formatDate(earnedMap[badge.id]) }}
      </div>
      <div v-else class="bg-tile__locked-label">Chưa đạt</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import "../styles/gamification-tokens.css";

const props = defineProps({
  badges: { type: Array, default: () => [] }, // toàn bộ badge hệ thống
  earned: { type: Array, default: () => [] }, // badge user đã đạt: [{id, earnedAt}]
});

const earnedMap = computed(() =>
  Object.fromEntries(props.earned.map((b) => [b.id, b.earnedAt])),
);

function isEarned(id) {
  return Object.prototype.hasOwnProperty.call(earnedMap.value, id);
}

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("vi-VN");
}
</script>

<style scoped>
.bg-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 14px;
  font-family: var(--gam-font);
}

.bg-tile {
  background: var(--gam-surface);
  border: 1px solid var(--gam-line);
  border-radius: var(--gam-radius-md);
  padding: 16px;
  text-align: center;
}

.bg-tile--locked {
  opacity: 0.55;
}

.bg-tile__icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 10px;
  border-radius: 50%;
  background: var(--gam-gold-soft);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  overflow: hidden;
}

.bg-tile--locked .bg-tile__icon {
  background: #efece3;
}

.bg-tile__icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bg-tile__name {
  font-weight: 700;
  font-size: 14px;
  color: var(--gam-ink);
  margin-bottom: 4px;
}

.bg-tile__desc {
  font-size: 12px;
  color: var(--gam-slate);
  line-height: 1.4;
  min-height: 32px;
}

.bg-tile__earned {
  margin-top: 10px;
  font-size: 11px;
  font-weight: 600;
  color: var(--gam-sage);
}

.bg-tile__locked-label {
  margin-top: 10px;
  font-size: 11px;
  font-weight: 600;
  color: var(--gam-locked);
}
</style>
