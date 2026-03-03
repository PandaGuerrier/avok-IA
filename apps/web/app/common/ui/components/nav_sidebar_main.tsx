import { Link, usePage } from '@inertiajs/react'

import { isSection, type NavMainItem } from '#common/ui/types/navigation'

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@workspace/ui/components/sidebar'
export interface NavSidebarMainProps {
  items: NavMainItem[]
}

export function NavSidebarMain({ items }: NavSidebarMainProps) {
  const { url: currentPath } = usePage()

  return (
    <>
      {items.map((item) => {
        if (isSection(item)) {
          const visibleItems = item.items

          if (visibleItems.length === 0) return null

          return (
            <SidebarGroup key={item.title}>
              <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleItems.map((subItem) => (
                    <SidebarMenuItem key={subItem.title}>
                      <SidebarMenuButton
                        asChild
                        tooltip={subItem.title}
                        data-tour-id={`nav-item-${subItem.id || subItem.title}`}
                        className={`duration-200 ${isSelected(subItem.url, currentPath) ? 'bg-accent font-medium' : ''}`}
                      >
                        {subItem.url ? (
                          subItem.external ? (
                            <a href={subItem.url} target="_blank" rel="noopener noreferrer">
                              {subItem.icon && <subItem.icon className="h-4 w-4 shrink-0 " />}
                              <span>{subItem.title}</span>
                            </a>
                          ) : (
                            <Link href={subItem.url}>
                              {subItem.icon && <subItem.icon className="h-4 w-4 shrink-0 " />}
                              <span>{subItem.title}</span>
                            </Link>
                          )
                        ) : (
                          <span>
                            {subItem.icon && <subItem.icon className="h-4 w-4 shrink-0" />}
                            <span>{subItem.title}</span>
                          </span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        } else {
          {
            return (
              <SidebarGroup key={item.title}>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.title}
                        data-tour-id={`nav-item-${item.title}`}
                        className={`duration-200 ${isSelected(item.url, currentPath) ? 'bg-accent font-medium' : ''}`}
                      >
                        {item.url ? (
                          item.external ? (
                            <a href={item.url} target="_blank" rel="noopener noreferrer">
                              {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                              <span>{item.title}</span>
                            </a>
                          ) : (
                            <Link href={item.url}>
                              {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                              <span>{item.title}</span>
                            </Link>
                          )
                        ) : (
                          <span>
                            {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
                            <span>{item.title}</span>
                          </span>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )
          }
        }
      })}
    </>
  )
}

function isSelected(itemUrl: string, currentPath: string): boolean {
  const pathname = currentPath.split('?')[0]
  return pathname === itemUrl
}
