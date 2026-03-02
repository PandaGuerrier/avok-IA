import AppSidebarLayout from '#common/ui/components/app_sidebar_layout'
import AppHeaderLayout from '#common/ui/components/app_header_layout'

import useUser from '#auth/ui/hooks/use_user'
import { useTranslation } from '#common/ui/hooks/use_translation'

import { ThemeProvider } from '@workspace/ui/components/theme-provider'
import { Toaster } from '@workspace/ui/components/sonner'

import { getNavHome, getNavMain, getNavUser } from '#common/ui/config/navigation.config'
import { TransmitProvider } from '#common/ui/providers/transmit-provider'
import PostHogTracker from '#common/ui/components/posthog_tracker'
import { ReactNode } from 'react'

interface BreadcrumbItemProps {
  label: string
  href?: string
}

interface AppLayoutProps extends React.PropsWithChildren {
  breadcrumbs?: BreadcrumbItemProps[]
  layout?: 'sidebar' | 'header' | 'none'
  mobileLeftElement?: ReactNode
  removePadding?: boolean
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

  const navMain = getNavMain(t)
  const navUser = getNavUser(t)
  const navHome = getNavHome(t)

  const renderLayout = () => {
    switch (layout) {
      case 'none':
        return <div className="min-h-screen w-full bg-background">{children}</div>
      case 'header':
        return (
          <AppHeaderLayout
            user={user}
            navMain={navHome}
            navUser={navUser}
            breadcrumbs={breadcrumbs}
          >
            {children}
          </AppHeaderLayout>
        )
      default:
        return (
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
        )
    }
  }

  return (
    <TransmitProvider user={user}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Toaster />
        <PostHogTracker />
        {renderLayout()}
      </ThemeProvider>
    </TransmitProvider>
  )
}
