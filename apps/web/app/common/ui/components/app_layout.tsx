import AppSidebarLayout from '#common/ui/components/app_sidebar_layout'
import AppHeaderLayout from '#common/ui/components/app_header_layout'

import useUser from '#auth/ui/hooks/use_user'
import { useTranslation } from '#common/ui/hooks/use_translation'

import { ThemeProvider } from '@workspace/ui/components/theme-provider'
import { Toaster } from '@workspace/ui/components/sonner'

import { getNavHome, getNavMain, getNavUser } from '#common/ui/config/navigation.config'
import PostHogTracker from '#common/ui/components/posthog_tracker'
import { ReactNode } from 'react'
import { usePage } from '@inertiajs/react'

interface BreadcrumbItemProps {
  label: string
  href?: string
}

interface AppLayoutProps extends React.PropsWithChildren {
  breadcrumbs?: BreadcrumbItemProps[]
  layout?: 'sidebar' | 'header' | 'none'
  mobileLeftElement?: ReactNode
  removePadding?: boolean
  hideBottomNav?: boolean
}

export default function AppLayout({
  children,
  breadcrumbs = [],
  layout = 'header',
  mobileLeftElement,
  removePadding = false,
}: AppLayoutProps) {
  const user = useUser()
  const { t } = useTranslation()
  const { url } = usePage()

  const gameUuidMatch = url.match(/\/game\/([0-9a-f-]{36})/)
  const gameUuid = gameUuidMatch?.[1]

  const navMain = getNavMain(t, gameUuid)
  const navUser = getNavUser(t)
  const navHome = getNavHome(t)

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Toaster />
        <PostHogTracker />
        {layout === 'header' ? (
          <AppHeaderLayout
            user={user}
            navMain={navHome}
            navUser={navUser}
            breadcrumbs={breadcrumbs}
          >
            {children}
          </AppHeaderLayout>
        ) : (
          <AppSidebarLayout
            user={user}
            navMain={navMain}
            navUser={navUser}
            breadcrumbs={breadcrumbs}
            mobileLeftElement={mobileLeftElement}
            removePadding={removePadding}
          >
            {children}
          </AppSidebarLayout>
        )}
    </ThemeProvider>
  )
}
