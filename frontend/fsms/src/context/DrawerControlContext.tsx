import React, { createContext, useContext, useMemo, useState } from "react";

type DrawerControl = {
  // MAIN
  toggleMainDrawer?: () => void;
  setToggleMainDrawer: (fn?: () => void) => void;

  // SETTINGS
  toggleSettingsDrawer?: () => void;
  setToggleSettingsDrawer: (fn?: () => void) => void;
};

const Ctx = createContext<DrawerControl>({
  toggleMainDrawer: undefined,
  setToggleMainDrawer: () => {},

  toggleSettingsDrawer: undefined,
  setToggleSettingsDrawer: () => {},
});

export function DrawerControlProvider({ children }: { children: React.ReactNode }) {
  const [toggleMainDrawer, setToggleMainDrawer] = useState<(() => void) | undefined>(undefined);
  const [toggleSettingsDrawer, setToggleSettingsDrawer] = useState<(() => void) | undefined>(
    undefined
  );

  const value = useMemo(
    () => ({
      toggleMainDrawer,
      setToggleMainDrawer,
      toggleSettingsDrawer,
      setToggleSettingsDrawer,
    }),
    [toggleMainDrawer, toggleSettingsDrawer]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDrawerControl() {
  return useContext(Ctx);
}