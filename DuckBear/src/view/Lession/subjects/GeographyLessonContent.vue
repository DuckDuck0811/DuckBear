<template>
  <!-- Môn Địa Lý - Geography lesson content (green/orange theme) -->
  <GenericLessonContent :lesson="lesson" :chapter="chapter" :fontSize="fontSize" />
</template>

<script setup>
/**
 * GeographyLessonContent.vue
 * Môn Địa lý - Geography specific lesson content renderer
 *
 * Màu xanh lá/cam - gợi nhớ đất đai, thiên nhiên.
 * Có thể mở rộng: map widgets, climate charts, region highlights...
 */
import GenericLessonContent from "./GenericLessonContent.vue";

defineProps({
  lesson: { type: Object, required: true },
  chapter: { type: Object, default: null },
  fontSize: { type: String, default: "normal" },
});
</script>

