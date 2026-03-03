import { Toaster } from '@workspace/ui/components/sonner'
import { ThemeProvider } from '@workspace/ui/components/theme-provider'
import React from 'react'

import { AppLogo } from '#common/ui/components/app_logo'
import { AppLangChanger } from '#common/ui/components/app_lang_changer'
import { ToggleTheme } from '#common/ui/components/toggle_theme'

export interface AuthLayoutProps extends React.PropsWithChildren {}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Toaster />

      <div className="min-h-screen flex flex-col">
        <nav className="flex items-center justify-between px-6 py-4 border-b">
          <AppLogo />
          <div className="flex items-center gap-2">
            <AppLangChanger />
            <ToggleTheme />
          </div>
        </nav>

        <main className="flex flex-1 items-center justify-center p-6">
          {children}
        </main>
      </div>
    </ThemeProvider>
  )
}
