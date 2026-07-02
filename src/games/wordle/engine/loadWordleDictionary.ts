import { normalizeWord } from '../../../shared/utils/normalizeWord'
import type { AppLanguage } from '../../../app/providers/SettingsContext'
import type { WordleDictionary } from '../types'

async function fetchWordList(path: string) {
  const response = await fetch(path)

  if (!response.ok) {
    throw new Error(`Cannot load dictionary: ${path}`)
  }

  const words = (await response.json()) as string[]

  return words.map(normalizeWord)
}

export async function loadWordleDictionary(
  language: AppLanguage,
  wordLength: number,
): Promise<WordleDictionary> {
  const baseUrl = import.meta.env.BASE_URL

  const [answers, allowedWords] = await Promise.all([
    fetchWordList(`${baseUrl}dictionaries/${language}/wordle-${wordLength}-answers.json`),
    fetchWordList(`${baseUrl}dictionaries/${language}/wordle-${wordLength}-allowed.json`),
  ])

  const allowed = new Set([...answers, ...allowedWords])

  return {
    answers,
    allowed,
  }
}