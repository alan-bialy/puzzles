import { Outlet } from 'react-router'
import { AppHeader } from '../shared/components/AppHeader'
import { AppFooter } from '../shared/components/AppFooter'

export function AppLayout() {
  return (
    <div className="min-h-dvh bg-(--color-bg) text-(--color-text)">
      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-4">
        <AppHeader />

        <main className="flex flex-1 flex-col py-6 sm:py-10">
          <Outlet />
        </main>

        <AppFooter />
      </div>
    </div>
  )
}