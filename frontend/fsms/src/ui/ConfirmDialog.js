import React from "react";
import { Modal, View, Text, Pressable } from "react-native";

export default function ConfirmDialog({
  visible,
  title = "Confirmar",
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  danger = false,
  onConfirm,
  onCancel,
}) {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.actions}>
            <Pressable onPress={onCancel} style={styles.btn}>
              <Text style={styles.cancelText}>{cancelText}</Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={[styles.btn, danger && styles.dangerBtn]}
            >
              <Text style={[styles.confirmText, danger && styles.dangerText]}>
                {confirmText}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = {
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "white",
    borderRadius: 14,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: "#334155",
    marginBottom: 16,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 16,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  cancelText: {
    color: "#334155",
    fontWeight: "600",
  },
  confirmText: {
    color: "#0ea5e9",
    fontWeight: "800",
  },
  dangerBtn: {},
  dangerText: {
    color: "#b91c1c",
  },
};
