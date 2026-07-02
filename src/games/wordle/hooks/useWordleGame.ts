import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { AppLanguage } from "../../../app/providers/SettingsContext";
import { getLocalDateKey } from "../../../shared/utils/dateKey";
import { normalizeWord } from "../../../shared/utils/normalizeWord";
import { evaluateGuess } from "../engine/evaluateGuess";
import { getDailyAnswer } from "../engine/getDailyAnswer";
import { loadWordleDictionary } from "../engine/loadWordleDictionary";
import {
  clearWordleState,
  loadWordleState,
  saveWordleState,
} from "../storage/wordleStorage";
import type {
  GameStatus,
  GuessEvaluation,
  LetterState,
  WordleDictionary,
  WordleGameResult,
  WordleMessage,
} from "../types";
import {
  BOARD_REVEAL_DURATION_MS,
  MAX_ATTEMPTS,
  WORD_LENGTH,
} from "../constants";

type LoadStatus = "idle" | "loading" | "loaded" | "error";
type UseWordleGameOptions = {
  onComplete?: (result: WordleGameResult) => void;
};
function getLetterPriority(state: LetterState) {
  if (state === "correct") return 3;
  if (state === "present") return 2;

  return 1;
}

function mergeLetterStates(
  currentStates: Record<string, LetterState>,
  evaluation: GuessEvaluation,
) {
  return evaluation.reduce<Record<string, LetterState>>(
    (result, tile) => {
      const currentState = result[tile.letter];

      if (
        !currentState ||
        getLetterPriority(tile.state) > getLetterPriority(currentState)
      ) {
        result[tile.letter] = tile.state;
      }

      return result;
    },
    { ...currentStates },
  );
}

function evaluationToWord(evaluation: GuessEvaluation) {
  return evaluation.map((tile) => tile.letter).join("");
}

function restoreGuesses(
  storedGuesses: string[],
  dictionary: WordleDictionary,
  answer: string,
) {
  return storedGuesses
    .map(normalizeWord)
    .filter((guess) => Array.from(guess).length === WORD_LENGTH)
    .filter((guess) => dictionary.allowed.has(guess))
    .slice(0, MAX_ATTEMPTS)
    .map((guess) => evaluateGuess(answer, guess));
}

function getRestoredStatus(
  guesses: GuessEvaluation[],
  answer: string,
): GameStatus {
  const hasWon = guesses.some((guess) => evaluationToWord(guess) === answer);

  if (hasWon) {
    return "won";
  }

  if (guesses.length >= MAX_ATTEMPTS) {
    return "lost";
  }

  return "playing";
}

export function useWordleGame(
  language: AppLanguage,
  options: UseWordleGameOptions = {},
) {
  const { onComplete } = options;
  const [gameDateKey] = useState(getLocalDateKey);
  const [loadStatus, setLoadStatus] = useState<LoadStatus>("idle");
  const [isHydrated, setIsHydrated] = useState(false);
  const [dictionary, setDictionary] = useState<WordleDictionary | null>(null);
  const [answer, setAnswer] = useState("");
  const [guesses, setGuesses] = useState<GuessEvaluation[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [status, setStatus] = useState<GameStatus>("playing");
  const [message, setMessage] = useState<WordleMessage>(null);

  const [revealingRowIndex, setRevealingRowIndex] = useState<number | null>(
    null,
  );
  const [winningRowIndex, setWinningRowIndex] = useState<number | null>(null);
  const [shakeNonce, setShakeNonce] = useState(0);
  const revealTimerRef = useRef<number | null>(null);
  const clearRevealTimer = useCallback(() => {
    if (revealTimerRef.current === null) {
      return;
    }

    window.clearTimeout(revealTimerRef.current);
    revealTimerRef.current = null;
  }, []);
  useEffect(() => {
    return () => {
      clearRevealTimer();
    };
  }, [clearRevealTimer]);

  useEffect(() => {
    let isActive = true;

    async function initializeGame() {
      try {
        setLoadStatus("loading");

        const nextDictionary = await loadWordleDictionary(
          language,
          WORD_LENGTH,
        );

        const nextAnswer = getDailyAnswer(nextDictionary.answers, language);

        const storedState = loadWordleState(language, gameDateKey);

        const restoredGuesses = storedState
          ? restoreGuesses(storedState.guesses, nextDictionary, nextAnswer)
          : [];

        const restoredStatus = getRestoredStatus(restoredGuesses, nextAnswer);

        const restoredCurrentGuess =
          storedState && restoredStatus === "playing"
            ? Array.from(normalizeWord(storedState.currentGuess))
                .slice(0, WORD_LENGTH)
                .join("")
            : "";

        if (!isActive) {
          return;
        }

        setDictionary(nextDictionary);
        setAnswer(nextAnswer);
        setGuesses(restoredGuesses);
        setCurrentGuess(restoredCurrentGuess);
        setStatus(restoredStatus);

        if (restoredStatus === "won") {
          setMessage({ type: "won" });
        } else if (restoredStatus === "lost") {
          setMessage({
            type: "lost",
            answer: nextAnswer,
          });
        } else {
          setMessage(null);
        }

        setLoadStatus("loaded");
        setIsHydrated(true);
      } catch {
        if (!isActive) {
          return;
        }

        setLoadStatus("error");
        setMessage({ type: "load-error" });
      }
    }

    void initializeGame();

    return () => {
      isActive = false;
    };
  }, [gameDateKey, language]);

  useEffect(() => {
    if (!isHydrated || loadStatus !== "loaded") {
      return;
    }

    saveWordleState(language, {
      dateKey: gameDateKey,
      guesses: guesses.map(evaluationToWord),
      currentGuess,
    });
  }, [currentGuess, gameDateKey, guesses, isHydrated, language, loadStatus]);

  const usedLetters = useMemo(
    () =>
      guesses.reduce<Record<string, LetterState>>(
        (result, guess) => mergeLetterStates(result, guess),
        {},
      ),
    [guesses],
  );

  const addLetter = useCallback(
    (letter: string) => {
      if (status !== "playing" || revealingRowIndex !== null) {
        return;
      }

      setMessage(null);

      setCurrentGuess((guess) => {
        if (Array.from(guess).length >= WORD_LENGTH) {
          return guess;
        }

        return normalizeWord(`${guess}${letter}`);
      });
    },
    [revealingRowIndex, status],
  );

  const removeLetter = useCallback(() => {
    if (status !== "playing" || revealingRowIndex !== null) {
      return;
    }

    setMessage(null);

    setCurrentGuess((guess) => Array.from(guess).slice(0, -1).join(""));
  }, [revealingRowIndex, status]);

  const submitGuess = useCallback(() => {
    if (
      !dictionary ||
      !answer ||
      status !== "playing" ||
      revealingRowIndex !== null
    ) {
      return;
    }

    const normalizedGuess = normalizeWord(currentGuess);

    if (Array.from(normalizedGuess).length !== WORD_LENGTH) {
      setMessage({ type: "too-short" });
      setShakeNonce((current) => current + 1);
      return;
    }

    if (!dictionary.allowed.has(normalizedGuess)) {
      setMessage({
        type: "not-in-dictionary",
      });
      setShakeNonce((current) => current + 1);
      return;
    }

    const evaluation = evaluateGuess(answer, normalizedGuess);

    const nextGuesses = [...guesses, evaluation];

    const revealedRowIndex = guesses.length;
    const hasWon = normalizedGuess === answer;
    const hasLost = !hasWon && nextGuesses.length >= MAX_ATTEMPTS;

    setGuesses(nextGuesses);
    setCurrentGuess("");
    setMessage(null);
    setRevealingRowIndex(revealedRowIndex);

    clearRevealTimer();

    revealTimerRef.current = window.setTimeout(() => {
      revealTimerRef.current = null;
      setRevealingRowIndex(null);

      if (hasWon) {
        setStatus("won");
        setMessage({ type: "won" });
        setWinningRowIndex(revealedRowIndex);

        onComplete?.({
          dateKey: gameDateKey,
          won: true,
          attempts: nextGuesses.length,
        });

        return;
      }

      if (hasLost) {
        setStatus("lost");
        setMessage({
          type: "lost",
          answer,
        });

        onComplete?.({
          dateKey: gameDateKey,
          won: false,
          attempts: nextGuesses.length,
        });
      }
    }, BOARD_REVEAL_DURATION_MS);
  }, [
    answer,
    clearRevealTimer,
    currentGuess,
    dictionary,
    gameDateKey,
    guesses,
    onComplete,
    revealingRowIndex,
    status,
  ]);

  const resetGame = useCallback(() => {
    clearRevealTimer();
    clearWordleState(language);

    setGuesses([]);
    setCurrentGuess("");
    setStatus("playing");
    setMessage(null);
    setRevealingRowIndex(null);
    setWinningRowIndex(null);
    setShakeNonce(0);
  }, [clearRevealTimer, language]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        submitGuess();
        return;
      }

      if (event.key === "Backspace") {
        event.preventDefault();
        removeLetter();
        return;
      }

      const normalizedKey = normalizeWord(event.key);

      if (/^[a-ząćęłńóśźż]$/i.test(normalizedKey)) {
        addLetter(normalizedKey);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [addLetter, removeLetter, submitGuess]);

  return {
    gameDateKey,
    guesses,
    currentGuess,
    usedLetters,
    status,
    message,
    loadStatus,
    wordLength: WORD_LENGTH,
    maxAttempts: MAX_ATTEMPTS,

    revealingRowIndex,
    winningRowIndex,
    shakeNonce,
    isInputLocked: revealingRowIndex !== null,

    addLetter,
    removeLetter,
    submitGuess,
    resetGame,
  };
}
