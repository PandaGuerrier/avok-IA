import { useEffect } from 'react'
import { useTutorialStore } from '#game/ui/store/tutorialStore'
import TutorialMissionPanel from '#game/ui/components/TutorialMissionPanel'

export type TourPage = 'game' | 'instagrume' | 'jaimail' | 'notetrack'

interface GameTourProps {
  gameUuid: string
  page: TourPage
}

export default function GameTour({ gameUuid, page }: GameTourProps) {
  const {
    init,
    step,
    interrogated,
    usedProof,
    instaPostAlibi,
    instaConvAlibi,
    mailAlibi,
    usedAlibi,
    usedCustomChoice,
  } = useTutorialStore()

  useEffect(() => {
    init(gameUuid)
  }, [gameUuid])

  return (
    <TutorialMissionPanel
      gameUuid={gameUuid}
      step={step}
      interrogated={interrogated}
      usedProof={usedProof}
      instaPostAlibi={instaPostAlibi}
      instaConvAlibi={instaConvAlibi}
      mailAlibi={mailAlibi}
      usedAlibi={usedAlibi}
      usedCustomChoice={usedCustomChoice}
      page={page}
    />
  )
}
