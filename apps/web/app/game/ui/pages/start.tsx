import { useState, useEffect, useRef } from 'react'
import { router } from '@inertiajs/react'
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

export interface Props {
  game: GameDto
  initialMessage: string
  currentChoices: ChoiceData[]
}

export default function StartPage() {
  const { game, initialMessage, currentChoices: initialChoices } = usePageProps<Props>()

  // ── Zustand store ──────────────────────────────────────────────────────────
  const { isPaused, updateGuilt } = useGameStore()

  // ── Local state ────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    buildInitialMessages(game.choices || [], initialMessage)
  )
  const [choices, setChoices] = useState<ChoiceData[]>(initialChoices || [])
  const [loading, setLoading] = useState(false)

  const [proofs] = useState<ProofDto[]>(game.proofs || [])
  const [selectedProofUuids, setSelectedProofUuids] = useState<string[]>([])

  const [alibis, setAlibis] = useState<AlibiDto[]>(game.alibis || [])
  const [selectedAlibiUuids, setSelectedAlibiUuids] = useState<string[]>([])

  // Panels / modals
  const [proofsOpen, setProofsOpen] = useState(false)
  const [alibisPanelOpen, setAlibisPanelOpen] = useState(false)
  const [interrogateOpen, setInterrogateOpen] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Redirect to result when time runs out
  useEffect(() => {
    if (isPaused) return
    const id = setInterval(() => {
      if (useGameStore.getState().computeTimeLeft() <= 0) {
        clearInterval(id)
        router.visit(`/game/${game.uuid}/result`)
      }
    }, 1000)
    return () => clearInterval(id)
  }, [isPaused, game.uuid])

  // ── Actions ────────────────────────────────────────────────────────────────

  async function handleChoice(choice: ChoiceData) {
    if (loading || isPaused) return
    setLoading(true)
    setMessages((prev) => [...prev, { role: 'user', content: choice.title }])
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
        setMessages((prev) => [...prev, { role: 'ai', content: "Une erreur s'est produite. Réessayez." }])
        return
      }
      const json = await res.json()
      setMessages((prev) => [...prev, { role: 'ai', content: json.choice.response }])
      updateGuilt(json.guiltyPourcentage)
      setChoices(json.nextChoices || [])
      setSelectedProofUuids([])
      setSelectedAlibiUuids([])
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', content: "Une erreur s'est produite. Réessayez." }])
    } finally {
      setLoading(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const contacts: ContactData[] = (game.data as any)?.contacts ?? []

  return (
    <GameStoreProvider game={game}>
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

          <ChatArea messages={messages} loading={loading} chatEndRef={chatEndRef} />

          <ChoicesBar
            choices={choices}
            loading={loading}
            isPaused={isPaused}
            selectedProofUuids={selectedProofUuids}
            selectedAlibiUuids={selectedAlibiUuids}
            onChoice={handleChoice}
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
            onAnswer={(answer, contactName) =>
              setMessages((prev) => [...prev, { role: 'contact', content: answer, contactName }])
            }
            onClose={() => setInterrogateOpen(false)}
          />
        )}
      </div>
    </AppLayout>
    </GameStoreProvider>
  )
}
