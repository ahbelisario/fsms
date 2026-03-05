import React, { useEffect, useRef, useState } from "react";
import { Platform, useWindowDimensions, View, Text, Pressable, StyleSheet } from "react-native";
import { Drawer } from "expo-router/drawer";
import { useRouter, usePathname, type Href } from "expo-router";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { Ionicons, MaterialIcons, Octicons } from "@expo/vector-icons";
import { ScreenStyles } from "@/src/styles/appStyles";
import { t } from "@/src/i18n";

import { DrawerActions } from "@react-navigation/native";
import { useDrawerControl } from "@/src/context/DrawerControlContext";
import { useUser } from "@/src/context/UserContext";

// Componente personalizado para items del drawer con hover
function CustomDrawerItem({ 
  label, 
  icon: IconComponent, 
  onPress, 
  isActive 
}: {
  label: string;
  icon?: any;
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
      {IconComponent && (
        <View style={styles.iconContainer}>
          {IconComponent({ size: 24, color: iconColor })}
        </View>
      )}
      <Text 
        style={[
          styles.label,
          !IconComponent && styles.labelNoIcon,
          isActive && styles.labelActive,
          isHovered && styles.labelHovered,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function CustomDrawerContent({ pointerEvents, ...props }: any) {
  const router = useRouter();
  const pathname = usePathname();

  const DASHBOARD: Href = "/(app)/(settings)/dashboard";
  const SETTINGS: Href = "/(app)/(settings)/dojosettings";
  const PACKAGES: Href = "/(app)/(settings)/packages";
  const DISCIPLINES: Href = "/(app)/(settings)/disciplines";
  const RANKS: Href = "/(app)/(settings)/ranks";
  const INCOMETYPES: Href = "/(app)/(settings)/incometypes";
  const MAIN: Href = "/(app)/(main)/dashboard";

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
            <Ionicons name="grid-outline" size={size} color={color} />
          )}
          onPress={() => router.push(DASHBOARD)}
          isActive={isActive('/settings/dashboard')}
        />

        <View style={ScreenStyles.divider} />

        <CustomDrawerItem 
          label={t("packages.title")}
          icon={({ size, color }) => (
            <Octicons name="package" size={size} color={color} />
          )}
          onPress={() => router.push(PACKAGES)}
          isActive={isActive('/packages')}
        />

        <CustomDrawerItem 
          label={t("incometypes.title")} 
          icon={({ size, color }) => (
            <Ionicons name="cash-outline" size={size} color={color} />
          )}
          onPress={() => router.push(INCOMETYPES)}
          isActive={isActive('/incometypes')}
        />

        <View style={ScreenStyles.divider} />

        <CustomDrawerItem 
          label={t("disciplines.title")} 
          icon={({ size, color }) => (
            <MaterialIcons name="sports-martial-arts" size={size} color={color} />
          )}
          onPress={() => router.push(DISCIPLINES)}
          isActive={isActive('/disciplines')}
        />

        <CustomDrawerItem 
          label={t("ranks.title")} 
          icon={({ size, color }) => (
            <MaterialIcons name="military-tech" size={size} color={color} />
          )}
          onPress={() => router.push(RANKS)}
          isActive={isActive('/ranks')}
        />

        <View style={ScreenStyles.divider} />

        <CustomDrawerItem 
          label={t("dojo.settings")} 
          icon={({ size, color }) => (
            <MaterialIcons name="miscellaneous-services" size={size} color={color} />
          )}
          onPress={() => router.push(SETTINGS)}
          isActive={isActive('/settings/dojosettings')}
        />

         <View style={ScreenStyles.divider} />

        <CustomDrawerItem 
          label={t("common.back")} 
          icon={({ size, color }) => (
            <Ionicons name="arrow-back" size={size} color={color} />
          )}
          onPress={() => router.replace(MAIN)}
          isActive={false}
        />
      </View>
    </DrawerContentScrollView>
  );
}

export default function SettingsLayout() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = width >= 1024;
  const isMobile = width < 768;
  
  const drawerWidth = isMobile ? width * 0.75 : 240;
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
        drawerStyle: { 
          width: drawerWidth,
          maxWidth: '100%',
        },
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
    cursor: 'pointer',
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
  labelNoIcon: {
    marginLeft: 0,
  },
  labelActive: {
    color: '#007AFF',
    fontWeight: '600',
  },
  labelHovered: {
    color: '#333',
  },
});