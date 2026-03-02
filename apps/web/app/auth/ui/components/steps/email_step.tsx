import React from 'react'
import { motion } from 'framer-motion'

import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { FieldSet, FieldGroup, Field, FieldLabel } from '@workspace/ui/components/field'

import { useTranslation } from '#common/ui/hooks/use_translation'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const } },
}

interface EmailStepProps {
  email: string
  onEmailChange: (email: string) => void
  onSubmit: () => void
  isLoading: boolean
  error?: string
}

export function EmailStep({ email, onEmailChange, onSubmit, isLoading, error }: EmailStepProps) {
  const { t } = useTranslation()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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
        <h1 className="text-2xl font-bold">{t('auth.email.title')}</h1>
        <p className="text-balance text-sm text-muted-foreground">
          {t('auth.email.description')}
        </p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">{t('auth.email.label')}</FieldLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder={t('auth.email.placeholder')}
                className={error ? 'border-destructive' : ''}
                autoFocus
                required
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive"
                >
                  {error}
                </motion.p>
              )}
            </Field>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '...' : t('auth.email.submit')}
            </Button>
          </FieldGroup>
        </FieldSet>
      </motion.div>
    </motion.form>
  )
}
