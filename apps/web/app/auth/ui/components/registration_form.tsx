import React, { useEffect, useState } from 'react'
import { Link, useForm } from '@inertiajs/react'

import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { FieldSet, FieldGroup, Field, FieldLabel, FieldError } from '@workspace/ui/components/field'
import { FieldErrorBag } from '@workspace/ui/components/field-error-bag'

import { useTranslation } from '#common/ui/hooks/use_translation'
import useFlashMessage from '#common/ui/hooks/use_flash_message'
import { WebcamCapture } from './webcam_capture'

export function RegistrationForm({ className, ...props }: React.ComponentPropsWithoutRef<'form'>) {
  const { t } = useTranslation()
  const [errorMessages, setErrorMessages] = useState<string[]>([])
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const { data, setData, errors, post } = useForm<{
    firstName: string
    lastName: string
    pseudo: string
    age: string
    avatar: File | null
  }>({
    firstName: '',
    lastName: '',
    pseudo: '',
    age: '',
    avatar: null,
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

  function handleCapture(file: File, preview: string) {
    setData('avatar', file)
    setAvatarPreview(preview)
  }

  function handleReset() {
    setData('avatar', null)
    setAvatarPreview(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post('/sign-up', { forceFormData: true })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('w-full max-w-2xl flex flex-col gap-6', className)}
      {...props}
    >
      <div className="text-center">
        <h1 className="text-2xl font-bold">{t('auth.registration.title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('auth.registration.description')}</p>
      </div>

      <div className="grid grid-cols-2 gap-6 items-stretch">

        {/* Gauche — Webcam */}
        <div className="flex flex-col items-center justify-center gap-3 border rounded-xl p-6">
          <p className="text-sm font-medium">Photo de profil</p>
          <WebcamCapture
            onCapture={handleCapture}
            onReset={handleReset}
            preview={avatarPreview}
          />
          <FieldErrorBag errors={errors} field="avatar" />
        </div>

        {/* Droite — Champs */}
        <FieldSet className="w-full">
          <FieldGroup>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="firstName">Prénom</FieldLabel>
                <Input
                  id="firstName"
                  type="text"
                  value={data.firstName}
                  onChange={(e) => setData('firstName', e.target.value)}
                  placeholder="Jean"
                  className={errors?.firstName ? 'border-destructive' : ''}
                  required
                />
                <FieldErrorBag errors={errors} field="firstName" />
              </Field>

              <Field>
                <FieldLabel htmlFor="lastName">Nom</FieldLabel>
                <Input
                  id="lastName"
                  type="text"
                  value={data.lastName}
                  onChange={(e) => setData('lastName', e.target.value)}
                  placeholder="Dupont"
                  className={errors?.lastName ? 'border-destructive' : ''}
                  required
                />
                <FieldErrorBag errors={errors} field="lastName" />
              </Field>
            </div>

            <Field>
              <FieldLabel htmlFor="pseudo">Pseudo</FieldLabel>
              <Input
                id="pseudo"
                type="text"
                value={data.pseudo}
                onChange={(e) => setData('pseudo', e.target.value)}
                placeholder="jdupont42"
                className={errors?.pseudo ? 'border-destructive' : ''}
                required
              />
              <FieldErrorBag errors={errors} field="pseudo" />
            </Field>

            <Field>
              <FieldLabel htmlFor="age">Âge</FieldLabel>
              <Input
                id="age"
                type="number"
                min={1}
                max={120}
                value={data.age}
                onChange={(e) => setData('age', e.target.value)}
                placeholder="20"
                className={errors?.age ? 'border-destructive' : ''}
                required
              />
              <FieldErrorBag errors={errors} field="age" />
            </Field>

            <Field>
              <Button type="submit" className="w-full">
                {t('auth.registration.actions.submit')}
              </Button>
              <FieldError errors={errorMessages.map((m) => ({ message: m }))} />
            </Field>
          </FieldGroup>
        </FieldSet>
      </div>
    </form>
  )
}
