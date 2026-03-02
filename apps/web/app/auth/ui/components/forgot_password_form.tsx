import React from 'react'
import { Link, useForm } from '@inertiajs/react'
import { motion } from 'framer-motion'

import { cn } from '@workspace/ui/lib/utils'
import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import { FieldSet, FieldGroup, Field, FieldLabel } from '@workspace/ui/components/field'
import { FieldErrorBag } from '@workspace/ui/components/field-error-bag'
import { toast } from '@workspace/ui/hooks/use-toast'

import { useTranslation } from '#common/ui/hooks/use_translation'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const } },
}

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'form'>) {
  const { data, setData, errors, post, reset } = useForm({
    email: '',
  })

  const { t } = useTranslation()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    post('/forgot-password', {
      onSuccess: () => {
        reset()

        toast(t('auth.forgot_password.toast.title'), {
          description: t('auth.forgot_password.toast.description'),
        })
      },
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
        <h1 className="text-2xl font-bold">{t('auth.forgot_password.title')}</h1>
        <p className="text-balance text-sm text-muted-foreground">
          {t('auth.forgot_password.description')}
        </p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email">{t('auth.forgot_password.form.email.label')}</FieldLabel>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(element) => setData('email', element.target.value)}
                placeholder={t('auth.forgot_password.form.email.placeholder')}
                required
              />
              <FieldErrorBag errors={errors} field="email" />
            </Field>

            <Field orientation="responsive">
              <Button type="submit" className="w-full">
                {t('auth.forgot_password.actions.submit')}
              </Button>
            </Field>
          </FieldGroup>
        </FieldSet>
      </motion.div>

      <motion.div variants={fadeUp} className="text-center text-sm">
        {t('auth.forgot_password.back_to_login.text')}{' '}
        <Link href={"/auth/start"} className="underline underline-offset-4">
          {t('auth.forgot_password.back_to_login.login')}
        </Link>
      </motion.div>
    </motion.form>
  )
}
