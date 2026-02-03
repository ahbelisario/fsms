import React, { useEffect, useRef } from "react";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { useDrawerControl } from "@/src/context/DrawerControlContext";
import { Platform, useWindowDimensions, View } from "react-native";
import { Drawer } from "expo-router/drawer";
import { useRouter, type Href } from "expo-router";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { ScreenStyles } from "@/src/styles/appStyles";
import { t } from "@/src/i18n";


function CustomDrawerContent(props: any) {
  const router = useRouter();

  const HOME: Href = "/(app)/(main)/home";
  const DASHBOARD: Href = "/(app)/(main)/dashboard";
  const USERS: Href = "/(app)/(main)/users";
  const MEMBERSHIPS: Href = "/(app)/(main)/memberships";
  const INCOMES: Href = "/(app)/(main)/incomes";
  const SETTINGS: Href = "/(app)/(settings)";

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem label={t("dashboard.title")} onPress={() => router.push(DASHBOARD)} />
      <View style={ScreenStyles.divider} />

      <DrawerItem label={t("users.members")} onPress={() => router.push(USERS)} />
      <DrawerItem label={t("memberships.title")} onPress={() => router.push(MEMBERSHIPS)} />
      <DrawerItem label={t("incomes.title")} onPress={() => router.push(INCOMES)} />

      <View style={ScreenStyles.divider} />

      <DrawerItem
        label={t("common.settings")}
        icon={({ size, color }) => (
          <Ionicons name="settings-outline" size={size} color={color} />
        )}
        onPress={() => router.push(SETTINGS)}
      />
    </DrawerContentScrollView>
  );
}

export default function MainLayout() {

  const drawerNavRef = useRef<any>(null);
  const navigation = useNavigation();
  const { setToggleMainDrawer } = useDrawerControl();

  useEffect(() => {
    const fn = () => navigation.dispatch(DrawerActions.toggleDrawer());

    // registra el handler
    setToggleMainDrawer(() => () => {
    drawerNavRef.current?.dispatch(DrawerActions.toggleDrawer());
  });

    // cleanup
    return () => setToggleMainDrawer(undefined);
  }, [navigation, setToggleMainDrawer]);

  // ... tu lógica de drawerWidth, isPermanent, etc

  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = width >= 1024;
  const drawerWidth = 220;
  const isPermanent = isWeb && isDesktop;

  return (
    <Drawer
      id="mainDrawer"
      drawerContent={(props) => {
        drawerNavRef.current = props.navigation; // ✅ ESTE ES EL NAV REAL DEL DRAWER
        return <CustomDrawerContent {...props} />;
      }}

      screenOptions={{
        headerShown: false, // header global está en app/_layout
        drawerType: isPermanent ? "permanent" : "front",
        drawerStyle: { width: drawerWidth },
        overlayColor: isPermanent ? "transparent" : undefined,
        swipeEnabled: !isPermanent,
        sceneContainerStyle: isPermanent ? { marginLeft: drawerWidth } : undefined,
      }}
    >
      <Drawer.Screen name="home" options={{ title: "Home" }} />
      <Drawer.Screen name="dashboard" options={{ title: t("dashboard.title") }} />
      <Drawer.Screen name="users" options={{ title: t("users.title") }} />
      <Drawer.Screen name="memberships" options={{ title: t("memberships.title") }} />
      <Drawer.Screen name="incomes" options={{ title: t("incomes.title") }} />
      <Drawer.Screen name="userprofiles/index" options={{ title: t("userprofiles.title") }} />
      <Drawer.Screen name="userprofiles/[userId]" options={{ title: t("userprofiles.title") }} />
    </Drawer>
  );
}
