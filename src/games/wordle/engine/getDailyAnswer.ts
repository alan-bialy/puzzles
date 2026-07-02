import type { AppLanguage } from '../../../app/providers/SettingsContext'
import { getLocalDateKey } from '../../../shared/utils/dateKey'
import { hashString } from '../../../shared/utils/hashString'

export function getDailyAnswer(
  answers: string[],
  language: AppLanguage,
  date = new Date(),
) {
  if (answers.length === 0) {
    throw new Error('Answers list cannot be empty')
  }

  const dateKey = getLocalDateKey(date)
  const hash = hashString(`wordle:${language}:${dateKey}`)

  return answers[hash % answers.length]
}