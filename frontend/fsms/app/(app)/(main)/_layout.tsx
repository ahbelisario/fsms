import React, { useEffect, useRef, useState } from "react";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { useDrawerControl } from "@/src/context/DrawerControlContext";
import { useUser } from "@/src/context/UserContext";
import { Platform, useWindowDimensions, View, Pressable, Text, StyleSheet } from "react-native";
import { Drawer } from "expo-router/drawer";
import { usePathname, useRouter, type Href } from "expo-router";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { ScreenStyles } from "@/src/styles/appStyles";
import { t } from "@/src/i18n";

// Componente personalizado para items del drawer con hover
function CustomDrawerItem({ 
  label, 
  icon: IconComponent, 
  onPress, 
  isActive 
}: {
  label: string;
  icon: any;
  onPress: () => void;
  isActive: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  const iconColor = isActive ? "#007AFF" : isHovered ? "#333" : "#666";

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
      style={[
        styles.drawerItem,
        isActive && styles.drawerItemActive,
        isHovered && styles.drawerItemHovered,
      ]}
    >
      <View style={styles.iconContainer}>
        {IconComponent({ size: 24, color: iconColor })}
      </View>
      <Text 
        style={[
          styles.label,
          isActive && styles.labelActive,
          isHovered && styles.labelHovered,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

// Menú para usuarios NORMALES
function UserDrawerContent({ pointerEvents, ...props }: any) {
  const router = useRouter();
  const pathname = usePathname();

  const HOME: Href = "/(app)/(main)/home";
  const AVAILABLECLASSES: Href = "/(app)/(main)/availableclasses";

  const isActive = (route: string) => pathname.includes(route);

  return (
    <DrawerContentScrollView 
      {...props}
      contentContainerStyle={{ flex: 1 }}
    >
      <View style={{ flex: 1 }}>
        <CustomDrawerItem
          label="Home"
          icon={({ size, color }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          )}
          onPress={() => router.push(HOME)}
          isActive={isActive('/home')}
        />

        <View style={ScreenStyles.divider} />

        <CustomDrawerItem
          label="Classes"
          icon={({ size, color }) => (
            <MaterialIcons name="schedule" size={size} color={color} />
          )}
          onPress={() => router.push(AVAILABLECLASSES)}
          isActive={isActive('/availableclasses')}
        />
      </View>
    </DrawerContentScrollView>
  );
}

// Menú para ADMINISTRADORES
function AdminDrawerContent({ pointerEvents, ...props }: any) {
  const router = useRouter();
  const pathname = usePathname(); 

  const DASHBOARD: Href = "/(app)/(main)/dashboard";
  const USERS: Href = "/(app)/(main)/users";
  const MEMBERSHIPS: Href = "/(app)/(main)/memberships";
  const ATTENDANCE: Href = "/(app)/(main)/attendance";
  const ENROLLMENTS: Href = "/(app)/(main)/managementenrollments";
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
        <CustomDrawerItem
          label={t("dashboard.title")}
          icon={({ size, color }) => (
            <Ionicons name="stats-chart-outline" size={size} color={color} />
          )}
          onPress={() => router.push(DASHBOARD)}
          isActive={isActive('/dashboard')}
        />

        <View style={ScreenStyles.divider} />

        <CustomDrawerItem
          label={t("schedule.title")}
          icon={({ size, color }) => (
            <MaterialIcons name="schedule" size={size} color={color} />
          )}
          onPress={() => router.push(SCHEDULE)}
          isActive={isActive('/schedule')}
        />

        <CustomDrawerItem
          label={t("enrollments.title")}
          icon={({ size, color }) => (
            <MaterialIcons name="how-to-reg" size={size} color={color} />
          )}
          onPress={() => router.push(ENROLLMENTS)}
          isActive={isActive('/managementenrollments')}
        />

        <CustomDrawerItem
          label={t("attendance.title")}
          icon={({ size, color }) => (
            <MaterialIcons name="checklist" size={size} color={color} />
          )}
          onPress={() => router.push(ATTENDANCE)}
          isActive={isActive('/attendance')}
        />

        <View style={ScreenStyles.divider} />

        <CustomDrawerItem
          label={t("users.title")}
          icon={({ size, color }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          )}
          onPress={() => router.push(USERS)}
          isActive={isActive('/users')}
        />

        <CustomDrawerItem
          label={t("memberships.title")}
          icon={({ size, color }) => (
            <Ionicons name="card-outline" size={size} color={color} />
          )}
          onPress={() => router.push(MEMBERSHIPS)}
          isActive={isActive('/memberships')}
        />

        <CustomDrawerItem
          label={t("incomes.title")}
          icon={({ size, color }) => (
            <Ionicons name="cash-outline" size={size} color={color} />
          )}
          onPress={() => router.push(INCOMES)}
          isActive={isActive('/incomes')}
        />

        <View style={ScreenStyles.divider} />

        <CustomDrawerItem
          label={t("common.settings")}
          icon={({ size, color }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          )}
          onPress={() => router.push(SETTINGS)}
          isActive={isActive('/settings')}
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
    setToggleMainDrawer(() => () => {
      drawerNavRef.current?.dispatch(DrawerActions.toggleDrawer());
    });

    return () => setToggleMainDrawer(undefined);
  }, [navigation, setToggleMainDrawer]);

  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = width >= 1024;
  const drawerWidth = 240;
  const isPermanent = isWeb && isDesktop;

  return (
    <Drawer
      id="mainDrawer"
      drawerContent={(props) => {
        drawerNavRef.current = props.navigation;
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
      <Drawer.Screen name="availableclasses" options={{ title: "Classes" }} />
      <Drawer.Screen name="dashboard" options={{ title: t("dashboard.title") }} />
      <Drawer.Screen name="schedule" options={{ title: t("schedule.title") }} />
      <Drawer.Screen name="attendance" options={{ title: t("attendance.title") }} />
      <Drawer.Screen name="managementenrollments" options={{ title: t("enrollments.title") }} />
      <Drawer.Screen name="users" options={{ title: t("users.title") }} />
      <Drawer.Screen name="memberships" options={{ title: t("memberships.title") }} />
      <Drawer.Screen name="incomes" options={{ title: t("incomes.title") }} />
      <Drawer.Screen name="userprofiles/index" options={{ title: t("userprofiles.title") }} />
      <Drawer.Screen name="userprofiles/[userId]" options={{ title: t("userprofiles.title") }} />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 8,
    backgroundColor: 'transparent',
    cursor: 'pointer', // Solo funciona en web
  },
  drawerItemActive: {
    backgroundColor: '#E3F2FD',
  },
  drawerItemHovered: {
    backgroundColor: '#F5F5F5',
  },
  iconContainer: {
    marginRight: 16,
    width: 24,
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  labelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  labelHovered: {
    color: '#333',
  },
});