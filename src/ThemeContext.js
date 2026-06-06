// ThemeContext — exposes the active palette + dark flag to the tree.
import React, { createContext, useContext } from "react";
import { getTheme } from "./theme";

const ThemeContext = createContext({ t: getTheme(false), dark: false });

export function ThemeProvider({ dark, children }) {
  return (
    <ThemeContext.Provider value={{ t: getTheme(dark), dark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
