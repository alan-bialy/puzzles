import { normalizeWord } from '../../../shared/utils/normalizeWord'
import type { GuessEvaluation } from '../types'

export function evaluateGuess(answer: string, guess: string): GuessEvaluation {
  const answerLetters = Array.from(normalizeWord(answer))
  const guessLetters = Array.from(normalizeWord(guess))

  if (answerLetters.length !== guessLetters.length) {
    throw new Error('Answer and guess must have the same length')
  }

  const result: GuessEvaluation = guessLetters.map((letter) => ({
    letter,
    state: 'absent',
  }))

  const remainingLetters = new Map<string, number>()

  for (let index = 0; index < answerLetters.length; index += 1) {
    const answerLetter = answerLetters[index]
    const guessLetter = guessLetters[index]

    if (guessLetter === answerLetter) {
      result[index].state = 'correct'
      continue
    }

    remainingLetters.set(answerLetter, (remainingLetters.get(answerLetter) ?? 0) + 1)
  }

  for (let index = 0; index < guessLetters.length; index += 1) {
    if (result[index].state === 'correct') {
      continue
    }

    const guessLetter = guessLetters[index]
    const remainingCount = remainingLetters.get(guessLetter) ?? 0

    if (remainingCount > 0) {
      result[index].state = 'present'
      remainingLetters.set(guessLetter, remainingCount - 1)
    }
  }

  return result
}