import { Moon, Sun } from 'lucide-react'

import { Button } from '@workspace/ui/components/button'
import { Theme, themes, useTheme } from '@workspace/ui/components/theme-provider'
import useUser from '#auth/ui/hooks/use_user'
import HeaderDropdown from '#common/ui/components/header_dropdown'

export function ToggleTheme() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const user = useUser()

  if (user && user.role.permissions.includes('theme:access')) {


    const visibleThemes = themes.filter((thm) => {
      if (!thm.default) {
        return user.role.permissions.includes('theme:' + thm.id)
      }
      return true
    })

    return (
      <div>
        <HeaderDropdown
          key={0}
          trigger={
            <div className="flex items-center text-lg">
              {themes[themes.findIndex((t) => t.id === theme)]?.emoji}
              <span className="sr-only">
                {themes[themes.findIndex((t) => t.id === theme)]?.title}
              </span>
            </div>
          }
          content={
            <div className="p-1 space-y-1">
              {Object.values(visibleThemes).map((thm) => (
                <button
                  key={thm.id}
                  type="button"
                  onClick={() => setTheme(thm.id as Theme)}
                  className={`flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground ${
                    theme === thm.id ? 'bg-accent/30 font-medium' : ''
                  }`}
                >
                  <span className="text-lg">{thm.emoji}</span>
                  <span>{thm.title}</span>
                </button>
              ))}
            </div>
          }
        />
      </div>
    )
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
