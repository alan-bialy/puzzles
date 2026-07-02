import { describe, expect, it } from "vitest";
import { buildShareText } from "./buildShareText";
import type { GuessEvaluation } from "../types";

describe("buildShareText", () => {
  it("builds a result for a won game", () => {
    const guesses: GuessEvaluation[] = [
      [
        { letter: "k", state: "absent" },
        { letter: "o", state: "present" },
        { letter: "t", state: "absent" },
        { letter: "e", state: "absent" },
        { letter: "k", state: "correct" },
      ],
      [
        { letter: "z", state: "correct" },
        { letter: "a", state: "correct" },
        { letter: "m", state: "correct" },
        { letter: "e", state: "correct" },
        { letter: "k", state: "correct" },
      ],
    ];

    expect(
      buildShareText({
        dateKey: "2026-07-02",
        status: "won",
        guesses,
        maxAttempts: 6,
        language: "pl",
      }),
    ).toBe(
      [
        // "Puzzles — Słówko 2/6",
        "Wordle 2/6",
        "2026-07-02",
        "",
        "⬛🟨⬛⬛🟩",
        "🟩🟩🟩🟩🟩",
      ].join("\n"),
    );
  });

  it("uses X for a lost game", () => {
    const guesses: GuessEvaluation[] = [];

    const result = buildShareText({
      dateKey: "2026-07-02",
      status: "lost",
      guesses,
      maxAttempts: 6,
      language: "en",
    });

    // expect(result).toContain("Puzzles — Daily Word X/6");
    expect(result).toContain("Wordle X/6");
  });
});
