import { defineConfig } from '@adonisjs/inertia'
import type { InferSharedProps } from '@adonisjs/inertia/types'
import logger from '@adonisjs/core/services/logger'
import i18nManager from '@adonisjs/i18n/services/main'
import { isSSREnableForPage } from '#config/ssr'

import UserDto from '#users/dtos/user'
import GameDto from '#game/dtos/game'
import Game from '#game/models/game'
import IaConfig from '#ia/models/ia_config'
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
    user: async ({ auth }) => {
      if (auth?.user) {
        // @ts-ignore
        await auth.user.load('role')
        return new UserDto(auth?.user)
      }
    },
    iaModel: async () => {
      const config = await IaConfig.query().where('isActive', true).first()
      return config?.model ?? 'o3-mini'
    },
    flashMessages: (ctx) => ctx.session?.flashMessages.all(),
    game: async ({ auth, params }: any) => {
      if (auth?.user && params?.uuid) {
        const game = await Game.findBy('uuid', params.uuid)
        if (game && game.userUuid === auth.user.uuid) {
          await game.load('choices')
          await game.load('proofs')
          await game.load('user')
          return new GameDto(game)
        }
      }
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
