import { useSettings } from '../../app/providers/SettingsProvider'
import { WordleBoard } from './components/WordleBoard'
import { WordleKeyboard } from './components/WordleKeyboard'
import { useWordleGame } from './hooks/useWordleGame'

export function WordleGame() {
  const { language } = useSettings()
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
  } = useWordleGame(language)

  if (loadStatus === 'loading' || loadStatus === 'idle') {
    return (
      <div className="flex flex-1 items-center justify-center text-center text-(--color-muted)">
        Ładowanie słownika...
      </div>
    )
  }

  if (loadStatus === 'error') {
    return (
      <div className="flex flex-1 items-center justify-center text-center text-(--color-muted)">
        {message}
      </div>
    )
  }

  return (
    <section className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-2">
      <div className="mb-5 text-center">
        <h1 className="text-3xl font-black tracking-tight">Wordle</h1>
        <p className="mt-2 text-sm text-(--color-muted)">
          {language === 'pl'
            ? 'Odgadnij słowo dnia w sześciu próbach.'
            : 'Guess the daily word in six tries.'}
        </p>
      </div>

      <WordleBoard
        guesses={guesses}
        currentGuess={currentGuess}
        maxAttempts={maxAttempts}
        wordLength={wordLength}
      />

      <div className="mt-4 min-h-7 text-center text-sm font-bold text-(--color-muted)">
        {message}
      </div>

      <WordleKeyboard
        language={language}
        usedLetters={usedLetters}
        onLetter={addLetter}
        onBackspace={removeLetter}
        onEnter={submitGuess}
        disabled={status !== 'playing'}
      />
    </section>
  )
}