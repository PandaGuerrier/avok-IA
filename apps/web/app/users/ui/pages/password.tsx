import AppLayout from '#common/ui/components/app_layout'
import HeadingSmall from '#common/ui/components/heading_small'
import { PasswordForm } from '#users/ui/components/password_form'
import SettingsLayout from '#users/ui/components/settings_layout'

import { useTranslation } from '#common/ui/hooks/use_translation'

export default function PasswordPage() {
  const { t } = useTranslation()
  const currentPath = '/settings/password'

  return (
    <AppLayout layout={"sidebar"} breadcrumbs={[{ label: t('users.password.breadcrumbs.settings') }]}>
      <SettingsLayout currentPath={currentPath}>
        <div className="space-y-6">
          <HeadingSmall
            title={t('users.password.title')}
            description={t('users.password.description')}
          />

          <PasswordForm />
        </div>
      </SettingsLayout>
    </AppLayout>
  )
}
