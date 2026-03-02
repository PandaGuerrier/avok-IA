import AppLayout from '#common/ui/components/app_layout'
import { Main } from '#common/ui/components/main'
import { Button } from '@workspace/ui/components/button'

export default function Page() {
  return (
    <AppLayout layout={'header'}>
      <Main>
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-6xl font-bold tracking-tight mb-4">
            Eaglet
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-md">
            Bienvenue sur Eaglet.
          </p>
          <div className="flex gap-3">
            <Button href="/auth/start" size="lg">Se connecter</Button>
            <Button href="/auth/start" variant="outline" size="lg">S'inscrire</Button>
          </div>
        </div>
      </Main>
    </AppLayout>
  )
}
