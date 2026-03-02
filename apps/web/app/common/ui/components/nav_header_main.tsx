import { Link } from '@inertiajs/react'

import { isSection, type NavMainItem } from '#common/ui/types/navigation'
import HeaderDropdown from '#common/ui/components/header_dropdown'
import useUser from '#auth/ui/hooks/use_user'
import { PermissionActions } from '#users/utils/permission'
import { userCan } from '#users/ui/utils'

export interface NavHeaderMainProps {
  items: NavMainItem[]
}

export function NavHeaderMain({ items }: NavHeaderMainProps) {
  const user = useUser()

  return (
    <nav className="flex items-center space-x-4">
      {items.map((item, index) => {
        if (isSection(item)) {
          const visibleItems = item.items.filter(
            (subItem) => !subItem.subject || userCan(user, subItem.subject, PermissionActions.READ)
          )

          if (visibleItems.length === 0) {
            return null
          }
          return (
            <HeaderDropdown
              key={index}
              trigger={<div className="flex items-center">{item.title}</div>}
              width={'flex w-full min-w-max justify-center'}
              align="center"
              content={
                <div className="flex max-w-xl space-x-2  p-2">
                  {visibleItems.map((subItem, subIndex) => {
                    if (subItem.external) {
                      return (
                        <a
                          key={subIndex}
                          href={subItem.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex select-none items-center space-x-2 rounded-md px-2 py-1.5 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          {subItem.icon && <subItem.icon className="h-4 w-4 shrink-0" />}
                          <span>{subItem.title}</span>
                        </a>
                      )
                    } else {
                      return (
                        <Link
                          key={subIndex}
                          href={subItem.url}
                          className="flex select-none items-center space-x-2 rounded-md px-2 py-1.5 text-sm leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        >
                          {subItem.icon && <subItem.icon className="h-4 w-4 shrink-0" />}
                          <span>{subItem.title}</span>
                        </Link>
                      )
                    }
                  })}
                </div>
              }
            />
          )
        } else {
          if (!item.subject || userCan(user, item.subject, PermissionActions.READ)) {
            if (item.external) {
              return (
                <a
                  key={index}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  {item.icon && <item.icon className="mr-2 h-4 w-4 shrink-0" />}
                  {item.title}
                </a>
              )
            } else {
              return (
                <Link
                  key={index}
                  href={item.url}
                  className="flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                >
                  {item.icon && <item.icon className="mr-2 h-4 w-4 shrink-0" />}
                  {item.title}
                </Link>
              )
            }
          } else {
            return null
          }
        }
      })}
    </nav>
  )
}
