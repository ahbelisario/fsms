import * as Localization from "expo-localization";
import { I18n } from "i18n-js";

const translations = {
  es: {
    common: {
      add: "Agregar",
      name: "Nombre",
      description: "Descripción",
      save: "Guardar",
      edit: "Editar",
      delete: "Borrar",
      saving: "Guardando",
      cancel: "Cancelar",
      logout: "Cerrar sesión",
      profile: "Mi perfil",
      loading: "Cargando...",
      show: "Mostrar",
      hide: "Ocultar",
      back: "Regresar",
      confirm: "Confirmar",
      confirmchanges: "Confirmar cambios",
      wishchanges: "¿Deseas guardar los cambios?",
      refresh: "Refresar",
      password_required: "Contraseña (Requerido)",
      password_confirm: "Confirmar contraseña"
    },
    messages: {
      password_dont_match: "Las contraseñas no coinciden",
      sure_delete_user: "¿Seguro que deseas borrar este usuario?",
      sure_delete_discipline: "¿Seguro que deseas borrar esta disciplina?",
      sure_delete_rank: "¿Seguro que deseas borrar este grado?",
    },
    dialogs:{
      delete_user: "Eliminar usuario",
      user_settings: "Preferencias del Usuario",
      delete_discipline: "Eliminar disciplina",
      delete_rank: "Eliminar grado",
    },
    login: {
      title: "Iniciar sesión",
      username: "Usuario",
      password: "Contraseña",
      signIn: "Entrar",
      invalid: "Credenciales inválidas",
      subtitle: "Accede con tu usuario y contraseña"
    },
    users: {
      title: "Usuarios",
      add: "Agregar Usuario",
      empty: "No hay usuarios.",
      role: "Rol",
      role_admin: "Administrador",
      role_user: "Usuario",
      changePass: "Cambiar contraseña",
      active: "Activo",
      createuser: "Crear usuario",
      edituser: "Editar usuario"
    },
    usersettings: {
      title: "Preferencias del Usuario",
      language: "Idioma",
      english: "Ingles",
      spanish: "Español",
    },
    dashboard: {
      title: "Panel de control",
    },
    userprofiles: {
      myprofile: "Mi Perfil",
      title: "Perfil",
      name: "Nombre",
      lastname: "Apellido",
      gender: "Género",
      date_of_birth: "Fecha de nacimiento",
      email: "Correo electrónico",
      phone: "Teléfono",
      emergency_contact_name: "Contacto de emergencia",
      emergency_contact_phone: "Teléfono de emergencia",
      address_line1: "Domicilio",
      address_line2: "Domicilio cont. (Opcional)",
      city: "Ciudad",
      state: "Estado",
      country: "Pais",
      postal_code: "Código Postal",
      discipline_id: "Disciplina",
      rank_id: "Grado",
      start_date: "Fecha de inicio",
      blood_type: "Tipo de Sangre",
      medical_notes: "Notas Médicas"
    },
    disciplines: {
      title: "Disciplinas",
      title_single: "Disciplina",
      add_discipline: "Agregar Disciplina",
      edit_discipline: "Editar Disciplina",
      delete_discipline: "Eliminar Disciplina",
      empty: "No hay disciplinas.",
    },
    ranks: {
      title: "Grados",
      add_rank: "Agregar Grado",
      edit_rank: "Editar Grado",
      delete_rank: "Eliminar Grado",
      empty: "No hay grados.",
    },
  },
  en: {
    common: {
      add: "Add",
      save: "Save",
      edit: "Edit",
      name: "Name",
      description: "Description",
      delete: "Delete",
      saving: "Saving",
      cancel: "Cancel",
      logout: "Log out",
      profile: "My profile",
      loading: "Loading...",
      show: "Show",
      hide: "Hide",
      back: "Back",
      common: "Confirm",
      confirmchanges: "Confirm changes",
      wishchanges: "Do you wish to save the changes?",
      refresh: "Refresh",
      password_required: "Password (Required)",
      password_confirm: "Confirm password"
    },
    messages: {
      password_dont_match: "Passwords don't match",
      sure_delete_user: " Are you to delere this user?",
      sure_delete_discipline: " Are you to delere this discipline?",
      sure_delete_rank: " Are you to delere this grade?"
    },
    dialogs:{
      delete_user: "Delete user",
      user_settings: "User Settings",
      delete_discipline: "Delete discipline",
      delete_rank: "Delete grade",
    },
    login: {
      title: "Sign in",
      username: "Username",
      password: "Password",
      signIn: "Sign in",
      invalid: "Invalid credentials",
      subtitle: "Log in with your username and password"
    },
    users: {
      title: "Users",
      add: "Add User",
      empty: "No users.",
      role: "Role",
      role_admin: "Admin",
      role_user: "User",
      changePass: "Change password",
      active: "Active",
      createuser: "Create user",
      edituser: "Edit user"
    },
    usersettings: {
      title: "User Settings",
      language: "Language",
      english: "English",
      spanish: "Spanish",
    },
    dashboard: {
      title: "Dashboard",
    },
    userprofiles: {
      myprofile: "My Profile",
      title: "Profile",
      name: "Name",
      lastname: "Lastname",
      gender: "Gender",
      date_of_birth: "Birth Date",
      email: "Email",
      phone: "Phone",
      emergency_contact_name: "Emergency Contact",
      emergency_contact_phone: "Emergency Phone",
      address_line1: "Address",
      address_line2: "Address cont. (Optional)",
      city: "City",
      state: "State",
      country: "Country",
      postal_code: "Zip Code",
      discipline: "Discipline",
      rank: "Grade",
      start_date: "Start Date",
      blood_type: "Blood Type",
      medical_notes: "Medical",
    },
    disciplines: {
      title: "Disciplines",
      title_single: "Discipline",
      add_discipline: "Add discipline",
      edit_discipline: "Edit discipline",
      delete_discipline: "Delete discipline"
    },
    ranks: {
      title: "Grades",
      add_rank: "Add grade",
      edit_rank: "Edit grade",
      delete_rank: "Delete grade"
    },
  },
}

export const i18n = new I18n(translations);

// Locale inicial (ej: "es-MX" => "es")
const deviceLocale = Localization.getLocales()?.[0]?.languageCode ?? "es";
i18n.locale = deviceLocale;
i18n.enableFallback = true;

// Helper corto
export function t(key: string, options?: Record<string, any>) {
  return i18n.t(key, options);
}
