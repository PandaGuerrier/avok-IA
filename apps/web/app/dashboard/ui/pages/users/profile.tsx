import { InferPageProps } from '@adonisjs/inertia/types'
import { Head, useForm } from '@inertiajs/react'
import { Calendar, MapPin, GraduationCap } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import AppLayout from '#common/ui/components/app_layout'
import { UserAvatar } from '#common/ui/components/user_avatar'
import UsersController from '#dashboard/controllers/users_controller'
import UserDto from '#users/dtos/user'
import useUser from '#auth/ui/hooks/use_user'

export default function UserProfile({
  profile,
}: InferPageProps<UsersController, 'show'>) {
  const { post, delete: destroy } = useForm({})
  const user = useUser()

  const isFollowing = profile.followers?.some((follower: string) => follower === user?.uuid)
  const isOwnProfile = user?.uuid === profile.uuid
  const followUnfollowButton = isOwnProfile ? null : isFollowing ? (
    <Button variant="outline" onClick={unfollowUser}>
      Ne plus suivre
    </Button>
  ) : (
    <Button onClick={followUser}>Suivre</Button>
  )

  function followUser() {
    post('/users/follow/' + profile.uuid, {
      onSuccess: () => {
        console.log('Followed user successfully')
      },
    })
  }

  function unfollowUser() {
    destroy('/users/unfollow/' + profile.uuid, {
      onSuccess: () => {
        console.log('Unfollowed user successfully')
      },
    })
  }

  return (
    <AppLayout layout={'sidebar'}>
      <Head title={`${profile.fullName} (@${profile.fullName})`} />

      <div className="flex flex-col min-h-screen border max-w-2xl w-full mx-auto bg-card">
        <div className="relative">
          <div className="h-48 bg-linear-to-r from-blue-400 to-purple-500 dark:from-blue-900 dark:to-purple-900 w-full" />
          <div className="px-4 flex justify-between items-end -mt-16 mb-4">
            <div className="relative rounded-full p-1 bg-background z-10">
              <UserAvatar
                user={profile as UserDto}
                className="size-32 text-4xl border-4 border-background"
              />
            </div>
            <div className="pb-2 z-10">{followUnfollowButton}</div>
          </div>

          <div className="px-4 pb-4 space-y-3 border-b">
            <div>
              <h1 className="text-2xl font-bold leading-tight">{profile.fullName}</h1>
              <p className="text-muted-foreground">
                @{profile.fullName?.replace(/\s+/g, '').toLowerCase()}
              </p>
            </div>

            <div className="text-[15px] space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <GraduationCap className="size-4" />
                <span>
                  {profile.program} {profile.year ? `- Année ${profile.year}` : ''}
                </span>
              </div>
              {profile.track && <p className="text-muted-foreground pl-6">{profile.track}</p>}
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-2 text-muted-foreground text-[15px]">
              {profile.campus && (
                <div className="flex items-center gap-1">
                  <MapPin className="size-4" />
                  <span>{profile.campus.toUpperCase()}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="size-4" />
                <span>
                  A rejoint en{' '}
                  {new Date(profile.createdAt).toLocaleDateString('fr-FR', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            <div className="flex gap-4 text-[15px]">
              <div className="flex gap-1 hover:underline cursor-pointer">
                <span className="font-bold text-foreground">{profile.following.length}</span>
                <span className="text-muted-foreground">abonnements</span>
              </div>
              <div className="flex gap-1 hover:underline cursor-pointer">
                <span className="font-bold text-foreground">{profile.followers.length}</span>
                <span className="text-muted-foreground">abonnés</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
