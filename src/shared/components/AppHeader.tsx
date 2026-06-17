import { Link, NavLink } from 'react-router'
import { useSettings } from '../../app/providers/SettingsProvider'
import { useTranslation } from '../../config/i18n'

export function AppHeader() {
  const { language } = useSettings()
  const t = useTranslation(language)

  return (
    <header className="border-b border-(--color-border) py-4">
      <nav className="flex items-center justify-between gap-4">
        <Link to="/" className="text-lg font-black tracking-tight sm:text-xl">
          {t.appName}
        </Link>

        <div className="flex items-center gap-2 text-sm">
          <NavLink
            to="/"
            className={({ isActive }) =>
              [
                'rounded-full px-3 py-2 font-medium transition',
                isActive
                  ? 'bg-(--color-surface-strong) text-(--color-text)'
                  : 'text-(--color-muted) hover:bg-(--color-surface) hover:text-(--color-text)',
              ].join(' ')
            }
          >
            Home
          </NavLink>

          <NavLink
            to="/wordle"
            className={({ isActive }) =>
              [
                'rounded-full px-3 py-2 font-medium transition',
                isActive
                  ? 'bg-(--color-surface-strong) text-(--color-text)'
                  : 'text-(--color-muted) hover:bg-(--color-surface) hover:text-(--color-text)',
              ].join(' ')
            }
          >
            Wordle
          </NavLink>
        </div>
      </nav>
    </header>
  )
}