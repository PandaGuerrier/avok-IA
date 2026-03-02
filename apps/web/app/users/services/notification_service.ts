import User from '#users/models/user'
import Notification from '#users/models/notification'
import transmit from '@adonisjs/transmit/services/main'

export default class NotificationService {
  constructor() { }

  async notify(userUuid: string, notification: Notification) {
    transmit.broadcast(`user/${userUuid}/notifications::add`, {
      notification: notification.toJSON(),
    })
  }

  async markAsRead(user: User, notificationUuid: string) {
    const notification = await Notification.query()
      .where('uuid', notificationUuid)
      .andWhere('user_uuid', user.uuid)
      .firstOrFail()

    notification.isRead = true
    await notification.save()
  }

  async delete(user: User, notificationUuid: string) {
    const notification = await Notification.query()
      .where('uuid', notificationUuid)
      .andWhere('user_uuid', user.uuid)
      .firstOrFail()

    await notification.delete()
  }
}
