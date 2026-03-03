import { cn } from '@workspace/ui/lib/utils'

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import UserDto from '#users/dtos/user'

export interface NavUserProps {
  user: UserDto,
  className?: string
}

function generateFallbackText(user: UserDto): string {
  if (user.firstName && user.lastName) {
    return (user.firstName[0] + user.lastName[0]).toUpperCase()
  }
  if (user.firstName) {
    return user.firstName.slice(0, 2).toUpperCase()
  }
  if (user.pseudo) {
    return user.pseudo.slice(0, 2).toUpperCase()
  }
  return (user.email ?? "NONE").slice(0, 2).toUpperCase()
}

export function UserAvatar({ user, className }: NavUserProps) {
  const fallbackText = generateFallbackText(user)
  const url = user.avatarUrl ?? user.avatar?.thumbnail?.url ?? undefined

  return (
    <Avatar className={cn('h-10 w-10', className)}>
      <AvatarImage src={url} alt={user.pseudo ?? user.firstName ?? undefined} />
      <AvatarFallback className="rounded-lg">{fallbackText}</AvatarFallback>
    </Avatar>
  )
}
