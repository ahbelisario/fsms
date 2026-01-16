import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Drawer } from "expo-router/drawer";
import { Stack, usePathname, useRouter, type Href } from "expo-router";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { getAuthToken, isSessionExpired, clearAuthSession } from "@/src/storage/authStorage";

function CustomDrawerContent(props: any) {
  const router = useRouter();
  const USERS: Href = "/users";
  const DISCIPLINES: Href = "/disciplines";
  const DASHBOARD: Href = "/dashboard";
  const RANKS: Href = "/ranks";
  const LOGIN: Href = "/";

  async function handleLogout() {
    await clearAuthSession();
    router.replace(LOGIN);
  }

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem label="Dashboard" onPress={() => router.push(DASHBOARD)} />
      <DrawerItem label="Disciplinas" onPress={() => router.push(DISCIPLINES)} />
      <DrawerItem label="Grados" onPress={() => router.push(RANKS)} />
      <DrawerItem label="Usuarios" onPress={() => router.push(USERS)} />
      <DrawerItem label="Logout" onPress={handleLogout} />
    </DrawerContentScrollView>
  );
}

export default function RootLayout() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const token = await getAuthToken();
        const expired = await isSessionExpired();

        if (!token || expired) {
          await clearAuthSession();
          if (!mounted) return;
          setHasSession(false);
        } else {
          if (!mounted) return;
          setHasSession(true);
        }
      } catch {
        await clearAuthSession();
        if (!mounted) return;
        setHasSession(false);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [pathname]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  if (!hasSession) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    );
  }

  return (
    <Drawer drawerContent={(props) => <CustomDrawerContent {...props} />} screenOptions={{ headerShown: true }}>
      <Drawer.Screen name="dashboard" options={{ title: "Dashboard" }} />
      <Drawer.Screen name="users" options={{ title: "Usuarios" }} />
      <Drawer.Screen name="disciplines" options={{ title: "Disciplinas" }} />
      <Drawer.Screen name="ranks" options={{ title: "Grados" }} />
    </Drawer>
  );
}
