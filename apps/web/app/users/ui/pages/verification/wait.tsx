import { InferPageProps } from '@adonisjs/inertia/types'
import { Head, useForm } from '@inertiajs/react'
import { Mail, Check, RefreshCw, LogOut } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { toast } from '@workspace/ui/hooks/use-toast'
import { useState, useEffect } from 'react'
import { cn } from '@workspace/ui/lib/utils'
import type VerificationController from '#users/controllers/verification_controller'
import AuthLayout from '#auth/ui/components/layout'
import { useTranslation } from '#common/ui/hooks/use_translation'
import GMailIcon from '#users/ui/components/icons/gmail'
import OutlookIcon from '#users/ui/components/icons/outlook'

export default function VerificationWaitPage(
  _props: InferPageProps<VerificationController, 'verify'>
) {
  const { t } = useTranslation()
  const { post } = useForm()
  const [timeout, setTimeout] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (timeout > 0) {
      interval = setInterval(() => {
        setTimeout((prev) => prev - 1)
      }, 1000)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timeout])

  const resendMail = () => {
    post('/verification/resend', {
      onSuccess: () => {
        toast.success(t('users.verification.wait.resend_success'))
        setTimeout(60)
      },
    })
  }

  return (
    <AuthLayout>
      <Head title={t('users.verification.wait.title')} />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-orange-500/10">
            <Mail className="size-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">{t('users.verification.wait.title')}</h1>
          <p className="text-balance text-sm text-muted-foreground">
            {t('users.verification.wait.description')}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button size="lg" className="w-full gap-2" href="/dashboard">
            <Check className="size-4" /> {t('users.verification.wait.validated')}
          </Button>

          <div className="flex space-x-4 items-center w-full max-w-2xl mx-auto ">
            <Button
              variant="secondary"
              className="w-1/2"
              onClick={resendMail}
              disabled={timeout > 0}
            >
              <RefreshCw className={cn('size-4', timeout > 0 && 'animate-spin')} />
              {timeout > 0 ? `${timeout}s` : t('users.verification.wait.resend')}
            </Button>
            <div className={'w-1/2 flex gap-2 items-center justify-end'}>
              <Button
                variant="outline"
                className="w-1/2"
                href="https://mail.google.com/mail"
                target="_blank"
              >
                <GMailIcon />
              </Button>{' '}
              <Button
                variant="outline"
                className="w-1/2"
                href="https://outlook.office.com/mail/"
                target="_blank"
              >
                <OutlookIcon />
              </Button>
            </div>
          </div>
        </div>

        <div className="text-center text-sm">
          <Button
            variant="link"
            className="text-destructive hover:text-destructive/80 gap-2 h-auto p-0"
            href="/logout"
          >
            <LogOut className="size-3" /> {t('users.verification.wait.logout')}
          </Button>
        </div>
      </div>
    </AuthLayout>
  )
}
