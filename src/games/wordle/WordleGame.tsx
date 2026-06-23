import type { AppLanguage } from '../../app/providers/SettingsProvider'
import { useSettings } from '../../app/providers/SettingsProvider'
import { WordleBoard } from './components/WordleBoard'
import { WordleKeyboard } from './components/WordleKeyboard'
import { useWordleGame } from './hooks/useWordleGame'
import type { WordleMessage } from './types'

function getMessageText(
  message: WordleMessage,
  language: AppLanguage,
) {
  if (!message) {
    return ''
  }

  const messages = {
    pl: {
      tooShort: 'Za mało liter.',
      unknownWord: 'Tego słowa nie ma w słowniku.',
      won: 'Brawo! Hasło odgadnięte.',
      loadError: 'Nie udało się załadować słownika.',
      lost: (answer: string) =>
        `Koniec gry. Hasło: ${answer.toLocaleUpperCase('pl-PL')}`,
    },
    en: {
      tooShort: 'Not enough letters.',
      unknownWord: 'This word is not in the dictionary.',
      won: 'Well done! You guessed the word.',
      loadError: 'The dictionary could not be loaded.',
      lost: (answer: string) =>
        `Game over. The word was: ${answer.toUpperCase()}`,
    },
  }

  const currentMessages = messages[language]

  switch (message.type) {
    case 'too-short':
      return currentMessages.tooShort

    case 'not-in-dictionary':
      return currentMessages.unknownWord

    case 'won':
      return currentMessages.won

    case 'lost':
      return currentMessages.lost(message.answer)

    case 'load-error':
      return currentMessages.loadError
  }
}

type WordleGameSessionProps = {
  language: AppLanguage
}

function WordleGameSession({
  language,
}: WordleGameSessionProps) {
  const {
    guesses,
    currentGuess,
    usedLetters,
    status,
    message,
    loadStatus,
    wordLength,
    maxAttempts,
    addLetter,
    removeLetter,
    submitGuess,
    resetGame,
  } = useWordleGame(language)

  const messageText = getMessageText(message, language)

  if (
    loadStatus === 'loading' ||
    loadStatus === 'idle'
  ) {
    return (
      <div className="flex flex-1 items-center justify-center text-center text-[var(--color-muted)]">
        {language === 'pl'
          ? 'Ładowanie słownika...'
          : 'Loading dictionary...'}
      </div>
    )
  }

  if (loadStatus === 'error') {
    return (
      <div className="flex flex-1 items-center justify-center text-center text-[var(--color-muted)]">
        {messageText}
      </div>
    )
  }

  return (
    <section className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-2">
      <div className="mb-5 text-center">
        <h1 className="text-3xl font-black tracking-tight">
          Wordle
        </h1>

        <p className="mt-2 text-sm text-[var(--color-muted)]">
          {language === 'pl'
            ? 'Odgadnij słowo dnia w sześciu próbach.'
            : 'Guess the daily word in six tries.'}
        </p>

        <p className="mt-2 text-xs font-semibold text-[var(--color-muted)]">
          {language === 'pl'
            ? `Próba ${Math.min(guesses.length + 1, maxAttempts)} z ${maxAttempts}`
            : `Attempt ${Math.min(guesses.length + 1, maxAttempts)} of ${maxAttempts}`}
        </p>
      </div>

      <WordleBoard
        guesses={guesses}
        currentGuess={currentGuess}
        maxAttempts={maxAttempts}
        wordLength={wordLength}
      />

      <div
        aria-live="polite"
        className="mt-4 min-h-7 text-center text-sm font-bold text-[var(--color-muted)]"
      >
        {messageText}
      </div>

      <WordleKeyboard
        language={language}
        usedLetters={usedLetters}
        onLetter={addLetter}
        onBackspace={removeLetter}
        onEnter={submitGuess}
        disabled={status !== 'playing'}
      />

      <button
        type="button"
        onClick={resetGame}
        className="mx-auto mt-6 rounded-full px-4 py-2 text-xs font-bold text-[var(--color-muted)] transition hover:bg-[var(--color-surface-strong)] hover:text-[var(--color-text)]"
      >
        {language === 'pl'
          ? 'Resetuj postęp'
          : 'Reset progress'}
      </button>
    </section>
  )
}

export function WordleGame() {
  const { language } = useSettings()

  return (
    <WordleGameSession
      key={language}
      language={language}
    />
  )
}