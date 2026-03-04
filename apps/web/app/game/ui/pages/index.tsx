import { Main } from '#common/ui/components/main'
import { Button } from '@workspace/ui/components/button'
import usePageProps from '#common/ui/hooks/use_page_props'
import { Clock } from 'lucide-react'
import { router } from '@inertiajs/react'
import { useState } from 'react'
import { MultiStepLoader } from '@workspace/ui/components/multi-loader'

interface GameSummary {
  uuid: string
  isFinished: boolean
  guiltyPourcentage: number
  createdAt: string
}

const loadingStates = [
  {
    text: 'Analyse des messages Instagrum',
  },
  {
    text: 'Lecture des mails',
  },
  {
    text: 'Vérification du planning',
  },
  {
    text: 'Génération du rapport final',
  },
  {
    text: 'Finalisation de l\'enquête',
  },
  {
    text: 'Préparation de l\'affaire pour le tribunal',
  }
]

interface Props {
  games: GameSummary[]
}

export default function GameIndexPage() {
  const { games } = usePageProps<Props>()
  const [processing, setProcessing] = useState(false)

  const handleStartNewGame = () => {
    if (processing) return
    setProcessing(true)
    router.post('/game/create')
  }

  return (
    <Main>
      {processing && (
        <MultiStepLoader loadingStates={loadingStates} loading={processing} duration={2000} />
      )}
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3">Nouvelle enquête</h1>
          <p className="text-muted-foreground text-lg max-w-md">
            Analysez les données numériques d'un adolescent et déterminez sa culpabilité en 7
            minutes.
          </p>
        </div>
        <Button onClick={handleStartNewGame} disabled={processing}>
          {processing ? 'Génération en cours...' : 'Commencer'}
        </Button>
      </div>

      {games && games.length > 0 && (
        <div className="max-w-2xl mx-auto px-4 pb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Enquêtes précédentes
          </h2>
          <div className="space-y-3">
            {games.map((game) => (
              <a
                key={game.uuid}
                href={`/game/${game.uuid}`}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">{game.isFinished ? 'Terminée' : 'En cours'}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(game.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{game.guiltyPourcentage}%</p>
                  <p className="text-xs text-muted-foreground">culpabilité</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </Main>
  )
}
