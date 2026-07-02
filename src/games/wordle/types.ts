export type LetterState = "correct" | "present" | "absent";

export type GameStatus = "playing" | "won" | "lost";

export type EvaluatedLetter = {
  letter: string;
  state: LetterState;
};

export type GuessEvaluation = EvaluatedLetter[];

export type WordleDictionary = {
  answers: string[];
  allowed: Set<string>;
};

export type WordleMessage =
  | { type: "too-short" }
  | { type: "not-in-dictionary" }
  | { type: "won" }
  | { type: "lost"; answer: string }
  | { type: "load-error" }
  | null;

export type WordleGameResult = {
  dateKey: string;
  won: boolean;
  attempts: number;
};
