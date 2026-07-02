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
  correct: 'wordle-tile--correct',
  present: 'wordle-tile--present',
  absent: 'wordle-tile--absent',
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

  return (
    <div
      style={animationStyles}
      className={[
        'wordle-tile',
        letter ? 'wordle-tile--filled' : '',
        state ? stateClassName[state] : '',
        state ? 'wordle-tile--resolved' : '',
        animatePop && letter
          ? 'wordle-tile--pop'
          : '',
        isRevealing
          ? 'wordle-tile--revealing'
          : '',
        isWinning
          ? 'wordle-tile--bounce'
          : '',
      ].join(' ')}
    >
      {letter}
    </div>
  )
}