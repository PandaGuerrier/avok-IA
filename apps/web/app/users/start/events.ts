import emitter from '@adonisjs/core/services/emitter'
import VerificationToken from '#users/models/verification_token'

emitter.on('user:registered', async function (data) {

  const token = await VerificationToken.create({
    userUuid: data.user.uuid,
  })

  await token.sendMail()
})
