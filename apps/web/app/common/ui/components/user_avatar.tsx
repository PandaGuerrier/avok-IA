import { cn } from '@workspace/ui/lib/utils'

import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar'
import UserDto from '#users/dtos/user'

export interface NavUserProps {
  user: UserDto,
  className?: string
}

function generateFallbackText(user: UserDto): string {
  if (user.fullName) {
    return user.fullName
      .split(' ')
      .map((word) => word[0])
      .join('')
      .slice(0, 2)
      .toUpperCase()
  }
  return (user.email ?? "NONE").slice(0, 2).toUpperCase()
}

export function UserAvatar({ user, className }: NavUserProps) {
  const fallbackText = generateFallbackText(user)
  const url = user.avatarUrl ?? user.avatar?.thumbnail?.url ?? undefined

  return (
    <Avatar className={cn('h-10 w-10 rounded-full ', className)}>
      <AvatarImage src={url} alt={user.fullName ?? undefined} />
      <AvatarFallback className="rounded-full">{fallbackText}</AvatarFallback>
    </Avatar>
  )
}
