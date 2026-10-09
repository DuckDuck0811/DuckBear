<template>
  <MathLessonDetailView v-if="isMath" />
  <OtherSubjectLessonDetailView v-else />
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import MathLessonDetailView from "@/view/Lession/MathLessonDetailView.vue";
import OtherSubjectLessonDetailView from "@/view/Lession/OtherSubjectLessonDetailView.vue";

const route = useRoute();
const isMath = computed(() => {
  const subjectName = String(route.query.subjectName || "").toLocaleLowerCase("vi");
  // Keep old direct links on the original math reader when no subject is given.
  return !subjectName || subjectName.includes("toán") || subjectName.includes("toan");
});
</script>
