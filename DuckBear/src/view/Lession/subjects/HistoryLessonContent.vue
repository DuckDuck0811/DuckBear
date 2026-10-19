<template>
  <!-- Môn Lịch Sử - History specific lesson content renderer -->
  <Historylessoncontent :lesson="lesson" :chapter="chapter" :fontSize="fontSize" />
</template>

<script setup>
/**
 * HistoryLessonContent.vue
 * Môn Lịch sử - Delegate to History/Historylessoncontent.vue
 */
import Historylessoncontent from "./History/Historylessoncontent.vue";

defineProps({
  lesson: { type: Object, required: true },
  chapter: { type: Object, default: null },
  fontSize: { type: String, default: "normal" },
});
</script>
