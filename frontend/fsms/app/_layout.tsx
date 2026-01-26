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
import UserSettingsModal from "@/src/ui/UserSettings";
import { getAuthToken, isSessionExpired, ensureSessionExpiry, clearAuthSession } from "@/src/storage/authStorage";
import { t } from "@/src/i18n";
import { loadLang, setLang } from "@/src/i18n/lang";


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
      {user?.role === "admin" ? ( <DrawerItem label={t("dashboard.title")} onPress={() => router.push(DASHBOARD)} /> ) : (<DrawerItem label="Home" onPress={() => router.push(HOME)} />)}
      {user?.role === "admin" && ( <DrawerItem label={t("disciplines.title")} onPress={() => router.push(DISCIPLINES)} />)}
      {user?.role === "admin" && ( <DrawerItem label={t("ranks.title")} onPress={() => router.push(RANKS)} />)}
      {user?.role === "admin" && ( <DrawerItem label={t("users.title")} onPress={() => router.push(USERS)} />)}
    </DrawerContentScrollView>
  );
}

export default function RootLayout() {
  
  const [lang, setLangState] = useState("es");
  const [i18nReady, setI18nReady] = useState(false);

  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [changePwdVisible, setChangePwdVisible] = useState(false);
  const [userSettingsVisible, setUserSettingsVisible] = useState(false);
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

      const l = await loadLang();

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
          if (!mounted) return;
          const me = meResp?.data ?? meResp;
          setUser(me);
          setHasSession(true);

          const settingsResp = await api.listUserSettings(me.id);
          const settings = settingsResp?.data ?? settingsResp;
          const language = String(settings?.language ?? "").toLowerCase();

          setLangState(language);

          const role = String(me?.role ?? "").trim().toLowerCase();

          // Si vienes de login o refresh y quedaste en pantalla equivocada, corrige
          if (role === "admin") {
            if (pathname === "/home" || pathname === "/") {
              router.replace("/dashboard");
            }
          } else {
            if (pathname === "/dashboard" || pathname === "/") {
              router.replace("/home");
            }
          }
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
        setI18nReady(true);
        setLoading(false);
      }

    })();

    return () => {
      mounted = false;
    };
  }, [pathname]);

  if (loading || !i18nReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{t("common.loading")}</Text>
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
        <Drawer key={lang} drawerContent={(props) => <CustomDrawerContent {...props} user={user} />} screenOptions={{
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
          <Drawer.Screen name="dashboard" options={{ title: t("dashboard.title") }} />
          <Drawer.Screen name="users" options={{ title: t("users.title") }} />
          <Drawer.Screen name="userprofiles/index" options={{ title: t("userprofiles.title") }} />
          <Drawer.Screen name="userprofiles/[userId]" options={{ title: t("userprofiles.title") }} />
          <Drawer.Screen name="disciplines" options={{ title: t("disciplines.title") }} />
          <Drawer.Screen name="ranks" options={{ title: t("ranks.title") }} />
        </Drawer>

        <ProfileMenu
                key={lang}
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
                onUserSettings={() => {
                  closeProfileMenu();
                  setUserSettingsVisible(true);
                }}
                onLogout={async () => {
                  closeProfileMenu();
                  await clearAuthSession();
                  router.replace("/");
                }}
              />

        <ChangePasswordModal
          key={lang}
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

        <UserSettingsModal
          key={lang}
          visible={userSettingsVisible}
          userId={user?.id ?? null}
          onClose={() => setUserSettingsVisible(false)}
          onSuccess={() => {
            // opcional: toast / setSuccess global
          }}
          onLanguageChanged={(newLang) => setLangState(newLang)}
          onAuthExpired={async () => {
            await clearAuthSession();
            router.replace("/");
          }}
          
        />
      </>    
  );

}
