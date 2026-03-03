import React, { useEffect, useRef } from "react";
import { Platform, useWindowDimensions, View, Text } from "react-native";
import { Drawer } from "expo-router/drawer";
import { useRouter, type Href } from "expo-router";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Ionicons, MaterialIcons, Octicons} from "@expo/vector-icons";
import { ScreenStyles } from "@/src/styles/appStyles";
import { clearAuthSession } from "@/src/storage/authStorage";
import { t } from "@/src/i18n";

import { DrawerActions } from "@react-navigation/native";
import { useDrawerControl } from "@/src/context/DrawerControlContext";
import { useUser } from "@/src/context/UserContext";


function CustomDrawerContent({ pointerEvents, ...props }: any) {
  const router = useRouter();

  const DASHBOARD: Href = "/(app)/(settings)/dashboard";
  const PACKAGES: Href = "/(app)/(settings)/packages";
  const DISCIPLINES: Href = "/(app)/(settings)/disciplines";
  const RANKS: Href = "/(app)/(settings)/ranks";
  const INCOMETYPES: Href = "/(app)/(settings)/incometypes";
  const MAIN: Href = "/(app)/(main)/dashboard";

  return (
    <DrawerContentScrollView 
      {...props}
      contentContainerStyle={{ flex: 1 }}
    >
      <View style={{ flex: 1 }}>
        <DrawerItem label={t("dashboard.title")} onPress={() => router.push(DASHBOARD)} />
        <View style={ScreenStyles.divider} />
        <DrawerItem 
          label={t("packages.title")}
          icon={({ size, color }) => (
            <Octicons name="package" size={size} color={color} />
          )}
          onPress={() => router.push(PACKAGES)} />

        <DrawerItem 
          label={t("incometypes.title")} 
          icon={({ size, color }) => (
            <Ionicons name="cash-outline" size={size} color={color} />
          )}
          onPress={() => router.push(INCOMETYPES)} />
        <View style={ScreenStyles.divider} />

        <DrawerItem 
          label={t("disciplines.title")} 
          icon={({ size, color }) => (
            <MaterialIcons name="sports-martial-arts" size={size} color={color} />
          )}
          onPress={() => router.push(DISCIPLINES)} />

        <DrawerItem 
          label={t("ranks.title")} 
          icon={({ size, color }) => (
            <MaterialIcons name="military-tech" size={size} color={color} />
          )}
          onPress={() => router.push(RANKS)} />

        <View style={ScreenStyles.divider} />
        <DrawerItem 
          label={t("common.back")} 
          icon={({ size, color }) => (
            <Ionicons name="arrow-back" size={size} color={color} />
          )}
          onPress={() => router.replace(MAIN)} />
      </View>
    </DrawerContentScrollView>
  );
}

export default function SettingsLayout() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = width >= 1024;
  const drawerWidth = 220;
  const isPermanent = isWeb && isDesktop;

  const router = useRouter();
  const drawerNavRef = useRef<any>(null);
  const { setToggleSettingsDrawer } = useDrawerControl();
  const { isAdmin } = useUser();

  useEffect(() => {
    setToggleSettingsDrawer(() => () => {
      drawerNavRef.current?.dispatch(DrawerActions.toggleDrawer());
    });

    return () => setToggleSettingsDrawer(undefined);
  }, [setToggleSettingsDrawer]);

  // Protección: redirigir si no es admin
  useEffect(() => {
    if (!isAdmin) {
      router.replace("/(app)/(main)/dashboard");
    }
  }, [isAdmin, router]);

  // Si no es admin, no renderizar nada
  if (!isAdmin) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{t("common.unauthorized") || "No autorizado"}</Text>
      </View>
    );
  }

  return (
    <Drawer
      id="settingsDrawer"
      drawerContent={(props) => {
        drawerNavRef.current = props.navigation;
        return <CustomDrawerContent {...props} />;
      }}
      screenOptions={{
        headerShown: false,
        drawerType: isPermanent ? "permanent" : "front",
        drawerStyle: { width: drawerWidth },
        overlayColor: isPermanent ? "transparent" : undefined,
        swipeEnabled: !isPermanent,
        sceneContainerStyle: isPermanent ? { marginLeft: drawerWidth } : undefined,
      }}
    >
      <Drawer.Screen name="dashboard" options={{ title: t("dashboard.title") }} />
      <Drawer.Screen name="packages" options={{ title: t("packages.title") }} />
      <Drawer.Screen name="disciplines" options={{ title: t("disciplines.title") }} />
      <Drawer.Screen name="ranks" options={{ title: t("ranks.title") }} />
      <Drawer.Screen name="incometypes" options={{ title: t("incometypes.title") }} />
    </Drawer>
  );
}