import { BaseSeeder } from '@adonisjs/lucid/seeders'
import WebsiteSetting from '#common/models/website_setting'

export default class WebsiteSettingSeeder extends BaseSeeder {
  async run() {
    await WebsiteSetting.create({
      isMaintenance: false,
      maintenanceMessage: null,
      maintenanceEndTime: null,
    })
  }
}
