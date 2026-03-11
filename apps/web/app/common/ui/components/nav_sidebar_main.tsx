import { Link, usePage } from '@inertiajs/react'
import { Lock } from 'lucide-react'

import { isSection, type NavMainItem } from '#common/ui/types/navigation'
import { useTutorialStore } from '#game/ui/store/tutorialStore'

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

function getAppKey(url: string): 'instagrume' | 'jaimail' | 'notetrack' | null {
  if (url.includes('/instagrume')) return 'instagrume'
  if (url.includes('/jaimail')) return 'jaimail'
  if (url.includes('/notetrack')) return 'notetrack'
  return null
}

export function NavSidebarMain({ items }: NavSidebarMainProps) {
  const { url: currentPath } = usePage()
  const isUnlocked = useTutorialStore((s) => s.isUnlocked)

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
                  {visibleItems.map((subItem) => {
                    const appKey = getAppKey(subItem.url)
                    const locked = appKey ? !isUnlocked(appKey) : false

                    return (
                      <SidebarMenuItem key={subItem.title}>
                        {locked ? (
                          <SidebarMenuButton
                            tooltip={subItem.lockedHint ?? 'Complète les étapes précédentes pour débloquer'}
                            className="opacity-40 cursor-not-allowed"
                            disabled
                          >
                            <Lock className="h-3 w-3 shrink-0 text-muted-foreground" />
                            {subItem.icon && <subItem.icon className="h-4 w-4 shrink-0" />}
                            <span>{subItem.title}</span>
                          </SidebarMenuButton>
                        ) : (
                          <SidebarMenuButton
                            asChild
                            tooltip={subItem.title}
                            data-tour-id={`nav-item-${subItem.id || subItem.title}`}
                            className={`duration-200 ${isSelected(subItem.url, currentPath) ? 'bg-primary/40 font-medium' : ''}`}
                          >
                            {subItem.url ? (
                              subItem.external ? (
                                <a href={subItem.url} target="_blank" rel="noopener noreferrer">
                                  {subItem.icon && <subItem.icon className="h-4 w-4 shrink-0 " />}
                                  <span>{subItem.title}</span>
                                </a>
                              ) : (
                                <Link href={subItem.url}>
                                  {subItem.imageUrl ? (
                                    <img src={subItem.imageUrl} alt={subItem.title} className="h-12 w-full shrink-0" />
                                  ) : (
                                    subItem.icon && <subItem.icon className="h-4 w-4 shrink-0 " />
                                  )}
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
                        )}
                      </SidebarMenuItem>
                    )
                  })}
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
