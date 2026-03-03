import { Stack } from "expo-router";
import { LanguageProvider } from "@/src/i18n/LanguageProvider";
import "./global.css";
import { useEffect } from "react";
import { Platform } from "react-native";

import { useFonts } from "expo-font";
import { Ionicons } from "@expo/vector-icons";

export default function RootLayout() {
  const [fontsLoaded] = useFonts(Ionicons.font);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // Configurar viewport meta tag
      let viewport = document.querySelector('meta[name=viewport]');
      if (!viewport) {
        viewport = document.createElement('meta');
        viewport.setAttribute('name', 'viewport');
        document.head.appendChild(viewport);
      }
      viewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover'
      );

      // Prevenir zoom con gestos
      const preventZoom = (e: TouchEvent) => {
        if (e.touches.length > 1) {
          e.preventDefault();
        }
      };

      const preventDoubleTapZoom = (e: TouchEvent) => {
        const now = Date.now();
        const delta = now - (window as any).lastTouchEnd;
        if (delta < 300) {
          e.preventDefault();
        }
        (window as any).lastTouchEnd = now;
      };

      document.addEventListener('touchmove', preventZoom, { passive: false });
      document.addEventListener('touchend', preventDoubleTapZoom, { passive: false });
      document.addEventListener('gesturestart', (e) => e.preventDefault());

      // CSS para prevenir overflow y zoom
      const style = document.createElement('style');
      style.textContent = `
        * {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
        }
        
        html, body, #root {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          overflow-x: hidden;
          -webkit-text-size-adjust: 100%;
        }

        body {
          touch-action: pan-y;
          position: fixed;
          overscroll-behavior: none;
        }

        input, textarea, select {
          -webkit-user-select: text;
          user-select: text;
          font-size: 16px !important; /* Previene zoom en iOS al enfocar inputs */
        }

        /* Prevenir que los drawers causen scroll horizontal */
        .drawer-container {
          overflow-x: hidden;
        }
      `;
      document.head.appendChild(style);

      return () => {
        document.removeEventListener('touchmove', preventZoom);
        document.removeEventListener('touchend', preventDoubleTapZoom);
      };
    }
  }, []);

  if (!fontsLoaded) return null;

  return (
    <LanguageProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </LanguageProvider>
  );
}