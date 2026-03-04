import { useState, useEffect, useRef } from 'react'
import { router } from '@inertiajs/react'
import AppLayout from '#common/ui/components/app_layout'
import usePageProps from '#common/ui/hooks/use_page_props'
import {
  Pause,
  Play,
  FileSearch,
  Mail,
  Calendar,
  StickyNote,
  ShieldX,
  Users,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  Loader2,
  type LucideIcon,
} from 'lucide-react'
import type GameDto from '#game/dtos/game'
import type AlibiDto from '#game/dtos/alibi'
import type ProofDto from '#game/dtos/proof'
import type ChoiceData from '#game/types/choices'
import type { ContactData } from '#game/types/data'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'ai' | 'user' | 'contact'
  content: string
  contactName?: string
}

interface Props {
  game: GameDto
  initialMessage: string
  currentChoices: ChoiceData[]
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DURATION_S = 7 * 60

const PROOF_TYPE_ICONS: Record<string, LucideIcon> = {
  instagram: FileSearch,
  mail: Mail,
  calendar: Calendar,
  note: StickyNote,
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

function calcRemaining(game: GameDto): number {
  if (!game.startTime) return DURATION_S
  const startMs = new Date(game.startTime as unknown as string).getTime()
  const pausedMs = game.totalPausedMs ?? 0
  const refMs = game.isPaused
    ? new Date(game.pausedAt as unknown as string).getTime()
    : Date.now()
  const elapsed = Math.floor((refMs - startMs - pausedMs) / 1000)
  return Math.max(0, DURATION_S - elapsed)
}

function buildInitialMessages(choices: GameDto['choices'], initialMessage: string): ChatMessage[] {
  const messages: ChatMessage[] = []
  if (initialMessage) messages.push({ role: 'ai', content: initialMessage })
  for (const choice of choices) {
    messages.push({ role: 'user', content: choice.data.title })
    if (choice.response) messages.push({ role: 'ai', content: choice.response })
  }
  return messages
}

// ─── SVG Widgets ─────────────────────────────────────────────────────────────

function GuiltyWidget({ percent }: { percent: number }) {
  // Semi-circle arc (top half of circle)
  const r = 42
  const cx = 50
  const cy = 54
  const circumference = Math.PI * r // half circumference
  const offset = circumference * (1 - percent / 100)

  const color =
    percent > 75
      ? '#ef4444'
      : percent > 50
        ? '#f97316'
        : percent > 25
          ? '#eab308'
          : '#22c55e'

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="100" height="60" viewBox="0 0 100 60">
        {/* Background arc */}
        <path
          d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Foreground arc */}
        <path
          d={`M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={`${offset}`}
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.6s ease' }}
        />
        <text x="50" y="52" textAnchor="middle" fill={color} fontSize="13" fontWeight="bold">
          {percent}%
        </text>
      </svg>
      <span className="text-[10px] text-white/40 uppercase tracking-widest">Culpabilité</span>
    </div>
  )
}

function TimerWidget({ seconds, isPaused }: { seconds: number; isPaused: boolean }) {
  const r = 36
  const cx = 44
  const cy = 44
  const circumference = 2 * Math.PI * r
  const progress = seconds / DURATION_S
  const offset = circumference * (1 - progress)

  const color = seconds < 60 ? '#ef4444' : seconds < 120 ? '#f97316' : '#22d3ee'

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={isPaused ? 'rgba(255,255,255,0.3)' : color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={`${offset}`}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 0.8s linear, stroke 0.6s ease' }}
        />
        <text
          x={cx}
          y={cy + 5}
          textAnchor="middle"
          fill={isPaused ? 'rgba(255,255,255,0.4)' : color}
          fontSize="13"
          fontWeight="bold"
          fontFamily="monospace"
        >
          {formatTime(seconds)}
        </text>
      </svg>
      <span className="text-[10px] text-white/40 uppercase tracking-widest">
        {isPaused ? 'En pause' : 'Temps restant'}
      </span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StartPage() {
  const { game, initialMessage, currentChoices: initialChoices } = usePageProps<Props>()

  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    buildInitialMessages(game.choices || [], initialMessage)
  )
  const [choices, setChoices] = useState<ChoiceData[]>(initialChoices || [])
  const [guilty, setGuilty] = useState(game.guiltyPourcentage ?? 50)
  const [loading, setLoading] = useState(false)
  const [timeLeft, setTimeLeft] = useState(() => calcRemaining(game))
  const [isPaused, setIsPaused] = useState(game.isPaused ?? false)
  const [proofs, setProofs] = useState<ProofDto[]>(game.proofs || [])
  const [selectedProofUuids, setSelectedProofUuids] = useState<string[]>([])
  const [alibis, setAlibis] = useState<AlibiDto[]>(game.alibis || [])

  // Modals / panels
  const [proofsOpen, setProofsOpen] = useState(false)
  const [expandedProofUuid, setExpandedProofUuid] = useState<string | null>(null)
  const [alibisPanelOpen, setAlibisPanelOpen] = useState(false)
  const [newAlibiTitle, setNewAlibiTitle] = useState('')
  const [newAlibiContent, setNewAlibiContent] = useState('')
  const [alibiFormOpen, setAlibiFormOpen] = useState(false)

  // Interrogation
  const [interrogateOpen, setInterrogateOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<ContactData | null>(null)
  const [interrogateQuestion, setInterrogateQuestion] = useState('')
  const [interrogating, setInterrogating] = useState(false)

  const chatEndRef = useRef<HTMLDivElement>(null)

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Timer
  useEffect(() => {
    if (isPaused) return
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
  }, [isPaused, game.uuid])

  // ── Actions ──────────────────────────────────────────────────────────────

  function toggleProof(uuid: string) {
    setSelectedProofUuids((prev) =>
      prev.includes(uuid) ? prev.filter((id) => id !== uuid) : [...prev, uuid]
    )
  }

  async function handlePause() {
    try {
      await fetch(`/game/${game.uuid}/pause`, {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-XSRF-TOKEN': getXsrfToken() },
      })
      setIsPaused(true)
    } catch {
      // silent
    }
  }

  async function handleResume() {
    try {
      await fetch(`/game/${game.uuid}/resume`, {
        method: 'POST',
        headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-XSRF-TOKEN': getXsrfToken() },
      })
      setIsPaused(false)
    } catch {
      // silent
    }
  }

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
      setSelectedProofUuids([])
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', content: "Une erreur s'est produite. Réessayez." }])
    } finally {
      setLoading(false)
    }
  }

  async function handleAddAlibi() {
    if (!newAlibiTitle.trim() || !newAlibiContent.trim()) return
    try {
      const res = await fetch(`/game/${game.uuid}/alibis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-XSRF-TOKEN': getXsrfToken(),
        },
        body: JSON.stringify({ title: newAlibiTitle, content: newAlibiContent }),
      })
      if (res.ok) {
        const json = await res.json()
        setAlibis((prev) => [...prev, json.alibi])
        setNewAlibiTitle('')
        setNewAlibiContent('')
        setAlibiFormOpen(false)
      }
    } catch {
      // silent
    }
  }

  async function handleDeleteAlibi(alibiUuid: string) {
    try {
      await fetch(`/game/${game.uuid}/alibis/${alibiUuid}`, {
        method: 'DELETE',
        headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-XSRF-TOKEN': getXsrfToken() },
      })
      setAlibis((prev) => prev.filter((a) => a.uuid !== alibiUuid))
    } catch {
      // silent
    }
  }

  async function handleInterrogate() {
    if (!selectedContact || !interrogateQuestion.trim() || interrogating) return
    setInterrogating(true)
    try {
      const res = await fetch(`/game/${game.uuid}/interrogate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-XSRF-TOKEN': getXsrfToken(),
        },
        body: JSON.stringify({ contactId: selectedContact.id, question: interrogateQuestion }),
      })
      if (res.ok) {
        const json = await res.json()
        setInterrogateOpen(false)
        setMessages((prev) => [
          ...prev,
          { role: 'contact', content: json.answer, contactName: json.contactName },
        ])
        setSelectedContact(null)
        setInterrogateQuestion('')
      }
    } catch {
      // silent
    } finally {
      setInterrogating(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AppLayout layout="sidebar" hideBottomNav removePadding>
      {/* Dark futuristic base */}
      <div className="relative flex h-[calc(100vh-4rem)] overflow-hidden bg-[#050510] text-white">

        {/* Subtle background radial glow */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(6,182,212,0.06) 0%, transparent 70%)',
          }}
        />

        {/* ── MAIN AREA ───────────────────────────────────────────────────── */}
        <div className="relative z-10 flex flex-1 flex-col min-w-0">

          {/* ─ Header bar ─ */}
          <div className="shrink-0 flex items-center justify-between gap-4 px-4 py-2 border-b border-white/10 bg-white/3 backdrop-blur-sm">

            {/* Left: suspect badge */}
            <div className="flex items-center gap-2">
              <ShieldX className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">
                Dossier #{game.uuid.slice(0, 8).toUpperCase()}
              </span>
            </div>

            {/* Center: widgets */}
            <div className="flex items-center gap-6">
              <GuiltyWidget percent={guilty} />
              <TimerWidget seconds={timeLeft} isPaused={isPaused} />
            </div>

            {/* Right: controls */}
            <div className="flex items-center gap-2">
              {/* Proofs button */}
              <button
                onClick={() => setProofsOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 hover:text-cyan-400 hover:border-cyan-500/30 transition-all"
              >
                <FileSearch className="w-3.5 h-3.5" />
                <span>Preuves</span>
                {proofs.length > 0 && (
                  <span className="bg-cyan-500/20 text-cyan-400 rounded-full px-1.5 text-[10px]">
                    {proofs.length}
                  </span>
                )}
              </button>

              {/* Alibis button */}
              <button
                onClick={() => setAlibisPanelOpen((v) => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 hover:text-purple-400 hover:border-purple-500/30 transition-all"
              >
                <StickyNote className="w-3.5 h-3.5" />
                <span>Alibis</span>
                {alibis.length > 0 && (
                  <span className="bg-purple-500/20 text-purple-400 rounded-full px-1.5 text-[10px]">
                    {alibis.length}
                  </span>
                )}
              </button>

              {/* Interrogate button */}
              <button
                onClick={() => setInterrogateOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 hover:text-amber-400 hover:border-amber-500/30 transition-all"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Interroger</span>
              </button>

              {/* Pause / Resume */}
              {isPaused ? (
                <button
                  onClick={handleResume}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-xs text-cyan-400 hover:bg-cyan-500/25 transition-all"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Reprendre</span>
                </button>
              ) : (
                <button
                  onClick={handlePause}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/50 hover:text-white/80 transition-all"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>
              )}
            </div>
          </div>

          {/* ─ Chat area ─ */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'contact' ? (
                  <div className="max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed backdrop-blur-sm bg-amber-500/10 border border-amber-500/20 text-amber-200">
                    <p className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider mb-1">{msg.contactName}</p>
                    {msg.content}
                  </div>
                ) : (
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed backdrop-blur-sm ${
                      msg.role === 'user'
                        ? 'bg-cyan-500/15 border border-cyan-500/20 text-cyan-100 rounded-br-sm'
                        : 'bg-white/5 border border-white/10 text-white/85 rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* ─ Choices bar ─ */}
          <div className="shrink-0 px-4 py-3 border-t border-white/10 bg-white/2 backdrop-blur-sm space-y-2">
            {selectedProofUuids.length > 0 && (
              <p className="text-[11px] text-cyan-400 font-medium px-1">
                {selectedProofUuids.length} preuve{selectedProofUuids.length > 1 ? 's' : ''} sélectionnée{selectedProofUuids.length > 1 ? 's' : ''} — incluse{selectedProofUuids.length > 1 ? 's' : ''} dans le prochain échange
              </p>
            )}
            {choices.map((choice) => (
              <button
                key={choice.id}
                disabled={loading || isPaused}
                onClick={() => handleChoice(choice)}
                className="w-full text-left px-4 py-2.5 rounded-xl border transition-all text-sm backdrop-blur-sm disabled:opacity-40 bg-white/5 border-white/10 hover:bg-cyan-500/8 hover:border-cyan-500/25 text-white/80"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-sm text-white/90">{choice.title}</p>
                  <p className="text-xs mt-0.5 text-white/40">{choice.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── ALIBIS SIDE PANEL ──────────────────────────────────────────── */}
        {alibisPanelOpen && (
          <div className="relative z-10 w-72 shrink-0 border-l border-white/10 flex flex-col bg-white/2 backdrop-blur-md max-lg:hidden">
            <div className="shrink-0 px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Mes alibis</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAlibiFormOpen((v) => !v)}
                  className="p-1 rounded-md bg-white/5 border border-white/10 text-white/40 hover:text-purple-400 hover:border-purple-500/30 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setAlibisPanelOpen(false)}
                  className="p-1 rounded-md text-white/30 hover:text-white/60 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Add alibi form */}
            {alibiFormOpen && (
              <div className="shrink-0 p-3 border-b border-white/10 bg-purple-500/5 space-y-2">
                <input
                  type="text"
                  placeholder="Titre de l'alibi"
                  value={newAlibiTitle}
                  onChange={(e) => setNewAlibiTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50"
                />
                <textarea
                  placeholder="Décrivez votre alibi..."
                  value={newAlibiContent}
                  onChange={(e) => setNewAlibiContent(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddAlibi}
                    className="flex-1 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-xs text-purple-400 hover:bg-purple-500/30 transition-all"
                  >
                    Ajouter
                  </button>
                  <button
                    onClick={() => setAlibiFormOpen(false)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/40 hover:text-white/70 transition-all"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {alibis.length === 0 ? (
                <div className="text-center py-10 text-white/30">
                  <StickyNote className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Aucun alibi enregistré</p>
                </div>
              ) : (
                alibis.map((alibi) => (
                  <div
                    key={alibi.uuid}
                    className="p-3 rounded-xl border border-white/8 bg-white/3 group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-semibold text-purple-300">{alibi.title}</p>
                      <button
                        onClick={() => handleDeleteAlibi(alibi.uuid)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-white/30 hover:text-red-400 transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <p className="text-[11px] text-white/40 mt-1 leading-relaxed">{alibi.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── PAUSE OVERLAY ─────────────────────────────────────────────── */}
        {isPaused && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-lg">
            <div className="bg-white/5 border border-white/15 rounded-2xl p-10 flex flex-col items-center gap-6 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <Pause className="w-7 h-7 text-cyan-400" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-white">Enquête en pause</p>
                <p className="text-sm text-white/40 mt-1">Le chronomètre est arrêté</p>
              </div>
              <button
                onClick={handleResume}
                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-semibold hover:bg-cyan-500/30 hover:border-cyan-500/60 transition-all"
              >
                <Play className="w-4 h-4" />
                Reprendre l'enquête
              </button>
            </div>
          </div>
        )}

        {/* ── PROOFS MODAL ──────────────────────────────────────────────── */}
        {proofsOpen && (
          <div className="absolute inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/60 backdrop-blur-md">
            <div className="w-full max-w-2xl bg-[#0a0a1a] border border-white/15 rounded-2xl shadow-2xl flex flex-col max-h-[75vh]">

              {/* Modal header */}
              <div className="shrink-0 px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileSearch className="w-4 h-4 text-cyan-400" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Dossier à charge</h2>
                  <span className="bg-cyan-500/15 text-cyan-400 text-[10px] px-2 py-0.5 rounded-full border border-cyan-500/20">
                    {proofs.length} pièce{proofs.length > 1 ? 's' : ''}
                  </span>
                </div>
                <button
                  onClick={() => setProofsOpen(false)}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/8 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Proof list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {proofs.length === 0 ? (
                  <div className="text-center py-12 text-white/30">
                    <FileSearch className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">Aucune preuve collectée pour l'instant</p>
                  </div>
                ) : (
                  proofs.map((proof) => {
                    const isSelected = selectedProofUuids.includes(proof.uuid)
                    const isExpanded = expandedProofUuid === proof.uuid
                    const Icon = PROOF_TYPE_ICONS[proof.data?.type] || FileSearch

                    return (
                      <div
                        key={proof.uuid}
                        className={`rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-cyan-500/8 border-cyan-500/30'
                            : 'bg-white/3 border-white/8 hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-center gap-3 px-4 py-3">
                          <button
                            onClick={() => toggleProof(proof.uuid)}
                            className={`w-4 h-4 rounded border shrink-0 transition-all ${
                              isSelected
                                ? 'bg-cyan-500 border-cyan-500'
                                : 'bg-transparent border-white/20 hover:border-cyan-500/50'
                            }`}
                          >
                            {isSelected && (
                              <span className="flex w-full h-full items-center justify-center text-black text-[10px] font-bold leading-none">
                                ✓
                              </span>
                            )}
                          </button>
                          <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-white/40'}`} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs font-semibold ${isSelected ? 'text-cyan-300' : 'text-white/80'}`}>
                              {proof.data?.title || 'Preuve'}
                            </p>
                            <p className="text-[10px] text-white/30 uppercase tracking-wider mt-0.5">
                              {proof.data?.type || 'document'}
                            </p>
                          </div>
                          <button
                            onClick={() => setExpandedProofUuid(isExpanded ? null : proof.uuid)}
                            className="p-1 text-white/30 hover:text-white/60 transition-colors"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        {isExpanded && (
                          <div className="px-4 pb-3 pt-0 border-t border-white/8 mt-2">
                            {proof.data?.type === 'image' && proof.imageUrl ? (
                              <img src={proof.imageUrl} alt={proof.data?.title} className="rounded-lg max-w-full mt-2" />
                            ) : proof.data?.type === 'pdf' && proof.imageUrl ? (
                              <a
                                href={proof.imageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-cyan-400 underline mt-2 inline-block"
                              >
                                Ouvrir le PDF
                              </a>
                            ) : (
                              <p className="text-xs text-white/60 leading-relaxed mt-2">{proof.content}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>

              {/* Selection summary */}
              {selectedProofUuids.length > 0 && (
                <div className="shrink-0 px-5 py-3 border-t border-white/10 bg-cyan-500/5 flex items-center justify-between">
                  <p className="text-xs text-cyan-400">
                    {selectedProofUuids.length} preuve{selectedProofUuids.length > 1 ? 's' : ''} sélectionnée{selectedProofUuids.length > 1 ? 's' : ''} pour le prochain échange
                  </p>
                  <button
                    onClick={() => setSelectedProofUuids([])}
                    className="text-xs text-white/30 hover:text-white/60 transition-colors"
                  >
                    Tout désélectionner
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── INTERROGATION MODAL ───────────────────────────────────────── */}
        {interrogateOpen && (
          <div className="absolute inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/60 backdrop-blur-md">
            <div className="w-full max-w-md bg-[#0a0a1a] border border-white/15 rounded-2xl shadow-2xl flex flex-col max-h-[75vh]">

              {/* Modal header */}
              <div className="shrink-0 px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Interrogatoire</h2>
                </div>
                <button
                  onClick={() => { setInterrogateOpen(false); setSelectedContact(null); setInterrogateQuestion('') }}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/8 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Contact list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                <p className="text-xs text-white/40 mb-3">Choisissez une personne à interroger :</p>
                {((game.data as any)?.contacts ?? []).map((contact: ContactData) => (
                  <button
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                      selectedContact?.id === contact.id
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                        : 'bg-white/3 border-white/8 text-white/70 hover:border-white/20'
                    }`}
                  >
                    <p className="text-sm font-semibold">{contact.name}</p>
                    <p className="text-xs mt-0.5 text-white/40 capitalize">{contact.role}</p>
                  </button>
                ))}
              </div>

              {/* Question input */}
              {selectedContact && (
                <div className="shrink-0 p-4 border-t border-white/10 space-y-3">
                  <p className="text-xs text-amber-400 font-medium">Question pour {selectedContact.name} :</p>
                  <textarea
                    value={interrogateQuestion}
                    onChange={(e) => setInterrogateQuestion(e.target.value)}
                    placeholder="Posez votre question..."
                    rows={3}
                    className="w-full px-3 py-2 text-xs bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 resize-none"
                  />
                  <button
                    onClick={handleInterrogate}
                    disabled={!interrogateQuestion.trim() || interrogating}
                    className="w-full py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-xs text-amber-400 font-semibold hover:bg-amber-500/30 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {interrogating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    Poser la question
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  )
}
