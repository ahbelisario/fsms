import { Alert, Platform } from "react-native";

export function notify(title, message) {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}
