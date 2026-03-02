import { motion } from 'framer-motion'
import { Toaster } from '@workspace/ui/components/sonner'

import { AppLogo } from '#common/ui/components/app_logo'
import { AppLangChanger } from '#common/ui/components/app_lang_changer'
import { ToggleTheme } from '#common/ui/components/toggle_theme'
import { ThemeProvider } from '@workspace/ui/components/theme-provider'

export interface AuthLayoutProps extends React.PropsWithChildren {}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Toaster />

      <div className="grid min-h-screen">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <motion.div
            className="flex justify-center gap-2 md:justify-start"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] as const }}
          >
            <AppLogo />
            <AppLangChanger />
            <ToggleTheme />
          </motion.div>
          <div className="flex flex-1 items-center w-full justify-center">
            <div className="w-full max-w-xl">{children}</div>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
