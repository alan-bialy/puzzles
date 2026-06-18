import { WordleTile } from './WordleTile'
import type { GuessEvaluation } from '../types'

type WordleBoardProps = {
  guesses: GuessEvaluation[]
  currentGuess: string
  maxAttempts: number
  wordLength: number
}

export function WordleBoard({
  guesses,
  currentGuess,
  maxAttempts,
  wordLength,
}: WordleBoardProps) {
  const rows = Array.from({ length: maxAttempts })

  return (
    <div className="mx-auto grid w-full max-w-sm gap-2">
      {rows.map((_, rowIndex) => {
        const evaluatedGuess = guesses[rowIndex]
        const isCurrentRow = rowIndex === guesses.length

        return (
          <div key={rowIndex} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${wordLength}, minmax(0, 1fr))` }}>
            {Array.from({ length: wordLength }).map((__, tileIndex) => {
              if (evaluatedGuess) {
                const tile = evaluatedGuess[tileIndex]

                return (
                  <WordleTile
                    key={tileIndex}
                    letter={tile.letter}
                    state={tile.state}
                  />
                )
              }

              return (
                <WordleTile
                  key={tileIndex}
                  letter={isCurrentRow ? currentGuess[tileIndex] : ''}
                />
              )
            })}
          </div>
        )
      })}
    </div>
  )
}