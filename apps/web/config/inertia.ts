import { defineConfig } from '@adonisjs/inertia'
import type { InferSharedProps } from '@adonisjs/inertia/types'
import logger from '@adonisjs/core/services/logger'
import i18nManager from '@adonisjs/i18n/services/main'
import { isSSREnableForPage } from '#config/ssr'

import AbilitiesService from '#dashboard/services/abilities_service'
import UserDto from '#users/dtos/user'
import WebsiteSetting from '#common/models/website_setting'
import WebsiteSettingsDto from '#common/dtos/website_settings'
import NotificationDto from '#users/dtos/notification'
import env from '#start/env'

const inertiaConfig = defineConfig({
  /**
   * Path to the Edge view that will be used as the root view for Inertia responses
   */
  rootView: 'inertia_layout',

  /**
   * Data that should be shared with all rendered pages
   */
  sharedData: {
    posthog: {
      apiKey: env.get('POSTHOG_API_KEY'),
      host: env.get('POSTHOG_HOST'),
    },
    locale: (ctx) => ctx.inertia.always(() => ctx.i18n?.locale || i18nManager.config.defaultLocale),
    fallbackLocale: (ctx: any) => ctx.inertia.always(() => ctx.i18n?.fallbackLocale || 'en'),
    websiteSettings: async (_) => {
      const settings = await WebsiteSetting.query().firstOrFail()
      return new WebsiteSettingsDto(settings)
    },
    user: async ({ auth }) => {
      if (auth?.user) {
        // @ts-ignore
        await auth.user.load('role')
        return new UserDto(auth?.user)
      }
    },
    notifications: async ({ auth }) => {
      if (auth?.user) {
        const notifications = await auth.user
          .related('notifications')
          .query()
          .orderBy('created_at', 'desc')
          .limit(10)

        return notifications.map((notification) => new NotificationDto(notification))
      }

      return []
    },
    flashMessages: (ctx) => ctx.session?.flashMessages.all(),
    abilities:  async (ctx) => {
      if (!ctx.auth?.user) {
        return []
      }

      // @ts-ignore
      await ctx.auth.user.load('role')
      return new AbilitiesService().getAllAbilities(ctx.auth?.user)
    },
  },

  /**
   * Options for the server-side rendering
   */
  ssr: {
    enabled: true,
    entrypoint: 'app/core/ui/app/ssr.tsx',
    pages: (_, page) => {
      const ssrEnabled = isSSREnableForPage(page)
      logger.debug(`Page "${page}" SSR enabled: ${ssrEnabled}`)
      return ssrEnabled
    },
  },
})

export default inertiaConfig

declare module '@adonisjs/inertia/types' {
  export interface SharedProps extends InferSharedProps<typeof inertiaConfig> {}
}
