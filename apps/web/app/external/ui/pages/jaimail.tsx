import { useState, useEffect } from 'react'
import usePageProps from '#common/ui/hooks/use_page_props'
import AppLayout from '#common/ui/components/app_layout'
import { useGameStore } from '#game/ui/store/gameStore'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import EmailList from '../components/EmailList'
import EmailDetail from '../components/EmailDetail'
import Toast from '../components/Toast'
import AlibisModal from '../components/AlibisModal'
import GameTour from '#game/ui/components/GameTour'
import { useTutorialStore } from '#game/ui/store/tutorialStore'
import type { Email } from '../schema/mailSchema'

interface MailData {
  mailId?: number
  subject?: string
  content?: string
  body?: string
  sender?: string
  isRead?: boolean
}

interface Props {
  game: {
    uuid: string
    startAt: unknown
    resumeAt: unknown | null
    pausedAt: unknown | null
    isPaused: boolean | null
    guiltyPourcentage: number | null
  }
  mails: MailData[]
}

const IMMERSIVE_EMAILS: Email[] = [
  // ── Inbox ──────────────────────────────────────────────────────────────────
  {
    id: 1001,
    folder: 'inbox',
    sender: 'newsletter@lemonde.fr',
    subject: 'Votre briefing du matin — Actualités du jour',
    snippet: 'Bonjour, voici votre sélection d\'articles à ne pas manquer ce matin...',
    body: `Bonjour,

Voici votre sélection d'articles à ne pas manquer ce matin :

• Économie : Le CAC 40 en légère hausse après les annonces de la BCE
• Politique : Remaniement gouvernemental attendu d'ici la fin de semaine
• Culture : Festival de Cannes – le palmarès complet

Bonne lecture.
— La rédaction du Monde`,
    time: '08:14',
    unread: true,
    isStarred: false,
  },
  {
    id: 1002,
    folder: 'inbox',
    sender: 'no-reply@netflix.com',
    subject: 'Nouveau sur Netflix : des séries qui font parler',
    snippet: 'Cette semaine sur Netflix : 3 nouvelles séries et un documentaire exclusif...',
    body: `Nouveautés de la semaine sur Netflix :

🎬 Série — "Labyrinth" (Saison 1) : Un thriller psychologique haletant
📺 Documentaire — "Au cœur de l'enquête" : Comment travaillent les détectives privés ?
🎭 Film — "Le dernier témoin" : Un classique remasterisé

Bonne soirée !`,
    time: 'Hier',
    unread: true,
    isStarred: false,
  },
  {
    id: 1003,
    folder: 'inbox',
    sender: 'thomas.renard@gmail.com',
    subject: 'Re: Dîner samedi ?',
    snippet: 'Oui ça marche pour moi ! Je ramène le vin, tu t\'occupes du reste ?',
    body: `Oui ça marche pour moi !

Je ramène le vin, tu t'occupes du reste ? J'ai vu que Marion ne peut finalement pas venir, c'est dommage.

À samedi,
Thomas`,
    time: 'Hier',
    unread: false,
    isStarred: false,
  },
  {
    id: 1004,
    folder: 'inbox',
    sender: 'factures@edf.fr',
    subject: 'Votre facture EDF du mois — Montant : 89,40 €',
    snippet: 'Votre facture du mois est disponible. Montant prélevé le 10 du mois : 89,40 €',
    body: `Bonjour,

Votre facture mensuelle est disponible dans votre espace client.

Montant : 89,40 €
Prélèvement prévu le : 10 du mois
Contrat : Particulier — Tarif Bleu

Consultez votre espace client pour plus de détails.

EDF — Service client`,
    time: 'Lun.',
    unread: false,
    isStarred: false,
  },
  {
    id: 1005,
    folder: 'inbox',
    sender: 'sophie.malik@avocat-conseil.fr',
    subject: 'Documents à signer avant le 15',
    snippet: 'Comme convenu, je vous transmets les pièces à signer. Merci de me retourner...',
    body: `Bonjour,

Comme convenu lors de notre entretien téléphonique, je vous transmets en pièce jointe les documents à signer avant le 15 du mois.

Merci de me les retourner scannés dès que possible.

Cordialement,
Sophie Malik
Avocate — Cabinet Malik & Associés`,
    time: 'Lun.',
    unread: true,
    isStarred: false,
    attachments: [
      { name: 'contrat_signature.pdf', size: '340 Ko', type: 'pdf' },
      { name: 'annexe_conditions.pdf', size: '120 Ko', type: 'pdf' },
    ],
  },
  // ── Starred ─────────────────────────────────────────────────────────────────
  {
    id: 1006,
    folder: 'inbox',
    sender: 'clara.fontaine@gmail.com',
    subject: 'Les photos du week-end !',
    snippet: 'Je viens de mettre en ligne les photos du week-end à Lyon, elles sont...',
    body: `Salut !

Je viens de mettre en ligne les photos du week-end à Lyon, elles sont vraiment bien ! J'ai fait une petite sélection sur l'album partagé.

Le lien : album-photo-lyon-weekend.fr/clara

Bises,
Clara`,
    time: '12 jan.',
    unread: false,
    isStarred: true,
  },
  {
    id: 1007,
    folder: 'inbox',
    sender: 'rh@entreprise-groupe.fr',
    subject: '✅ Confirmation — Augmentation de salaire effective dès février',
    snippet: 'Suite à notre entretien annuel, nous avons le plaisir de vous confirmer...',
    body: `Bonjour,

Suite à votre entretien annuel d'évaluation, nous avons le plaisir de vous confirmer que votre augmentation de salaire sera effective à partir du 1er février.

Votre nouveau salaire brut mensuel sera de 3 450 €.

Félicitations pour votre travail cette année.

Cordialement,
Direction des Ressources Humaines`,
    time: '8 jan.',
    unread: false,
    isStarred: true,
  },
  // ── Sent ────────────────────────────────────────────────────────────────────
  {
    id: 1008,
    folder: 'sent',
    sender: 'moi@jaimail.fr',
    subject: 'Re: Réunion de la semaine prochaine',
    snippet: 'Bonjour, je confirme ma présence pour la réunion de lundi à 14h. Bonne journée.',
    body: `Bonjour,

Je confirme ma présence pour la réunion de lundi à 14h.

Bonne journée,`,
    time: 'Hier',
    unread: false,
    isStarred: false,
  },
  {
    id: 1009,
    folder: 'sent',
    sender: 'moi@jaimail.fr',
    subject: 'Demande de devis — Travaux salle de bain',
    snippet: 'Bonjour, je souhaiterais obtenir un devis pour des travaux de rénovation...',
    body: `Bonjour,

Je souhaiterais obtenir un devis pour des travaux de rénovation de ma salle de bain (remplacement de la douche, nouveau carrelage sol et murs).

Surface approximative : 6 m²
Disponibilité pour une visite : semaine du 20

Cordialement`,
    time: 'Jeu.',
    unread: false,
    isStarred: false,
  },
  {
    id: 1010,
    folder: 'sent',
    sender: 'moi@jaimail.fr',
    subject: 'Réclamation — Commande #4872 non reçue',
    snippet: 'Madame, Monsieur, je vous contacte au sujet de ma commande passée le 3 janvier...',
    body: `Madame, Monsieur,

Je vous contacte au sujet de ma commande n°4872 passée le 3 janvier et dont la livraison était prévue avant le 8. À ce jour, je n'ai toujours rien reçu.

Pourriez-vous faire le point sur ce colis ?

Cordialement`,
    time: '9 jan.',
    unread: false,
    isStarred: false,
  },
  // ── Snoozed ─────────────────────────────────────────────────────────────────
  {
    id: 1011,
    folder: 'snoozed',
    sender: 'reservation@hotel-bellevue.fr',
    subject: 'Votre réservation — Hôtel Bellevue du 14 au 16 mars',
    snippet: 'Merci pour votre réservation. Retrouvez tous les détails de votre séjour...',
    body: `Bonjour,

Merci pour votre réservation à l'Hôtel Bellevue.

Dates : du 14 au 16 mars
Chambre : Supérieure double
Numéro de réservation : BLV-20241

Check-in : à partir de 15h
Check-out : avant 12h

Au plaisir de vous accueillir !
L'équipe Bellevue`,
    time: '5 jan.',
    unread: false,
    isStarred: false,
  },
  {
    id: 1012,
    folder: 'snoozed',
    sender: 'impots.gouv.fr',
    subject: 'Rappel — Déclaration de revenus à compléter',
    snippet: 'N\'oubliez pas de compléter votre déclaration de revenus avant la date limite...',
    body: `Bonjour,

Nous vous rappelons que la date limite de déclaration de revenus approche.

Département 75 (Paris) : avant le 23 mai
Connectez-vous sur impots.gouv.fr pour accéder à votre espace.

Direction Générale des Finances Publiques`,
    time: '2 jan.',
    unread: false,
    isStarred: false,
  },
  // ── Archive ─────────────────────────────────────────────────────────────────
  {
    id: 1013,
    folder: 'archive',
    sender: 'ameli@assurance-maladie.fr',
    subject: 'Votre attestation Vitale mise à jour',
    snippet: 'Votre nouvelle attestation de droits est disponible en téléchargement...',
    body: `Bonjour,

Votre attestation de droits à l'assurance maladie a été mise à jour. Vous pouvez la télécharger depuis votre espace Ameli.

Cette attestation est à conserver pour vos démarches administratives.

L'Assurance Maladie`,
    time: 'Nov.',
    unread: false,
    isStarred: false,
  },
  {
    id: 1014,
    folder: 'archive',
    sender: 'no-reply@sncf.fr',
    subject: 'Votre billet — Paris → Lyon, 14 nov. 08h02',
    snippet: 'Votre billet de train est confirmé. Départ Paris Gare de Lyon à 08h02...',
    body: `Votre billet TGV INOUI

Paris Gare de Lyon → Lyon Part-Dieu
Départ : 14 novembre — 08h02
Arrivée : 14 novembre — 09h58
Voiture : 12 — Siège : 67 (fenêtre)
Réservation : XKQP72

Bon voyage !`,
    time: '13 nov.',
    unread: false,
    isStarred: false,
  },
  {
    id: 1015,
    folder: 'archive',
    sender: 'contact@mutuelle-sante.fr',
    subject: 'Remboursement effectué — 47,20 €',
    snippet: 'Votre remboursement de 47,20 € a été viré sur votre compte bancaire...',
    body: `Bonjour,

Votre remboursement de soins a été traité.

Montant remboursé : 47,20 €
Virement prévu sous 3 à 5 jours ouvrés

Détail des soins remboursés :
— Consultation spécialiste : 28,00 €
— Médicaments : 19,20 €

Votre Mutuelle Santé`,
    time: 'Oct.',
    unread: false,
    isStarred: false,
  },
  // ── Trash ───────────────────────────────────────────────────────────────────
  {
    id: 1016,
    folder: 'trash',
    sender: 'promo@shopping-express.com',
    subject: '🛍️ -50% sur tout le site — Offre flash 24h !',
    snippet: 'Ne manquez pas notre vente flash ! Jusqu\'à -50% sur des milliers d\'articles...',
    body: `VENTE FLASH — 24H SEULEMENT

Jusqu'à -50% sur des milliers d'articles !
Livraison gratuite dès 30€ d'achat.

Code promo : FLASH50

Dépêchez-vous, stocks limités !`,
    time: 'Lun.',
    unread: false,
    isStarred: false,
  },
  {
    id: 1017,
    folder: 'trash',
    sender: 'noreply@concours-gagnant.net',
    subject: 'Félicitations ! Vous avez été sélectionné(e) — réclamez votre lot',
    snippet: 'Vous avez été tiré(e) au sort parmi nos participants. Un cadeau vous attend...',
    body: `Félicitations !

Vous avez été sélectionné(e) pour recevoir un cadeau d'une valeur de 500 €.

Pour le réclamer, cliquez sur le lien ci-dessous et renseignez vos coordonnées.

[Réclamer mon cadeau]

(Ne pas répondre à cet email)`,
    time: 'Dim.',
    unread: false,
    isStarred: false,
  },
]

function mapMailsToEmails(mails: MailData[]): Email[] {
  const fromServer = (mails ?? []).map((m, i) => {
    const body = m.content ?? m.body ?? ''
    return {
      id: m.mailId ?? i + 1,
      folder: 'inbox' as const,
      sender: m.sender ?? 'Inconnu',
      subject: m.subject ?? '(Sans objet)',
      snippet: body.slice(0, 80) + (body.length > 80 ? '...' : ''),
      body,
      time: "Dans l'affaire",
      unread: !(m.isRead ?? false),
      isStarred: false,
    }
  })
  return [...fromServer, ...IMMERSIVE_EMAILS]
}

export default function Jaimail() {
  const { game, mails } = usePageProps<Props>()
  const gameUuid = game.uuid

  const init = useGameStore((s) => s.init)
  const markTutorialAction = useTutorialStore((s) => s.markAction)

  const [emails, setEmails] = useState<Email[]>(() => mapMailsToEmails(mails))

  // Initialize the game store without pausing
  useEffect(() => {
    init({
      gameUuid: game.uuid,
      startAtMs: game.startAt ? new Date(game.startAt as string).getTime() : null,
      guiltyPercentage: game.guiltyPourcentage ?? 50,
    })
  }, [init, game])
  const [activeTab, setActiveTab] = useState('inbox')
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [alibisModal, setAlibisModal] = useState<{ content: string } | null>(null)

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const displayedEmails = emails.filter((email) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      return (
        email.subject.toLowerCase().includes(q) ||
        email.sender.toLowerCase().includes(q) ||
        email.body.toLowerCase().includes(q)
      )
    }
    if (activeTab === 'starred') return email.isStarred || email.folder === 'starred'
    return email.folder === activeTab
  })

  const openEmail = (email: Email) => {
    setEmails(emails.map((e) => (e.id === email.id ? { ...e, unread: false } : e)))
    setSelectedEmail(email)
  }

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setSelectedEmail(null)
    setSearchQuery('')
  }

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    const email = emails.find((em) => em.id === id)
    if (email?.folder === 'trash') {
      setEmails(emails.filter((em) => em.id !== id))
      showToast('Message supprimé définitivement.')
    } else {
      setEmails(emails.map((em) => (em.id === id ? { ...em, folder: 'trash' } : em)))
      showToast('Conversation mise à la corbeille.')
    }
  }

  const handleArchive = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    setEmails(emails.map((email) => (email.id === id ? { ...email, folder: 'archive' } : email)))
    showToast('Conversation archivée.')
  }

  const handleSnooze = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    setEmails(emails.map((email) => (email.id === id ? { ...email, folder: 'snoozed' } : email)))
    showToast('Conversation mise en attente.')
  }

  const toggleUnread = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    const email = emails.find((em) => em.id === id)
    setEmails(emails.map((em) => (em.id === id ? { ...em, unread: !em.unread } : em)))
    showToast(email?.unread ? 'Marqué comme lu.' : 'Marqué comme non lu.')
  }

  const toggleStarred = (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    const email = emails.find((em) => em.id === id)
    const currentlyStarred = email?.isStarred || email?.folder === 'starred'
    setEmails(
      emails.map((em) => {
        if (em.id !== id) return em
        const newFolder = em.folder === 'starred' && currentlyStarred ? 'inbox' : em.folder
        return { ...em, isStarred: !currentlyStarred, folder: newFolder }
      })
    )
    showToast(currentlyStarred ? 'Retiré des favoris.' : 'Ajouté aux favoris.')
  }

  const toggleSelectAll = () => {}
  const toggleSelectEmail = () => {}

  return (
    <AppLayout layout="sidebar" removePadding hideBottomNav>
    <GameTour gameUuid={gameUuid} page="jaimail" />
    <div
      className="flex flex-col h-[calc(100vh-8rem)] w-full font-sans relative overflow-hidden transition-colors duration-300 bg-slate-50 dark:bg-slate-950 text-brand-dark dark:text-slate-200"
    >
      <Header
        isSidebarOpen={true}
        setIsSidebarOpen={() => {}}
        handleTabChange={handleTabChange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          setIsComposeOpen={() => {}}
          activeTab={activeTab}
          handleTabChange={handleTabChange}
          isDarkMode={isDarkMode}
        />

        <main className="flex-1 bg-white dark:bg-slate-900 sm:m-4 sm:rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col transition-colors relative">
          {selectedEmail ? (
            <EmailDetail
              selectedEmail={selectedEmail}
              setSelectedEmail={setSelectedEmail}
              onAlibisClick={(content) => setAlibisModal({ content })}
            />
          ) : (
            <EmailList
              displayedEmails={displayedEmails}
              searchQuery={searchQuery}
              openEmail={openEmail}
              showToast={showToast}
              handleArchive={handleArchive}
              handleDelete={handleDelete}
              toggleUnread={toggleUnread}
              selectedEmails={[]}
              toggleSelectAll={toggleSelectAll}
              toggleSelectEmail={toggleSelectEmail}
              activeTab={activeTab}
              handleEmptyTrash={() => {
                setEmails(emails.filter((em) => em.folder !== 'trash'))
                showToast('La corbeille a été vidée.')
              }}
              toggleStarred={toggleStarred}
              handleSnooze={handleSnooze}
            />
          )}
          <Toast message={toast} />
        </main>
      </div>

      {alibisModal && (
        <AlibisModal
          gameUuid={gameUuid}
          defaultContent={alibisModal.content}
          onClose={() => setAlibisModal(null)}
          isDarkMode={isDarkMode}
          onSaved={() => markTutorialAction('mailAlibi', gameUuid)}
        />
      )}
      <style>{`
        /* Scrollbar styles for dark mode */
        .dark ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .dark ::-webkit-scrollbar-track {
          background-color: #0f172a;
        }
        .dark ::-webkit-scrollbar-thumb {
          background-color: #475569;
          border-radius: 4px;
        }
        .dark ::-webkit-scrollbar-thumb:hover {
          background-color: #64748b;
        }
        /* Firefox scrollbar */
        .dark {
          scrollbar-color: #475569 #0f172a;
          scrollbar-width: thin;
        }
      `}</style>
    </div>
    </AppLayout>
  )
}
