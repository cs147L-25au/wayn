import React, { createContext, useState, useEffect } from "react";
import { useNavigationState } from "@react-navigation/native";

export const NavigationContext = createContext({
  previousRoute: null as string | null,
});

export function NavigationProvider({ children }: any) {
  const [previousRoute, setPreviousRoute] = useState<string | null>(null);
  const navState = useNavigationState((state) => state);

  useEffect(() => {
    if (!navState) return;

    const idx = navState.index;
    const prev = navState.routes[idx - 1]?.name ?? null;
    // console.log("NavigationProvider: previous route is", prev);

    setPreviousRoute(prev);
  }, [navState]);

  return (
    <NavigationContext.Provider value={{ previousRoute }}>
      {children}
    </NavigationContext.Provider>
  );
}
