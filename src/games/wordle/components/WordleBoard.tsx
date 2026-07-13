import { TILE_REVEAL_DELAY_MS, TILE_WIN_DELAY_MS } from "../constants";
import type { GuessEvaluation } from "../types";
import { WordleTile } from "./WordleTile";

type ShakeState = {
  rowIndex: number;
  nonce: number;
};

type WordleBoardProps = {
  guesses: GuessEvaluation[];
  currentGuess: string;
  maxAttempts: number;
  wordLength: number;
  revealingRowIndex: number | null;
  winningRowIndex: number | null;
  shakeState: ShakeState | null;
};

export function WordleBoard({
  guesses,
  currentGuess,
  maxAttempts,
  wordLength,
  revealingRowIndex,
  winningRowIndex,
  shakeState,
}: WordleBoardProps) {
  const rows = Array.from({ length: maxAttempts });
  const currentLetters = Array.from(currentGuess);

  return (
    <div className="mx-auto grid w-full max-w-sm gap-2">
  {/* <div className="mx-auto grid w-full max-w-76 gap-1.5 sm:max-w-sm sm:gap-2"> */}
      {rows.map((_, rowIndex) => {
        const evaluatedGuess = guesses[rowIndex];
        const isCurrentRow = rowIndex === guesses.length;

        const isRevealing =
          revealingRowIndex !== null &&
          rowIndex === revealingRowIndex &&
          evaluatedGuess !== undefined;

        const isWinning =
          winningRowIndex !== null &&
          rowIndex === winningRowIndex &&
          evaluatedGuess !== undefined;

        const isShaking = shakeState?.rowIndex === rowIndex;
        /*
         * Zmiana key po błędzie powoduje ponowne
         * uruchomienie animacji shake.
         */
        const rowKey = isShaking
          ? `row-${rowIndex}-shake-${shakeState.nonce}`
          : `row-${rowIndex}`;

        return (
          <div
            key={rowKey}
            className={["grid gap-2", isShaking ? "wordle-row-shake" : ""].join(
              " ",
            )}
            style={{
              gridTemplateColumns: `repeat(${wordLength}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: wordLength }).map((__, tileIndex) => {
              if (evaluatedGuess) {
                const tile = evaluatedGuess[tileIndex];

                return (
                  <WordleTile
                    key={tileIndex}
                    letter={tile.letter}
                    state={tile.state}
                    isRevealing={isRevealing}
                    revealDelayMs={tileIndex * TILE_REVEAL_DELAY_MS}
                    isWinning={isWinning}
                    winDelayMs={tileIndex * TILE_WIN_DELAY_MS}
                  />
                );
              }

              const letter = isCurrentRow
                ? (currentLetters[tileIndex] ?? "")
                : "";

              return (
                <WordleTile
                  key={`${tileIndex}-${letter}`}
                  letter={letter}
                  animatePop={isCurrentRow && Boolean(letter)}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
