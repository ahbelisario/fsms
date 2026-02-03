import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { getAuthToken, isSessionExpired } from "@/src/storage/authStorage";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const token = await getAuthToken();
      if (token && !isSessionExpired(token)) {
        router.replace("/(app)/(main)/home");
      } else {
        router.replace("/(auth)");
      }
    })();
  }, [router]);

  return null;
}