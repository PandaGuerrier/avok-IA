import React from 'react'

import { NavUser } from '#common/ui/components/nav_user'
import { AppLogo } from '#common/ui/components/app_logo'
import { NavHeaderMain } from '#common/ui/components/nav_header_main'
import Breadcrumb from '#common/ui/components/breadcrumbs'

import type { NavMainItem, NavUserOptionsGroup } from '#common/ui/types/navigation'

import UserDto from '#users/dtos/user'
import { useTranslation } from '#common/ui/hooks/use_translation'
import { AppLangChanger } from '#common/ui/components/app_lang_changer'
import { Button } from '@workspace/ui/components/button'

interface BreadcrumbItemProps {
  label: string
  href?: string
}

interface AppLayoutProps extends React.PropsWithChildren {
  breadcrumbs?: BreadcrumbItemProps[]
  navMain: NavMainItem[]
  navUser: NavUserOptionsGroup[]
  user: UserDto
}

export default function AppHeaderLayout({
  children,
  breadcrumbs = [],
  navMain,
  navUser,
  user,
}: AppLayoutProps) {
  const { t } = useTranslation()
  return (
    <>
      <div className={'flex justify-center mt-3'}>
        <div className="flex mt-3 backdrop-blur-xs justify-center border-sidebar-border/40 border rounded-full bg-background/80 fixed top-0 z-30 w-full max-w-7xl mx-auto shadow-sm px-12">
          <div className="flex h-16 w-full items-center ml-3">
            <div className={'w-1/3'}>
              <AppLogo />
            </div>

            <div className=" hidden h-full items-center justify-center w-1/3 space-x-6 lg:flex">
              <NavHeaderMain items={navMain} />
            </div>

            <div className="ml-auto flex items-center">
              <div className="relative flex items-center space-x-3 px-3 md:px-0">
                <AppLangChanger />
                {user ? (
                  <NavUser user={user} options={navUser} />
                ) : (
                  <>
                    <Button href="/sign-up" variant={"ghost"}>{t('auth.name.register')}</Button>
                    <Button href="/login">{t('auth.name.login')}</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="border-sidebar-border/70 flex w-full">
        <Breadcrumb breadcrumbs={breadcrumbs} />
      </div>

      <main className="mx-auto overflow-x-hidden flex h-full w-full flex-1 flex-col">
        {children}
      </main>
    </>
  )
}
