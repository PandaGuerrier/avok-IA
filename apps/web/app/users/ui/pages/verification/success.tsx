import { InferPageProps } from '@adonisjs/inertia/types'
import { Link, Head } from '@inertiajs/react'
import { CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import type VerificationController from '#users/controllers/verification_controller'
import AuthLayout from '#auth/ui/components/layout'
import { useTranslation } from '#common/ui/hooks/use_translation'

export default function VerificationSuccessPage(
  _props: InferPageProps<VerificationController, 'verify'>
) {
  const { t } = useTranslation()

  return (
    <AuthLayout>
      <Head title={t('users.verification.success.title')} />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircle className="size-6 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold">{t('users.verification.success.title')}</h1>
          <p className="text-balance text-sm text-muted-foreground">
            {t('users.verification.success.description')}
          </p>
        </div>

        <Button asChild size="lg" className="w-full gap-2">
          <Link href="/dashboard">
            {t('users.verification.success.cta')} <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>
    </AuthLayout>
  )
}
