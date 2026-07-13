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
  pl: [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
    ['ą', 'ć', 'ę', 'ł', 'ń', 'ó', 'ś', 'ź', 'ż'],
  ],
  en: [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ],
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
    <div className="mx-auto mt-4 grid w-full max-w-md gap-1.5 px-0 sm:mt-6 sm:max-w-xl sm:gap-2">
      {keyboardLayouts[language].map((row) => (
        <div
          key={row.join('')}
          className="grid gap-1 sm:gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))`,
          }}
        >
          {row.map((letter) => {
            const state = usedLetters[letter]

            return (
              <button
                key={letter}
                type="button"
                disabled={disabled}
                onClick={() => onLetter(letter)}
                className={[
                  'grid h-9 min-w-0 place-items-center rounded-md px-0 text-[0.7rem] font-black uppercase transition active:scale-95 disabled:opacity-60 sm:h-12 sm:rounded-lg sm:text-sm',
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

      <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={onEnter}
          className="h-10 rounded-md bg-(--color-text) px-3 text-xs font-black uppercase text-(--color-bg) active:scale-95 disabled:opacity-60 sm:h-12 sm:rounded-lg sm:text-sm"
        >
          Enter
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onBackspace}
          aria-label="Backspace"
          className="h-10 rounded-md bg-(--color-surface-strong) px-3 text-xs font-black uppercase text-(--color-text) active:scale-95 disabled:opacity-60 sm:h-12 sm:rounded-lg sm:text-sm"
        >
          Backspace
        </button>
      </div>
    </div>
  )
}