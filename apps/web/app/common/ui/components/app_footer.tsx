import { Link } from '@inertiajs/react'
import { Origami, Github, Twitter, Linkedin, ArrowUpRight } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { useTranslation } from '#common/ui/hooks/use_translation'

const SOCIAL_LINKS = [
  { labelKey: 'GitHub', href: 'https://github.com', icon: Github },
  { labelKey: 'Twitter / X', href: 'https://twitter.com', icon: Twitter },
  { labelKey: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
]

export default function AppFooter() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  const PRODUCT_LINKS = [
    { label: t('common.footer.product.home'), href: '/' },
    { label: t('common.footer.product.pricing'), href: '/pricing' },
    { label: t('common.footer.product.dashboard'), href: '/dashboard' },
    { label: t('common.footer.product.contact'), href: '/billing/contact' },
  ]

  const LEGAL_LINKS = [
    { label: t('common.footer.legal.mentions'), href: '/mentions-legales' },
    { label: t('common.footer.legal.cgu'), href: '/cgu' },
    { label: t('common.footer.legal.privacy'), href: '/politique-confidentialite' },
  ]

  return (
    <footer className="relative mt-24 overflow-hidden border-t border-border/40 bg-background">
      {/* Huge background EAGLET wordmark */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-center overflow-hidden select-none"
      >
        <span className="whitespace-nowrap text-[clamp(6rem,18vw,16rem)] font-black uppercase leading-none tracking-tighter text-foreground/3">
          EAGLET
        </span>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-10">
        {/* ── Top: brand + description ─────────────────────────────────────── */}
        <div className="mb-16 flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary ring-1 ring-primary/20">
                <Origami className="size-5" />
              </div>
              <span className="text-2xl font-bold tracking-tight">Eaglet</span>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t('common.footer.tagline')}
            </p>
          </div>
        </div>

        {/* ── Middle grid ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Social links */}
          <div className="sm:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map(({ labelKey, href, icon: Icon }) => (
                <Button
                  key={labelKey}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={labelKey}
                  variant="secondary"
                  size="icon"
                >
                  <Icon className="size-4" />
                </Button>
              ))}
            </div>
          </div>

          {/* Product links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground/70">
              {t('common.footer.product.title')}
            </h3>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                    <ArrowUpRight className="size-3 opacity-0 -translate-y-0.5 translate-x-0.5 transition-all group-hover:opacity-100 group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-widest text-foreground/70">
              {t('common.footer.legal.title')}
            </h3>
            <ul className="space-y-3">
              {LEGAL_LINKS.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                    <ArrowUpRight className="size-3 opacity-0 -translate-y-0.5 translate-x-0.5 transition-all group-hover:opacity-100 group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-border/60 to-transparent" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-xs text-muted-foreground">{t('common.footer.copyright', { year })}</p>

          <div className="flex items-center gap-4">
            {LEGAL_LINKS.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className="text-xs text-muted-foreground/70 transition-colors hover:text-muted-foreground"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
