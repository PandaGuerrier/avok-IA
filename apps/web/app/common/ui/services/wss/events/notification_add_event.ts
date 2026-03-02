import BaseEvent from '#common/ui/services/wss/base_event'
import NotificationDto from '#users/dtos/notification'
import { useNotificationsStore } from '#common/ui/stores/use_notifications_store'

export default class NotificationAddEvent extends BaseEvent {
  channel = 'notifications::add'

  constructor(userUuid?: string) {
    super()
    if (userUuid) {
      this.channel = `user/${userUuid}/notifications::add`
    }
  }

  handle(data: any): void {
    console.log('New notif on notifications::add channel:', data)
    const notif = NotificationDto.fromJSON(data.notification)
    useNotificationsStore.getState().addNotification(notif)
  }
}
