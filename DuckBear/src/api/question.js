import api from "@/service/http";

export function getQuestionsApi() {
  return api.get("/question-management");
}

export function getQuestionsByLessonApi(lessonId) {
  return api.get(`/question-management/by-lesson/${lessonId}`);
}