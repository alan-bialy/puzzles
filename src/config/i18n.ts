import type { AppLanguage } from "../app/providers/SettingsContext";

type TranslationKey =
  | "appName"
  | "home"
  | "statistics"
  | "enableDarkTheme"
  | "enableLightTheme"
  | "homeTitle"
  | "homeSubtitle"
  | "play"
  | "soon"
  | "wordleTitle"
  | "wordleDescription"
  | "comingSoonTitle"
  | "comingSoonDescription"
  | "language"
  | "theme"
  | "light"
  | "dark"
  | "backHome"
  | "notFoundTitle"
  | "notFoundDescription"
  | "dinoFlightTitle"
  | "dinoFlightDescription"
  | "pageTitleHome"
  | "pageTitleWordle"
  | "pageTitleDinoFlight"
  | "pageTitleNotFound";
export const translations: Record<
  AppLanguage,
  Record<TranslationKey, string>
> = {
  pl: {
    appName: "Minigierki",
    homeTitle: "Codzienne łamigłówki",
    homeSubtitle: "Wybierz grę i baw się dobrze",
    play: "Graj",
    soon: "Soon™",
    wordleTitle: "Wordle",
    wordleDescription: "Odgadnij słowo dnia w sześciu próbach.",
    comingSoonTitle: "Kolejna gra",
    comingSoonDescription: "Tu później wpadnie kolejna łamigłówka.",
    language: "Język",
    theme: "Motyw",
    light: "Jasny",
    dark: "Ciemny",
    backHome: "Wróć na główną",
    notFoundTitle: "Nie znaleziono strony",
    notFoundDescription:
      "Ta łamigłówka jeszcze nie istnieje albo adres jest błędny.",
    home: "Główna",
    statistics: "Statystyki",
    enableDarkTheme: "Włącz ciemny motyw",
    enableLightTheme: "Włącz jasny motyw",
    dinoFlightTitle: "Flappy Dino",
    dinoFlightDescription: "Przeżyj jak najdłużej.",
    pageTitleHome: "Minigierki",
    pageTitleWordle: "Wordle",
    pageTitleDinoFlight: "Flappy Dino",
    pageTitleNotFound: "Nie znaleziono strony",
  },
  en: {
    appName: "Minigames",
    homeTitle: "Daily puzzles",
    homeSubtitle: "Choose a game and have fun",
    play: "Play",
    soon: "Soon™",
    wordleTitle: "Wordle",
    wordleDescription: "Guess the daily word in six tries.",
    comingSoonTitle: "Another game",
    comingSoonDescription: "A new puzzle will appear here later.",
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    backHome: "Back home",
    notFoundTitle: "Page not found",
    notFoundDescription:
      "This puzzle does not exist yet, or the address is wrong.",
    home: "Home",
    statistics: "Statistics",
    enableDarkTheme: "Enable dark theme",
    enableLightTheme: "Enable light theme",
    dinoFlightTitle: "Flappy Dino",
    dinoFlightDescription: "Stay alive as long as you can.",
    pageTitleHome: "Minigames",
    pageTitleWordle: "Wordle",
    pageTitleDinoFlight: "Flappy Dino",
    pageTitleNotFound: "Page not found",
  },
};

export function useTranslation(language: AppLanguage) {
  return translations[language];
}
