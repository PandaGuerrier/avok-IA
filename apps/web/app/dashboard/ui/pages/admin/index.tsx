import AppLayout from '#common/ui/components/app_layout'
import { Main } from '#common/ui/components/main'
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Label } from '@workspace/ui/components/label'
import { Switch } from '@workspace/ui/components/switch'
import { Input } from '@workspace/ui/components/input'
import { Textarea } from '@workspace/ui/components/textarea'
import { Button } from '@workspace/ui/components/button'
import { useForm, usePage } from '@inertiajs/react'
import { Save, AlertTriangle, Send, Mail } from 'lucide-react'
import useWebsiteSettings from '#common/ui/hooks/use_website_settings'
import { DateTime } from 'luxon'
import { useState } from 'react'

export default function AdminIndex() {
  const settings = useWebsiteSettings()
  const { props } = usePage<{ abilities: string[] }>()
  const canManageEmails = (props.abilities ?? []).includes('email:manage')

  type AdminSettingsFormData = {
    isMaintenance: boolean
    maintenanceMessage: string
    maintenanceEndTime?: string | null
  }

  const { data, setData, put, processing, errors } = useForm<AdminSettingsFormData>({
    isMaintenance: settings.isMaintenance,
    maintenanceMessage: settings.maintenanceMessage || '',
    maintenanceEndTime:
      DateTime.fromISO(String(settings.maintenanceEndTime || '')).toISODate() || null,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    put('/dashboard/admin/settings')
  }

  const [emailSubject, setEmailSubject] = useState('')
  const [emailContent, setEmailContent] = useState('')
  const [sendStatus, setSendStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [sendResult, setSendResult] = useState<string | null>(null)

  const handleSendNewsletter = async (e: React.FormEvent) => {
    e.preventDefault()
    setSendStatus('loading')
    setSendResult(null)

    try {
      const csrfToken = decodeURIComponent(
        document.cookie
          .split('; ')
          .find((row) => row.startsWith('XSRF-TOKEN='))
          ?.split('=')[1] ?? ''
      )

      const response = await fetch('/dashboard/admin/newsletter/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-XSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({ subject: emailSubject, content: emailContent }),
      })

      const data = await response.json()

      if (!response.ok) {
        setSendStatus('error')
        setSendResult(data?.message || 'Erreur lors de l\'envoi.')
        return
      }

      setSendStatus('success')
      setSendResult(`Email envoyé à ${data.sent} abonné(s).`)
      setEmailSubject('')
      setEmailContent('')
    } catch {
      setSendStatus('error')
      setSendResult('Erreur réseau. Veuillez réessayer.')
    }
  }

  return (
    <AppLayout layout="sidebar">
      <Main>
        <div className="flex items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold flex-1">Administration</h1>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="size-5 text-amber-500" />
                Mode Maintenance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-center justify-between border p-4 rounded-lg bg-muted/50">
                  <div className="space-y-0.5">
                    <Label className="text-base">Activer la maintenance</Label>
                    <p className="text-sm text-muted-foreground">
                      Le site sera inaccessible pour les utilisateurs non-administrateurs.{' '}
                    </p>
                  </div>
                  <Switch
                    checked={data.isMaintenance}
                    onCheckedChange={(checked) => setData('isMaintenance', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Message de maintenance</Label>
                  <Textarea
                    placeholder="Ex: Nous revenons bientôt..."
                    value={data.maintenanceMessage}
                    onChange={(e) => setData('maintenanceMessage', e.target.value)}
                    rows={4}
                    className={`${errors?.maintenanceMessage ? 'border-destructive' : ''}`}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ce message sera affiché aux visiteurs.
                  </p>
                  {errors?.maintenanceMessage && (
                    <p className="text-sm text-destructive">{errors.maintenanceMessage}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Date de fin prévue (Optionnel)</Label>
                  <Input
                    type="date"
                    value={data.maintenanceEndTime || ''}
                    onChange={(e) => {
                      const val = e.target.value
                      setData('maintenanceEndTime', (val as string) || null)
                    }}
                    className={`${errors?.maintenanceEndTime ? 'border-destructive' : ''}`}
                  />
                  <p className="text-xs text-muted-foreground">
                    Si renseignée, un compte à rebours sera affiché.
                  </p>
                  {errors?.maintenanceEndTime && (
                    <p className="text-sm text-destructive">{errors.maintenanceEndTime}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={processing}>
                    <Save className="size-4 mr-2" />
                    Enregistrer les paramètres
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {canManageEmails && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="size-5 text-primary" />
                  Envoyer un email aux abonnés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendNewsletter} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-subject">Sujet</Label>
                    <Input
                      id="email-subject"
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Ex: Eaglet est disponible !"
                      required
                      disabled={sendStatus === 'loading'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-content">Contenu (HTML autorisé)</Label>
                    <Textarea
                      id="email-content"
                      value={emailContent}
                      onChange={(e) => setEmailContent(e.target.value)}
                      placeholder="Rédigez votre message ici..."
                      rows={6}
                      required
                      disabled={sendStatus === 'loading'}
                    />
                    <p className="text-xs text-muted-foreground">
                      Le contenu sera envoyé à tous les abonnés vérifiés.
                    </p>
                  </div>

                  {sendResult && (
                    <p className={`text-sm ${sendStatus === 'success' ? 'text-primary' : 'text-destructive'}`}>
                      {sendResult}
                    </p>
                  )}

                  <div className="flex justify-end">
                    <Button type="submit" disabled={sendStatus === 'loading'}>
                      <Send className="size-4 mr-2" />
                      {sendStatus === 'loading' ? 'Envoi en cours...' : 'Envoyer'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </Main>
    </AppLayout>
  )
}
