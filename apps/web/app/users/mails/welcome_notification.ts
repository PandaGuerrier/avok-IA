import { BaseMail } from '@adonisjs/mail'
import env from '#start/env'
import router from '@adonisjs/core/services/router'

import User from '#users/models/user'

export default class WelcomeNotification extends BaseMail {
  from = env.get('EMAIL_FROM')
  subject = 'Welcome!'

  constructor(
    private user: User,
    private token: string,
  ) {
    super()
    this.subject = "Bienvenue sur notre plateforme !"
  }

  /**
   * The "prepare" method is called automatically when
   * the email is sent or queued.
   */
  async prepare() {
    const verificationUrl = router.makeUrl(
      'verification.token',
      { token: this.token },
      { prefixUrl: env.get('VITE_API_URL') }
    )

    this.message.to(this.user.email).subject(this.subject)

    this.message.htmlView('users::emails/welcome', {
      username: this.user.fullName,
      verificationUrl,
    })
  }
}
