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
  const USERS: Href = "/(app)/(main)/users";
  const HOME: Href = "/(app)/(main)/home";
  const MEMBERSHIPS: Href = "/(app)/(main)/memberships";
  const DASHBOARD: Href = "/(app)/(main)/dashboard";
  const PAYMENTS: Href = "/(app)/(main)/payments";
  const SETTINGS: Href = "/(app)/(settings)";

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem label={t("dashboard.title")} onPress={() => router.push(DASHBOARD)} /> ) : (<DrawerItem label="Home" onPress={() => router.push(HOME)} />
      <View style={ScreenStyles.divider} />
      <DrawerItem label={t("users.members")} onPress={() => router.push(USERS)} />
      <DrawerItem label={t("memberships.title")} onPress={() => router.push(MEMBERSHIPS)} />
      <DrawerItem label={t("payments.title")} onPress={() => router.push(PAYMENTS)} />
      <View style={ScreenStyles.divider} />
      <DrawerItem
        label="Configuración"
        icon={({ size, color }) => (
          <Ionicons name="settings-outline" size={size} color={color} />
        )}
        onPress={() => router.push(SETTINGS)}
      />
    </DrawerContentScrollView>
  );
}

export default function MainLayout() {

  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = width >= 1024;
  const drawerWidth = 250;
  const isPermanent = isWeb && isDesktop;
  
  return (
      <>
        <Drawer
            id="mainDrawer"
            drawerContent={(props) => <CustomDrawerContent {...props} user={user} />}
            screenOptions={{
              headerShown: false,
              drawerType: isPermanent ? "permanent" : "front",
              drawerStyle: { width: drawerWidth } ,
              overlayColor: isPermanent ? "transparent" : undefined,
              swipeEnabled: !isPermanent,
              sceneContainerStyle: isPermanent ? { marginLeft: drawerWidth } : undefined,
            }}
          >
          <Drawer.Screen name="home" options={{ title: "Home" }} />
          <Drawer.Screen name="dashboard" options={{ title: t("dashboard.title"), drawerLabel: () => <Text>{t("dashboard.title")}</Text>, }} />
          <Drawer.Screen name="users" options={{ title: t("users.members"), drawerLabel: () => <Text>{t("users.title")}</Text>, }} />
          <Drawer.Screen name="userprofiles/index" options={{ title: t("userprofiles.title"), drawerLabel: () => <Text>{t("userprofiles.title")}</Text>, }} />
          <Drawer.Screen name="userprofiles/[userId]" options={{ title: t("userprofiles.title"), drawerLabel: () => <Text>{t("userprofiles.title")}</Text>, }} />
          <Drawer.Screen name="memberships" options={{ title: t("memberships.title"), drawerLabel: () => <Text>{t("memberships.title")}</Text>, }} />
          <Drawer.Screen name="payments" options={{ title: t("payments.title"), drawerLabel: () => <Text>{t("payments.title")}</Text>, }} />
        </Drawer>
      </>    
  );

}
