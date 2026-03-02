import AppLayout from '#common/ui/components/app_layout'
import HeadingSmall from '#common/ui/components/heading_small'
import { ProfileForm } from '#users/ui/components/profile_form'
import SettingsLayout from '#users/ui/components/settings_layout'
import { DeleteAccountModal } from '#users/ui/components/delete_account_modal'

import { useTranslation } from '#common/ui/hooks/use_translation'
import useUser from '#auth/ui/hooks/use_user'

export default function ProfilePage() {
  const { t } = useTranslation()
  const currentPath = '/settings/profile'
  const profile = useUser()

  return (
    <AppLayout
      layout={'sidebar'}
      breadcrumbs={[{ label: t('users.profile.breadcrumbs.settings') }]}
    >
      <SettingsLayout currentPath={currentPath}>
        <div className="space-y-6">
          <HeadingSmall
            title={t('users.profile.title')}
            description={t('users.profile.description')}
          />

          <ProfileForm user={profile} />

          <div className="pt-6 border-t border-dashed">
            <h3 className="text-lg font-medium text-destructive mb-4">Zone de danger</h3>
            <div className="bg-destructive/10 p-4 rounded-lg border border-destructive/20 flex items-center justify-between">
              <div>
                <p className="font-medium text-destructive">Supprimer mon compte</p>
                <p className="text-sm text-muted-foreground">
                  Cette action est irréversible et supprimera toutes vos données.
                </p>
              </div>
              <DeleteAccountModal />
            </div>
          </div>
        </div>
      </SettingsLayout>
    </AppLayout>
  )
}
