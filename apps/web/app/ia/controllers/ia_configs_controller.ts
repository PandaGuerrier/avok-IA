import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import IaConfig from '#ia/models/ia_config'

const configSchema = vine.compile(
  vine.object({
    name: vine.string().minLength(1).maxLength(100),
    endpoint: vine.string().url().maxLength(500),
    apiKey: vine.string().minLength(1).maxLength(500),
    model: vine.string().minLength(1).maxLength(100),
  })
)

export default class IaConfigsController {
  async index({ inertia }: HttpContext) {
    const configs = await IaConfig.query().orderBy('createdAt', 'asc')
    return inertia.render('ia/ia_config', { configs })
  }

  async store({ request, response }: HttpContext) {
    const payload = await request.validateUsing(configSchema)
    await IaConfig.create(payload)
    return response.redirect().back()
  }

  async update({ params, request, response }: HttpContext) {
    const config = await IaConfig.findByOrFail('uuid', params.uuid)
    const payload = await request.validateUsing(configSchema)
    config.merge(payload)
    await config.save()
    return response.redirect().back()
  }

  async activate({ params, response }: HttpContext) {
    await IaConfig.query().update({ isActive: false })
    const config = await IaConfig.findByOrFail('uuid', params.uuid)
    config.isActive = true
    await config.save()
    return response.redirect().back()
  }

  async destroy({ params, response }: HttpContext) {
    const config = await IaConfig.findByOrFail('uuid', params.uuid)
    if (!config.isActive) {
      await config.delete()
    }
    return response.redirect().back()
  }
}
