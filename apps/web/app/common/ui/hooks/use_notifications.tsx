import usePageProps from './use_page_props'
import NotificationDto from '#users/dtos/notification'

export default function useNotifications() {
  const { notifications } = usePageProps<{ notifications: NotificationDto[] }>()
  return notifications
}
