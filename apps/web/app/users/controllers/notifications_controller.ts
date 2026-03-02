import type { HttpContext } from '@adonisjs/core/http'
import { inject } from '@adonisjs/core/container'
import NotificationService from '#users/services/notification_service'

@inject()
export default class NotificationsController {
    constructor(private notificationService: NotificationService) { }

    async read({ response, auth, params }: HttpContext) {
        await this.notificationService.markAsRead(auth.user!, params.uuid)
        return response.noContent()
    }

    async destroy({ response, auth, params }: HttpContext) {
        await this.notificationService.delete(auth.user!, params.uuid)
        return response.noContent()
    }
}
