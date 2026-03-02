import React, { useState } from 'react'
import { Link } from '@inertiajs/react'
import { AnimatePresence, motion } from 'framer-motion'

import { Button } from '@workspace/ui/components/button'
import { useTranslation } from '#common/ui/hooks/use_translation'
import { cn } from '@workspace/ui/lib/utils'
import { Check } from 'lucide-react'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const } },
}

interface TermsStepProps {
  onBack: () => void
  onSubmit: () => void
  isLoading: boolean
  errors: Record<string, string>
}

export function TermsStep({ onBack, onSubmit, isLoading, errors }: TermsStepProps) {
  const { t } = useTranslation()
  const [accepted, setAccepted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!accepted) return
    onSubmit()
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUp} className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{t('auth.register.terms.title')}</h1>
        <p className="text-balance text-sm text-muted-foreground">
          {t('auth.register.terms.description')}
        </p>
      </motion.div>

      <motion.div variants={fadeUp} className="space-y-4">
        <motion.div
          className={cn(
            'flex items-start space-x-3 bg-secondary rounded-full px-3 py-2 cursor-pointer text-center justify-center',
            accepted ? 'border-2 border-primary' : 'border-2 border-transparent'
          )}
          onClick={() => setAccepted((prev) => !prev)}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.15 }}
        >
          <AnimatePresence>
            {accepted && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] as const }}
              >
                <Check className="text-primary" />
              </motion.span>
            )}
          </AnimatePresence>
          <span>{t('auth.register.terms.accept')}</span>
          <AnimatePresence>
            {accepted && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] as const }}
              >
                <Check className="text-primary" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="text-center">
          <Link
            href="/politique-confidentialite"
            target="_blank"
            className="text-sm underline underline-offset-4 hover:text-primary"
          >
            {t('auth.register.terms.read_terms')}
          </Link>
        </div>

        {errors?.hasAcceptedTerms && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-destructive text-center"
          >
            {errors.hasAcceptedTerms}
          </motion.p>
        )}

        <Button type="submit" className="w-full" disabled={!accepted || isLoading}>
          {isLoading ? '...' : t('auth.register.terms.submit')}
        </Button>
      </motion.div>

      <motion.div variants={fadeUp} className="text-center text-sm">
        <button
          type="button"
          onClick={onBack}
          className="underline underline-offset-4 hover:text-primary"
        >
          {t('auth.actions.back')}
        </button>
      </motion.div>
    </motion.form>
  )
}
