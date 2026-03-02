import React, { useState } from 'react'
import { Link } from '@inertiajs/react'

import { UserAvatar } from '#common/ui/components/user_avatar'
import type { NavUserProps } from '#common/ui/types/navigation'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { userCan } from '#users/ui/utils'
import { PermissionActions } from '#users/utils/permission'
import { ChevronsUpDown, LogOut } from 'lucide-react'
import { ConfirmDialog } from '#common/ui/components/confirm_dialog'
import { Button } from '@workspace/ui/components/button'
import { useTranslation } from '#common/ui/hooks/use_translation'

export function NavUser({ user, options }: NavUserProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { t } = useTranslation()

  return (
    <>
      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={t('common.layout.navUser.logoutTitle')}
        desc={t('common.layout.navUser.logoutDesc')}
        href={'/logout'}
        destructive={true}
        confirmText={t('common.layout.navUser.logoutConfirm')}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={'outline'}
            size="lg"
            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          >
            <UserAvatar className="h-8 w-8 rounded-lg" user={user} />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.fullName}</span>
              <span className="truncate text-xs hidden md:block">{user.email}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
          side={'bottom'}
          align="end"
          sideOffset={4}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <UserAvatar className="h-8 w-8 rounded-lg" user={user} />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.fullName}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {options.map((group, groupIndex) => (
            <React.Fragment key={groupIndex}>
              {groupIndex > 0 && <DropdownMenuSeparator />}
              {group.map((option) => {
                if (option.subject && !userCan(user, option.subject, PermissionActions.READ)) return

                return (
                  <Link key={option.title} href={option.url} className={'w-full'}>
                    <DropdownMenuItem className="gap-2 cursor-pointer">
                      <option.icon className={'h-4 w-4'} />
                      {option.title}
                    </DropdownMenuItem>
                  </Link>
                )
              })}
            </React.Fragment>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer gap-2 text-destructive hover:text-primary "
            onSelect={() => setIsDialogOpen(true)}
          >
            <LogOut className={'text-destructive'} />
            <span className={'text-destructive'}>{t('common.layout.navUser.logout')}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
