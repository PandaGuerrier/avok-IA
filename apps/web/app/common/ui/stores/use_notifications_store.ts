import { create } from 'zustand'
import NotificationDto from '#users/dtos/notification'

type NotificationState = {
  notifications: NotificationDto[]
  addNotifications: (notifications: NotificationDto[]) => void
  addNotification: (notification: NotificationDto) => void
  markAsRead: (notificationUuid: string) => void
  deleteNotification: (notificationUuid: string) => void
  markAllAsRead: () => void
  reset: () => void
}

export const useNotificationsStore = create<NotificationState>((set) => ({
  notifications: [],
  reset: () => set({ notifications: [] }),
  addNotifications: (notifications) =>
    set((state) => {
      const newNotifications = notifications.filter(
        (n) => !state.notifications.some((existing) => existing.uuid === n.uuid)
      )
      return {
        notifications: [...state.notifications, ...newNotifications],
      }
    }),
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),
  markAsRead: async (notificationUuid) => {
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.uuid === notificationUuid
          ? { ...notification, isRead: true }
          : notification
      ),
    }))

    // Call backend
    try {
      await fetch(`/users/notifications/${notificationUuid}/read`, {
        method: 'POST',
        headers: {
          'X-XSRF-TOKEN': document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || '',
        }
      })
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      // Revert if needed, but for now assuming it eventually succeeds or isn't critical
    }
  },
  deleteNotification: async (notificationUuid) => {
    // Optimistic update
    set((state) => ({
      notifications: state.notifications.filter((n) => n.uuid !== notificationUuid),
    }))

    // Call backend
    try {
      await fetch(`/users/notifications/${notificationUuid}`, {
        method: 'DELETE',
        headers: {
          'X-XSRF-TOKEN': document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] || '',
        }
      })
    } catch (error) {
      console.error('Failed to delete notification:', error)
    }
  },
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) => ({
        ...notification,
        isRead: true,
      })),
    })),
}))
