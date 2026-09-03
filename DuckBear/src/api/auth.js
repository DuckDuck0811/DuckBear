import api from "@/service/http";

export function registerApi(payload) {
  return api.post("/auth/register", payload);
}

export function loginApi(payload) {
  return api.post("/auth/login", payload);
}
