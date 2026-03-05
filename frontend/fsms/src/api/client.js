import { getAuthToken, clearAuthSession, extendSession } from "@/src/storage/authStorage";
import { API_BASE_URL } from '@/src/config/api.config';

// Callback global para manejar sesión expirada
let onAuthExpiredCallback = null;

export function setAuthExpiredHandler(callback) {
  onAuthExpiredCallback = callback;
}

async function request(path, { method = "GET", body } = {}) {

  const token = await getAuthToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);

  // ✅ Solo 401 (token inválido/expirado) dispara el logout
  if (res.status === 401) {
    await clearAuthSession();
    onAuthExpiredCallback?.();
    const err = new Error((data && (data.message || data.error)) || "Sesión expirada.");
    err.code = "AUTH_EXPIRED";
    throw err;
  }

  // ✅ 403 es "sin permisos", no cierra sesión - solo lanza error normal
  if (res.status === 403) {
    throw new Error((data && (data.message || data.error)) || "No tienes permisos para realizar esta acción.");
  }

  if (!res.ok) {
    throw new Error((data && (data.message || data.error)) || `Error HTTP ${res.status}`);
  }

  // ✅ Si la petición fue exitosa, extender la sesión
  // Esto mantiene la sesión activa mientras el usuario usa la app
  if (res.ok && token) {
    await extendSession();
  }

  return data;
}

export const api = {

  me: () => request("/api/auth/me"),

  listUsers: () => request("/api/users"),
  getUser: (id) => request(`/api/users/${id}`),
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

  listIncomes: () => request("/api/incomes"),
  createIncomes: (payload) => request("/api/incomes", { method: "POST", body: payload }),
  updateIncomes: (id, payload) => request(`/api/incomes/${id}`, { method: "PUT", body: payload }),
  deleteIncomes: (id) => request(`/api/incomes/${id}`, { method: "DELETE" }),

  listIncomeTypes: () => request("/api/incometypes"),
  createIncomeTypes: (payload) => request("/api/incometypes", { method: "POST", body: payload }),
  updateIncomeTypes: (id, payload) => request(`/api/incometypes/${id}`, { method: "PUT", body: payload }),
  deleteIncomeTypes: (id) => request(`/api/incometypes/${id}`, { method: "DELETE" }),

  listScheduledClasses: () => request("/api/scheduled-classes"),
  getScheduledClass: (id) => request(`/api/scheduled-classes/${id}`),
  createScheduledClass: (payload) => request("/api/scheduled-classes", { method: "POST", body: payload }),
  updateScheduledClass: (id, payload) => request(`/api/scheduled-classes/${id}`, { method: "PUT", body: payload }),
  deleteScheduledClass: (id) => request(`/api/scheduled-classes/${id}`, { method: "DELETE" }),
  getClassesByMonth: (year, month) => request(`/api/scheduled-classes/month/${year}/${month}`),

  createRecurringClasses: (payload) => request("/api/scheduled-classes/recurring", { method: "POST", body: payload }),
  deleteRecurringSeries: (parentId) => request(`/api/scheduled-classes/recurring/${parentId}`, { method: "DELETE" }),

  reportsPaymentsMonthlySummary: () => request("/api/reports/payments/monthly-summary"),
  reportsLastPaymentbyUser: (id) => request(`/api/reports/payments/lastpayment/${id}`),

  getMyMembership: () => request("/api/memberships/my-membership"),
  getMyPayments: () => request("/api/incomes/my-payments"),
  getMyLastPayment: () => request("/api/incomes/my-last-payment"),
  getMyProfile: () => request("/api/userprofiles/my-profile"),

  listClassEnrollments: () => request("/api/class-enrollments"), // Solo admin
  getMyEnrollments: () => request("/api/class-enrollments/my-enrollments"),
  getClassEnrollments: (classId) => request(`/api/class-enrollments/class/${classId}`),
  enrollInClass: (payload) => request("/api/class-enrollments/enroll", { method: "POST", body: payload }),
  createEnrollment: (payload) => request("/api/class-enrollments", { method: "POST", body: payload }), // Solo admin
  cancelEnrollment: (classId) => request(`/api/class-enrollments/cancel/${classId}`, { method: "DELETE" }),
  deleteEnrollment: (id) => request(`/api/class-enrollments/${id}`, { method: "DELETE" }), // Solo admin
  updateEnrollmentStatus: (id, payload) => request(`/api/class-enrollments/${id}/status`, { method: "PUT", body: payload }), // Solo admin

  markAttendance: (payload) => request("/api/class-enrollments/mark-attendance", { method: "POST", body: payload }),
  getAttendanceStats: (userId) => request(`/api/class-enrollments/attendance-stats/${userId}`),
  getMyAttendanceStats: () => request("/api/class-enrollments/my-attendance-stats"),
  
  getDojoSettings: () => request("/api/dojo-settings"),
  getDojoSettingsPublic: () => request("/api/dojo-settings/public"),
  updateDojoSettings: (payload) => request("/api/dojo-settings", { method: "PUT", body: payload }),

};