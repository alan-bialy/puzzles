import type { AppLanguage } from "../../app/providers/SettingsContext";
import { useSettings } from "../../app/providers/SettingsContext";
import { useCallback, useState } from "react";
import { buildShareText } from "./engine/buildShareText";
import type { ShareStatus } from "./components/WordleResultModal";
import { WordleResultModal } from "./components/WordleResultModal";
import { useWordleStats } from "./hooks/useWordleStats";
import { WordleBoard } from "./components/WordleBoard";
import { WordleKeyboard } from "./components/WordleKeyboard";
import { useWordleGame } from "./hooks/useWordleGame";
import type { WordleGameResult, WordleMessage } from "./types";

function getMessageText(message: WordleMessage, language: AppLanguage) {
  if (!message) {
    return "";
  }

  const messages = {
    pl: {
      tooShort: "Za mało liter.",
      unknownWord: "Tego słowa nie ma w słowniku.",
      won: "Brawo! Hasło odgadnięte.",
      loadError: "Nie udało się załadować słownika.",
      lost: (answer: string) =>
        `Koniec gry. Hasło: ${answer.toLocaleUpperCase("pl-PL")}`,
    },
    en: {
      tooShort: "Not enough letters.",
      unknownWord: "This word is not in the dictionary.",
      won: "Well done! You guessed the word.",
      loadError: "The dictionary could not be loaded.",
      lost: (answer: string) =>
        `Game over. The word was: ${answer.toUpperCase()}`,
    },
  };

  const currentMessages = messages[language];

  switch (message.type) {
    case "too-short":
      return currentMessages.tooShort;

    case "not-in-dictionary":
      return currentMessages.unknownWord;

    case "won":
      return currentMessages.won;

    case "lost":
      return currentMessages.lost(message.answer);

    case "load-error":
      return currentMessages.loadError;
  }
}

type WordleGameSessionProps = {
  language: AppLanguage;
};

function WordleGameSession({ language }: WordleGameSessionProps) {
  const [isResultOpen, setIsResultOpen] = useState(false);

  const { stats, recordResult } = useWordleStats(language);
  const [shareStatus, setShareStatus] = useState<ShareStatus>("idle");
  const handleGameComplete = useCallback(
    (result: WordleGameResult) => {
      recordResult(result);
      setShareStatus("idle");
      setIsResultOpen(true);
    },
    [recordResult],
  );

  const {
    gameDateKey,
    guesses,
    currentGuess,
    usedLetters,
    status,
    message,
    loadStatus,
    wordLength,
    maxAttempts,
    revealingRowIndex,
    winningRowIndex,
    shakeNonce,
    isInputLocked,
    addLetter,
    removeLetter,
    submitGuess,
    resetGame,
  } = useWordleGame(language, {
    onComplete: handleGameComplete,
  });
  const handleReset = useCallback(() => {
    setIsResultOpen(false);
    resetGame();
  }, [resetGame]);
  const messageText = getMessageText(message, language);

  const handleShare = useCallback(async () => {
    if (status === "playing") {
      return;
    }

    const shareText = buildShareText({
      dateKey: gameDateKey,
      status,
      guesses,
      maxAttempts,
      language,
      url: window.location.href,
    });

    setShareStatus("idle");

    try {
      if (navigator.share) {
        await navigator.share({
          title:
            language === "pl" ? "Mój wynik w Puzzles" : "My Puzzles result",
          text: shareText,
        });

        setShareStatus("success");
        return;
      }

      await navigator.clipboard.writeText(shareText);

      setShareStatus("success");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setShareStatus("error");
    }
  }, [gameDateKey, guesses, language, maxAttempts, status]);

  if (loadStatus === "loading" || loadStatus === "idle") {
    return (
      <div className="flex flex-1 items-center justify-center text-center text-(--color-muted)">
        {language === "pl" ? "Ładowanie słownika..." : "Loading dictionary..."}
      </div>
    );
  }

  if (loadStatus === "error") {
    return (
      <div className="flex flex-1 items-center justify-center text-center text-(--color-muted)">
        {messageText}
      </div>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center py-2">
      <div className="mb-5 text-center">
        <h1 className="text-3xl font-black tracking-tight">Wordle</h1>

        <p className="mt-2 text-sm text-(--color-muted)">
          {language === "pl"
            ? "Odgadnij słowo dnia w sześciu próbach."
            : "Guess the daily word in six tries."}
        </p>

        <p className="mt-2 text-xs font-semibold text-(--color-muted)">
          {language === "pl"
            ? `Próba ${Math.min(guesses.length + 1, maxAttempts)} z ${maxAttempts}`
            : `Attempt ${Math.min(guesses.length + 1, maxAttempts)} of ${maxAttempts}`}
        </p>
      </div>

      <WordleBoard
        guesses={guesses}
        currentGuess={currentGuess}
        maxAttempts={maxAttempts}
        wordLength={wordLength}
        revealingRowIndex={revealingRowIndex}
        winningRowIndex={winningRowIndex}
        shakeNonce={shakeNonce}
      />

      <div
        aria-live="polite"
        className="mt-4 min-h-7 text-center text-sm font-bold text-(--color-muted)"
      >
        {messageText}
      </div>

      <WordleKeyboard
        language={language}
        usedLetters={usedLetters}
        onLetter={addLetter}
        onBackspace={removeLetter}
        onEnter={submitGuess}
        disabled={status !== "playing" || isInputLocked}
      />

      <div className="mx-auto mt-6 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => {
            setShareStatus("idle");
            setIsResultOpen(true);
          }}
          className="rounded-full px-4 py-2 text-xs font-bold text-(--color-muted) transition hover:bg-(--color-surface-strong) hover:text-(--color-text)"
        >
          {language === "pl" ? "Statystyki" : "Statistics"}
        </button>

        {import.meta.env.DEV && (
          <button
            type="button"
            onClick={handleReset}
            className="rounded-full px-4 py-2 text-xs font-bold text-(--color-muted) transition hover:bg-(--color-surface-strong) hover:text-(--color-text)"
          >
            {language === "pl" ? "Resetuj postęp" : "Reset progress"}
          </button>
        )}
      </div>

      <WordleResultModal
        open={isResultOpen}
        language={language}
        status={status}
        attempts={guesses.length}
        stats={stats}
        shareStatus={shareStatus}
        onShare={handleShare}
        onClose={() => setIsResultOpen(false)}
      />
    </section>
  );
}

export function WordleGame() {
  const { language } = useSettings();

  return <WordleGameSession key={language} language={language} />;
}
