import React from 'react'
import { Link } from '@inertiajs/react'
import {
  Settings2,
  Users,
  Shield,
  FileQuestion,
  MessageSquareText,
  TornadoIcon,
  Scale3DIcon,
  Flag,
  Trash2,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@workspace/ui/components/sheet'
import useUser from '#auth/ui/hooks/use_user'
import { userCan } from '#users/ui/utils'
import { PermissionActions, PermissionSubject } from '#users/utils/permission'
import { cn } from '@workspace/ui/lib/utils'

interface AdminMenuItem {
  label: string
  href: string
  icon: React.ElementType
  subject: PermissionSubject
}

const adminMenuItems: AdminMenuItem[] = [
  {
    label: 'Paramètres',
    href: '/dashboard/admin/settings',
    icon: Settings2,
    subject: 'website_settings',
  },
  {
    label: 'Utilisateurs',
    href: '/dashboard/users',
    icon: Users,
    subject: 'user',
  },
  {
    label: 'Rôles & Permissions',
    href: '/dashboard/admin/roles',
    icon: Shield,
    subject: 'role',
  },
  {
    label: 'Sondages (Admin)',
    href: '/dashboard/surveys/admin',
    icon: FileQuestion,
    subject: 'survey',
  },
  {
    label: 'Channels (Admin)',
    href: '/dashboard/admin/channels',
    icon: MessageSquareText,
    subject: 'website_settings',
  },
  {
    label: 'Signalements',
    href: '/dashboard/admin/reports',
    icon: Flag,
    subject: 'post',
  },
  {
    label: 'Posts supprimés (IA)',
    href: '/dashboard/admin/deleted-posts',
    icon: Trash2,
    subject: 'post',
  },
  {
    label: 'Publicités',
    href: '/dashboard/publicities',
    icon: TornadoIcon,
    subject: 'publicity',
  },
  {
    label: 'Publicité Admin',
    href: '/dashboard/publicities/admin',
    icon: Scale3DIcon,
    subject: 'publicity_admin',
  },
]

interface MobileAdminMenuProps {
  trigger: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileAdminMenu({ trigger, open, onOpenChange }: MobileAdminMenuProps) {
  const user = useUser()

  const visibleItems = adminMenuItems.filter((item) =>
    userCan(user, item.subject, PermissionActions.READ)
  )

  if (visibleItems.length === 0) {
    return null
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="bottom" className="h-auto max-h-[70vh] rounded-t-xl">
        <SheetHeader className="text-left">
          <SheetTitle>Administration</SheetTitle>
        </SheetHeader>
        <nav className="mt-4 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  'active:bg-accent/80'
                )}
              >
                <Icon className="h-5 w-5 text-muted-foreground" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

export function useHasAdminAccess(): boolean {
  const user = useUser()
  return adminMenuItems.some((item) =>
    userCan(user, item.subject, PermissionActions.READ)
  )
}
