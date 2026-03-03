import React, { useEffect, useState } from "react";
import { Platform, useWindowDimensions, View, Text, Pressable } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { api, setAuthExpiredHandler } from "@/src/api/client";
import { ScreenStyles } from "@/src/styles/appStyles";
import { getAuthToken, isSessionExpired, ensureSessionExpiry, clearAuthSession } from "@/src/storage/authStorage";
import { useLanguage } from "@/src/i18n/LanguageProvider";
import { DrawerControlProvider, useDrawerControl } from "@/src/context/DrawerControlContext";
import { UserProvider, useUser } from "@/src/context/UserContext";
import ProfileMenu from "@/src/ui/ProfileMenu";


function AppShell() {
  const { lang, setLanguage, t, ready } = useLanguage();
  const router = useRouter();
  const segments = useSegments();
  const isInSettings = segments.includes("(settings)");
  const { toggleMainDrawer, toggleSettingsDrawer } = useDrawerControl();
  const { user, setUser, isAdmin } = useUser();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const { width } = useWindowDimensions();
  const isWebDesktop = Platform.OS === "web" && width >= 1024;

  const [loading, setLoading] = useState(true);
  const [hasSession, setHasSession] = useState(false);

  // Handler global de sesión expirada
  useEffect(() => {
    setAuthExpiredHandler(async () => {
      await clearAuthSession();
      setHasSession(false);
      setUser(null);
      router.replace("/(auth)");
    });

    return () => setAuthExpiredHandler(null);
  }, [router]);

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
        // ✅ No retornamos para que el finally siempre ejecute setLoading(false)
        if (e?.code !== "AUTH_EXPIRED") {
          // Solo limpiar sesión si no es AUTH_EXPIRED (el handler global ya lo maneja)
          await clearAuthSession();
          if (!mounted) return;
          setHasSession(false);
          setUser(null);
        }
      } finally {
        // ✅ Siempre se ejecuta, sin importar el tipo de error
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

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

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: true,

          headerRight: () => (
            <View style={ScreenStyles.rowNoWidth}>
              <Ionicons name="person-circle-outline" size={26} color="#0b1220" />
              <Text style={{ fontWeight: "500" }}>
                {user?.name ? `${user.name} ${user.lastname ?? ""}` : "FSMS"}{" "}
              </Text>
              <Pressable onPress={() => setProfileMenuOpen(true)} style={{ marginRight: 14 }}>
                <Ionicons name="settings-outline" size={20} color="#0b1220" />
              </Pressable>
            </View>
          ),

          headerLeft: () => {
            if (isWebDesktop) return null;

            return (
              <Pressable
                onPress={() => {
                  if (isInSettings) {
                    toggleSettingsDrawer?.();
                  } else {
                    toggleMainDrawer?.();
                  }
                }}
                style={{ paddingHorizontal: 12 }}
              >
                <Ionicons name="menu" size={24} color="#0b1220" />
              </Pressable>
            );
          },
        }}
      >
        <Stack.Screen name="(main)" options={{ title: "FSMS" }} />
        <Stack.Screen name="(settings)" options={{ title: t("common.settings") }} />
      </Stack>

      <ProfileMenu
        key={lang}
        visible={profileMenuOpen}
        onClose={() => setProfileMenuOpen(false)}
        onGoProfile={() => {
          setProfileMenuOpen(false);
          router.push("/(app)/(main)/userprofiles");
        }}
        onLogout={async () => {
          setProfileMenuOpen(false);
          await clearAuthSession();
          router.replace("/(auth)");
        }}
      />
      
    </>
  );
}

export default function AppLayout() {
  return (
    <DrawerControlProvider>
      <UserProvider>
        <AppShell />
      </UserProvider>
    </DrawerControlProvider>
  );
}