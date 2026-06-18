import { useCallback, useEffect, useMemo, useState } from 'react'
import type { AppLanguage } from '../../../app/providers/SettingsProvider'
import { normalizeWord } from '../../../shared/utils/normalizeWord'
import { evaluateGuess } from '../engine/evaluateGuess'
import { getDailyAnswer } from '../engine/getDailyAnswer'
import { loadWordleDictionary } from '../engine/loadWordleDictionary'
import type { GameStatus, GuessEvaluation, LetterState, WordleDictionary } from '../types'

const WORD_LENGTH = 5
const MAX_ATTEMPTS = 6

type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error'

function getLetterPriority(state: LetterState) {
  if (state === 'correct') return 3
  if (state === 'present') return 2
  return 1
}

function mergeLetterStates(
  currentStates: Record<string, LetterState>,
  evaluation: GuessEvaluation,
) {
  return evaluation.reduce<Record<string, LetterState>>((result, tile) => {
    const currentState = result[tile.letter]

    if (!currentState || getLetterPriority(tile.state) > getLetterPriority(currentState)) {
      result[tile.letter] = tile.state
    }

    return result
  }, { ...currentStates })
}

export function useWordleGame(language: AppLanguage) {
  const [loadStatus, setLoadStatus] = useState<LoadStatus>('idle')
  const [dictionary, setDictionary] = useState<WordleDictionary | null>(null)
  const [answer, setAnswer] = useState('')
  const [guesses, setGuesses] = useState<GuessEvaluation[]>([])
  const [currentGuess, setCurrentGuess] = useState('')
  const [status, setStatus] = useState<GameStatus>('playing')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let isActive = true

    async function loadDictionary() {
      try {
        setLoadStatus('loading')
        setMessage('')
        setDictionary(null)
        setAnswer('')
        setGuesses([])
        setCurrentGuess('')
        setStatus('playing')

        const nextDictionary = await loadWordleDictionary(language, WORD_LENGTH)
        const nextAnswer = getDailyAnswer(nextDictionary.answers, language)

        if (!isActive) return

        setDictionary(nextDictionary)
        setAnswer(nextAnswer)
        setLoadStatus('loaded')
      } catch {
        if (!isActive) return

        setLoadStatus('error')
        setMessage('Nie udało się załadować słownika.')
      }
    }

    void loadDictionary()

    return () => {
      isActive = false
    }
  }, [language])

  const usedLetters = useMemo(
    () =>
      guesses.reduce<Record<string, LetterState>>(
        (result, guess) => mergeLetterStates(result, guess),
        {},
      ),
    [guesses],
  )

  const addLetter = useCallback(
    (letter: string) => {
      if (status !== 'playing') return

      setCurrentGuess((guess) => {
        if (Array.from(guess).length >= WORD_LENGTH) {
          return guess
        }

        return normalizeWord(`${guess}${letter}`)
      })
    },
    [status],
  )

  const removeLetter = useCallback(() => {
    if (status !== 'playing') return

    setCurrentGuess((guess) => Array.from(guess).slice(0, -1).join(''))
  }, [status])

  const submitGuess = useCallback(() => {
    if (!dictionary || !answer || status !== 'playing') return

    const normalizedGuess = normalizeWord(currentGuess)

    if (Array.from(normalizedGuess).length !== WORD_LENGTH) {
      setMessage('Za mało liter.')
      return
    }

    if (!dictionary.allowed.has(normalizedGuess)) {
      setMessage('Tego słowa nie ma w słowniku.')
      return
    }

    const evaluation = evaluateGuess(answer, normalizedGuess)
    const nextGuesses = [...guesses, evaluation]

    setGuesses(nextGuesses)
    setCurrentGuess('')
    setMessage('')

    if (normalizedGuess === answer) {
      setStatus('won')
      setMessage('Wygrana!')
      return
    }

    if (nextGuesses.length >= MAX_ATTEMPTS) {
      setStatus('lost')
      setMessage(`Koniec gry. Hasło: ${answer.toUpperCase()}`)
    }
  }, [answer, currentGuess, dictionary, guesses, status])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return

      if (event.key === 'Enter') {
        submitGuess()
        return
      }

      if (event.key === 'Backspace') {
        removeLetter()
        return
      }

      const normalizedKey = normalizeWord(event.key)

      if (/^[a-ząćęłńóśźż]$/i.test(normalizedKey)) {
        addLetter(normalizedKey)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [addLetter, removeLetter, submitGuess])

  return {
    answer,
    guesses,
    currentGuess,
    usedLetters,
    status,
    message,
    loadStatus,
    wordLength: WORD_LENGTH,
    maxAttempts: MAX_ATTEMPTS,
    addLetter,
    removeLetter,
    submitGuess,
  }
}