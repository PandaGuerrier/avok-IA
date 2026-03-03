import React from 'react'

interface MobileAdminMenuProps {
  trigger: React.ReactNode
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileAdminMenu(_props: MobileAdminMenuProps) {
  return null
}

export function useHasAdminAccess(): boolean {
  return false
}
