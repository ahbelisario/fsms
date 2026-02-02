import React, { createContext, useContext, useMemo, useState } from "react";

type DrawerControl = {
  toggleMainDrawer?: () => void;
  setToggleMainDrawer: (fn?: () => void) => void;
};

const Ctx = createContext<DrawerControl>({
  toggleMainDrawer: undefined,
  setToggleMainDrawer: () => {},
});

export function DrawerControlProvider({ children }: { children: React.ReactNode }) {
  const [toggleMainDrawer, setToggleMainDrawer] = useState<(() => void) | undefined>(undefined);

  const value = useMemo(
    () => ({
      toggleMainDrawer,
      setToggleMainDrawer,
    }),
    [toggleMainDrawer]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useDrawerControl() {
  return useContext(Ctx);
}