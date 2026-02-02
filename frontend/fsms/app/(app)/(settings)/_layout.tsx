import React, { useEffect, useState } from "react";
import { Text, View, Pressable, Platform, useWindowDimensions } from "react-native";
import { Drawer } from "expo-router/drawer";
import { useRouter, type Href } from "expo-router";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/src/api/client";
import { ScreenStyles } from '@/src/styles/appStyles';
import ProfileMenu from "@/src/ui/ProfileMenu";
import ChangePasswordModal from "@/src/ui/ChangePasswordModal";
import UserSettingsModal from "@/src/ui/UserSettings";
import { getAuthToken, isSessionExpired, ensureSessionExpiry, clearAuthSession } from "@/src/storage/authStorage";
import { t } from "@/src/i18n";
import { useLanguage } from "@/src/i18n/LanguageProvider";

function CustomDrawerContent(props: any) {

  const router = useRouter();

  const DISCIPLINES: Href = "/(app)/(settings)/disciplines";
  const PACKAGES: Href = "/(app)/(settings)/packages";
  const DASHBOARD: Href = "/(app)/(settings)/dashboard";
  const RANKS: Href = "/(app)/(settings)/ranks";

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem label={t("dashboard.title")} onPress={() => router.push(DASHBOARD)} />
      <View style={ScreenStyles.divider} />
      <DrawerItem label={t("packages.title")} onPress={() => router.push(PACKAGES)} />
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
  const [user, setUser] = useState(null);

  return (
      <Drawer
                 drawerContent={(props) => <CustomDrawerContent {...props} user={user} />}
                 screenOptions={{
                   drawerType: isPermanent ? "permanent" : "front",
                   drawerStyle: { width: drawerWidth } ,
                   overlayColor: isPermanent ? "transparent" : undefined,
                   swipeEnabled: !isPermanent,
                   headerShown: false,
                   headerLeft: isPermanent ? () => null : undefined,
                   sceneContainerStyle: isPermanent ? { marginLeft: drawerWidth } : undefined,
                 }}
               >
      <Drawer.Screen name="disciplines" options={{ title: t("disciplines.title"), drawerLabel: () => <Text>{t("disciplines.title")}</Text>, }} />
      <Drawer.Screen name="ranks" options={{ title: t("ranks.title"), drawerLabel: () => <Text>{t("ranks.title")}</Text>, }} />
      <Drawer.Screen name="packages" options={{ title: t("packages.title"), drawerLabel: () => <Text>{t("packages.title")}</Text>, }} />
    </Drawer>
  );
}
