import React, { useEffect, useState } from "react";
import { Text, View, Pressable } from "react-native";
import { Drawer } from "expo-router/drawer";
import { Stack, usePathname, useRouter, type Href } from "expo-router";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/src/api/client";
import { ScreenStyles } from '@/src/styles/appStyles';
import ProfileMenu from "@/src/ui/ProfileMenu";
import ChangePasswordModal from "@/src/ui/ChangePasswordModal";
import { getAuthToken, isSessionExpired, ensureSessionExpiry, clearAuthSession } from "@/src/storage/authStorage";


function CustomDrawerContent(props: any) {
  const router = useRouter();
  const USERS: Href = "/users";
  const HOME: Href = "/home";
  const DISCIPLINES: Href = "/disciplines";
  const DASHBOARD: Href = "/dashboard";
  const RANKS: Href = "/ranks";
  const LOGIN: Href = "/";
  const user = props.user;

  //<DrawerItem label="Logout" onPress={handleLogout} />

  async function handleLogout() {
    await clearAuthSession();
    router.replace(LOGIN);
  }

  return (
    <DrawerContentScrollView {...props}>
      {user?.role === "admin" ? ( <DrawerItem label="Dashboard" onPress={() => router.push(DASHBOARD)} /> ) : (<DrawerItem label="Home" onPress={() => router.push(HOME)} />)}
      {user?.role === "admin" && ( <DrawerItem label="Disciplinas" onPress={() => router.push(DISCIPLINES)} />)}
      {user?.role === "admin" && ( <DrawerItem label="Grados" onPress={() => router.push(RANKS)} />)}
      {user?.role === "admin" && ( <DrawerItem label="Usuarios" onPress={() => router.push(USERS)} />)}
    </DrawerContentScrollView>
  );
}

export default function RootLayout() {

  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [changePwdVisible, setChangePwdVisible] = useState(false);
  const isAdmin = user?.username === "admin";

  function openProfileMenu() {
    setProfileMenuOpen(true);
  }

  function closeProfileMenu() {
    setProfileMenuOpen(false);
  }

  useEffect(() => {
    let mounted = true;


    (async () => {
      try {
        
        const token = await getAuthToken();

        if (token) await ensureSessionExpiry();  

        const expired = await isSessionExpired();

        if (!token || expired) {
          
          await clearAuthSession();
          if (!mounted) return;
          setHasSession(false);
        } else {

          if (!mounted) return;

          const meResp = await api.me();
          const me = meResp?.data ?? meResp;
          setUser(me);
          setHasSession(true);

        }

      } catch (e) {

        if (e?.code === "AUTH_EXPIRED") {
          await clearAuthSession();
          if (!mounted) return;
          setHasSession(false);
          setUser(null);
          return;
        }

        if (!mounted) return;
        setHasSession(true); 

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

   // <Pressable disabled={user?.username === "admin"} onPress={() => router.push("/userprofiles")} style={{ marginRight: 14 }}>
   //           <Ionicons name="person-circle-outline" size={26} color="#0b1220" />
   //         </Pressable>

  if (!hasSession) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
      </Stack>
    );
  }

  return (
      <>
        <Drawer drawerContent={(props) => <CustomDrawerContent {...props} user={user} />} screenOptions={{
            headerShown: true,
            headerRight: () => (
              <View style={ScreenStyles.rowNoWidth}>
              <Text style={{ fontWeight: "800" }}>{user?.name ? `${user.name} ${user.lastname ?? ""}` : "FSMS"} </Text>
              <Pressable onPress={openProfileMenu} style={{ marginRight: 14 }}>
                  <Ionicons name="person-circle-outline" size={26} color="#0b1220" />
                </Pressable>
              </View>
            ),
          }}>

          <Drawer.Screen name="home" options={{ title: "Home" }} />
          <Drawer.Screen name="dashboard" options={{ title: "Dashboard" }} />
          <Drawer.Screen name="users" options={{ title: "Usuarios" }} />
          <Drawer.Screen name="userprofiles" options={{ title: "Mi Perfil" }} />
          <Drawer.Screen name="disciplines" options={{ title: "Disciplinas" }} />
          <Drawer.Screen name="ranks" options={{ title: "Grados" }} />
        </Drawer>

        <ProfileMenu
                visible={profileMenuOpen}
                onClose={closeProfileMenu}
                isAdmin={isAdmin}
                onGoProfile={() => {
                  closeProfileMenu();
                  router.push("/userprofiles");
                }}
                onChangePassword={() => {
                  closeProfileMenu();
                  setChangePwdVisible(true);
                }}
                onLogout={async () => {
                  closeProfileMenu();
                  await clearAuthSession();
                  router.replace("/");
                }}
              />

        <ChangePasswordModal
          visible={changePwdVisible}
          userId={user?.id ?? null}
          onClose={() => setChangePwdVisible(false)}
          onSuccess={() => {
            // opcional: toast / setSuccess global
          }}
          onAuthExpired={async () => {
            await clearAuthSession();
            router.replace("/");
          }}
        />
      </>    
  );

}
