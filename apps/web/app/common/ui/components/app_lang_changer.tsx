import { useTranslation } from '#common/ui/hooks/use_translation'
// import HeaderDropdown from '#common/ui/components/header_dropdown'
import { useEffect, useState } from 'react'
import HeaderDropdown from '#common/ui/components/header_dropdown'

interface LangOption {
  id: string
  title: string
  emoji: string
}

const languages: Record<string, LangOption> = {
  fr: {
    id: 'fr',
    title: 'Français',
    emoji: '🇫🇷',
  },
  en: {
    id: 'en',
    title: 'English',
    emoji: '🇬🇧',
  },
}

export function AppLangChanger() {
  const { language, changeLanguage } = useTranslation()

  const getLangSafe = (code: string): LangOption => languages[code] ?? languages.en
  const [actLang, setActLang] = useState<LangOption>(getLangSafe(String(language)))

  useEffect(() => {
    setActLang(getLangSafe(String(language)))
  }, [language])

  useEffect(() => {
    async function loadLanguageFromStorage() {
      const storedLanguage = localStorage.getItem('i18nextLng')
      if (storedLanguage && storedLanguage !== language) {
        setActLang(getLangSafe(storedLanguage))
      }
    }
    loadLanguageFromStorage()
  }, [])

  const handleSelect = async (code: string) => {
    if (code === actLang.id) return
    await changeLanguage(code)
    setActLang(getLangSafe(code))
  }

  return (
    <div>
      <HeaderDropdown
        key={0}
        trigger={
          <div className="flex items-center text-lg">
            {actLang.emoji}
            <span className="sr-only">{actLang.title}</span>
          </div>
        }
        align={'right'}
        content={
          <div className="p-1">
            {Object.values(languages).map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => handleSelect(lang.id)}
                className={`flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground ${
                  lang.id === actLang.id ? 'bg-accent/30 font-medium' : ''
                }`}
              >
                <span className="text-lg">{lang.emoji}</span>
                <span>{lang.title}</span>
              </button>
            ))}
          </div>
        }
      />
    </div>
  )
}
