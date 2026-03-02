import React from 'react'
import { useForm } from '@inertiajs/react'
import { motion } from 'framer-motion'

import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { PasswordInput } from '@workspace/ui/components/password-input'
import { FieldSet, FieldGroup, Field, FieldLabel } from '@workspace/ui/components/field'
import { FieldErrorBag } from '@workspace/ui/components/field-error-bag'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const } },
}

export function ResetPasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<'form'>) {
  const { data, setData, errors, post } = useForm({
    password: '',
    passwordConfirmation: '',
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    post('', {
      preserveScroll: true,
      onError: (e) => {
        console.log('erreur', e)
      }
    })
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={cn('flex flex-col gap-6', className)}
      variants={stagger}
      initial="hidden"
      animate="show"
      {...props}
    >
      <motion.div variants={fadeUp} className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Tu n'as vraiment aucune mémoire..</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Bon aller choisi ton nouveau mot de passe.
        </p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="password">Nouveau mot de passe</FieldLabel>
              <PasswordInput
                id="password"
                value={data.password}
                onChange={(element) => setData('password', element.target.value)}
                required
              />
              <FieldErrorBag errors={errors} field="password" />
            </Field>

            <Field>
              <FieldLabel htmlFor="passwordConfirmation">Confirme le super nouveau mot de passe</FieldLabel>
              <PasswordInput
                id="passwordConfirmation"
                disabled={data.password === ''}
                placeholder="e.g., S3cur3P@ssw0rd"
                value={data.passwordConfirmation}
                onChange={(element) => setData('passwordConfirmation', element.target.value)}
                className={`${errors?.passwordConfirmation ? 'border-destructive' : ''}`}
              />
              <p className="text-[0.8rem] font-medium text-destructive col-span-4 col-start-3">
                {errors?.passwordConfirmation}
              </p>
            </Field>

            <Field orientation="responsive">
              <Button type="submit" className="w-full">
                Reset Password
              </Button>
            </Field>
          </FieldGroup>
        </FieldSet>
      </motion.div>
    </motion.form>
  )
}
