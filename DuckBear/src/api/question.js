import api from "@/service/http";

export function getQuestionsApi() {
  return api.get("/question-management");
}