import api from "@/service/http";

export function getSubjectsApi() {
  return api.get("/subject-management");
}
