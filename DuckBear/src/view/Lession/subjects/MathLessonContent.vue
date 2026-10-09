<template>
  <!-- Môn Toán - Kế thừa GenericLessonContent với đầy đủ parser toán học -->
  <GenericLessonContent :lesson="lesson" :chapter="chapter" :fontSize="fontSize" />
</template>

<script setup>
/**
 * MathLessonContent.vue
 * Môn Toán học - Math specific lesson content renderer
 *
 * Hiện tại kế thừa toàn bộ từ GenericLessonContent.
 * Có thể customize thêm: parser công thức nâng cao, KaTeX, đồ thị động, v.v.
 */
import GenericLessonContent from "./GenericLessonContent.vue";

defineProps({
  lesson: { type: Object, required: true },
  chapter: { type: Object, default: null },
  fontSize: { type: String, default: "normal" },
});
</script>

