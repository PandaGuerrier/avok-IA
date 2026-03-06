import Joyride, { STATUS } from 'react-joyride'
import type { CallBackProps, Step, Styles } from 'react-joyride'
import { useState, useEffect } from 'react'

export type TourPage = 'game' | 'instagrume' | 'jaimail' | 'notetrack'

const storageKey = (gameUuid: string, page: TourPage) => `avok_tour_${gameUuid}_${page}`

const STEPS: Record<TourPage, Step[]> = {
  game: [
    {
      target: 'body',
      placement: 'center',
      disableBeacon: true,
      content: (
        <div className="space-y-2">
          <p className="text-base font-bold text-cyan-400">🕵️ Bienvenue dans l'interrogatoire</p>
          <p className="text-sm text-white/80">
            Vous êtes le suspect. Votre objectif : convaincre l'inspecteur de votre innocence avant
            la fin du temps imparti.
          </p>
          <p className="text-sm text-white/60">
            Explorez les applications disponibles pour collecter des alibis, puis revenez ici pour
            les utiliser lors de l'interrogatoire.
          </p>
        </div>
      ),
    },
    {
      target: '#tour-guilty',
      disableBeacon: true,
      content: (
        <div className="space-y-1.5">
          <p className="text-sm font-bold text-white">⚖️ Jauge de culpabilité</p>
          <p className="text-sm text-white/70">
            Cette jauge indique à quel point vous semblez coupable. Faites-la descendre en
            répondant intelligemment et en utilisant vos alibis !
          </p>
        </div>
      ),
    },
    {
      target: '#tour-timer',
      disableBeacon: true,
      content: (
        <div className="space-y-1.5">
          <p className="text-sm font-bold text-white">⏱️ Temps restant</p>
          <p className="text-sm text-white/70">
            Le chrono tourne. Quand il atteint zéro, l'interrogatoire se termine. Gérez bien votre
            temps !
          </p>
        </div>
      ),
    },
    {
      target: '#tour-chat',
      disableBeacon: true,
      content: (
        <div className="space-y-1.5">
          <p className="text-sm font-bold text-white">💬 Conversation</p>
          <p className="text-sm text-white/70">
            C'est ici que se déroule l'interrogatoire. L'inspecteur vous pose des questions —
            lisez attentivement chaque message avant de répondre.
          </p>
        </div>
      ),
    },
    {
      target: '#tour-choices',
      disableBeacon: true,
      content: (
        <div className="space-y-1.5">
          <p className="text-sm font-bold text-white">🗂️ Vos réponses</p>
          <p className="text-sm text-white/70">
            Choisissez parmi ces réponses. Certaines font baisser votre culpabilité, d'autres la
            font monter. Réfléchissez avant de cliquer !
          </p>
        </div>
      ),
    },
    {
      target: '#tour-preuves',
      disableBeacon: true,
      content: (
        <div className="space-y-1.5">
          <p className="text-sm font-bold text-white">🔍 Preuves</p>
          <p className="text-sm text-white/70">
            Consultez les preuves réunies contre vous. Les connaître vous permettra de mieux
            préparer votre défense.
          </p>
        </div>
      ),
    },
    {
      target: '#tour-alibis',
      disableBeacon: true,
      content: (
        <div className="space-y-1.5">
          <p className="text-sm font-bold text-white">📋 Alibis</p>
          <p className="text-sm text-white/70">
            Vos alibis sauvegardés depuis les autres applications apparaissent ici. Cochez-en
            avant de répondre pour les joindre automatiquement à votre réponse !
          </p>
        </div>
      ),
    },
    {
      target: '#tour-interroger',
      disableBeacon: true,
      content: (
        <div className="space-y-1.5">
          <p className="text-sm font-bold text-white">👥 Interroger les contacts</p>
          <p className="text-sm text-white/70">
            Posez des questions aux contacts de l'affaire. Leurs réponses peuvent vous fournir de
            précieux alibis à réutiliser.
          </p>
        </div>
      ),
    },
  ],

  instagrume: [
    {
      target: 'body',
      placement: 'center',
      disableBeacon: true,
      content: (
        <div className="space-y-2">
          <p className="text-base font-bold text-pink-400">📸 Instagrume</p>
          <p className="text-sm text-white/80">
            Voici le compte Instagrume du suspect. Explorez les posts et les messages privés pour
            trouver des éléments qui prouvent votre innocence.
          </p>
        </div>
      ),
    },
    {
      target: '#tour-insta-sidebar',
      placement: 'right',
      disableBeacon: true,
      content: (
        <div className="space-y-1.5">
          <p className="text-sm font-bold text-white">🧭 Navigation</p>
          <p className="text-sm text-white/70">
            Utilisez cette barre pour passer du fil d'actualité aux messages privés. Vérifiez les
            deux !
          </p>
        </div>
      ),
    },
    {
      target: 'body',
      placement: 'center',
      disableBeacon: true,
      content: (
        <div className="space-y-2">
          <p className="text-base font-bold text-white">🔖 Créer un alibi</p>
          <p className="text-sm text-white/70">
            Sur chaque post et dans les messages, repérez l'icône{' '}
            <span className="text-pink-400 font-bold">🔖 Bookmark</span>. Cliquez dessus pour
            sauvegarder ce contenu comme alibi.
          </p>
          <p className="text-sm text-white/60">
            Vos alibis seront disponibles dans l'interrogatoire pour appuyer vos réponses !
          </p>
        </div>
      ),
    },
  ],

  jaimail: [
    {
      target: 'body',
      placement: 'center',
      disableBeacon: true,
      content: (
        <div className="space-y-2">
          <p className="text-base font-bold text-sky-400">📧 JaiMail</p>
          <p className="text-sm text-white/80">
            Voici la boîte mail du suspect. Lisez les emails pour trouver des éléments qui
            pourraient prouver où vous étiez au moment des faits.
          </p>
        </div>
      ),
    },
    {
      target: '#tour-mail-sidebar',
      placement: 'right',
      disableBeacon: true,
      content: (
        <div className="space-y-1.5">
          <p className="text-sm font-bold text-white">📁 Dossiers</p>
          <p className="text-sm text-white/70">
            Naviguez entre la boîte de réception, les messages envoyés et les archives. Ne laissez
            aucun email de côté !
          </p>
        </div>
      ),
    },
    {
      target: 'body',
      placement: 'center',
      disableBeacon: true,
      content: (
        <div className="space-y-2">
          <p className="text-base font-bold text-white">🔖 Utiliser comme alibi</p>
          <p className="text-sm text-white/70">
            En ouvrant un email, vous verrez le bouton{' '}
            <span className="text-sky-400 font-bold">"Utiliser comme alibi"</span>. Cliquez dessus
            pour sauvegarder l'email et l'utiliser lors de l'interrogatoire !
          </p>
        </div>
      ),
    },
  ],

  notetrack: [
    {
      target: 'body',
      placement: 'center',
      disableBeacon: true,
      content: (
        <div className="space-y-2">
          <p className="text-base font-bold text-blue-400">📚 NoteTrack</p>
          <p className="text-sm text-white/80">
            Voici l'application scolaire du suspect. Consultez l'agenda, les notes et les
            présences pour trouver des alibis !
          </p>
        </div>
      ),
    },
    {
      target: '#tour-note-navbar',
      placement: 'right',
      disableBeacon: true,
      content: (
        <div className="space-y-1.5">
          <p className="text-sm font-bold text-white">🗂️ Navigation</p>
          <p className="text-sm text-white/70">
            Explorez le tableau de bord (agenda), les notes, les absences et les incidents. Chaque
            section peut contenir des preuves de votre innocence.
          </p>
        </div>
      ),
    },
    {
      target: 'body',
      placement: 'center',
      disableBeacon: true,
      content: (
        <div className="space-y-2">
          <p className="text-base font-bold text-white">🔖 Créer un alibi</p>
          <p className="text-sm text-white/70">
            Dans l'agenda et les notes, repérez l'icône{' '}
            <span className="text-blue-400 font-bold">🔖 Bookmark</span>. Cliquez dessus pour
            sauvegarder un événement ou une note comme alibi à utiliser en interrogatoire !
          </p>
        </div>
      ),
    },
  ],
}

const tourStyles: Partial<Styles> = {
  options: {
    arrowColor: '#0f172a',
    backgroundColor: '#0f172a',
    overlayColor: 'rgba(0, 0, 0, 0.65)',
    primaryColor: '#06b6d4',
    textColor: '#f1f5f9',
    zIndex: 9999,
  },
  tooltip: {
    borderRadius: '12px',
    border: '1px solid rgba(6, 182, 212, 0.2)',
    padding: '20px',
    maxWidth: '340px',
    backgroundColor: '#0f172a',
  },
  tooltipTitle: {
    display: 'none',
  },
  buttonNext: {
    backgroundColor: '#06b6d4',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '13px',
    padding: '8px 16px',
  },
  buttonBack: {
    color: '#94a3b8',
    fontSize: '13px',
    marginRight: '8px',
  },
  buttonSkip: {
    color: '#64748b',
    fontSize: '12px',
  },
  buttonClose: {
    color: '#64748b',
  },
}

interface GameTourProps {
  gameUuid: string
  page: TourPage
}

export default function GameTour({ gameUuid, page }: GameTourProps) {
  const [run, setRun] = useState(false)

  useEffect(() => {
    const key = storageKey(gameUuid, page)
    if (!localStorage.getItem(key)) {
      // Small delay so the page DOM is ready
      const timer = setTimeout(() => setRun(true), 800)
      return () => clearTimeout(timer)
    }
  }, [gameUuid, page])

  function handleCallback(data: CallBackProps) {
    const { status } = data
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      localStorage.setItem(storageKey(gameUuid, page), 'done')
      setRun(false)
    }
  }

  return (
    <Joyride
      steps={STEPS[page]}
      run={run}
      continuous
      showProgress
      showSkipButton
      scrollToFirstStep
      disableScrolling
      callback={handleCallback}
      styles={tourStyles}
      locale={{
        back: 'Précédent',
        close: 'Fermer',
        last: 'Terminer',
        next: 'Suivant →',
        skip: 'Passer le tutoriel',
        open: 'Ouvrir le dialogue',
      }}
    />
  )
}
