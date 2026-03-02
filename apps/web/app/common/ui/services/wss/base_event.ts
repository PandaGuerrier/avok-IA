export default abstract class BaseEvent {
  abstract channel: string
  abstract handle(data: any): void
}
