import { InferPageProps } from '@adonisjs/inertia/types'

import type UsersController from '#dashboard/controllers/users_controller'

import AppLayout from '#common/ui/components/app_layout'
import { Main } from '#common/ui/components/main'
import Heading from '#common/ui/components/heading'

import UsersTable from '#dashboard/ui/components/users/users_table'
import { UsersPrimaryButtons } from '#dashboard/ui/components/users/users_primary_buttons'
import { UsersDialogs } from '#dashboard/ui/components/users/users_dialogs'
import UsersProvider from '#users/ui/context/users_context'

import { useTranslation } from '#common/ui/hooks/use_translation'
import UserDto from '#users/dtos/user'
import { SimplePaginatorDtoContract } from '@adocasts.com/dto/types'
import RoleDto from '#users/dtos/role'

export default function ListUsersPage({
  users,
  roles,
  q,
  selectedRoles,
}: InferPageProps<UsersController, 'index'>) {
  const { t } = useTranslation()

  return (
    <AppLayout layout={'sidebar'} breadcrumbs={[{ label: t('users.index.page.breadcrumbs.users') }]}>
      <UsersProvider>
        <Main>
          <Heading
            title={t('users.index.page.title')}
            description={t('users.index.page.description')}
          >
            <UsersPrimaryButtons />
          </Heading>

          <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
            <UsersTable users={users as SimplePaginatorDtoContract<UserDto>} roles={roles as RoleDto[]} q={q} selectedRoles={selectedRoles} />
          </div>
        </Main>

        <UsersDialogs roles={roles as RoleDto[]} />
      </UsersProvider>
    </AppLayout>
  )
}
