import type { AppLanguage } from '../app/providers/SettingsProvider'

type TranslationKey =
  | 'appName'
  | 'homeTitle'
  | 'homeSubtitle'
  | 'play'
  | 'soon'
  | 'wordleTitle'
  | 'wordleDescription'
  | 'comingSoonTitle'
  | 'comingSoonDescription'
  | 'language'
  | 'theme'
  | 'light'
  | 'dark'
  | 'backHome'
  | 'notFoundTitle'
  | 'notFoundDescription'

export const translations: Record<AppLanguage, Record<TranslationKey, string>> = {
  pl: {
    appName: 'Puzzles',
    homeTitle: 'Codzienne łamigłówki',
    homeSubtitle: 'Wybierz grę i rozwiązuj puzzle w swoim języku.',
    play: 'Graj',
    soon: 'Soon™',
    wordleTitle: 'Wordle',
    wordleDescription: 'Odgadnij słowo dnia w sześciu próbach.',
    comingSoonTitle: 'Kolejna gra',
    comingSoonDescription: 'Tu później wpadnie kolejna łamigłówka.',
    language: 'Język',
    theme: 'Motyw',
    light: 'Jasny',
    dark: 'Ciemny',
    backHome: 'Wróć na główną',
    notFoundTitle: 'Nie znaleziono strony',
    notFoundDescription: 'Ta łamigłówka jeszcze nie istnieje albo adres jest błędny.',
  },
  en: {
    appName: 'Puzzles',
    homeTitle: 'Daily puzzles',
    homeSubtitle: 'Choose a game and solve puzzles in your language.',
    play: 'Play',
    soon: 'Soon™',
    wordleTitle: 'Wordle',
    wordleDescription: 'Guess the daily word in six tries.',
    comingSoonTitle: 'Another game',
    comingSoonDescription: 'A new puzzle will appear here later.',
    language: 'Language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    backHome: 'Back home',
    notFoundTitle: 'Page not found',
    notFoundDescription: 'This puzzle does not exist yet, or the address is wrong.',
  },
}

export function useTranslation(language: AppLanguage) {
  return translations[language]
}