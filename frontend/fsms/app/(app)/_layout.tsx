import React, { useEffect, useMemo, useState } from "react";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { View, Text, Pressable } from "react-native";
import { Stack, useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api } from "@/src/api/client";
import { ScreenStyles } from "@/src/styles/appStyles";
import ProfileMenu from "@/src/ui/ProfileMenu";
import ChangePasswordModal from "@/src/ui/ChangePasswordModal";
import UserSettingsModal from "@/src/ui/UserSettings";
import { getAuthToken, isSessionExpired, ensureSessionExpiry, clearAuthSession } from "@/src/storage/authStorage";
import { useLanguage } from "@/src/i18n/LanguageProvider";

export default function AppLayout() {

  const navigation = useNavigation();
  const { lang, setLanguage, t, ready } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [changePwdVisible, setChangePwdVisible] = useState(false);
  const [userSettingsVisible, setUserSettingsVisible] = useState(false);

  const isAdmin = user?.username === "admin";

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
      } catch (e: any) {
        await clearAuthSession();
        if (!mounted) return;
        setHasSession(false);
        setUser(null);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // Redirección al login si no hay sesión
  useEffect(() => {
    if (!loading && !hasSession) {
      router.replace("/(auth)");
    }
  }, [loading, hasSession]);

  if (loading || !ready) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{t("common.loading")}</Text>
      </View>
    );
  }

  if (!hasSession) return null;

  const isInSettings = pathname.startsWith("/(app)/(settings)");

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: true,

          // ✅ Header global (se ve en main y settings)
          headerRight: () => (
            <View style={ScreenStyles.rowNoWidth}>
              <Text style={{ fontWeight: "800" }} onPress={() => setProfileMenuOpen(true)}>
                {user?.name ? `${user.name} ${user.lastname ?? ""}` : "FSMS"}{" "}
              </Text>
              <Pressable onPress={() => setProfileMenuOpen(true)} style={{ marginRight: 14 }}>
                <Ionicons name="person-circle-outline" size={26} color="#0b1220" />
              </Pressable>
            </View>
          ),

          headerLeft: () => {
            if (isInSettings) {
              return (
                <Pressable
                  onPress={() => router.replace("/(app)/(main)/dashboard")}
                  style={{ paddingHorizontal: 12 }}
                >
                  <Ionicons name="arrow-back" size={22} color="#0b1220" />
                </Pressable>
              );
            }

            return (
              <Pressable
                onPress={() => {
                  // ✅ togglear el drawer correcto (main)
                  const parent = navigation.getParent?.("mainDrawer");
                  parent?.dispatch(DrawerActions.toggleDrawer());
                }}
                style={{ paddingHorizontal: 12 }}
              >
                <Ionicons name="menu" size={24} color="#0b1220" />
              </Pressable>
            );
          },

        }}
      >
        {/* “Shells” */}
        <Stack.Screen name="(main)" options={{ title: "FSMS" }} />
        <Stack.Screen name="(settings)" options={{ title: "Configuración" }} />
      </Stack>

      {/* Modales siguen globales */}
      <ProfileMenu
        key={lang}
        visible={profileMenuOpen}
        onClose={() => setProfileMenuOpen(false)}
        isAdmin={isAdmin}
        onGoProfile={() => {
          setProfileMenuOpen(false);
          router.push("/(app)/(main)/userprofiles");
        }}
        onChangePassword={() => {
          setProfileMenuOpen(false);
          setChangePwdVisible(true);
        }}
        onUserSettings={() => {
          setProfileMenuOpen(false);
          setUserSettingsVisible(true);
        }}
        onLogout={async () => {
          setProfileMenuOpen(false);
          await clearAuthSession();
          router.replace("/(auth)");
        }}
      />

      <ChangePasswordModal
        key={lang}
        visible={changePwdVisible}
        userId={user?.id ?? null}
        onClose={() => setChangePwdVisible(false)}
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
        onLanguageChanged={async (newLang) => setLanguage(newLang)}
        onAuthExpired={async () => {
          await clearAuthSession();
          router.replace("/(auth)");
        }}
      />
    </>
  );
}
