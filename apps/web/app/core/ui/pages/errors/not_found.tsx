import { router } from '@inertiajs/react'

import { Button } from '@workspace/ui/components/button'

export default function NotFoundError() {
  return (
    <div className="h-svh">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-[7rem] font-bold leading-tight">404</h1>
        <span className="font-medium">Oupsi !!</span>
        <p className="text-center text-muted-foreground">
          La page que vous recherchez n'existe pas ou a été déplacée.<br />
          Vérifiez l'URL ou revenez à la page d'accueil.
        </p>
        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            Retour en arrière
          </Button>
          <Button onClick={() => router.visit('/')}>Retour a l'accueil</Button>
        </div>
      </div>
    </div>
  )
}
