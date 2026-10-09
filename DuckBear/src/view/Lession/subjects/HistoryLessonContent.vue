<template>
  <!-- Môn Lịch Sử - History lesson content (amber/brown theme) -->
  <GenericLessonContent :lesson="lesson" :chapter="chapter" :fontSize="fontSize" />
</template>

<script setup>
/**
 * HistoryLessonContent.vue
 * Môn Lịch sử - History specific lesson content renderer
 *
 * Màu amber/nâu đồng - gợi nhớ lịch sử.
 * Có thể mở rộng: timeline events, map widgets, date highlights...
 */
import GenericLessonContent from "./GenericLessonContent.vue";

defineProps({
  lesson: { type: Object, required: true },
  chapter: { type: Object, default: null },
  fontSize: { type: String, default: "normal" },
});
</script>

