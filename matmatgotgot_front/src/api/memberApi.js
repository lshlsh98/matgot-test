// api/memberApi.js - 기능별 API 분리
import apiClient from "./index";

const memberApi = {
  getMember: (id) => apiClient.get(`/api/members/${id}`),
  getMembers: (params) => apiClient.get("/api/members", { params }),
  createMember: (data) => apiClient.post("/api/members", data),
  updateMember: (id, data) => apiClient.put(`/api/members/${id}`, data),
  deleteMember: (id) => apiClient.delete(`/api/members/${id}`),
};

export default memberApi;
