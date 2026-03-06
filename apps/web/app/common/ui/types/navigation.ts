import { LucideIcon } from 'lucide-react'

import UserDto from '#users/dtos/user'

interface ItemNav {
  title: string
  url: string
  icon?: LucideIcon
  imageUrl?: string
  isActive?: boolean
  external?: boolean
  id?: string
}

interface NavMainSection {
  title: string
  items: ItemNav[]
}

export type NavMainItem = NavMainSection | ItemNav

export function isSection(item: NavMainSection | ItemNav): item is NavMainSection {
  return 'items' in item
}

export interface NavMainProps {
  items: NavMainItem[]
}

export type NavUserOptionsGroup = {
  title: string
  url: string
  icon: LucideIcon
  shortcut?: string
}[]

export interface NavUserProps {
  user: UserDto
  options: NavUserOptionsGroup[]
}
