import { Moon, Sun, Monitor } from 'lucide-react'
import { type Theme, useTheme } from '@workspace/ui/components/theme-provider'
import { useTranslation } from '#common/ui/hooks/use_translation'
import { useRef, useEffect, useState } from 'react'
import { Button } from '@workspace/ui/components/button'

const options: { value: Theme; icon: typeof Sun }[] = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
  { value: 'system', icon: Monitor },
]

export function ToggleTheme() {
  const { theme, setTheme } = useTheme()
  const { t, language } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })

  function updateIndicator() {
    const container = containerRef.current
    if (!container) return

    const activeIndex = options.findIndex((o) => o.value === theme)
    const buttons = container.querySelectorAll<HTMLButtonElement>('[data-theme-btn]')
    const activeBtn = buttons[activeIndex]

    if (activeBtn) {
      setIndicatorStyle({
        left: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth,
      })
    }
  }

  useEffect(() => {
    updateIndicator()
  }, [language])

  useEffect(() => {
    updateIndicator()
  }, [theme])

  return (
    <div
      ref={containerRef}
      className="relative flex items-center gap-0.5 rounded-full bg-muted/80 p-1 backdrop-blur-sm border border-border/50"
      role="tablist"
      aria-label={t('common.theme.toggle')}
    >
      <div
        className="absolute top-1 h-[calc(100%-0.5rem)] rounded-full bg-background shadow-sm transition-all duration-300 ease-out"
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
      />

      {options.map(({ value, icon: Icon }) => {
        const isActive = theme === value

        return (
          <Button
            size={"icon-sm"}
            variant={"ghost"}
            key={value}
            data-theme-btn
            role="tab"
            aria-selected={isActive}
            onClick={() => setTheme(value)}
            className={
              'relative z-10 flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors duration-200 cursor-pointer ' +
              (isActive
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground/70')
            }
            title={t(`common.theme.${value}`)}
          >
            <Icon className="h-3.5 w-3.5" />
          </Button>
        )
      })}
    </div>
  )
}
