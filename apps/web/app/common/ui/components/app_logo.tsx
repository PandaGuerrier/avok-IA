import { ShieldQuestionMark } from 'lucide-react'
import { cn } from '@workspace/ui/lib/utils'
import { Link } from '@inertiajs/react'

interface AppLogoProps {
  className?: string
}

export function AppLogo({ className }: AppLogoProps) {

  return (
    <div className={cn('w-full', className)}>
      <Link href={'/'} prefetch className="flex items-center space-x-2">
        <div className="flex aspect-square size-8 items-center justify-center">
          <ShieldQuestionMark />
        </div>
        <div className="hidden md:grid  ml-1 flex-1 text-left leading-tight text-xs md:text-sm">
          <span className="font-semibold">Avok'IA</span>
          <span className="text-muted-foreground text-xs">Un super jeu de recherche !</span>
        </div>
      </Link>
    </div>
  )
}
