import React from "react";
import { Platform, useWindowDimensions, View } from "react-native";
import { Drawer } from "expo-router/drawer";
import { useRouter, type Href } from "expo-router";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { ScreenStyles } from "@/src/styles/appStyles";
import { t } from "@/src/i18n";

function CustomDrawerContent(props: any) {
  const router = useRouter();

  const PACKAGES: Href = "/(app)/(settings)/packages";
  const DISCIPLINES: Href = "/(app)/(settings)/disciplines";
  const RANKS: Href = "/(app)/(settings)/ranks";

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem label={t("packages.title")} onPress={() => router.push(PACKAGES)} />
      <View style={ScreenStyles.divider} />
      <DrawerItem label={t("disciplines.title")} onPress={() => router.push(DISCIPLINES)} />
      <DrawerItem label={t("ranks.title")} onPress={() => router.push(RANKS)} />
      <View style={ScreenStyles.divider} />
    </DrawerContentScrollView>
  );
}

export default function SettingsLayout() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = width >= 1024;
  const drawerWidth = 250;
  const isPermanent = isWeb && isDesktop;

  return (
    <Drawer
      id="settingsDrawer"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false, // header global está en app/_layout (con back)
        drawerType: isPermanent ? "permanent" : "front",
        drawerStyle: { width: drawerWidth },
        overlayColor: isPermanent ? "transparent" : undefined,
        swipeEnabled: !isPermanent,
        sceneContainerStyle: isPermanent ? { marginLeft: drawerWidth } : undefined,
      }}
    >
      <Drawer.Screen name="packages" options={{ title: t("packages.title") }} />
      <Drawer.Screen name="disciplines" options={{ title: t("disciplines.title") }} />
      <Drawer.Screen name="ranks" options={{ title: t("ranks.title") }} />
    </Drawer>
  );
}
