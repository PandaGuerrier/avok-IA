import React from 'react'

import { ToggleTheme } from '#common/ui/components/toggle_theme'
import { NavUser } from '#common/ui/components/nav_user'
import { AppSidebar } from '#common/ui/components/app_sidebar'
import Breadcrumb from '#common/ui/components/breadcrumbs'
import { BottomNavBar } from '#common/ui/components/bottom_nav_bar'
import { MobileHeader } from '#common/ui/components/mobile_header'

import type { NavMainItem, NavUserOptionsGroup } from '#common/ui/types/navigation'

import { SidebarInset, SidebarProvider, SidebarTrigger } from '@workspace/ui/components/sidebar'

import UserDto from '#users/dtos/user'
import { NotificationsButton } from '#common/ui/components/notifications_button'
import { AppLangChanger } from '#common/ui/components/app_lang_changer'

interface BreadcrumbItemProps {
  label: string
  href?: string
}

interface AppLayoutProps extends React.PropsWithChildren {
  breadcrumbs?: BreadcrumbItemProps[]
  navMain: NavMainItem[]
  navUser: NavUserOptionsGroup[]
  user: UserDto
  mobileLeftElement?: React.ReactNode
  removePadding?: boolean
}

export default function AppLayout({
  children,
  breadcrumbs = [],
  navMain,
  navUser,
  user,
  mobileLeftElement,
  removePadding = false,
}: AppLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar navMain={navMain} navUser={navUser} />
      <SidebarInset>
        <header className="fixed md:sticky top-0 w-full flex h-14 md:h-16 shrink-0 items-center gap-2 border-b px-4 md:px-6 bg-background z-40">
          {/* Mobile Header */}
          <MobileHeader breadcrumbs={breadcrumbs} leftElement={mobileLeftElement} />

          {/* Desktop Header */}
          <div className="hidden md:flex flex-row items-center gap-2 ">
            <SidebarTrigger className="-ml-1" />
            <Breadcrumb breadcrumbs={breadcrumbs} />
          </div>

          <div className="flex flex-row items-center gap-2 space-x-2 w-full  justify-end">
            <AppLangChanger />
            <ToggleTheme />
            <NotificationsButton />
            <div className="md:hidden">
              <NavUser user={user} options={navUser} />
            </div>
          </div>
        </header>
        <div
          className={
            'flex flex-1 flex-col min-h-0 overflow-auto pb-16 md:pb-0 ' +
            (removePadding ? '' : ' pt-12')
          }
        >
          {children}
        </div>
      </SidebarInset>
      <BottomNavBar />
    </SidebarProvider>
  )
}
