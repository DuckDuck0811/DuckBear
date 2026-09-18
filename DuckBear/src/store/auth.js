import { defineStore } from "pinia";
import { registerApi, loginApi } from "@/api/auth";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    accessToken: localStorage.getItem("accessToken") || null,
    userId: Number(localStorage.getItem("userId")) || null,
    email: null,
    role: localStorage.getItem("role") || null,
  }),

  actions: {
    async register(payload) {
      const { data } = await registerApi(payload);
      return data;
    },

    async login(payload) {
      const { data } = await loginApi(payload);
      this.accessToken = data.accessToken;
      this.userId = data.userId;
      this.email = data.email;
      this.role = data.role;
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("userId", data.userId);
      localStorage.setItem("role", data.role);
      return data;
    },

    logout() {
      this.accessToken = null;
      this.userId = null;
      this.email = null;
      this.role = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userId");
      localStorage.removeItem("role");
    },
  },
});