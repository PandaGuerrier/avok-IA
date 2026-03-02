import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu'
import { useNotificationsStore } from '#common/ui/stores/use_notifications_store'
import { Trash2, Bell, ExternalLink } from 'lucide-react'
import { useEffect } from 'react'
import useNotifications from '#common/ui/hooks/use_notifications'
import { Button } from '@workspace/ui/components/button'

export function NotificationsButton() {
  const { notifications, markAsRead, addNotifications, deleteNotification } = useNotificationsStore()
  const notifs = useNotifications()

  useEffect(() => {
    if (notifs && notifs.length > 0) {
      addNotifications(notifs)
    }
  }, [notifs])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"outline"} size={"icon-sm"} >
          <Bell className="w-5 h-5" />
          {Object.values(notifications).filter((n) => !n.isRead).length > 0 && (
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background animate-in zoom-in-50 duration-300 fill-mode-forwards" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-[400px] overflow-y-auto space-y-2" align="end">
        {Object.values(notifications).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground animate-in fade-in duration-300">
            <Bell className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm font-medium">Pas de nouveautés</p>
            <p className="text-xs">Tout est calme pour le moment.</p>
          </div>
        ) : (
          <>
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.values(notifications).map((thm) => (
              <DropdownMenuItem
                key={thm.uuid}
                onMouseEnter={() => !thm.isRead && markAsRead(thm.uuid)}
                className={`cursor-pointer group relative overflow-hidden focus:bg-accent ${
                  thm.isRead ? 'opacity-60' : 'bg-accent/50'
                }`}
              >
                {!thm.isRead && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 group-hover:w-full group-hover:opacity-10 transition-all duration-300 pointer-events-none" />
                )}
                <div className="flex flex-col gap-1 w-full">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium text-sm leading-none group-hover:translate-x-1 transition-transform duration-200">
                      {thm.title}
                    </div>
                    <div className={'flex'}>
                      <Button
                        onClick={(e: { stopPropagation: () => void }) => {
                          e.stopPropagation()
                          deleteNotification(thm.uuid)
                        }}
                        size={'icon-sm'}
                        variant={'ghost'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      {thm.link && (
                        <Button size={'icon-sm'} variant={'ghost'} href={thm.link}>
                          <ExternalLink />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground group-hover:translate-x-1 transition-transform duration-200 delay-75">
                    {thm.message}
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
