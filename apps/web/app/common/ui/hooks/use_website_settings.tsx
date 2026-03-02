import usePageProps from './use_page_props'
import WebsiteSettingsDto from '#common/dtos/website_settings'

export default function useWebsiteSettings() {
  const { websiteSettings } = usePageProps<{ websiteSettings: WebsiteSettingsDto }>()
  return websiteSettings
}
