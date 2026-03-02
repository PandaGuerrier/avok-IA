import React, { useState } from 'react'
import { motion } from 'framer-motion'

import { Button } from '@workspace/ui/components/button'
import { PasswordInput } from '@workspace/ui/components/password-input'
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

interface PasswordStepProps {
  onBack: () => void
  onSubmit: (password: string, passwordConfirmation: string) => void
}

export function PasswordStep({ onBack, onSubmit }: PasswordStepProps) {
  const { t } = useTranslation()
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== passwordConfirmation) {
      setError(t('auth.register.password.confirm_label'))
      return
    }
    if (password.length < 1) {
      return
    }
    setError('')
    onSubmit(password, passwordConfirmation)
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
        <h1 className="text-2xl font-bold">{t('auth.register.password.title')}</h1>
        <p className="text-balance text-sm text-muted-foreground">
          {t('auth.register.password.description')}
        </p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="password">{t('auth.register.password.label')}</FieldLabel>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.register.password.placeholder')}
                autoFocus
                required
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="passwordConfirmation">
                {t('auth.register.password.confirm_label')}
              </FieldLabel>
              <PasswordInput
                id="passwordConfirmation"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                placeholder={t('auth.register.password.confirm_placeholder')}
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

            <Button type="submit" className="w-full">
              {t('auth.actions.next')}
            </Button>
          </FieldGroup>
        </FieldSet>
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
