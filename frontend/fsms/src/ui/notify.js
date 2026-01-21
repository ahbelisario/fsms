import { Alert, Platform } from "react-native";


export function notify(title, message) {
  // Permite notify("Texto") también
  const t = message === undefined ? "Aviso" : title;
  const m = message === undefined ? String(title ?? "") : String(message ?? "");

  if (Platform.OS === "web") {
    window.alert(`${t}\n\n${m}`);
    return;
  }

  Alert.alert(t, m, [{ text: "OK" }]);
}


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
