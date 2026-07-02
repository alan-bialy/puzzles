import type { AppLanguage } from '../../../app/providers/SettingsContext'
import { getPreviousDateKey } from '../../../shared/utils/dateKey'

const STORAGE_VERSION = 1
const MAX_ATTEMPTS = 6

export type StoredWordleResult = {
  won: boolean
  attempts: number
}

export type WordleStats = {
  version: typeof STORAGE_VERSION
  gamesPlayed: number
  gamesWon: number
  currentStreak: number
  maxStreak: number
  guessDistribution: number[]
  results: Record<string, StoredWordleResult>
}

type RecordResultOptions = {
  dateKey: string
  won: boolean
  attempts: number
}

function getStorageKey(language: AppLanguage) {
  return `puzzles.wordle.stats.${language}`
}

export function createEmptyWordleStats(): WordleStats {
  return {
    version: STORAGE_VERSION,
    gamesPlayed: 0,
    gamesWon: 0,
    currentStreak: 0,
    maxStreak: 0,
    guessDistribution: Array.from(
      { length: MAX_ATTEMPTS },
      () => 0,
    ),
    results: {},
  }
}

function isWordleStats(value: unknown): value is WordleStats {
  if (!value || typeof value !== 'object') {
    return false
  }

  const stats = value as Partial<WordleStats>

  return (
    stats.version === STORAGE_VERSION &&
    typeof stats.gamesPlayed === 'number' &&
    typeof stats.gamesWon === 'number' &&
    typeof stats.currentStreak === 'number' &&
    typeof stats.maxStreak === 'number' &&
    Array.isArray(stats.guessDistribution) &&
    stats.guessDistribution.length === MAX_ATTEMPTS &&
    stats.guessDistribution.every(
      (value) => typeof value === 'number',
    ) &&
    Boolean(stats.results) &&
    typeof stats.results === 'object'
  )
}

export function loadWordleStats(
  language: AppLanguage,
): WordleStats {
  try {
    const serializedStats = localStorage.getItem(
      getStorageKey(language),
    )

    if (!serializedStats) {
      return createEmptyWordleStats()
    }

    const parsedStats: unknown = JSON.parse(serializedStats)

    if (!isWordleStats(parsedStats)) {
      return createEmptyWordleStats()
    }

    return parsedStats
  } catch {
    return createEmptyWordleStats()
  }
}

function saveWordleStats(
  language: AppLanguage,
  stats: WordleStats,
) {
  try {
    localStorage.setItem(
      getStorageKey(language),
      JSON.stringify(stats),
    )
  } catch {
    // Statystyki nie są niezbędne do działania gry.
  }
}

export function recordWordleResult(
  language: AppLanguage,
  options: RecordResultOptions,
): WordleStats {
  const stats = loadWordleStats(language)

  if (stats.results[options.dateKey]) {
    return stats
  }

  const previousDateKey = getPreviousDateKey(
    options.dateKey,
  )

  const previousResult = stats.results[previousDateKey]

  const nextCurrentStreak = options.won
    ? previousResult?.won
      ? stats.currentStreak + 1
      : 1
    : 0

  const nextGuessDistribution = [
    ...stats.guessDistribution,
  ]

  if (
    options.won &&
    options.attempts >= 1 &&
    options.attempts <= MAX_ATTEMPTS
  ) {
    nextGuessDistribution[options.attempts - 1] += 1
  }

  const nextStats: WordleStats = {
    ...stats,
    gamesPlayed: stats.gamesPlayed + 1,
    gamesWon: stats.gamesWon + (options.won ? 1 : 0),
    currentStreak: nextCurrentStreak,
    maxStreak: Math.max(
      stats.maxStreak,
      nextCurrentStreak,
    ),
    guessDistribution: nextGuessDistribution,
    results: {
      ...stats.results,
      [options.dateKey]: {
        won: options.won,
        attempts: options.attempts,
      },
    },
  }

  saveWordleStats(language, nextStats)

  return nextStats
}