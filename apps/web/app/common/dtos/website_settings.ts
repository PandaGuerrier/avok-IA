import { BaseDto } from '@adocasts.com/dto/base'
import WebsiteSetting from '#common/models/website_setting'
import { DateTime } from 'luxon'

export default class WebsiteSettingsDto extends BaseDto {
  declare isMaintenance: boolean
  declare maintenanceMessage: string | null
  declare maintenanceEndTime: DateTime | null

  constructor(model: WebsiteSetting) {
    super()

    this.isMaintenance = model.isMaintenance
    this.maintenanceMessage = model.maintenanceMessage
    this.maintenanceEndTime = model.maintenanceEndTime
  }
}
