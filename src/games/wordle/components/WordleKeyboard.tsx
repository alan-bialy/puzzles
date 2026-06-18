import type { LetterState } from '../types'

type WordleKeyboardProps = {
  language: 'pl' | 'en'
  usedLetters: Record<string, LetterState>
  onLetter: (letter: string) => void
  onBackspace: () => void
  onEnter: () => void
  disabled?: boolean
}

const keyboardLayouts = {
  pl: ['qwertyuiop', 'asdfghjkl', 'zxcvbnmąćęłńóśźż'],
  en: ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'],
}

const stateClassName: Record<LetterState, string> = {
  correct: 'bg-[var(--color-correct)] text-white',
  present: 'bg-[var(--color-present)] text-white',
  absent: 'bg-[var(--color-absent)] text-white',
}

export function WordleKeyboard({
  language,
  usedLetters,
  onLetter,
  onBackspace,
  onEnter,
  disabled = false,
}: WordleKeyboardProps) {
  return (
    <div className="mx-auto mt-6 grid w-full max-w-xl gap-2">
      {keyboardLayouts[language].map((row) => (
        <div key={row} className="flex justify-center gap-1.5">
          {Array.from(row).map((letter) => {
            const state = usedLetters[letter]

            return (
              <button
                key={letter}
                type="button"
                disabled={disabled}
                onClick={() => onLetter(letter)}
                className={[
                  'min-h-11 min-w-8 flex-1 rounded-lg px-2 text-sm font-black uppercase transition active:scale-95 disabled:opacity-60 sm:min-h-12',
                  state
                    ? stateClassName[state]
                    : 'bg-(--color-surface-strong) text-(--color-text)',
                ].join(' ')}
              >
                {letter}
              </button>
            )
          })}
        </div>
      ))}

      <div className="flex justify-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onEnter}
          className="min-h-11 flex-1 rounded-lg bg-(--color-text) px-3 text-xs font-black uppercase text-(--color-bg) active:scale-95 disabled:opacity-60 sm:text-sm"
        >
          Enter
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onBackspace}
          className="min-h-11 flex-1 rounded-lg bg-(--color-surface-strong) px-3 text-xs font-black uppercase text-(--color-text) active:scale-95 disabled:opacity-60 sm:text-sm"
        >
          Backspace
        </button>
      </div>
    </div>
  )
}