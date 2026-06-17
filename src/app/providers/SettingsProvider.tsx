import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
export type AppLanguage = "pl" | "en";
export type AppTheme = "light" | "dark";

type SettingsContextValue = {
  language: AppLanguage;
  theme: AppTheme;
  setLanguage: (language: AppLanguage) => void;
  setTheme: (theme: AppTheme) => void;
  toggleTheme: () => void;
};

const SETTINGS_STORAGE_KEY = "puzzles.settings";

type StoredSettings = {
  language?: AppLanguage;
  theme?: AppTheme;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

function readStoredSettings(): Required<StoredSettings> {
  try {
    const rawSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);

    if (!rawSettings) {
      return {
        language: "pl",
        theme: "light",
      };
    }

    const parsedSettings = JSON.parse(rawSettings) as StoredSettings;

    return {
      language: parsedSettings.language === "en" ? "en" : "pl",
      theme: parsedSettings.theme === "dark" ? "dark" : "light",
    };
  } catch {
    return {
      language: "pl",
      theme: "light",
    };
  }
}

export function SettingsProvider({ children }: PropsWithChildren) {
  const [settings, setSettings] = useState(readStoredSettings);

  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      settings.theme === "dark",
    );
    document.documentElement.lang = settings.language;
  }, [settings.language, settings.theme]);

  const value = useMemo<SettingsContextValue>(
    () => ({
      language: settings.language,
      theme: settings.theme,
      setLanguage: (language) => {
        setSettings((currentSettings) => ({
          ...currentSettings,
          language,
        }));
      },
      setTheme: (theme) => {
        setSettings((currentSettings) => ({
          ...currentSettings,
          theme,
        }));
      },
      toggleTheme: () => {
        setSettings((currentSettings) => ({
          ...currentSettings,
          theme: currentSettings.theme === "dark" ? "light" : "dark",
        }));
      },
    }),
    [settings.language, settings.theme],
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error("useSettings must be used inside SettingsProvider");
  }

  return context;
}
