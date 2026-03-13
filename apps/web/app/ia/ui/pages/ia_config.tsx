import { useState } from 'react'
import AppLayout from '#common/ui/components/app_layout'
import usePageProps from '#common/ui/hooks/use_page_props'
import { Badge } from '@workspace/ui/components/badge'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { Label } from '@workspace/ui/components/label'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Eye, EyeOff, Plus, Trash2, Zap, ServerCog } from 'lucide-react'
import { router } from '@inertiajs/react'

interface IaConfigItem {
  uuid: string
  name: string
  endpoint: string
  apiKey: string
  model: string
  isActive: boolean
}

interface Props {
  configs: IaConfigItem[]
}

interface ConfigFormState {
  name: string
  endpoint: string
  apiKey: string
  model: string
}

const emptyForm: ConfigFormState = { name: '', endpoint: '', apiKey: '', model: '' }

export default function IaConfigPage() {
  const { configs } = usePageProps<Props>()
  const [showKeyFor, setShowKeyFor] = useState<string | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newForm, setNewForm] = useState<ConfigFormState>(emptyForm)
  const [editUuid, setEditUuid] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<ConfigFormState>(emptyForm)

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    router.post('/admin/ia', newForm, {
      onSuccess: () => {
        setNewForm(emptyForm)
        setShowNewForm(false)
      },
    })
  }

  function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editUuid) return
    router.put(`/admin/ia/${editUuid}`, editForm, {
      onSuccess: () => setEditUuid(null),
    })
  }

  function handleActivate(uuid: string) {
    router.patch(`/admin/ia/${uuid}/activate`)
  }

  function handleDelete(uuid: string) {
    router.delete(`/admin/ia/${uuid}`)
  }

  function handleUseEnv() {
    router.patch('/admin/ia/use-env')
  }

  function startEdit(config: IaConfigItem) {
    setEditUuid(config.uuid)
    setEditForm({
      name: config.name,
      endpoint: config.endpoint,
      apiKey: config.apiKey,
      model: config.model,
    })
  }

  const activeConfig = configs.find((c) => c.isActive)
  const usingEnv = !activeConfig

  return (
    <AppLayout breadcrumbs={[{ label: 'Admin' }, { label: 'Configuration IA' }]}>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Configuration IA</h1>
          <div className="flex gap-2">
            {!usingEnv && (
              <Button variant="outline" size="sm" onClick={handleUseEnv}>
                <ServerCog className="w-4 h-4 mr-2" />
                Basculer sur .env
              </Button>
            )}
            <Button onClick={() => setShowNewForm((v) => !v)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle config
            </Button>
          </div>
        </div>

        {usingEnv && (
          <div className="flex items-center gap-3 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-600 dark:text-blue-400">
            <ServerCog className="w-4 h-4 shrink-0" />
            <span>Aucune config active — l'IA utilise les variables <code className="font-mono text-xs">.env</code> (IA_API_URL, IA_API_KEY).</span>
          </div>
        )}

        {showNewForm && (
          <Card>
            <CardHeader>
              <CardTitle>Nouvelle configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreate} className="space-y-4">
                <ConfigFormFields form={newForm} onChange={setNewForm} showKey={showKeyFor === 'new'} onToggleKey={() => setShowKeyFor(showKeyFor === 'new' ? null : 'new')} />
                <div className="flex gap-2">
                  <Button type="submit">Créer</Button>
                  <Button type="button" variant="outline" onClick={() => setShowNewForm(false)}>Annuler</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {configs.length === 0 && (
            <p className="text-muted-foreground text-sm">Aucune configuration IA. Créez-en une ci-dessus.</p>
          )}
          {configs.map((config) => (
            <Card key={config.uuid} className={config.isActive ? 'border-primary' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{config.name}</CardTitle>
                    {config.isActive && <Badge variant="default">Actif</Badge>}
                  </div>
                  <div className="flex gap-2">
                    {!config.isActive && (
                      <Button size="sm" variant="outline" onClick={() => handleActivate(config.uuid)}>
                        <Zap className="w-3 h-3 mr-1" />
                        Activer
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => startEdit(config)}>
                      Modifier
                    </Button>
                    {!config.isActive && (
                      <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(config.uuid)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p><span className="font-medium text-foreground">Endpoint :</span> {config.endpoint}</p>
                <p><span className="font-medium text-foreground">Modèle :</span> {config.model}</p>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">Clé API :</span>
                  <span className="font-mono">
                    {showKeyFor === config.uuid ? config.apiKey : '••••••••••••••••'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowKeyFor(showKeyFor === config.uuid ? null : config.uuid)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    {showKeyFor === config.uuid ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  </button>
                </div>
              </CardContent>

              {editUuid === config.uuid && (
                <CardContent className="border-t pt-4">
                  <form onSubmit={handleUpdate} className="space-y-4">
                    <ConfigFormFields
                      form={editForm}
                      onChange={setEditForm}
                      showKey={showKeyFor === `edit-${config.uuid}`}
                      onToggleKey={() => setShowKeyFor(showKeyFor === `edit-${config.uuid}` ? null : `edit-${config.uuid}`)}
                    />
                    <div className="flex gap-2">
                      <Button type="submit">Enregistrer</Button>
                      <Button type="button" variant="outline" onClick={() => setEditUuid(null)}>Annuler</Button>
                    </div>
                  </form>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}

function ConfigFormFields({
  form,
  onChange,
  showKey,
  onToggleKey,
}: {
  form: ConfigFormState
  onChange: (f: ConfigFormState) => void
  showKey: boolean
  onToggleKey: () => void
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-1">
        <Label htmlFor="name">Nom</Label>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          placeholder="OpenAI GPT-4"
          required
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="model">Modèle</Label>
        <Input
          id="model"
          value={form.model}
          onChange={(e) => onChange({ ...form, model: e.target.value })}
          placeholder="o3-mini"
          required
        />
      </div>
      <div className="space-y-1 md:col-span-2">
        <Label htmlFor="endpoint">Endpoint</Label>
        <Input
          id="endpoint"
          value={form.endpoint}
          onChange={(e) => onChange({ ...form, endpoint: e.target.value })}
          placeholder="https://api.openai.com/v1"
          required
        />
      </div>
      <div className="space-y-1 md:col-span-2">
        <Label htmlFor="apiKey">Clé API</Label>
        <div className="relative">
          <Input
            id="apiKey"
            type={showKey ? 'text' : 'password'}
            value={form.apiKey}
            onChange={(e) => onChange({ ...form, apiKey: e.target.value })}
            placeholder="sk-..."
            required
            className="pr-10"
          />
          <button
            type="button"
            onClick={onToggleKey}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
