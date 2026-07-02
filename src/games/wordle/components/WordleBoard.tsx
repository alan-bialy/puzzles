import {
  TILE_REVEAL_DELAY_MS,
  TILE_WIN_DELAY_MS,
} from '../constants'
import type { GuessEvaluation } from '../types'
import { WordleTile } from './WordleTile'

type WordleBoardProps = {
  guesses: GuessEvaluation[]
  currentGuess: string
  maxAttempts: number
  wordLength: number
  revealingRowIndex: number | null
  winningRowIndex: number | null
  shakeNonce: number
}

export function WordleBoard({
  guesses,
  currentGuess,
  maxAttempts,
  wordLength,
  revealingRowIndex,
  winningRowIndex,
  shakeNonce,
}: WordleBoardProps) {
  const rows = Array.from({ length: maxAttempts })
  const currentLetters = Array.from(currentGuess)

  return (
    <div className="mx-auto grid w-full max-w-sm gap-2">
      {rows.map((_, rowIndex) => {
        const evaluatedGuess = guesses[rowIndex]
        const isCurrentRow = rowIndex === guesses.length
        const isRevealing =
          rowIndex === revealingRowIndex
        const isWinning =
          rowIndex === winningRowIndex

        /*
         * Zmiana key po błędzie powoduje ponowne
         * uruchomienie animacji shake.
         */
        const rowKey = isCurrentRow
          ? `current-${rowIndex}-${shakeNonce}`
          : `row-${rowIndex}`

        return (
          <div
            key={rowKey}
            className={[
              'grid gap-2',
              isCurrentRow && shakeNonce > 0
                ? 'wordle-row-shake'
                : '',
            ].join(' ')}
            style={{
              gridTemplateColumns: `repeat(${wordLength}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: wordLength }).map(
              (__, tileIndex) => {
                if (evaluatedGuess) {
                  const tile =
                    evaluatedGuess[tileIndex]

                  return (
                    <WordleTile
                      key={tileIndex}
                      letter={tile.letter}
                      state={tile.state}
                      isRevealing={isRevealing}
                      revealDelayMs={
                        tileIndex *
                        TILE_REVEAL_DELAY_MS
                      }
                      isWinning={isWinning}
                      winDelayMs={
                        tileIndex *
                        TILE_WIN_DELAY_MS
                      }
                    />
                  )
                }

                const letter = isCurrentRow
                  ? (currentLetters[tileIndex] ?? '')
                  : ''

                return (
                  <WordleTile
                    key={`${tileIndex}-${letter}`}
                    letter={letter}
                    animatePop={
                      isCurrentRow &&
                      Boolean(letter)
                    }
                  />
                )
              },
            )}
          </div>
        )
      })}
    </div>
  )
}