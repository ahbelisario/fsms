import React, { useEffect, useRef } from "react";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { useDrawerControl } from "@/src/context/DrawerControlContext";
import { useUser } from "@/src/context/UserContext";
import { Platform, useWindowDimensions, View } from "react-native";
import { Drawer } from "expo-router/drawer";
import { usePathname, useRouter, type Href } from "expo-router";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { ScreenStyles } from "@/src/styles/appStyles";
import { clearAuthSession } from "@/src/storage/authStorage";
import { t } from "@/src/i18n";


// Menú para usuarios NORMALES
function UserDrawerContent({ pointerEvents, ...props }: any) {
  const router = useRouter();

  const HOME: Href = "/(app)/(main)/home";
  const DASHBOARD: Href = "/(app)/(main)/dashboard";

  return (
    <DrawerContentScrollView 
      {...props}
      contentContainerStyle={{ flex: 1 }}
    >
      <View style={{ flex: 1 }}>
        <DrawerItem 
          label="Home" 
          icon={({ size, color }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          )}
          onPress={() => router.push(HOME)} 
        />
        <DrawerItem 
          label={t("dashboard.title")} 
          icon={({ size, color }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          )}
          onPress={() => router.push(DASHBOARD)} 
        />
      </View>
      
      {/* Logout al final */}
      <View style={{ borderTopWidth: 1, borderTopColor: '#ddd', marginTop: 'auto' }}>
        <DrawerItem 
          label={t("common.logout") || "Cerrar sesión"}
          icon={({ size, color }) => (
            <Ionicons name="log-out-outline" size={size} color={color} />
          )}
          onPress={async () => {
            await clearAuthSession();
            router.replace("/(auth)");
          }}
          labelStyle={{ color: '#dc2626' }}
        />
      </View>
    </DrawerContentScrollView>
  );
}

// Menú para ADMINISTRADORES
function AdminDrawerContent({ pointerEvents, ...props }: any) {
  const router = useRouter();
  const pathname = usePathname(); 

  const HOME: Href = "/(app)/(main)/home";
  const DASHBOARD: Href = "/(app)/(main)/dashboard";
  const USERS: Href = "/(app)/(main)/users";
  const MEMBERSHIPS: Href = "/(app)/(main)/memberships";
  const SCHEDULE: Href = "/(app)/(main)/schedule";
  const INCOMES: Href = "/(app)/(main)/incomes";
  const SETTINGS: Href = "/(app)/(settings)";

  const isActive = (route: string) => pathname.includes(route);


  return (
    <DrawerContentScrollView 
      {...props}
      contentContainerStyle={{ flex: 1 }}
    >
      <View style={{ flex: 1 }}>
        <DrawerItem 
          label={t("dashboard.title")} 
          icon={({ size, color }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          )}
          onPress={() => router.push(DASHBOARD)} 

          // Personalización aquí
          activeTintColor="#007AFF"
          inactiveTintColor="#666"
          activeBackgroundColor="#E3F2FD"
          labelStyle={{ fontSize: 15, fontWeight: '500' }}
          style={{
            borderRadius: 4,
            marginHorizontal: 8,
            marginVertical: 2,
            backgroundColor: isActive('/dashboard') ? '#E3F2FD' : 'transparent',}}


        />
        <View style={ScreenStyles.divider} />

        <DrawerItem 
          label={t("schedule.title")} 
          icon={({ size, color }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          )}
          onPress={() => router.push(SCHEDULE)} 
        />

        <View style={ScreenStyles.divider} />

        <DrawerItem 
          label={t("users.title")} 
          icon={({ size, color }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          )}
          onPress={() => router.push(USERS)} 
        />
        <DrawerItem 
          label={t("memberships.title")} 
          icon={({ size, color }) => (
            <Ionicons name="card-outline" size={size} color={color} />
          )}
          onPress={() => router.push(MEMBERSHIPS)} 
        />
        <DrawerItem 
          label={t("incomes.title")} 
          icon={({ size, color }) => (
            <Ionicons name="cash-outline" size={size} color={color} />
          )}
          onPress={() => router.push(INCOMES)} 
        />

        <View style={ScreenStyles.divider} />

        <DrawerItem
          label={t("common.settings")}
          icon={({ size, color }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          )}
          onPress={() => router.push(SETTINGS)}
        />
      </View>

      {/* Logout al final */}
      <View style={{ borderTopWidth: 1, borderTopColor: '#ddd', marginTop: 'auto' }}>
        <DrawerItem 
          label={t("common.logout") || "Cerrar sesión"}
          icon={({ size, color }) => (
            <Ionicons name="log-out-outline" size={size} color={color} />
          )}
          onPress={async () => {
            await clearAuthSession();
            router.replace("/(auth)");
          }}
          labelStyle={{ color: '#dc2626' }}
        />
      </View>
    </DrawerContentScrollView>
  );
}

export default function MainLayout() {

  const drawerNavRef = useRef<any>(null);
  const navigation = useNavigation();
  const { setToggleMainDrawer } = useDrawerControl();
  const { isAdmin } = useUser();

  useEffect(() => {
    // registra el handler
    setToggleMainDrawer(() => () => {
      drawerNavRef.current?.dispatch(DrawerActions.toggleDrawer());
    });

    // cleanup
    return () => setToggleMainDrawer(undefined);
  }, [navigation, setToggleMainDrawer]);

  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = width >= 1024;
  const drawerWidth = 220;
  const isPermanent = isWeb && isDesktop;

  return (
    <Drawer
      id="mainDrawer"
      drawerContent={(props) => {
        drawerNavRef.current = props.navigation;
        // Renderizar menú diferente según el rol
        return isAdmin ? (
          <AdminDrawerContent {...props} />
        ) : (
          <UserDrawerContent {...props} />
        );
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
      <Drawer.Screen name="home" options={{ title: "Home" }} />
      <Drawer.Screen name="dashboard" options={{ title: t("dashboard.title") }} />
      <Drawer.Screen name="schedule" options={{ title: t("schedule.title") }} />
      <Drawer.Screen name="users" options={{ title: t("users.title") }} />
      <Drawer.Screen name="memberships" options={{ title: t("memberships.title") }} />
      <Drawer.Screen name="incomes" options={{ title: t("incomes.title") }} />
      <Drawer.Screen name="userprofiles/index" options={{ title: t("userprofiles.title") }} />
      <Drawer.Screen name="userprofiles/[userId]" options={{ title: t("userprofiles.title") }} />
    </Drawer>
  );
}