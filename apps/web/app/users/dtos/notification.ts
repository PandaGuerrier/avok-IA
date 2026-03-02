import { BaseModelDto } from '@adocasts.com/dto/base'
import Notification from '#users/models/notification'

export default class NotificationDto extends BaseModelDto {
  declare uuid: string
  declare userUuid: string
  declare title: string
  declare message: string
  declare isRead: boolean
  declare link: string | null
  declare type: string // default, friendship, system, etc.

  declare createdAt: string
  declare updatedAt: string

  constructor(notification?: Notification) {
    super()

    if (!notification) return

    this.uuid = notification.uuid
    this.userUuid = notification.userUuid
    this.title = notification.title
    this.message = notification.message
    this.isRead = notification.isRead
    this.link = notification.link
    this.type = notification.type
    this.createdAt = notification.createdAt.toISO()!
    this.updatedAt = notification.updatedAt ? notification.updatedAt.toISO()! : ''
  }

  static fromJSON(json: any): NotificationDto {
    const dto = new NotificationDto()
    dto.uuid = json.uuid
    dto.userUuid = json.userUuid
    dto.title = json.title
    dto.message = json.message
    dto.isRead = json.isRead
    dto.link = json.link
    dto.type = json.type
    dto.createdAt = json.createdAt
    dto.updatedAt = json.updatedAt
    return dto
  }
}
