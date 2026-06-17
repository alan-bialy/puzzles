import { Link } from 'react-router'
import { useSettings } from '../app/providers/SettingsProvider'
import { useTranslation } from '../config/i18n'

export function NotFoundPage() {
  const { language } = useSettings()
  const t = useTranslation(language)

  return (
    <section className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center text-center">
      <p className="text-7xl font-black">404</p>

      <h1 className="mt-6 text-3xl font-black tracking-tight">{t.notFoundTitle}</h1>

      <p className="mt-3 text-sm leading-6 text-(--color-muted)">
        {t.notFoundDescription}
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