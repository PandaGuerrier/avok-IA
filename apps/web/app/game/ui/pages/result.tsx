import GameStoreProvider from '#game/ui/components/GameStoreProvider'
import { Main } from '#common/ui/components/main'
import { Button } from '@workspace/ui/components/button'
import usePageProps from '#common/ui/hooks/use_page_props'
import { Trophy, XCircle } from 'lucide-react'
import type GameDto from '#game/dtos/game'

interface Props {
  game: GameDto
}

export default function ResultPage() {
  const { game } = usePageProps<Props>()

  const won = game.guiltyPourcentage <= 50

  return (
    <GameStoreProvider game={game}>
      <Main>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="mb-6">
            {won ? (
              <Trophy className="w-16 h-16 text-yellow-500" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500" />
            )}
          </div>
          <h1 className="text-5xl font-bold mb-4">
            {won ? 'Enquête réussie !' : 'Enquête échouée'}
          </h1>
          <p className="text-muted-foreground text-lg mb-2 max-w-md">
            {won
              ? "Vous avez su maintenir le doute. L'IA ne peut pas vous déclarer coupable."
              : "L'IA vous a jugé coupable. Vous n'avez pas su protéger votre innocence."}
          </p>
          <div className="my-6 px-8 py-4 rounded-2xl border bg-card">
            <p className="text-sm text-muted-foreground mb-1">Score de culpabilité final</p>
            <p className="text-4xl font-bold">{game.guiltyPourcentage}%</p>
          </div>
          <Button size="lg" asChild>
            <a href="/game">Rejouer</a>
          </Button>
        </div>
      </Main>
    </GameStoreProvider>
  )
}
