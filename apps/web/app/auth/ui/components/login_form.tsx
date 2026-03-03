import React, { useEffect, useState } from 'react'
import { Link, useForm } from '@inertiajs/react'

import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
  FieldSet,
  FieldGroup,
  Field,
  FieldLabel,
  FieldError,
} from '@workspace/ui/components/field'
import { FieldErrorBag } from '@workspace/ui/components/field-error-bag'

import useFlashMessage from '#common/ui/hooks/use_flash_message'
import { useTranslation } from '#common/ui/hooks/use_translation'

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'form'>) {
  const { data, setData, errors, post } = useForm({
    email: '',
    password: '',
  })
  const { t } = useTranslation()

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

    post('/login')
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex flex-col gap-6', className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{t('auth.signin.title')}</h1>
        <p className="text-balance text-sm text-muted-foreground">{t('auth.signin.description')}</p>
      </div>

      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">{t('auth.signin.form.email.label')}</FieldLabel>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              placeholder={t('auth.signin.form.email.placeholder')}
              className={`${errors?.email ? 'border-destructive' : ''}`}
              required
            />
            <FieldErrorBag errors={errors} field="email" />
          </Field>
          <Field>
            <div className="flex items-center">
              <FieldLabel htmlFor="password">{t('auth.signin.form.password.label')}</FieldLabel>
            </div>
            <Input
              id="password"
              type="password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              placeholder={t('auth.signin.form.password.placeholder')}
              className={`${errors?.password ? 'border-destructive' : ''}`}
              required
            />
            <FieldErrorBag errors={errors} field="password" />
          </Field>

          <Field orientation="responsive">
            <Button type="submit">{t('auth.signin.actions.submit')}</Button>
          </Field>

          <FieldError errors={errorMessages.map((m) => ({ message: m }))} />
        </FieldGroup>
      </FieldSet>
      <div className="text-center text-sm">
        <span>{t('auth.signin.no_account.text')} </span>
        <Link href={"/sign-up"} className="underline underline-offset-4">
          {t('auth.signin.no_account.sign_up')}
        </Link>
      </div>
    </form>
  )
}
