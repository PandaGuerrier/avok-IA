import { useTranslation } from '#common/ui/hooks/use_translation'
// import HeaderDropdown from '#common/ui/components/header_dropdown'
import { useEffect, useState } from 'react'

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
  const { language } = useTranslation()

  const getLangSafe = (code: string): LangOption => languages[code] ?? languages.en
  const [_, setActLang] = useState<LangOption>(getLangSafe(String(language)))

  useEffect(() => {
    setActLang(getLangSafe(String('fr')))
  }, [language])

  /* const handleSelect = async (code: string) => {
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
  */

  return <></>
}
