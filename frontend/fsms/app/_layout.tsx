import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { Drawer } from "expo-router/drawer";
import { Stack, usePathname, useRouter, type Href } from "expo-router";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { deleteAuthToken, getAuthToken } from "@/src/storage/authStorage";

function CustomDrawerContent(props: any) {
  const router = useRouter();
  const USERS: Href = "/users";
  const DICIPLINES: Href = "/diciplines";
  const LOGIN: Href = "/";

  async function handleLogout() {
    await deleteAuthToken();
    router.replace(LOGIN);
  }

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItem label="Usuarios" onPress={() => router.push(USERS)} />
      <DrawerItem label="Diciplinas" onPress={() => router.push(DICIPLINES)} />
      {/* Agrega más pantallas después:
      <DrawerItem label="Reportes" onPress={() => router.push("/reports" as const)} />
      */}
      <DrawerItem label="Logout" onPress={handleLogout} />
    </DrawerContentScrollView>
  );
}

export default function RootLayout() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const t = await getAuthToken();
        if (!mounted) return;
        setHasToken(!!t);
      } catch {
        if (!mounted) return;
        setHasToken(false);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [pathname]); // <-- clave: re-check cuando cambias de ruta (ej. después del login)

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  // SIN token: solo login (index)
  if (!hasToken) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    );
  }

  // CON token: Drawer (menú)
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ headerShown: true }}
    >
      <Drawer.Screen name="users" options={{ title: "Usuarios" }} />
      <Drawer.Screen name="diciplines" options={{ title: "Diciplinas" }} />
      {/* <Drawer.Screen name="reports" options={{ title: "Reportes" }} /> */}
    </Drawer>
  );
}
