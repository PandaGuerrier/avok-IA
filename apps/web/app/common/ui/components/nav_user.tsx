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
import { ChevronsUpDown, LogOut, Sparkles } from 'lucide-react'
import { ConfirmDialog } from '#common/ui/components/confirm_dialog'
import { Button } from '@workspace/ui/components/button'

export function NavUser({ user, options }: NavUserProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <>
      <ConfirmDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title={'Déconnexion'}
        desc={'Êtes-vous sûr de vouloir vous déconnecter ?'}
        href={'/logout'}
        destructive={true}
        confirmText={'Me déconnecter'}
      />
      <div>
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <UserAvatar className="h-8 w-8 rounded-lg" user={user} />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.pseudo ?? user.firstName}</span>
                  <span className="truncate text-xs hidden md:block">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <UserAvatar className="h-8 w-8 rounded-lg" user={user} />
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.pseudo ?? user.firstName}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className={'gap-2 p-2'}>
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Sparkles className="size-4 text-primary" />
                </div>
                <div className={'flex flex-col gap-0.5 leading-none'}>
                  <span className="font-semibold">Rôle</span>
                  <span className="">{user.role.tag ?? user.role.name}</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {options.map((group, groupIndex) => (
                <React.Fragment key={groupIndex}>
                  {groupIndex > 0 && <DropdownMenuSeparator />}
                  {group.map((option) => {
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
                <span className={'text-destructive'}>Se déconnecter</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  )
}
