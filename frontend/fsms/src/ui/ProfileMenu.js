import React from "react";
import { Modal, View, Text, Pressable } from "react-native";

export default function ProfileMenu({ visible, onClose, onGoProfile, onChangePassword, onLogout, isAdmin }) {
  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.menu} onPress={() => {}}>
          {!isAdmin && (
            <>
              <Pressable style={styles.item} onPress={onGoProfile}>
                <Text style={styles.itemText}>Mi perfil</Text>
              </Pressable>
              <View style={styles.divider} />
            </>
          )}
          <Pressable style={styles.item} onPress={onChangePassword}>
            <Text style={styles.itemText}>Cambiar contraseña</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.item} onPress={onLogout}>
            <Text style={[styles.itemText, styles.danger]}>Logout</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = {
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
    // posiciona el menú en la esquina superior derecha (aprox del header)
    alignItems: "flex-end",
    justifyContent: "flex-start",
    paddingTop: 50,     // ajusta según tu header
    paddingRight: 22,
  },
  menu: {
    width: 180,
    backgroundColor: "white",
    borderRadius: 6,
    overflow: "hidden",
    // sombra (iOS) + elevación (Android)
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  item: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  itemText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  danger: {
    color: "#b91c1c",
  },
};
