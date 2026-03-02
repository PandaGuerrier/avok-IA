import AppLayout from '#common/ui/components/app_layout'
import { Main } from '#common/ui/components/main'
import useUser from '#auth/ui/hooks/use_user'

export default function Page() {
  const user = useUser()

  return (
    <AppLayout layout={'sidebar'}>
      <Main>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
          <h1 className="text-3xl font-bold mb-2">
            Bienvenue{user ? `, ${user.fullName}` : ''} !
          </h1>
          <p className="text-muted-foreground text-lg">
            Bienvenue sur Eaglet.
          </p>
        </div>
      </Main>
    </AppLayout>
  )
}
