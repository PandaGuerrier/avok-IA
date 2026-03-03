import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface MobileHeaderProps {
  breadcrumbs?: BreadcrumbItem[]
  leftElement?: React.ReactNode
  showBackButton?: boolean
}

export function MobileHeader({
  leftElement,
  showBackButton = true,
}: MobileHeaderProps) {
  const handleBack = () => {
    if (typeof window !== 'undefined') {
      window.history.back()
    }
  }

  const showButton = showBackButton && window.history.length > 1

  return (
    <div className="flex items-center gap-2 min-w-0 flex-1 md:hidden">
      {leftElement}
      {showButton && !leftElement && (
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 -ml-2" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
          <span className="sr-only">Retour</span>
        </Button>
      )}
    </div>
  )
}
