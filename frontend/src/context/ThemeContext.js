import React, { createContext, useState, useMemo, useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";

export const ThemeContext = createContext();

export const ThemeContextProvider = ({ children }) => {
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const [themeType, setThemeType] = useState("light");

  useEffect(() => {
    setThemeType(prefersDarkMode ? "dark" : "light");
  }, [prefersDarkMode]);

  const toggleTheme = () => {
    console.log("Toggling theme");
    setThemeType((prevThemeType) => {
      const newThemeType = prevThemeType === "light" ? "dark" : "light";
      console.log("New theme type:", newThemeType);
      return newThemeType;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeType,
          // primary: {
          //   main: '#90caf9',
          // },
        },
      }),
    [themeType]
  );

  return (
    <ThemeContext.Provider value={{ themeType, toggleTheme }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  );
};
