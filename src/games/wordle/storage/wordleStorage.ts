import type { AppLanguage } from '../../../app/providers/SettingsContext'

const STORAGE_VERSION = 1

type StoredWordleState = {
  version: typeof STORAGE_VERSION
  dateKey: string
  guesses: string[]
  currentGuess: string
}

function getStorageKey(language: AppLanguage) {
  return `puzzles.wordle.${language}`
}

function isStoredWordleState(value: unknown): value is StoredWordleState {
  if (!value || typeof value !== 'object') {
    return false
  }

  const state = value as Partial<StoredWordleState>

  return (
    state.version === STORAGE_VERSION &&
    typeof state.dateKey === 'string' &&
    Array.isArray(state.guesses) &&
    state.guesses.every((guess) => typeof guess === 'string') &&
    typeof state.currentGuess === 'string'
  )
}

export function loadWordleState(
  language: AppLanguage,
  dateKey: string,
): StoredWordleState | null {
  try {
    const serializedState = localStorage.getItem(getStorageKey(language))

    if (!serializedState) {
      return null
    }

    const parsedState: unknown = JSON.parse(serializedState)

    if (!isStoredWordleState(parsedState)) {
      return null
    }

    if (parsedState.dateKey !== dateKey) {
      return null
    }

    return parsedState
  } catch {
    return null
  }
}

export function saveWordleState(
  language: AppLanguage,
  state: Omit<StoredWordleState, 'version'>,
) {
  try {
    const storedState: StoredWordleState = {
      version: STORAGE_VERSION,
      ...state,
    }

    localStorage.setItem(
      getStorageKey(language),
      JSON.stringify(storedState),
    )
  } catch {
    // 
  }
}

export function clearWordleState(language: AppLanguage) {
  try {
    localStorage.removeItem(getStorageKey(language))
  } catch {
    // 
  }
}