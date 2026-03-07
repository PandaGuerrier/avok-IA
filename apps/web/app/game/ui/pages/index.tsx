import { Main } from '#common/ui/components/main'
import { Button } from '@workspace/ui/components/button'
import usePageProps from '#common/ui/hooks/use_page_props'
import { Clock } from 'lucide-react'
import { Link, router } from '@inertiajs/react'
import { useState } from 'react'
import { MultiStepLoader } from '@workspace/ui/components/multi-loader'
import { motion } from 'framer-motion'

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
      <div className="h-full flex justify-center items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="flex flex-col items-center gap-6"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-6xl"
          >
            🎮
          </motion.div>

          <h1 className="text-5xl font-black">Tout est prêt !</h1>

          <p className="text-xl text-muted-foreground max-w-sm">
            Tu peux commencer à jouer quand tu es prêt.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <Button size="lg" onClick={handleStartNewGame} disabled={processing}>
              Commencer à jouer
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {games && games.length > 0 && (
        <div className="max-w-2xl mx-auto px-4 pb-8">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Enquêtes précédentes
          </h2>
          <div className="space-y-3">
            {games.map((game) => (
              <Link
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
              </Link>
            ))}
          </div>
        </div>
      )}
    </Main>
  )
}
