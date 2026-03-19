import React from "react";
import { View, Text, Image, Platform, useWindowDimensions } from "react-native";

export default function Footer() {
  const { width } = useWindowDimensions();

  // Ocultar en móvil nativo o web con ancho < 768
  const isNativeMobile = Platform.OS === "ios" || Platform.OS === "android";
  const isNarrowWeb    = Platform.OS === "web" && width < 768;

  if (isNativeMobile || isNarrowWeb) return null;

  const currentYear = new Date().getFullYear();

  return (
    <View style={styles.footer}>
      <View style={styles.content}>
        <Text style={styles.text}>
          © {currentYear} BudoDesk. Todos los derechos reservados.
        </Text>
        <Image
          source={require('@/assets/images/budodesk-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = {
  footer: {
    backgroundColor: '#f8fafc',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: "row",
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 150,
    height: 40,
  },
  text: {
    fontSize: 11,
    color: '#64748b',
  },
};