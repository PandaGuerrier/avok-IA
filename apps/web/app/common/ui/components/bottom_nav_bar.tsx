import React, { useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { Home, MessageSquare, FileQuestion, Settings2Icon, Shield } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { MobileAdminMenu, useHasAdminAccess } from '#common/ui/components/mobile_admin_menu'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  matchPaths?: string[]
}

const navItems: NavItem[] = [
  {
    label: 'Accueil',
    href: '/dashboard',
    icon: Home,
    matchPaths: ['/dashboard'],
  },
  {
    label: 'Channels',
    href: '/channels',
    icon: MessageSquare,
    matchPaths: ['/channels'],
  },
  {
    label: 'Sondages',
    href: '/surveys',
    icon: FileQuestion,
    matchPaths: ['/surveys', '/dashboard/surveys'],
  },
  {
    label: 'Paramètres',
    href: '/settings',
    icon: Settings2Icon,
    matchPaths: ['/settings'],
  },
]

export function BottomNavBar() {
  const { url } = usePage()
  const hasAdminAccess = useHasAdminAccess()
  const [adminMenuOpen, setAdminMenuOpen] = useState(false)

  const isActive = (item: NavItem) => {
    if (item.matchPaths) {
      return item.matchPaths.some((path) => url.startsWith(path))
    }
    return url.startsWith(item.href)
  }

  const isAdminActive =
    url.startsWith('/dashboard/admin') ||
    url.startsWith('/dashboard/users') ||
    url.startsWith('/dashboard/publicities')

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex h-16 items-center justify-around pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'text-primary')} />
              <span className={cn('font-medium', active && 'text-primary')}>
                {item.label}
              </span>
            </Link>
          )
        })}

        {hasAdminAccess && (
          <MobileAdminMenu
            open={adminMenuOpen}
            onOpenChange={setAdminMenuOpen}
            trigger={
              <button
                className={cn(
                  'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors text-muted-foreground hover:text-foreground'
                )}
              >
                <Shield className={cn('h-5 w-5', isAdminActive && 'text-primary')} />
                <span className={cn('font-medium', isAdminActive && 'text-primary')}>
                  Admin
                </span>
              </button>
            }
          />
        )}
      </div>
    </nav>
  )
}
