import { useState, useEffect, useRef } from 'react'
import AppLayout from '#common/ui/components/app_layout'
import usePageProps from '#common/ui/hooks/use_page_props'
import type GameDto from '#game/dtos/game'
import type AlibiDto from '#game/dtos/alibi'
import type ProofDto from '#game/dtos/proof'
import type ChoiceData from '#game/types/choices'
import type { ContactData } from '#game/types/data'
import type { ChatMessage } from '#game/ui/utils/types'
import { buildInitialMessages, getXsrfToken } from '#game/ui/utils/utils'
import { useGameStore } from '#game/ui/store/gameStore'
import GameStoreProvider from '#game/ui/components/GameStoreProvider'
import GameHeader from '#game/ui/components/GameHeader'
import ChatArea from '#game/ui/components/ChatArea'
import ChoicesBar from '#game/ui/components/ChoicesBar'
import AlibisPanel from '#game/ui/components/AlibisPanel'
import ProofsModal from '#game/ui/components/ProofsModal'
import InterrogateModal from '#game/ui/components/InterrogateModal'
import GameTour from '#game/ui/components/GameTour'
import { Button } from '@workspace/ui/components/button'
import { Trophy } from 'lucide-react'

export interface Props {
  game: GameDto
  initialMessage: string
  currentChoices: ChoiceData[]
}

export default function StartPage() {
  const { game, initialMessage, currentChoices: initialChoices } = usePageProps<Props>()

  // ── Zustand store ──────────────────────────────────────────────────────────
  const { isPaused, updateGuilt, guiltyPercentage } = useGameStore()

  const [won, setWon] = useState(false)

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    fetch(`/game/${game.uuid}/guilty`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'X-XSRF-TOKEN': getXsrfToken(),
      },
      body: JSON.stringify({ guiltyPourcentage: guiltyPercentage }),
    })
      .then((res) => res.json())
      .then((data) => { if (data.isFinished) setWon(true) })
      .catch(console.error)
  }, [guiltyPercentage])

  // ── Local state ────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    buildInitialMessages(game, initialMessage)
  )
  const [choices, setChoices] = useState<ChoiceData[]>(initialChoices || [])
  const [loading, setLoading] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  const [proofs] = useState<ProofDto[]>(game.proofs || [])
  const [selectedProofUuids, setSelectedProofUuids] = useState<string[]>([])

  const [alibis, setAlibis] = useState<AlibiDto[]>(game.alibis || [])
  const [selectedAlibiUuids, setSelectedAlibiUuids] = useState<string[]>([])

  // Panels / modals
  const [proofsOpen, setProofsOpen] = useState(false)
  const [alibisPanelOpen, setAlibisPanelOpen] = useState(false)
  const [interrogateOpen, setInterrogateOpen] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)
  const isInitialMount = useRef(true)

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Actions ────────────────────────────────────────────────────────────────

  async function handleChoice(choice: ChoiceData) {
    if (loading || isPaused) return
    setLoading(true)
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: choice.title,
        alibis: selectedAlibiUuids.length > 0 ? [...selectedAlibiUuids] : undefined,
      },
    ])
    try {
      const res = await fetch(`/game/${game.uuid}/choices`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-XSRF-TOKEN': getXsrfToken(),
        },
        body: JSON.stringify({ data: choice, selectedProofUuids, selectedAlibiUuids }),
      })
      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { role: 'ai', content: "Une erreur s'est produite. Réessayez." },
        ])
        return
      }
      const json = await res.json()
      setMessages((prev) => [...prev, { role: 'ai', content: json.choice.response }])
      updateGuilt(json.guiltyPourcentage)
      setChoices(json.nextChoices || [])
      setSelectedProofUuids([])
      setSelectedAlibiUuids([])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', content: "Une erreur s'est produite. Réessayez." },
      ])
    } finally {
      setLoading(false)
    }
  }

  async function handleRegenerate() {
    if (loading || regenerating || isPaused) return
    setRegenerating(true)
    try {
      const res = await fetch(`/game/${game.uuid}/choices/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-XSRF-TOKEN': getXsrfToken(),
        },
        body: JSON.stringify({ selectedProofUuids, selectedAlibiUuids }),
      })
      if (res.ok) {
        const json = await res.json()
        if (json.nextChoices?.length > 0) {
          setChoices(json.nextChoices)
        }
      } else {
        console.error('[regenerate] HTTP', res.status, await res.text())
      }
    } catch (err) {
      console.error('[regenerate] fetch error:', err)
    } finally {
      setRegenerating(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const contacts: ContactData[] = (game.data as any)?.contacts ?? []

  return (
    <GameStoreProvider game={game}>
      <GameTour gameUuid={game.uuid} page="game" />
      <AppLayout layout="sidebar" hideBottomNav removePadding>
        <div className="relative flex h-[calc(100vh-4rem)] overflow-hidden bg-white dark:bg-[#050510] text-black dark:text-white">
          {/* Background glow */}
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background: window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(6,182,212,0.06) 0%, transparent 70%)'
                : 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(6,182,212,0.03) 0%, transparent 70%)',
            }}
          />

          {/* Main column */}
          <div className="relative z-10 flex flex-1 flex-col min-w-0">
            <GameHeader
              gameUuid={game.uuid}
              proofsCount={proofs.length}
              alibisCount={alibis.length}
              onProofsClick={() => setProofsOpen(true)}
              onAlibisToggle={() => setAlibisPanelOpen((v) => !v)}
              onInterrogateClick={() => setInterrogateOpen(true)}
            />

            {/* Chat + side panel */}
            <div className="flex flex-1 overflow-hidden min-w-0">
              <div
                className={
                  'absolute top-28 right-4 flex flex-col gap-2 z-20 px-3 ' +
                  (alibisPanelOpen ? 'right-72' : '')
                }
              >
                <div className={"space-x-2 bg-background p-2 rounded-md shadow-md floating-buttons"}>
                  <Button variant={'outline'} onClick={() => setProofsOpen(true)}>
                    Preuves{' '}
                    <span className="ml-1 px-2 py-0.5 text-[10px] font-mono rounded bg-red-500/20 text-red-500">
                      {proofs.length}
                    </span>
                  </Button>
                  <Button variant={'outline'} onClick={() => setAlibisPanelOpen(!alibisPanelOpen)}>
                    Alibi(s){' '}
                    <span className="ml-1 px-2 py-0.5 text-[10px] font-mono rounded bg-blue-500/20 text-blue-500">
                      {alibis.length}
                    </span>
                  </Button>
                  <Button variant={'default'} onClick={() => setInterrogateOpen(true)}>
                    Intérroger une personne
                  </Button>
                </div>
              </div>
              <div className="flex flex-1 flex-col min-w-0">
                <ChatArea messages={messages} loading={loading} chatEndRef={chatEndRef} selectedAlibis={selectedAlibiUuids} alibis={alibis} />

                <ChoicesBar
                  choices={choices}
                  loading={loading}
                  regenerating={regenerating}
                  isPaused={isPaused}
                  selectedProofUuids={selectedProofUuids}
                  selectedAlibiUuids={selectedAlibiUuids}
                  onChoice={handleChoice}
                  onRegenerate={handleRegenerate}
                />
              </div>

              {/* Alibis side panel */}
              {alibisPanelOpen && (
                <AlibisPanel
                  gameUuid={game.uuid}
                  alibis={alibis}
                  selectedAlibiUuids={selectedAlibiUuids}
                  onToggle={(uuid) =>
                    setSelectedAlibiUuids((prev) =>
                      prev.includes(uuid) ? prev.filter((id) => id !== uuid) : [...prev, uuid]
                    )
                  }
                  onClearSelection={() => setSelectedAlibiUuids([])}
                  onAdd={(alibi) => setAlibis((prev) => [...prev, alibi])}
                  onDelete={(uuid) => setAlibis((prev) => prev.filter((a) => a.uuid !== uuid))}
                  onClose={() => setAlibisPanelOpen(false)}
                />
              )}
            </div>

            {proofsOpen && (
              <ProofsModal
                proofs={proofs}
                selectedProofUuids={selectedProofUuids}
                onToggle={(uuid) =>
                  setSelectedProofUuids((prev) =>
                    prev.includes(uuid) ? prev.filter((id) => id !== uuid) : [...prev, uuid]
                  )
                }
                onClearSelection={() => setSelectedProofUuids([])}
                onClose={() => setProofsOpen(false)}
              />
            )}

            {interrogateOpen && (
              <InterrogateModal
                gameUuid={game.uuid}
                contacts={contacts}
                onAnswer={(answer, contactName, judgeReaction) =>
                  setMessages((prev) => [
                    ...prev,
                    { role: 'contact', content: answer, contactName },
                    ...(judgeReaction ? [{ role: 'ai' as const, content: judgeReaction }] : []),
                  ])
                }
                onClose={() => setInterrogateOpen(false)}
              />
            )}
          </div>
        </div>

        {/* Win overlay */}
        {won && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-6 text-center px-8 py-10 rounded-3xl bg-white/10 dark:bg-white/5 border border-white/20 shadow-2xl max-w-sm w-full animate-in fade-in zoom-in-95 duration-500">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-yellow-400/30 blur-2xl scale-150" />
                <Trophy className="relative w-20 h-20 text-yellow-400 drop-shadow-[0_0_24px_rgba(250,204,21,0.8)]" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-white mb-2">Enquête réussie !</h2>
                <p className="text-white/70 text-sm leading-relaxed">
                  Vous avez maintenu le doute sous les 50%.<br />
                  L'IA ne peut pas vous déclarer coupable.
                </p>
              </div>
              <div className="px-6 py-3 rounded-2xl bg-white/10 border border-white/20">
                <p className="text-xs text-white/50 mb-0.5">Score de culpabilité</p>
                <p className="text-3xl font-bold text-yellow-300">{guiltyPercentage}%</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="text-white border-white/30 hover:bg-white/10" asChild>
                  <a href="/game">Rejouer</a>
                </Button>
                <Button className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold" asChild>
                  <a href={`/game/${game.uuid}/result`}>Voir les résultats</a>
                </Button>
              </div>
            </div>
          </div>
        )}
      </AppLayout>

      <style>{`
      @keyframes float {
        0%, 100% { transform: translateY(0px); box-shadow: 0 4px 16px rgba(0,0,0,0.10); }
        50% { transform: translateY(-6px); box-shadow: 0 10px 28px rgba(0,0,0,0.16); }
      }
      .floating-buttons {
        animation: float 3.5s ease-in-out infinite;
      }
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
    </GameStoreProvider>
  )
}
