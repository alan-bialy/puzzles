import type { LetterState } from '../types'

type WordleTileProps = {
  letter?: string
  state?: LetterState
}

const stateClassName: Record<LetterState, string> = {
  correct: 'border-[var(--color-correct)] bg-[var(--color-correct)] text-white',
  present: 'border-[var(--color-present)] bg-[var(--color-present)] text-white',
  absent: 'border-[var(--color-absent)] bg-[var(--color-absent)] text-white',
}

export function WordleTile({ letter = '', state }: WordleTileProps) {
  return (
    <div
      className={[
        'grid aspect-square w-full place-items-center rounded-xl border-2 text-2xl font-black uppercase transition sm:text-3xl',
        state
          ? stateClassName[state]
          : 'border-(--color-tile-border) bg-(--color-tile-empty)',
      ].join(' ')}
    >
      {letter}
    </div>
  )
}