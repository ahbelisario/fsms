import { Alert, Platform } from "react-native";

// Para web, usaremos toast nativo del navegador o implementación simple
let toast = null;

if (Platform.OS === "web") {
  // Implementación simple de toast para web sin dependencias externas
  toast = {
    success: (message) => showWebToast(message, "success"),
    error: (message) => showWebToast(message, "error"),
    info: (message) => showWebToast(message, "info"),
  };
}

function showWebToast(message, type = "info") {
  // Crear elemento de toast
  const toastEl = document.createElement("div");
  
  const colors = {
    success: { bg: "#10b981", text: "#fff" },
    error: { bg: "#ef4444", text: "#fff" },
    info: { bg: "#3b82f6", text: "#fff" },
  };
  
  const color = colors[type] || colors.info;
  
  toastEl.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: ${color.bg};
    color: ${color.text};
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06);
    z-index: 9999;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    max-width: 400px;
    animation: slideInCenter 0.3s ease-out;
    pointer-events: auto;
    cursor: pointer;
  `;
  
  toastEl.textContent = message;
  
  // Agregar animación
  const style = document.createElement("style");
  style.textContent = `
    @keyframes slideInCenter {
      from {
        transform: translateX(-50%) translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
    }
    @keyframes slideOutCenter {
      from {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
      }
      to {
        transform: translateX(-50%) translateY(-100%);
        opacity: 0;
      }
    }
  `;

  if (!document.querySelector("#toast-styles")) {
    style.id = "toast-styles";
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toastEl);
  
  // Click para cerrar
  toastEl.addEventListener("click", () => {
    toastEl.style.animation = "slideOutCenter 0.3s ease-in";
    setTimeout(() => toastEl.remove(), 300);
  });

  // Auto-cerrar después de 4 segundos
  setTimeout(() => {
    if (toastEl.parentNode) {
      toastEl.style.animation = "slideOutCenter 0.3s ease-in";
      setTimeout(() => toastEl.remove(), 300);
    }
  }, 4000);
}

/**
 * Mostrar notificación de éxito
 */
export function notifySuccess(message) {
  if (Platform.OS === "web") {
    toast.success(message);
  } else {
    Alert.alert("✅ Éxito", message, [{ text: "OK" }]);
  }
}

/**
 * Mostrar notificación de error
 */
export function notifyError(message) {
  if (Platform.OS === "web") {
    toast.error(message);
  } else {
    Alert.alert("❌ Error", message, [{ text: "OK" }]);
  }
}

/**
 * Mostrar notificación informativa
 */
export function notifyInfo(message) {
  if (Platform.OS === "web") {
    toast.info(message);
  } else {
    Alert.alert("ℹ️ Información", message, [{ text: "OK" }]);
  }
}

/**
 * Notificación genérica (backward compatibility)
 */
export function notify(title, message) {
  const t = message === undefined ? "Aviso" : title;
  const m = message === undefined ? String(title ?? "") : String(message ?? "");

  if (Platform.OS === "web") {
    toast.info(m);
  } else {
    Alert.alert(t, m, [{ text: "OK" }]);
  }
}

/**
 * Diálogo de confirmación
 */
export function confirmDialog(title, message, { okText = "OK", cancelText = "Cancelar" } = {}) {
  if (Platform.OS === "web") {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      { text: cancelText, style: "cancel", onPress: () => resolve(false) },
      { text: okText, style: "default", onPress: () => resolve(true) },
    ]);
  });
}