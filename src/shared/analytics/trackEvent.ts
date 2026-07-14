type UmamiEventData = Record<string, string | number | boolean | null | undefined>

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: UmamiEventData) => void
    }
  }
}

export function trackEvent(eventName: string, eventData?: UmamiEventData) {
  window.umami?.track(eventName, eventData)
}