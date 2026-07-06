import type { GameStatus, GuessEvaluation } from "../types";

type BuildShareTextOptions = {
  dateKey: string;
  status: GameStatus;
  guesses: GuessEvaluation[];
  maxAttempts: number;
  language: "pl" | "en";
  url?: string;
};

const stateSymbols = {
  correct: "🟩",
  present: "🟨",
  absent: "⬛",
} as const;

export function buildShareText({
  dateKey,
  status,
  guesses,
  maxAttempts,
  language,
  url,
}: BuildShareTextOptions) {
  const score = status === "won" ? guesses.length : "X";

  //   const title = language === "pl" ? "Puzzles — Słówko" : "Puzzles — Daily Word";
  const title = language === "pl" ? "Wordle" : "Wordle";

  const grid = guesses
    .map((guess) => guess.map((tile) => stateSymbols[tile.state]).join(""))
    .join("\n");

  const lines = [`${title} ${score}/${maxAttempts}`, dateKey, "", grid];

  url = "";
  if (url) {
    lines.push("", url);
  }

  return lines.join("\n");
}
