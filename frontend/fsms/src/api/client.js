import { getAuthToken, clearAuthSession } from "../storage/authStorage";

const API_BASE_URL = "http://localhost:3000";

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
    await clearAuthSession();
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

  me: () => request("/api/auth/me"),

  listUsers: () => request("/api/users"),
  createUser: (payload) => request("/api/users", { method: "POST", body: payload }),
  updateUser: (id, payload) => request(`/api/users/${id}`, { method: "PUT", body: payload }),
  deleteUser: (id) => request(`/api/users/${id}`, { method: "DELETE" }),
  updatePassword: (id, payload) => request(`/api/users/${id}/password`, { method: "PATCH", body: payload }),
  checkPassword: (id, payload) => request(`/api/users/${id}/checkpassword`, { method: "POST", body: payload }),
  
  listUserSettings: (id) => request(`/api/usersettings/${id}`),
  createUserSettings: (payload) => request("/api/usersettings", { method: "POST", body: payload }),
  updateUserSettingLanguage: (id, payload) => request(`/api/usersettings/${id}/language`, { method: "PUT", body: payload }),

  listUserProfiles: (id) => request(`/api/userprofiles/${id}`),
  createUserProfiles: (payload) => request("/api/userprofiles", { method: "POST", body: payload }),
  updateUserProfiles: (id, payload) => request(`/api/userprofiles/${id}`, { method: "PUT", body: payload }),
  deleteUserProfiles: (id) => request(`/api/userprofiles/${id}`, { method: "DELETE" }),
  
  listDisciplines: () => request("/api/disciplines"),
  createDisciplines: (payload) => request("/api/disciplines", { method: "POST", body: payload }),
  updateDisciplines: (id, payload) => request(`/api/disciplines/${id}`, { method: "PUT", body: payload }),
  deleteDisciplines: (id) => request(`/api/disciplines/${id}`, { method: "DELETE" }),

  listRanks: () => request("/api/ranks"),
  listRankswDiscipline: () => request("/api/ranks/with_disciplines_names"),
  createRanks: (payload) => request("/api/ranks", { method: "POST", body: payload }),
  updateRanks: (id, payload) => request(`/api/ranks/${id}`, { method: "PUT", body: payload }),
  deleteRanks: (id) => request(`/api/ranks/${id}`, { method: "DELETE" }),

  listPackages: () => request("/api/packages"),
  createPackages: (payload) => request("/api/packages", { method: "POST", body: payload }),
  updatePackages: (id, payload) => request(`/api/packages/${id}`, { method: "PUT", body: payload }),
  deletePackages: (id) => request(`/api/packages/${id}`, { method: "DELETE" }),

  listMemberships: () => request("/api/memberships"),
  createMemberships: (payload) => request("/api/memberships", { method: "POST", body: payload }),
  updateMemberships: (id, payload) => request(`/api/memberships/${id}`, { method: "PUT", body: payload }),
  deleteMemberships: (id) => request(`/api/memberships/${id}`, { method: "DELETE" }),

  listPayments: () => request("/api/payments"),
  createPayments: (payload) => request("/api/payments", { method: "POST", body: payload }),
  updatePayments: (id, payload) => request(`/api/payments/${id}`, { method: "PUT", body: payload }),
  deletePayments: (id) => request(`/api/payments/${id}`, { method: "DELETE" }),

  reportsPaymentsMonthlySummary: () => request("/api/reports/payments/monthly-summary"),

  
};
