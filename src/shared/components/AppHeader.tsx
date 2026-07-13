import type { ReactNode } from 'react'
// import { NavLink } from 'react-router'
import { Link, useLocation, useSearchParams } from 'react-router'
import { useSettings } from '../../app/providers/SettingsContext'
import type { AppLanguage } from '../../app/providers/SettingsContext'
import { useTranslation } from '../../config/i18n'

export function AppHeader() {
  const {
    language,
    theme,
    setLanguage,
    toggleTheme,
  } = useSettings()

  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const t = useTranslation(language)

  const isWordleRoute = location.pathname === '/wordle'

  function openStatistics() {
    const nextSearchParams = new URLSearchParams(searchParams)

    nextSearchParams.set('modal', 'stats')
    setSearchParams(nextSearchParams)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-(--color-border) bg-(--color-bg)/90 backdrop-blur">
      <nav className="flex min-h-16 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-5">
          <Link
            to="/"
            className="shrink-0 text-lg font-black tracking-tight sm:text-xl"
          >
            {t.pageTitleHome}
          </Link>

          {/* <div className="hidden items-center gap-1 sm:flex">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                [
                  'rounded-full px-3 py-2 text-sm font-semibold transition',
                  isActive
                    ? 'bg-(--color-surface-strong) text-(--color-text)'
                    : 'text-(--color-muted) hover:bg-(--color-surface) hover:text-(--color-text)',
                ].join(' ')
              }
            >
              {t.home}
            </NavLink>

            <NavLink
              to="/wordle"
              className={({ isActive }) =>
                [
                  'rounded-full px-3 py-2 text-sm font-semibold transition',
                  isActive
                    ? 'bg-(--color-surface-strong) text-(--color-text)'
                    : 'text-(--color-muted) hover:bg-(--color-surface) hover:text-(--color-text)',
                ].join(' ')
              }
            >
              {t.wordleTitle}
            </NavLink>
          </div> */}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <LanguageSwitcher
            language={language}
            onChange={setLanguage}
          />

          {isWordleRoute && (
            <IconButton
              label={t.statistics}
              onClick={openStatistics}
            >
              <StatisticsIcon />
            </IconButton>
          )}

          <IconButton
            label={
              theme === 'dark'
                ? t.enableLightTheme
                : t.enableDarkTheme
            }
            pressed={theme === 'dark'}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <SunIcon />
            ) : (
              <MoonIcon />
            )}
          </IconButton>
        </div>
      </nav>
    </header>
  )
}

type LanguageSwitcherProps = {
  language: AppLanguage
  onChange: (language: AppLanguage) => void
}

function LanguageSwitcher({
  language,
  onChange,
}: LanguageSwitcherProps) {
  return (
    <div
      role="group"
      aria-label="Language"
      className="flex rounded-full border border-(--color-border) bg-(--color-surface) p-1"
    >
      <button
        type="button"
        aria-pressed={language === 'pl'}
        onClick={() => onChange('pl')}
        className={[
          'cursor-pointer rounded-full px-2.5 py-1.5 text-xs font-black transition sm:px-3',
          language === 'pl'
            ? 'bg-(--color-text) text-(--color-bg) shadow-sm'
            : 'text-(--color-muted) hover:text-(--color-text)',
        ].join(' ')}
      >
        PL
      </button>

      <button
        type="button"
        aria-pressed={language === 'en'}
        onClick={() => onChange('en')}
        className={[
          'cursor-pointer rounded-full px-2.5 py-1.5 text-xs font-black transition sm:px-3',
          language === 'en'
            ? 'bg-(--color-text) text-(--color-bg) shadow-sm'
            : 'text-(--color-muted) hover:text-(--color-text)',
        ].join(' ')}
      >
        EN
      </button>
    </div>
  )
}

type IconButtonProps = {
  label: string
  pressed?: boolean
  onClick: () => void
  children: ReactNode
}

function IconButton({
  label,
  pressed,
  onClick,
  children,
}: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      title={label}
      onClick={onClick}
      className="cursor-pointer grid size-10 place-items-center rounded-full border border-(--color-border) bg-(--color-surface) text-(--color-text) transition hover:-translate-y-0.5 hover:bg-(--color-surface-strong) active:translate-y-0"
    >
      {children}
    </button>
  )
}

function StatisticsIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M22 20H2" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.42 1.42" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.42" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  )
}