import React from 'react'

import { NavSidebarMain } from '#common/ui/components/nav_sidebar_main'
import { AppLogo } from '#common/ui/components/app_logo'

import type { NavMainItem } from '#common/ui/types/navigation'

import {
  Sidebar,
  SidebarContent, SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@workspace/ui/components/sidebar'
import useUser from '#auth/ui/hooks/use_user'

import { NavUser } from '#common/ui/components/nav_user'
import TimerWidget from '#game/ui/components/TimerWidget'
import GuiltyWidget from '#game/ui/components/GuiltyWidget'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  navMain: NavMainItem[]
  navUser: any[]
}

export function AppSidebar({ navMain, navUser, ...props }: AppSidebarProps) {
  const user = useUser()

  return (
    <Sidebar {...props} variant={'floating'}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex w-full items-center justify-center px-4 py-3">
                <AppLogo />
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavSidebarMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-6">
          <GuiltyWidget />
          <TimerWidget />
        </div>
        <NavUser user={user} options={navUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
