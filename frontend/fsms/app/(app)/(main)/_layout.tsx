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
  const LOGIN: Href = "/(auth)";
  const user = props.user;

  //<DrawerItem label="Logout" onPress={handleLogout} />

  async function handleLogout() {
    await clearAuthSession();
    router.replace(LOGIN);
  }

  return (
    <DrawerContentScrollView {...props}>
      {user?.role === "admin" ? ( <DrawerItem label={t("dashboard.title")} onPress={() => router.push(DASHBOARD)} /> ) : (<DrawerItem label="Home" onPress={() => router.push(HOME)} />)}
      <View style={ScreenStyles.divider} />
      {user?.role === "admin" && ( <DrawerItem label={t("users.members")} onPress={() => router.push(USERS)} />)}
      {user?.role === "admin" && ( <DrawerItem label={t("memberships.title")} onPress={() => router.push(MEMBERSHIPS)} />)}
      {user?.role === "admin" && ( <DrawerItem label={t("payments.title")} onPress={() => router.push(PAYMENTS)} />)}
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

  const { lang, setLanguage, t, ready } = useLanguage();
  
  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [user, setUser] = useState(null);

  const router = useRouter();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [changePwdVisible, setChangePwdVisible] = useState(false);
  const [userSettingsVisible, setUserSettingsVisible] = useState(false);

  const [i18nReady, setI18nReady] = useState(false);

  const isAdmin = user?.username === "admin";

  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === "web";
  const isDesktop = width >= 1024;
  const drawerWidth = 250;
  const isPermanent = isWeb && isDesktop;


  function openProfileMenu() {
    setProfileMenuOpen(true);
  }

  function closeProfileMenu() {
    setProfileMenuOpen(false);
  }
  
  useEffect(() => {
    let mounted = true;

    if (!loading && !hasSession) {
      router.replace("/(auth)");
    }

    (async () => {
      try {

        const token = await getAuthToken();
        if (token) await ensureSessionExpiry();  

        const expired = await isSessionExpired();

        if (!token || expired) {
          await clearAuthSession();
          if (!mounted) return;
          setHasSession(false);
          setUser(null);
          return;
        }

        const meResp = await api.me();
        const me = meResp?.data ?? meResp;

        const settingsResp = await api.listUserSettings(me.id);
        const settings = settingsResp?.data ?? settingsResp;
        const language = String(settings?.language ?? "").toLowerCase() || "es";
        
        if (!mounted) return;
        setUser(me);
        setHasSession(true);
        setLanguage(language);

          const role = String(me?.role ?? "").trim().toLowerCase();

      } catch (e) {

        if (e?.code === "AUTH_EXPIRED") {
          await clearAuthSession();
          if (!mounted) return;
          setHasSession(false);
          setUser(null);
          return;
        }

        await clearAuthSession();
        if (!mounted) return;
        setHasSession(false);
        setUser(null);

      } finally {

        if (!mounted) return;
        setI18nReady(true);
        setLoading(false);
      }

    })();

    return () => {
      mounted = false;
    };
  }, [loading, hasSession, router]);

  if (loading || !ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{t("common.loading")}</Text>
      </View>
    );
  }

  if (!hasSession) {
    return null;
  }
  
  return (
      <>
        <Drawer
            id="mainDrawer"
            drawerContent={(props) => <CustomDrawerContent {...props} user={user} />}
            screenOptions={{
              drawerType: isPermanent ? "permanent" : "front",
              drawerStyle: { width: drawerWidth } ,
              overlayColor: isPermanent ? "transparent" : undefined,
              swipeEnabled: !isPermanent,

              // ✅ En desktop normalmente ocultas header/hamburguesa
              //headerShown: !isPermanent,

              headerShown: false,
              headerLeft: isPermanent ? () => null : undefined,
              headerRight: () => ( 
                  <View style={ScreenStyles.rowNoWidth}>
                    <Text style={{ fontWeight: "800" }} onPress={openProfileMenu}>
                      {user?.name ? `${user.name} ${user.lastname ?? ""}` : "FSMS"}{" "}
                    </Text>
                    <Pressable onPress={openProfileMenu} style={{ marginRight: 14 }}>
                      <Ionicons name="person-circle-outline" size={26} color="#0b1220" />
                    </Pressable>
                  </View>
                ),

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
          <Drawer.Screen
            name="settings"
            options={{
              title: "Configuración",
              // Oculta del drawer principal (para que solo se vea el DrawerItem custom)
              drawerItemStyle: { display: "none" },
            }}
          />
        </Drawer>

        <ProfileMenu
                key={lang}
                visible={profileMenuOpen}
                onClose={closeProfileMenu}
                isAdmin={isAdmin}
                onGoProfile={() => {
                  closeProfileMenu();
                  router.push("/(app)/userprofiles");
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
                  router.replace("/(auth)");
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
            router.replace("/(auth)");
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
          onLanguageChanged={async (newLang) => {
            setLanguage(newLang);
          }}
          onAuthExpired={async () => {
            await clearAuthSession();
            router.replace("/(auth)");
          }}
          
        />
      </>    
  );

}
