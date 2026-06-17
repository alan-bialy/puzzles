import type { ChangeEvent } from "react";
import { useSettings } from "../../app/providers/SettingsProvider";
import type {
  AppLanguage,
  AppTheme,
} from "../../app/providers/SettingsProvider";
import { useTranslation } from "../../config/i18n";

export function AppFooter() {
  const { language, theme, setLanguage, setTheme } = useSettings();
  const t = useTranslation(language);

  function handleLanguageChange(event: ChangeEvent<HTMLSelectElement>) {
    setLanguage(event.target.value as AppLanguage);
  }

  function handleThemeChange(event: ChangeEvent<HTMLSelectElement>) {
    setTheme(event.target.value as AppTheme);
  }

  return (
    <footer className="border-t border-(--color-border) py-4">
      <div className="flex flex-col gap-3 text-sm text-(--color-muted) sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Puzzles</p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex items-center justify-between gap-3 sm:justify-start">
            <span>{t.language}</span>
            <select
              value={language}
              onChange={handleLanguageChange}
              className="rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-text) outline-none focus:ring-2 focus:ring-(--color-focus)"
            >
              <option value="pl">Polski</option>
              <option value="en">English</option>
            </select>
          </label>

          <label className="flex items-center justify-between gap-3 sm:justify-start">
            <span>{t.theme}</span>
            <select
              value={theme}
              onChange={handleThemeChange}
              className="rounded-xl border border-(--color-border) bg-(--color-surface) px-3 py-2 text-(--color-text) outline-none focus:ring-2 focus:ring-(--color-focus)"
            >
              <option value="light">{t.light}</option>
              <option value="dark">{t.dark}</option>
            </select>
          </label>
        </div>
      </div>
    </footer>
  );
}
