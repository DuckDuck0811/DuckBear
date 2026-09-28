<template>
  <table class="lb">
    <thead>
      <tr>
        <th class="lb__rank">Hạng</th>
        <th>Học sinh</th>
        <th class="lb__points">Điểm</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="entry in entries"
        :key="entry.userId"
        :class="{ 'lb__row--me': entry.userId === currentUserId }"
      >
        <td class="lb__rank">
          <span
            v-if="entry.rank <= 3"
            class="lb__medal"
            :class="`lb__medal--${entry.rank}`"
          >
            {{ ["🥇", "🥈", "🥉"][entry.rank - 1] }}
          </span>
          <span v-else>{{ entry.rank }}</span>
        </td>
        <td class="lb__student">
          <img
            v-if="entry.avatarUrl"
            class="lb__avatar"
            :src="entry.avatarUrl"
            alt=""
          />
          <span v-else class="lb__avatar lb__avatar--fallback">{{
            initials(entry.fullName)
          }}</span>
          {{ entry.fullName }}
        </td>
        <td class="lb__points">
          {{ entry.totalPoints.toLocaleString("vi-VN") }}
        </td>
      </tr>
      <tr v-if="!entries.length">
        <td colspan="3" class="lb__empty">Chưa có dữ liệu xếp hạng</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import "../styles/gamification-tokens.css";

defineProps({
  entries: { type: Array, default: () => [] }, // [{rank, userId, fullName, avatarUrl, totalPoints}]
  currentUserId: { type: [String, Number], default: null },
});

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
</script>

<style scoped>
.lb {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--gam-font);
  font-size: 14px;
}

.lb thead th {
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--gam-slate);
  padding: 10px 12px;
  border-bottom: 1px solid var(--gam-line);
}

.lb tbody td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--gam-line);
  color: var(--gam-ink);
}

.lb__rank,
.lb__points {
  width: 90px;
}

.lb__row--me {
  background: var(--gam-gold-soft);
}

.lb__student {
  display: flex;
  align-items: center;
  gap: 10px;
}

.lb__avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.lb__avatar--fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gam-ink);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}

.lb__medal {
  font-size: 16px;
}

.lb__empty {
  text-align: center;
  color: var(--gam-slate);
  padding: 24px 0;
}
</style>
