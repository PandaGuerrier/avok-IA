import { useTranslation as useReactI18nextTranslation } from 'react-i18next'
import { useEffect } from 'react'

export type SimpleTFunction = (key: string | string[], options?: Record<string, unknown>) => string

interface I18nService {
  t: SimpleTFunction
  changeLanguage: (lang: string) => Promise<void>
  language: string
  i18n: ReturnType<typeof useReactI18nextTranslation>['i18n']
  getTranslationFrom: (
    translations: Record<string, string> | null | undefined,
    locale?: string | null
  ) => string
}

export function useTranslation(): I18nService {
  const { t, i18n } = useReactI18nextTranslation()

  useEffect(() => {
    async function loadLanguageFromStorage() {
      const storedLanguage = localStorage.getItem('i18nextLng')
      if (storedLanguage && storedLanguage !== i18n.language) {
        await i18n.changeLanguage(storedLanguage)
      }
    }
    loadLanguageFromStorage()
  }, [])

  return {
    t: (key, options) => t(key, options),
    changeLanguage: async (lang: string) => {
      if (i18n.language !== lang) {
        await i18n.changeLanguage(lang)
        localStorage.setItem('i18nextLng', lang) // Persist the selected language
      }
    },
    language: i18n.language,
    i18n,
    getTranslationFrom: (translations, locale = undefined) => {
      if (!translations) return ''
      if (!locale) locale = i18n.language
      return (
        translations[locale] ??
        translations['fr'] ??
        translations['en'] ??
        Object.values(translations)[0] ??
        ''
      )
    },
  }
}
