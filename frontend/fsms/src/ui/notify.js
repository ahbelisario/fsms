import { Alert, Platform } from "react-native";

export function notify(title, message) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

export function confirmDelete(message, onConfirm) {
  if (Platform.OS === "web") {
    const ok = window.confirm(message);
    if (ok) onConfirm();
    return;
  }

  Alert.alert("Confirmar", message, [
    { text: "Cancelar", style: "cancel" },
    { text: "Borrar", style: "destructive", onPress: onConfirm },
  ]);
}
