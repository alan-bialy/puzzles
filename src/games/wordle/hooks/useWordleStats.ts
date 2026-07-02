import { useCallback, useState } from 'react'
import type { AppLanguage } from '../../../app/providers/SettingsProvider'
import {
  loadWordleStats,
  recordWordleResult,
} from '../storage/wordleStatsStorage'

type RecordResultOptions = {
  dateKey: string
  won: boolean
  attempts: number
}

export function useWordleStats(
  language: AppLanguage,
) {
  const [stats, setStats] = useState(() =>
    loadWordleStats(language),
  )

  const recordResult = useCallback(
    (options: RecordResultOptions) => {
      const nextStats = recordWordleResult(
        language,
        options,
      )

      setStats(nextStats)

      return nextStats
    },
    [language],
  )

  return {
    stats,
    recordResult,
  }
}