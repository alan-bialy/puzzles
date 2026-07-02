import { useEffect } from "react";
import type { AppLanguage } from "../../../app/providers/SettingsContext";
import type { WordleStats } from "../storage/wordleStatsStorage";
import type { GameStatus } from "../types";

export type ShareStatus = "idle" | "success" | "error";

type WordleResultModalProps = {
  open: boolean;
  language: AppLanguage;
  status: GameStatus;
  attempts: number;
  stats: WordleStats;
  shareStatus: ShareStatus;
  onShare: () => Promise<void>;
  onClose: () => void;
};

export function WordleResultModal({
  open,
  language,
  status,
  attempts,
  stats,
  shareStatus,
  onShare,
  onClose,
}: WordleResultModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const winPercentage =
    stats.gamesPlayed === 0
      ? 0
      : Math.round((stats.gamesWon / stats.gamesPlayed) * 100);

  const maximumDistribution = Math.max(1, ...stats.guessDistribution);

  const text =
    language === "pl"
      ? {
          title: "Statystyki",
          won: `Wygrana w ${attempts}. próbie!`,
          lost: "Tym razem się nie udało.",
          played: "Gry",
          winPercentage: "Wygrane",
          currentStreak: "Seria",
          maxStreak: "Najlepsza",
          distribution: "Rozkład prób",
          close: "Zamknij",
          share: "Udostępnij wynik",
          shared: "Wynik skopiowany",
          shareError: "Nie udało się skopiować",
        }
      : {
          title: "Statistics",
          won: `Won in ${attempts} attempts!`,
          lost: "Better luck next time.",
          played: "Played",
          winPercentage: "Win rate",
          currentStreak: "Streak",
          maxStreak: "Best",
          distribution: "Guess distribution",
          close: "Close",
          share: "Share result",
          shared: "Result copied",
          shareError: "Could not copy",
        };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="wordle-stats-title"
        className="w-full max-w-md rounded-3xl border border-(--color-border) bg-(--color-surface) p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="wordle-stats-title"
              className="text-2xl font-black tracking-tight"
            >
              {text.title}
            </h2>

            {status !== "playing" && (
              <p className="mt-1 text-sm font-semibold text-(--color-muted)">
                {status === "won" ? text.won : text.lost}
              </p>
            )}
          </div>

          <div className="mt-2">
            {status !== "playing" && (
              <button
                type="button"
                onClick={() => {
                  void onShare();
                }}
                className="w-full rounded-full bg-(--color-correct) px-5 py-3 text-sm font-black text-white transition hover:scale-[1.01]"
              >
                {shareStatus === "success"
                  ? text.shared
                  : shareStatus === "error"
                    ? text.shareError
                    : text.share}
              </button>
            )}

            {/* <button
              type="button"
              onClick={onClose}
              className="w-full rounded-full bg-(--color-text) px-5 py-3 text-sm font-black text-(--color-bg) transition hover:scale-[1.01]"
            >
              {text.close}
            </button> */}
          </div>
          {/* <button
            type="button"
            onClick={onClose}
            aria-label={text.close}
            className="grid size-10 place-items-center rounded-full bg-(--color-surface-strong) text-xl font-bold transition hover:scale-105"
          >
            ×
          </button> */}
        </div>

        <div className="mt-6 grid grid-cols-4 gap-2">
          <StatItem value={stats.gamesPlayed} label={text.played} />

          <StatItem value={`${winPercentage}%`} label={text.winPercentage} />

          <StatItem value={stats.currentStreak} label={text.currentStreak} />

          <StatItem value={stats.maxStreak} label={text.maxStreak} />
        </div>

        <div className="mt-8">
          <h3 className="text-sm font-black uppercase tracking-wide">
            {text.distribution}
          </h3>

          <div className="mt-4 grid gap-2">
            {stats.guessDistribution.map((count, index) => {
              const width =
                count === 0
                  ? 8
                  : Math.max(12, (count / maximumDistribution) * 100);

              return (
                <div
                  key={index}
                  className="grid grid-cols-[1.5rem_1fr] items-center gap-2"
                >
                  <span className="text-sm font-bold">{index + 1}</span>

                  <div className="h-7 rounded-md bg-(--color-surface-strong)">
                    <div
                      className="grid h-full min-w-7 place-items-center rounded-md bg-(--color-correct) px-2 text-xs font-black text-white"
                      style={{
                        width: `${width}%`,
                      }}
                    >
                      {count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-8 w-full rounded-full bg-(--color-text) px-5 py-3 text-sm font-black text-(--color-bg) transition hover:scale-[1.01]"
        >
          {text.close}
        </button>
      </section>
    </div>
  );
}

type StatItemProps = {
  value: number | string;
  label: string;
};

function StatItem({ value, label }: StatItemProps) {
  return (
    <div className="text-center">
      <p className="text-2xl font-black">{value}</p>
      <p className="mt-1 text-[0.65rem] font-semibold leading-tight text-(--color-muted)">
        {label}
      </p>
    </div>
  );
}
