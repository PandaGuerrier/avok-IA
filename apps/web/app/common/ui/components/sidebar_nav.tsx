import { type JSX, useState } from 'react'
import { Link, router } from '@inertiajs/react'

import { cn } from '@workspace/ui/lib/utils'
import { buttonVariants } from '@workspace/ui/components/button'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { PermissionActions, PermissionSubject } from '#users/utils/permission'
import { userCan } from '#users/ui/utils'
import useUser from '#auth/ui/hooks/use_user'

export interface SidebarNavItem {
  href: string
  title: string
  icon: JSX.Element
  subject?: PermissionSubject
}

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  currentPath: string
  items: SidebarNavItem[]
}

export default function SidebarNav({ className, currentPath, items, ...props }: SidebarNavProps) {
  const [val, setVal] = useState(currentPath)
  const user = useUser()

  const handleSelect = (e: string) => {
    setVal(e)
    router.visit(e)
  }

  const visibleItems = items.filter(
    (item) => !item.subject || userCan(user, item.subject, PermissionActions.READ)
  )

  return (
    <>
      <div className="py-1 md:hidden">
        <Select value={val} onValueChange={handleSelect}>
          <SelectTrigger className="h-12 sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {visibleItems.map((item) => (
              <SelectItem key={item.href} value={item.href}>
                <div className="flex gap-x-4 px-2 py-1">
                  <span className="scale-125">{item.icon}</span>
                  <span className="text-md">{item.title}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea type="always" className="hidden w-full min-w-40 bg-background md:block">
        <nav
          className={cn('flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1', className)}
          {...props}
        >
          {visibleItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                currentPath === item.href
                  ? 'bg-muted hover:bg-muted'
                  : 'hover:bg-transparent hover:underline',
                'justify-start'
              )}
            >
              <span className="mr-2">{item.icon}</span>
              {item.title}
            </Link>
          ))}
        </nav>
      </ScrollArea>
    </>
  )
}
