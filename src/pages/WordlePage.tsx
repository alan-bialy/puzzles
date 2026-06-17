import { Link } from 'react-router'
import { useSettings } from '../app/providers/SettingsProvider'
import { useTranslation } from '../config/i18n'

export function WordlePage() {
  const { language } = useSettings()
  const t = useTranslation(language)

  return (
    <section className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center text-center">
      <div className="mb-8 grid grid-cols-5 gap-2">
        {'WORDLE'.split('').map((letter, index) => (
          <div
            key={`${letter}-${index}`}
            className="grid aspect-square w-14 place-items-center rounded-xl border-2 border-(--color-tile-border) bg-(--color-tile-empty) text-xl font-black sm:w-16"
          >
            {letter}
          </div>
        ))}
      </div>

      <h1 className="text-3xl font-black tracking-tight">{t.wordleTitle}</h1>

      <p className="mt-3 max-w-sm text-sm leading-6 text-(--color-muted)">
        {t.wordleDescription}
      </p>

      <Link
        to="/"
        className="mt-8 rounded-full bg-(--color-text) px-5 py-3 text-sm font-bold text-(--color-bg) transition hover:scale-[1.02]"
      >
        {t.backHome}
      </Link>
    </section>
  )
}