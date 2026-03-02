import React, { useEffect, useState } from 'react'
import { Link } from '@inertiajs/react'
import { motion } from 'framer-motion'

import { Button } from '@workspace/ui/components/button'
import { PasswordInput } from '@workspace/ui/components/password-input'
import { FieldSet, FieldGroup, Field, FieldLabel, FieldError } from '@workspace/ui/components/field'
import { FieldErrorBag } from '@workspace/ui/components/field-error-bag'

import { useTranslation } from '#common/ui/hooks/use_translation'
import useFlashMessage from '#common/ui/hooks/use_flash_message'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const } },
}

interface LoginStepProps {
  email: string
  onBack: () => void
  onSubmit: (password: string) => void
  isLoading: boolean
  errors: Record<string, string>
}

export function LoginStep({ email, onBack, onSubmit, isLoading, errors }: LoginStepProps) {
  const { t } = useTranslation()
  const [password, setPassword] = useState('')
  const [errorMessages, setErrorMessages] = useState<string[]>([])

  const messages = useFlashMessage('errorsBag')
  useEffect(() => {
    if (messages) {
      const msgs = Object.values(messages).flat().filter(Boolean).map(String)
      setErrorMessages(msgs)
    } else {
      setErrorMessages([])
    }
  }, [messages])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(password)
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
        <h1 className="text-2xl font-bold">{t('auth.login.title')}</h1>
        <p className="text-balance text-sm text-muted-foreground">
          {t('auth.login.description')}
        </p>
        <p className="text-sm font-medium">{email}</p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <FieldSet>
          <FieldGroup>
            <Field>
              <div className="flex items-center">
                <FieldLabel htmlFor="password">{t('auth.login.password.label')}</FieldLabel>
                <Link
                  href="/forgot-password"
                  className="ml-auto text-sm underline-offset-4 hover:underline"
                >
                  {t('auth.login.forgot_password')}
                </Link>
              </div>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.login.password.placeholder')}
                className={errors?.password ? 'border-destructive' : ''}
                autoFocus
                required
              />
              <FieldErrorBag errors={errors} field="password" />
            </Field>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? '...' : t('auth.login.submit')}
            </Button>

            <FieldError errors={errorMessages.map((m) => ({ message: m }))} />
          </FieldGroup>
        </FieldSet>
      </motion.div>

      <motion.div variants={fadeUp} className="text-center text-sm">
        <button
          type="button"
          onClick={onBack}
          className="underline underline-offset-4 hover:text-primary"
        >
          {t('auth.login.other_account')}
        </button>
      </motion.div>
    </motion.form>
  )
}
