import { Subscription, Transmit } from '@adonisjs/transmit-client'
import BaseEvent from '#common/ui/services/wss/base_event'
import NotificationAddEvent from '#common/ui/services/wss/events/notification_add_event'
import UserDto from '#users/dtos/user'

export default class TransmitService {
  declare transmit: Transmit

  constructor(baseUrl: string) {
    this.transmit = new Transmit({
      baseUrl,
    })
  }

  public init(user?: UserDto) {
    this.transmit.on('connected', () => {
      console.log('🟢 Transmit connected')
    })

    if (!user) return
    this._subscribe(new NotificationAddEvent(user.uuid))
  }

  public close() {
    this.transmit.close()
  }

  private _subscribe(event: BaseEvent): Subscription {
    console.log(`Subscribing to channel: ${event.channel}`)
    const subscription = this.transmit.subscription(event.channel)
    Promise.all([subscription.create()])

    subscription.onMessage((msg) => event.handle(msg))
    return subscription
  }
}
