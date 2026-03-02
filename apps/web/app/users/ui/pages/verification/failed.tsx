import { InferPageProps } from '@adonisjs/inertia/types'
import { Head } from '@inertiajs/react'
import { XCircle, LogOut } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import type VerificationController from '#users/controllers/verification_controller'
import AuthLayout from '#auth/ui/components/layout'
import { useTranslation } from '#common/ui/hooks/use_translation'

export default function VerificationFailedPage(
  _props: InferPageProps<VerificationController, 'verify'>
) {
  const { t } = useTranslation()

  return (
    <AuthLayout>
      <Head title={t('users.verification.failed.title')} />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <XCircle className="size-6 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold">{t('users.verification.failed.title')}</h1>
          <p className="text-balance text-sm text-muted-foreground">
            {t('users.verification.failed.description')}
          </p>
        </div>

        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-center">
          <p className="text-sm text-destructive">
            {t('users.verification.failed.warning')}
          </p>
        </div>

        <Button size="lg" variant="destructive" className="w-full gap-2" href="/logout">
          <LogOut className="size-4" /> {t('users.verification.failed.logout')}
        </Button>
      </div>
    </AuthLayout>
  )
}
