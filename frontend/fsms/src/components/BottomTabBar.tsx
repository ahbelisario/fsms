// =====================================================
// Bottom Tab Bar - Solo para estudiantes en móvil
// Ubicación: src/components/BottomTabBar.tsx
// =====================================================

import React from "react";
import { View, Pressable, Text, Platform, useWindowDimensions, StyleSheet } from "react-native";
import { useRouter, usePathname, type Href } from "expo-router";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useUser } from "@/src/context/UserContext";
import { t } from "@/src/i18n";

export default function BottomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const { isAdmin } = useUser();

  // ── Condiciones de visibilidad ─────────────────────────────────────────────
  // Solo muestra en: móvil nativo  ó  web con ancho < 768
  // Solo para estudiantes (no admins)
  const isNativeMobile = Platform.OS === "ios" || Platform.OS === "android";
  const isNarrowWeb    = Platform.OS === "web" && width < 768;

  if (isAdmin || (!isNativeMobile && !isNarrowWeb)) {
    return null;
  }
  // ──────────────────────────────────────────────────────────────────────────

  const tabs: {
    name: string;
    label: string;
    route: Href;
    matchSegment: string;
    icon: React.ReactNode;
    iconOutline: React.ReactNode;
  }[] = [
    {
      name: "home",
      label: "Home",
      route: "/(app)/(main)/home",
      matchSegment: "/home",
      icon:        <Ionicons name="home"         size={24} color="#3b82f6" />,
      iconOutline: <Ionicons name="home-outline" size={24} color="#64748b" />,
    },
    {
      name: "classes",
      label: t("classes.availables"),   // "Available Classes" / "Clases Disponibles"
      route: "/(app)/(main)/availableclasses",
      matchSegment: "/availableclasses",
      icon:        <MaterialIcons name="schedule" size={24} color="#3b82f6" />,
      iconOutline: <MaterialIcons name="schedule" size={24} color="#64748b" />,
    },
    {
      name: "payments",
      label: t("payments.payments_history"),   // "Payments History" / "Historial de Pagos"
      route: "/(app)/(main)/paymenthistory",
      matchSegment: "/paymenthistory",
      icon:        <MaterialIcons name="payments" size={24} color="#3b82f6" />,
      iconOutline: <MaterialIcons name="payments" size={24} color="#64748b" />,
    },
    {
      name: "profile",
      label: t("userprofiles.myprofile"),   // "My Profile" / "Mi Perfil"
      route: "/(app)/(main)/userprofiles",
      matchSegment: "/userprofiles",
      icon:        <Ionicons name="person"         size={24} color="#3b82f6" />,
      iconOutline: <Ionicons name="person-outline" size={24} color="#64748b" />,
    },
  ];

  const isActive = (segment: string) => pathname.includes(segment);

  return (
    <View style={[
      styles.container,
      { paddingBottom: Platform.OS === "ios" ? 20 : 6 },
    ]}>
      {tabs.map((tab) => {
        const active = isActive(tab.matchSegment);
        return (
          <Pressable
            key={tab.name}
            onPress={() => router.push(tab.route)}
            style={styles.tab}
            android_ripple={{ color: "#e2e8f0", borderless: true }}
          >
            {/* Indicador activo arriba */}
            {active && <View style={styles.activeIndicator} />}

            {active ? tab.icon : tab.iconOutline}

            <Text style={[styles.label, active && styles.labelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 8,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 3,
    position: "relative",
  },
  label: {
    fontSize: 10,
    color: "#64748b",
    fontWeight: "400",
    textAlign: "center",
  },
  labelActive: {
    color: "#3b82f6",
    fontWeight: "600",
  },
  activeIndicator: {
    position: "absolute",
    top: 0,
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#3b82f6",
  },
});