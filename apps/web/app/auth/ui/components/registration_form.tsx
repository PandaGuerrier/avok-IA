import React, { useEffect, useState } from 'react'
import { Link, useForm } from '@inertiajs/react'

import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { FieldSet, FieldGroup, Field, FieldLabel, FieldError } from '@workspace/ui/components/field'
import { FieldErrorBag } from '@workspace/ui/components/field-error-bag'

import { useTranslation } from '#common/ui/hooks/use_translation'
import useFlashMessage from '#common/ui/hooks/use_flash_message'
import { Switch } from '@workspace/ui/components/switch'
import { Label } from '@workspace/ui/components/label'

export function RegistrationForm({ className, ...props }: React.ComponentPropsWithoutRef<'form'>) {
  const { t } = useTranslation()
  const [errorMessages, setErrorMessages] = useState<string[]>([])
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false)
  const { data, setData, errors, post } = useForm({
    email: '',
    password: '',
    passwordConfirmation: '',
    hasAcceptedTerms: false,
  })

  const messages = useFlashMessage('errorsBag')
  useEffect(() => {
    if (messages) {
      const msgs = Object.values(messages).flat().filter(Boolean).map(String)
      setErrorMessages(msgs)
    } else {
      setErrorMessages([])
    }
  }, [messages])

  useEffect(() => {
    setData('hasAcceptedTerms', hasAcceptedTerms)
  }, [hasAcceptedTerms])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setData('hasAcceptedTerms', hasAcceptedTerms)
    post('/sign-up')
  }

  return (
    <form onSubmit={handleSubmit} className={cn('flex flex-col gap-6', className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{t('auth.registration.title')}</h1>
        <p className="text-balance text-sm text-muted-foreground">
          {t('auth.registration.description')}
        </p>
      </div>

      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">
              Email <span className={"text-destructive text-xs"}>(@efrei.net uniquement)</span>
            </FieldLabel>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => setData('email', e.target.value)}
              placeholder={'prenom.nom@efrei.net'}
              className={`${errors?.email ? 'border-destructive' : ''}`}
              required
            />
            <FieldErrorBag errors={errors} field="email" />
          </Field>

          <Field>
            <FieldLabel htmlFor="password">{t('auth.registration.form.password.label')}</FieldLabel>
            <Input
              id="password"
              type="password"
              value={data.password}
              onChange={(e) => setData('password', e.target.value)}
              placeholder={t('auth.registration.form.password.placeholder')}
              className={`${errors?.password ? 'border-destructive' : ''}`}
              required
            />
            <FieldErrorBag errors={errors} field="password" />
          </Field>

          <Field>
            <FieldLabel htmlFor="passwordConfirmation">
              {t('auth.registration.form.password_confirmation.label')}
            </FieldLabel>
            <Input
              id="passwordConfirmation"
              type="password"
              value={data.passwordConfirmation}
              onChange={(e) => setData('passwordConfirmation', e.target.value)}
              placeholder={t('auth.registration.form.password_confirmation.placeholder')}
              required
            />
            <FieldErrorBag errors={errors} field="passwordConfirmation" />
          </Field>
          <Field orientation="responsive">
            <div className="flex items-start space-x-3">
              <Switch
                id="terms"
                checked={hasAcceptedTerms}
                onCheckedChange={(checked) => setHasAcceptedTerms(checked)}
                className="mt-0.5"
              />
              <Label
                htmlFor="terms"
                className="flex flex-wrap flex-row items-center justify-center text-sm"
              >
                <div>
                  <span>J'accepte les</span>
                  <Link
                    href="/politique-confidentialite"
                    target="_blank"
                    className="underline underline-offset-4 ml-1 w-full hover:text-primary duration-200"
                  >
                    CGU et la politique de confidentialité
                  </Link>
                </div>
              </Label>
            </div>
            <FieldErrorBag errors={errors} field="hasAcceptedTerms" />
          </Field>
          <Field orientation="responsive">
            <Button type="submit" className="w-full">
              {t('auth.registration.actions.submit')}
            </Button>

            <FieldError errors={errorMessages.map((m) => ({ message: m }))} />
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="text-center text-sm">
        <span>{t('auth.registration.already_account.text')} </span>
        <Link href={'/login'} className="underline underline-offset-4">
          {t('auth.registration.already_account.login')}
        </Link>
      </div>
    </form>
  )
}
