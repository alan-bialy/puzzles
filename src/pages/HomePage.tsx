import { GameCard } from "../shared/components/GameCard";
import { useSettings } from "../app/providers/SettingsContext";
import { useTranslation } from "../config/i18n";

export function HomePage() {
  const { language } = useSettings();
  const t = useTranslation(language);

  return (
    <section className="flex flex-1 flex-col">
      <div className="mb-8 sm:mb-10">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.25em] text-(--color-muted)">
          {t.appName}
        </p>

        <h1 className="max-w-2xl text-4xl font-black tracking-tight sm:text-5xl">
          {t.homeTitle}
        </h1>

        <p className="mt-4 max-w-xl text-base leading-7 text-(--color-muted) sm:text-lg">
          {t.homeSubtitle}
        </p>
      </div>

      {/* <div className="grid gap-4 sm:grid-cols-2"> */}
      <div className="grid gap-2 sm:grid-cols-2 ">
        <GameCard
          title={t.wordleTitle}
          description={t.wordleDescription}
          actionLabel={t.play}
          to="/wordle"
        />
        <GameCard
          title={t.dinoFlightTitle}
          description={t.dinoFlightDescription}
          actionLabel={t.play}
          to="/flappy-dino"
          imageSrc="assets/dino-flight/flappydino.png"
          imageAlt={t.dinoFlightTitle}
        />

        {/* <GameCard
          title={t.comingSoonTitle}
          description={t.comingSoonDescription}
          actionLabel={t.soon}
          disabled
        /> */}
      </div>
    </section>
  );
}
