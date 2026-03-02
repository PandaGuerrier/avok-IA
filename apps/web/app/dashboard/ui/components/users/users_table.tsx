import React from 'react'
import { router } from '@inertiajs/react'
import type { SimplePaginatorDtoContract } from '@adocasts.com/dto/types'

import { DataTable, ColumnDef } from '@workspace/ui/components/data-table'
import { useDataTable } from '@workspace/ui/hooks/use-data-table'

import UsersTableFilters from '#dashboard/ui/components/users/users_table_filters'
import { DataTableRowActions } from '#dashboard/ui/components/users/users_row_actions'
import { useTranslation } from '#common/ui/hooks/use_translation'

import type UserDto from '#users/dtos/user'
import { Check, X } from 'lucide-react'
import RoleDto from '#users/dtos/role'

interface DataTableProps {
  users: SimplePaginatorDtoContract<UserDto>
  roles: RoleDto[]
  q: string | undefined
  selectedRoles: number[]
}


export default function UsersTable({ users, roles, q, selectedRoles }: DataTableProps) {
  const { t } = useTranslation()

  const [querySearch, setQuerySearch] = React.useState(q || '')
  const [roleUuids, setRoleUuids] = React.useState<string[]>(
    selectedRoles ? selectedRoles.map(String) : []
  )

  const remoteTableOptions = useDataTable({
    data: users,
    visit: ({ page, perPage }) => {
      return router.get(
        '/dashboard/users',
        {
          page,
          perPage,
          q: querySearch.length > 0 ? querySearch : undefined,
          roleIds: roleUuids.length > 0 ? roleUuids : undefined,
        },
        {
          preserveState: true,
          preserveScroll: true,
          replace: true,
        }
      )
    },
  })

  const columns: ColumnDef<UserDto>[] = [
    {
      header: t('users.index.table.columns.full_name'),
      accessorKey: 'fullName',
      cell: ({ row }) =>
        row.original.fullName ? (
          row.original.fullName
        ) : (
          <span className="text-muted-foreground">
            <i>{t('users.index.table.not_provided')}</i>
          </span>
        ),
    },
    {
      header: t('users.index.table.columns.email'),
      accessorKey: 'email',
      cell: ({ row }) => (
        <span className={"flex items-center gap-x-2"}>
          {row.original.email} {
            row.original.isEmailVerified ? (<Check className={"w-4 h-4 text-green-500"} />) : (<X className={"w-4 h-4 text-destructive"} />)
        }
        </span>
      ),
    },
    {
      accessorKey: 'roleUuid',
      accessorFn: (user) => String(user.roleUuid),
      header: t('users.index.table.columns.role'),
      cell: ({ row }) => {
        const { role } = row.original

        if (!role) {
          return null
        }

        return (
          <div className="flex gap-x-2 items-center">
            <span className="capitalize text-sm">{role.tag}</span>
          </div>
        )
      },
    },
    {
      id: 'actions',
      cell: DataTableRowActions,
    },
  ]

  return (
    <div className="space-y-4">
      <UsersTableFilters
        roles={roles}
        querySearch={querySearch}
        setQuerySearch={setQuerySearch}
        roleUuids={roleUuids}
        setRoleUuids={setRoleUuids}
        perPage={users.meta.perPage}
      />
      <DataTable
        columns={columns}
        data={users.data}
        t={t}
        remoteTableOptions={remoteTableOptions}
      />
    </div>
  )
}
