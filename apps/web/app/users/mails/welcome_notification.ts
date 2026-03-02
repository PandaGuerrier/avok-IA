import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'
import router from '@adonisjs/core/services/router'
import i18nManager from '@adonisjs/i18n/services/main'

import User from '#users/models/user'
import { primaryDomain } from '#start/domains'

export default class WelcomeNotification extends BaseMail {
  from = env.get('EMAIL_FROM')
  subject = 'Welcome!'

  constructor(
    private user: User,
    private token: string,
  ) {
    super()
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  async prepare() {
    const i18n = i18nManager.locale(i18nManager.defaultLocale)

    const verificationUrl = router.makeUrl(
      'verification.token',
      { token: this.token },
      { prefixUrl: env.get('VITE_API_URL'), domain: primaryDomain }
    )

    this.message
      .to(this.user.email)
      .subject(i18n.t('users.emails.welcome.subject', { full_name: this.user.fullName }))

    this.message.htmlView('users::emails/welcome', {
      username: this.user.fullName,
      full_name: this.user.fullName,
      verificationUrl,
      i18n,
    })
  }
}
