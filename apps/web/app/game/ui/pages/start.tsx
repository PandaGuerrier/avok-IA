import { useState, useEffect, useRef } from 'react'
import { router } from '@inertiajs/react'
import AppSidebarLayout from '#common/ui/components/app_sidebar_layout'
import { Button } from '@workspace/ui/components/button'
import usePageProps from '#common/ui/hooks/use_page_props'
import useUser from '#auth/ui/hooks/use_user'
import { getNavUser } from '#common/ui/config/navigation.config'
import { useTranslation } from '#common/ui/hooks/use_translation'
import { Loader2, ShieldAlert, FileSearch, Mail, Calendar, StickyNote, AlertTriangle, type LucideIcon } from 'lucide-react'
import type GameDto from '#game/dtos/game'
import type ProofDto from '#game/dtos/proof'
import type ChoiceData from '#game/types/choices'

interface ChatMessage {
  role: 'ai' | 'user'
  content: string
}

interface Props {
  game: GameDto
  initialMessage: string
  currentChoices: ChoiceData[]
}

const PROOF_TYPE_ICONS: Record<string, LucideIcon> = {
  instagram: FileSearch,
  mail: Mail,
  calendar: Calendar,
  note: StickyNote,
}

function buildInitialMessages(choices: GameDto['choices'], initialMessage: string): ChatMessage[] {
  const messages: ChatMessage[] = []
  if (initialMessage) {
    messages.push({ role: 'ai', content: initialMessage })
  }
  for (const choice of choices) {
    messages.push({ role: 'user', content: choice.data.title })
    if (choice.response) {
      messages.push({ role: 'ai', content: choice.response })
    }
  }
  return messages
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function getXsrfToken(): string {
  return decodeURIComponent(
    document.cookie
      .split(';')
      .find((c) => c.trim().startsWith('XSRF-TOKEN='))
      ?.split('=')[1] || ''
  )
}

export default function StartPage() {
  const { game, initialMessage, currentChoices } = usePageProps<Props>()
  const user = useUser()
  const { t } = useTranslation()
  const navUser = getNavUser(t)

  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    buildInitialMessages(game.choices || [], initialMessage)
  )
  const [choices, setChoices] = useState<ChoiceData[]>(currentChoices || [])
  const [guilty, setGuilty] = useState(game.guiltyPourcentage ?? 50)
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(7 * 60)
  const [proofs, setProofs] = useState<ProofDto[]>(game.proofs || [])
  const [selectedProofUuids, setSelectedProofUuids] = useState<string[]>([])

  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          router.visit(`/game/${game.uuid}/result`)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [game.uuid])

  function toggleProof(uuid: string) {
    setSelectedProofUuids((prev) =>
      prev.includes(uuid) ? prev.filter((id) => id !== uuid) : [...prev, uuid]
    )
  }

  async function handleChoice(choice: ChoiceData) {
    if (loading) return
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
        body: JSON.stringify({ data: choice, selectedProofUuids }),
      })

      if (!res.ok) {
        setMessages((prev) => [...prev, { role: 'ai', content: "Une erreur s'est produite. Réessayez." }])
        return
      }

      const json = await res.json()
      setMessages((prev) => [...prev, { role: 'ai', content: json.choice.response }])
      setGuilty(json.guiltyPourcentage)
      setChoices(json.nextChoices || [])
      if (json.newProofs && json.newProofs.length > 0) {
        setProofs((prev) => [...prev, ...json.newProofs])
      }
      setSelectedProofUuids([])
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', content: "Une erreur s'est produite. Réessayez." }])
    } finally {
      setLoading(false)
    }
  }

  const guiltyColor =
    guilty > 75 ? 'bg-red-500' : guilty > 50 ? 'bg-orange-500' : guilty > 25 ? 'bg-yellow-500' : 'bg-green-500'
  const timerColor = timeLeft < 60 ? 'text-red-500' : timeLeft < 120 ? 'text-orange-500' : 'text-foreground'

  return (
    <AppSidebarLayout navMain={[]} navUser={navUser} user={user} removePadding>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">

        {/* ── Zone principale : header + chat + choix ── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* Header fixe : score + timer */}
          <div className="shrink-0 border-b bg-background px-4 py-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                Score de culpabilité
              </span>
              <span className={`text-sm font-bold tabular-nums ${timerColor}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${guiltyColor}`}
                  style={{ width: `${guilty}%` }}
                />
              </div>
              <span className="text-sm font-semibold w-10 text-right">{guilty}%</span>
            </div>
          </div>

          {/* Zone chat */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-muted text-foreground rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Choix (sticky bas) */}
          <div className="shrink-0 border-t bg-background px-4 py-3 space-y-2">
            {selectedProofUuids.length > 0 && (
              <p className="text-xs text-primary font-medium px-1">
                {selectedProofUuids.length} preuve{selectedProofUuids.length > 1 ? 's' : ''} sélectionnée{selectedProofUuids.length > 1 ? 's' : ''} — incluse{selectedProofUuids.length > 1 ? 's' : ''} dans le prochain échange
              </p>
            )}
            {choices.map((choice) => (
              <Button
                key={choice.id}
                variant={choice.isTrap ? 'ghost' : 'outline'}
                className={`w-full justify-start text-left h-auto py-2 px-3 ${
                  choice.isTrap
                    ? 'border border-red-500/30 hover:bg-red-500/10 hover:border-red-500/60'
                    : ''
                }`}
                disabled={loading}
                onClick={() => handleChoice(choice)}
              >
                <div className="flex items-start gap-2 w-full">
                  {choice.isTrap && (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className={`font-medium text-sm ${choice.isTrap ? 'text-red-500' : ''}`}>
                      {choice.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{choice.description}</p>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* ── Sidebar preuves ── */}
        <div className="w-72 shrink-0 border-l flex flex-col bg-muted/10 max-lg:hidden">
          <div className="shrink-0 px-3 py-3 border-b flex items-center justify-between">
            <h3 className="text-sm font-semibold">Preuves collectées</h3>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {proofs.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {proofs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileSearch className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs">Aucune preuve trouvée pour l'instant</p>
              </div>
            ) : (
              proofs.map((proof) => {
                const isSelected = selectedProofUuids.includes(proof.uuid)
                const Icon = PROOF_TYPE_ICONS[proof.data?.type] || FileSearch
                return (
                  <button
                    key={proof.uuid}
                    onClick={() => toggleProof(proof.uuid)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all text-xs ${
                      isSelected
                        ? 'border-primary bg-primary/10 ring-1 ring-primary/30'
                        : 'border-border bg-card hover:bg-accent hover:border-primary/30'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <Icon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="min-w-0">
                        <p className={`font-medium leading-tight mb-1 ${isSelected ? 'text-primary' : ''}`}>
                          {proof.data?.title || 'Preuve'}
                        </p>
                        <p className="text-muted-foreground leading-relaxed line-clamp-3">
                          {proof.content}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="mt-2 pt-1.5 border-t border-primary/20">
                        <p className="text-primary text-[10px] font-medium">✓ Sélectionnée</p>
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </div>

          {selectedProofUuids.length > 0 && (
            <div className="shrink-0 px-3 py-2.5 border-t bg-primary/5">
              <button
                onClick={() => setSelectedProofUuids([])}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Tout désélectionner
              </button>
            </div>
          )}
        </div>

      </div>
    </AppSidebarLayout>
  )
}
