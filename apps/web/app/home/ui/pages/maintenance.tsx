import { useState } from 'react'
import { Head } from '@inertiajs/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, HardHat, Hammer, X, ArrowUpRight } from 'lucide-react'
import WebsiteSetting from '#common/models/website_setting'
import { CountdownTimer } from '#home/ui/components/countdown_timer'
import { useTranslation } from '#common/ui/hooks/use_translation'
import { AppLangChanger } from '#common/ui/components/app_lang_changer'
import { ToggleTheme } from '#common/ui/components/toggle_theme'
import AppLayout from '#common/ui/components/app_layout'
import { Marquee } from '@workspace/ui/components/marquee'

/* ─── Page principale ───────────────────────────────────────────────── */
export default function MaintenancePage({ settings }: { settings: WebsiteSetting }) {
  const { t } = useTranslation()

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    }),
  }

  const features = [
    { icon: Zap, key: 'f1' },
    { icon: Hammer, key: 'f2' },
    { icon: HardHat, key: 'f3' },
  ] as const

  const mockupImages = [
    '/images/maintenance/graphist_mockup.png',
    '/images/maintenance/menuisier_mockup.png',
  ]

  const [lightbox, setLightbox] = useState<string | null>(null)

  return (
    <AppLayout layout={'none'}>
      <Head title={t('home.maintenance.title')} />

      <div className="min-h-screen w-full relative overflow-hidden bg-background flex flex-col">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-accent/30 blur-3xl" />
          <svg
            className="absolute inset-0 w-full h-full opacity-[0.025]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <filter id="noise">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.65"
                numOctaves="3"
                stitchTiles="stitch"
              />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)" />
          </svg>
        </div>

        {/* ── Lang changer ── */}
        <div className="relative z-20 w-full max-w-6xl mx-auto flex justify-end p-4 space-x-2">
          <ToggleTheme />
          <AppLangChanger />
        </div>

        <div className="relative z-10 flex-1 flex items-center">
          <div className="w-full max-w-6xl mx-auto px-6 py-8 lg:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="flex flex-col items-start">
                <motion.div
                  custom={0}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="mb-6"
                >
                  <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-primary/30 bg-primary/10 text-primary">
                    <span className="size-2 rounded-full bg-primary animate-pulse" />
                    {t('home.hero.badge')}
                  </span>
                </motion.div>

                <motion.h1
                  custom={1}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="font-serif text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight leading-[1.15] text-foreground mb-5 whitespace-pre-line"
                >
                  {t('home.hero.title')}
                </motion.h1>

                <motion.p
                  custom={2}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-md"
                >
                  {t('home.hero.description')}
                </motion.p>

                <motion.div
                  custom={3}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="flex flex-col gap-4 mb-8 w-full max-w-md"
                >
                  {features.map(({ icon: Icon, key }) => (
                    <div key={key} className="flex items-start gap-3.5">
                      <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground leading-tight">
                          {t(`home.hero.features.${key as string}`)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                          {t(`home.hero.features_detail.${key as string}_desc`)}
                        </p>
                      </div>
                    </div>
                  ))}
                </motion.div>

                {settings.maintenanceEndTime ? (
                  <motion.div
                    custom={4}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    className="w-full max-w-md mb-8"
                  >
                    <CountdownTimer
                      targetDate={settings.maintenanceEndTime.toString()}
                      variants={{}}
                    />
                  </motion.div>
                ) : null}

                <motion.div
                  custom={5}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="w-full max-w-sm mb-4"
                >
                  <div className="flex items-start gap-2.5 rounded-lg border border-dashed border-primary/30 px-3 py-2.5">
                    <span className="shrink-0 text-[11px] font-bold text-primary bg-primary/10 rounded-full  px-1.5 py-0.5 leading-tight my-auto">
                      {t('home.maintenance.discount_label')}
                    </span>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t('home.maintenance.discount_desc')}
                    </p>
                  </div>
                </motion.div>

              </div>

              {/* ── Colonne droite : galerie scrollante ── */}
              <motion.div
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                className="hidden lg:flex gap-4 h-155 overflow-hidden"
                style={{
                  maskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
                  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
                }}
              >
                {/* Col 1 — descend, lent */}
                <Marquee vertical repeat={6} className="flex-1 overflow-hidden [--duration:32s] [--gap:0.75rem]">
                  {mockupImages.map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setLightbox(src)}
                      className="group/card relative w-full overflow-hidden rounded-xl border border-border/20 shadow-sm bg-card cursor-zoom-in hover:shadow-md hover:border-border/40 transition-all duration-200"
                    >
                      <img src={src} alt="" className="w-full h-auto block" />
                      <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/20 transition-colors duration-200" />
                      <div className="absolute bottom-2 right-2 flex size-7 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm opacity-0 translate-x-1 translate-y-1 group-hover/card:opacity-100 group-hover/card:translate-x-0 group-hover/card:translate-y-0 transition-all duration-200">
                        <ArrowUpRight className="size-3.5" />
                      </div>
                    </button>
                  ))}
                </Marquee>

                {/* Col 2 — remonte, plus rapide */}
                <Marquee vertical reverse repeat={6} className="flex-1 overflow-hidden [--duration:22s] [--gap:0.75rem]">
                  {[...mockupImages].reverse().map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setLightbox(src)}
                      className="group/card relative w-full overflow-hidden rounded-xl border border-border/20 shadow-sm bg-card cursor-zoom-in hover:shadow-md hover:border-border/40 transition-all duration-200"
                    >
                      <img src={src} alt="" className="w-full h-auto block" />
                      <div className="absolute inset-0 bg-black/0 group-hover/card:bg-black/20 transition-colors duration-200" />
                      <div className="absolute bottom-2 right-2 flex size-7 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm opacity-0 translate-x-1 translate-y-1 group-hover/card:opacity-100 group-hover/card:translate-x-0 group-hover/card:translate-y-0 transition-all duration-200">
                        <ArrowUpRight className="size-3.5" />
                      </div>
                    </button>
                  ))}
                </Marquee>
              </motion.div>
            </div>
          </div>
        </div>

        {/* ── Lightbox ── */}
        <AnimatePresence>
          {lightbox && (
            <motion.div
              key="lightbox"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
              onClick={() => setLightbox(null)}
            >
              <motion.div
                initial={{ scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.88, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                className="relative max-w-3xl w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={lightbox}
                  alt=""
                  className="w-full h-auto rounded-2xl shadow-2xl border border-white/10"
                />
                <button
                  type="button"
                  onClick={() => setLightbox(null)}
                  className="absolute -top-3 -right-3 flex size-8 items-center justify-center rounded-full bg-background border border-border shadow-md text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-4" />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="relative z-10 pb-8 pt-4 flex flex-col items-center gap-2"
        >
          <p className="text-xs text-muted-foreground/40">{t('home.maintenance.footer_tagline')}</p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground/30">
            <a
              href="/mentions-legales"
              className="hover:text-muted-foreground/60 transition-colors"
            >
              {t('home.footer.legal')}
            </a>
            <span>·</span>
            <a href="/privacy" className="hover:text-muted-foreground/60 transition-colors">
              {t('home.footer.privacy')}
            </a>
          </div>
        </motion.footer>
      </div>
    </AppLayout>
  )
}
