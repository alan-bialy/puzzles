import { WordleGame } from '../games/wordle/WordleGame'
import { useSettings } from '../app/providers/SettingsContext'
import { useTranslation } from '../config/i18n'
import { usePageTitle } from '../shared/hooks/usePageTitle'

export function WordlePage() {
  const { language } = useSettings()
  const t = useTranslation(language)

  usePageTitle(t.pageTitleWordle)

  return <WordleGame />
}