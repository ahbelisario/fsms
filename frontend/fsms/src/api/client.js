import { getAuthToken, deleteAuthToken } from "../storage/authStorage";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:3000";

async function request(path, { method = "GET", body } = {}) {
  const token = await getAuthToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
  //const res = await fetch(`${path}`, {  
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  if (res.status === 401 || res.status === 403) {
    await deleteAuthToken();
    const err = new Error((data && (data.message || data.error)) || "Sesión expirada.");
    err.code = "AUTH_EXPIRED";
    throw err;
  }

  if (!res.ok) {
    throw new Error((data && (data.message || data.error)) || `Error HTTP ${res.status}`);
  }

  return data;
}

export const api = {

  listUsers: () => request("/api/users"),
  createUser: (payload) => request("/api/users", { method: "POST", body: payload }),
  updateUser: (id, payload) => request(`/api/users/${id}`, { method: "PUT", body: payload }),
  deleteUser: (id) => request(`/api/users/${id}`, { method: "DELETE" }),
  
  listDisciplines: () => request("/api/disciplines"),
  createDisciplines: (payload) => request("/api/disciplines", { method: "POST", body: payload }),
  updateDisciplines: (id, payload) => request(`/api/disciplines/${id}`, { method: "PUT", body: payload }),
  deleteDisciplines: (id) => request(`/api/disciplines/${id}`, { method: "DELETE" }),

  listRanks: () => request("/api/ranks"),
  listRankswDiscipline: () => request("/api/ranks/with_disciplines_names"),
  createRanks: (payload) => request("/api/ranks", { method: "POST", body: payload }),
  updateRanks: (id, payload) => request(`/api/ranks/${id}`, { method: "PUT", body: payload }),
  deleteRanks: (id) => request(`/api/ranks/${id}`, { method: "DELETE" }),
  
};
