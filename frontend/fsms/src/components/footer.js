import React from "react";
import { View, Text, Image } from "react-native";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <View style={styles.footer}>
      {/* Contenedor con texto izquierda y logo derecha */}
      <View style={styles.content}>
        {/* Texto a la izquierda */}
        <Text style={styles.text}>
          © {currentYear} BudoDesk. Todos los derechos reservados.
        </Text>
        
        {/* Logo a la derecha */}
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
    alignItems: 'center',        // ← Centra verticalmente
    justifyContent: 'space-between',  // ← Texto izquierda, logo derecha
  },
  logo: {
    width: 150,
    height: 40,
  },
  text: {
    fontSize: 11,
    color: '#64748b',
    // textAlign: 'left' es el default
  },
};