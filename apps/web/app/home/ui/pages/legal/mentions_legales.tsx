import AppLayout from '#common/ui/components/app_layout'
import { Main } from '#common/ui/components/main'
import { useTranslation } from '#common/ui/hooks/use_translation'
import { Link } from '@inertiajs/react'
import { Scale, Building2, Server, Copyright } from 'lucide-react'

export default function MentionsLegales() {
  const { t } = useTranslation()

  const fields = [
    { key: t('home.legal.mentions.editor.fields.legal_form'), value: t('home.legal.mentions.editor.fields.legal_form_value') },
    { key: t('home.legal.mentions.editor.fields.siren'), value: t('home.legal.mentions.editor.fields.siren_value') },
    { key: t('home.legal.mentions.editor.fields.ape'), value: t('home.legal.mentions.editor.fields.ape_value') },
    { key: t('home.legal.mentions.editor.fields.address'), value: t('home.legal.mentions.editor.fields.address_value') },
    { key: t('home.legal.mentions.editor.fields.registration'), value: t('home.legal.mentions.editor.fields.registration_value') },
  ]

  const sections = [
    {
      icon: Building2,
      title: t('home.legal.mentions.editor.title'),
      content: (
        <div className="space-y-3">
          <p>
            {t('home.legal.mentions.editor.intro')}{' '}
            <strong className="text-foreground">{t('home.legal.mentions.editor.name')}</strong>
          </p>
          <dl className="space-y-1.5">
            {fields.map(({ key, value }) => (
              <div key={key} className="flex flex-wrap gap-1.5">
                <dt className="font-medium text-foreground/80">{key} :</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ),
    },
    {
      icon: Server,
      title: t('home.legal.mentions.host.title'),
      content: <p>{t('home.legal.mentions.host.content')}</p>,
    },
    {
      icon: Copyright,
      title: t('home.legal.mentions.ip.title'),
      content: <p>{t('home.legal.mentions.ip.content')}</p>,
    },
  ]

  return (
    <AppLayout layout="header">
      <Main>
        <div className="max-w-3xl mx-auto py-16 px-4 mt-12">

          {/* Header */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-xs text-muted-foreground mb-5">
              <Scale className="size-3" />
              {t('home.legal.badge')}
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground mb-3">
              {t('home.legal.mentions.title')}
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              {t('home.legal.mentions.subtitle')}
            </p>
          </div>

          {/* Legal nav */}
          <nav className="flex flex-wrap gap-2 mb-12">
            {[
              { label: t('home.legal.nav.mentions'), href: '/mentions-legales', active: true },
              { label: t('home.legal.nav.cgu'), href: '/cgu', active: false },
              { label: t('home.legal.nav.privacy'), href: '/politique-confidentialite', active: false },
            ].map(({ label, href, active }) => (
              <Link
                key={href}
                href={href}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors border ${
                  active
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border/60 text-muted-foreground hover:text-foreground hover:border-border'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Sections */}
          <div className="space-y-10">
            {sections.map(({ icon: Icon, title, content }) => (
              <section key={title} className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="size-3.5" />
                  </div>
                  <h2 className="font-semibold text-foreground">{title}</h2>
                </div>
                <div className="pl-9 text-sm text-muted-foreground leading-relaxed space-y-2 border-l border-border/40 ml-3.5">
                  {content}
                </div>
              </section>
            ))}
          </div>

          {/* Footer note */}
          <p className="mt-16 text-xs text-muted-foreground/60 border-t border-border/30 pt-6">
            {t('home.legal.updated')}
          </p>
        </div>
      </Main>
    </AppLayout>
  )
}
