import { ShieldQuestionMark } from 'lucide-react'
import { useTranslation } from '#common/ui/hooks/use_translation'
import { cn } from '@workspace/ui/lib/utils'
import { Link } from '@inertiajs/react'

interface AppLogoProps {
  className?: string
}

export function AppLogo({ className }: AppLogoProps) {
  const { t } = useTranslation()

  return (
    <div className={cn('w-full', className)}>
      <Link href={'/'} prefetch className="flex items-center space-x-2">
        <div className="flex aspect-square size-8 items-center justify-center">
          <ShieldQuestionMark />
        </div>
        <div className="hidden md:grid  ml-1 flex-1 text-left leading-tight text-xs md:text-sm">
          <span className="font-semibold">{t('common.logo.title')}</span>
          <span className="text-muted-foreground text-xs">{t('common.logo.description')}</span>
        </div>
      </Link>
    </div>
  )
}
