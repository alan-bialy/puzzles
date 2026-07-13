import { DinoFlightGame } from '../games/dino-flight/DinoFlightGame'
import { useSettings } from '../app/providers/SettingsContext'
import { useTranslation } from '../config/i18n'
import { usePageTitle } from '../shared/hooks/usePageTitle'

export function DinoFlightPage() {
  const { language } = useSettings()
  const t = useTranslation(language)

  usePageTitle(t.pageTitleDinoFlight)

  return <DinoFlightGame />
}