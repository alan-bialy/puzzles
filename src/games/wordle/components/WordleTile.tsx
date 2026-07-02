import type { CSSProperties } from 'react'
import type { LetterState } from '../types'

type WordleTileProps = {
  letter?: string
  state?: LetterState
  animatePop?: boolean
  isRevealing?: boolean
  revealDelayMs?: number
  isWinning?: boolean
  winDelayMs?: number
}

const stateClassName: Record<LetterState, string> = {
  correct:
    'border-[var(--color-correct)] bg-[var(--color-correct)] text-white',
  present:
    'border-[var(--color-present)] bg-[var(--color-present)] text-white',
  absent:
    'border-[var(--color-absent)] bg-[var(--color-absent)] text-white',
}

export function WordleTile({
  letter = '',
  state,
  animatePop = false,
  isRevealing = false,
  revealDelayMs = 0,
  isWinning = false,
  winDelayMs = 0,
}: WordleTileProps) {
  const animationStyles = {
    '--wordle-reveal-delay': `${revealDelayMs}ms`,
    '--wordle-win-delay': `${winDelayMs}ms`,
  } as CSSProperties

  const frontClassName = letter
    ? 'border-[var(--color-text)] bg-[var(--color-tile-empty)]'
    : 'border-[var(--color-tile-border)] bg-[var(--color-tile-empty)]'

  return (
    <div
      style={animationStyles}
      className={[
        'wordle-tile-shell aspect-square w-full',
        animatePop && letter ? 'wordle-tile-pop' : '',
        isWinning ? 'wordle-tile-bounce' : '',
      ].join(' ')}
    >
      <div
        className={[
          'wordle-tile-card',
          isRevealing
            ? 'wordle-tile-flip'
            : state
              ? 'wordle-tile-flipped'
              : '',
        ].join(' ')}
      >
        <div
          className={[
            'wordle-tile-face rounded-xl border-2 text-2xl font-black uppercase sm:text-3xl',
            frontClassName,
          ].join(' ')}
        >
          {letter}
        </div>

        {state && (
          <div
            className={[
              'wordle-tile-face wordle-tile-back rounded-xl border-2 text-2xl font-black uppercase sm:text-3xl',
              stateClassName[state],
            ].join(' ')}
          >
            {letter}
          </div>
        )}
      </div>
    </div>
  )
}