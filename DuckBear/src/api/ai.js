import api from "@/service/http";

export function generateQuestionsApi(payload) {
  return api.post("/ai/question-generation/generate", payload);
}

export function saveGeneratedQuestionsApi(payload) {
  return api.post("/ai/question-generation/save", payload);
}