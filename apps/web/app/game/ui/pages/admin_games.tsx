import { useState, useMemo } from 'react'
import { router } from '@inertiajs/react'
import AppLayout from '#common/ui/components/app_layout'
import usePageProps from '#common/ui/hooks/use_page_props'
import { Button } from '@workspace/ui/components/button'
import { Badge } from '@workspace/ui/components/badge'
import { Checkbox } from '@workspace/ui/components/checkbox'
import { Input } from '@workspace/ui/components/input'
import { Trash2, Search } from 'lucide-react'

interface GameEntry {
  uuid: string
  username: string
  userUuid: string
  guiltyPourcentage: number
  isFinished: boolean
  durationMs: number | null
  createdAt: string
  finishedAt: string | null
}

interface Props {
  entries: GameEntry[]
}

function formatDuration(ms: number | null): string {
  if (ms === null) return '—'
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m}m${rem.toString().padStart(2, '0')}s`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

type FilterStatus = 'all' | 'finished' | 'ongoing'

export default function AdminGamesPage() {
  const { entries } = usePageProps<Props>()

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const matchSearch = e.username.toLowerCase().includes(search.toLowerCase()) ||
        e.uuid.toLowerCase().includes(search.toLowerCase())
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'finished' && e.isFinished) ||
        (filterStatus === 'ongoing' && !e.isFinished)
      return matchSearch && matchStatus
    })
  }, [entries, search, filterStatus])

  const allSelected = filtered.length > 0 && filtered.every((e) => selected.has(e.uuid))

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev)
        filtered.forEach((e) => next.delete(e.uuid))
        return next
      })
    } else {
      setSelected((prev) => {
        const next = new Set(prev)
        filtered.forEach((e) => next.add(e.uuid))
        return next
      })
    }
  }

  function toggle(uuid: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(uuid) ? next.delete(uuid) : next.add(uuid)
      return next
    })
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    router.delete('/admin/games', {
      data: { uuids: [...selected] },
      onSuccess: () => {
        setSelected(new Set())
        setConfirmDelete(false)
      },
    })
  }

  return (
    <AppLayout breadcrumbs={[{ label: 'Admin' }, { label: 'Parties' }]}>
      <div className="p-6 max-w-6xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Parties</h1>
            <p className="text-sm text-muted-foreground">{entries.length} parties au total</p>
          </div>

          {selected.size > 0 && (
            <Button
              variant={confirmDelete ? 'destructive' : 'outline'}
              onClick={handleDelete}
              onBlur={() => setConfirmDelete(false)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {confirmDelete
                ? `Confirmer (${selected.size})`
                : `Supprimer (${selected.size})`}
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-center">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Rechercher un joueur ou UUID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1">
            {(['all', 'finished', 'ongoing'] as FilterStatus[]).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={filterStatus === s ? 'default' : 'outline'}
                onClick={() => setFilterStatus(s)}
              >
                {s === 'all' ? 'Toutes' : s === 'finished' ? 'Terminées' : 'En cours'}
              </Button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="w-10 px-4 py-3 text-left">
                  <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
                </th>
                <th className="px-4 py-3 text-left font-medium">Joueur</th>
                <th className="px-4 py-3 text-left font-medium">Statut</th>
                <th className="px-4 py-3 text-left font-medium">Culpabilité</th>
                <th className="px-4 py-3 text-left font-medium">Durée</th>
                <th className="px-4 py-3 text-left font-medium">Créée le</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    Aucune partie trouvée.
                  </td>
                </tr>
              )}
              {filtered.map((entry) => (
                <tr
                  key={entry.uuid}
                  className={`hover:bg-muted/30 transition-colors ${selected.has(entry.uuid) ? 'bg-destructive/5' : ''}`}
                  onClick={() => toggle(entry.uuid)}
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selected.has(entry.uuid)}
                      onCheckedChange={() => toggle(entry.uuid)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{entry.username}</div>
                    <div className="text-xs text-muted-foreground font-mono">{entry.uuid.slice(0, 8)}…</div>
                  </td>
                  <td className="px-4 py-3">
                    {entry.isFinished ? (
                      <Badge variant="default">Terminée</Badge>
                    ) : (
                      <Badge variant="secondary">En cours</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={entry.guiltyPourcentage > 50 ? 'text-red-500' : 'text-green-500'}>
                      {entry.guiltyPourcentage}%
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{formatDuration(entry.durationMs)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(entry.createdAt)}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => {
                        setSelected(new Set([entry.uuid]))
                        setConfirmDelete(false)
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  )
}
