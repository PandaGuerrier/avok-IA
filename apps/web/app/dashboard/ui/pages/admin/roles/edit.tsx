import Role from '#users/dtos/role'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Save, Trash } from 'lucide-react'
import { useForm, router } from '@inertiajs/react'
import { Label } from '@workspace/ui/components/label'
import { Input } from '@workspace/ui/components/input'
import { Permission, PermissionSubject } from '#users/utils/permission'
import { Switch } from '@workspace/ui/components/switch'
import { Separator } from '@workspace/ui/components/separator'
import { Badge } from '@workspace/ui/components/badge'
import AppLayout from '#common/ui/components/app_layout'
import { Main } from '#common/ui/components/main'

interface Props {
  role: Role
  availablePermissions: Permission[]
}

export default function RolesEdit({ role, availablePermissions }: Props) {
  const { data, setData, put, processing, errors } = useForm({
    name: role.name,
    description: role.description || '',
    tag: role.tag || '',
    permissions: role.permissions || [],
    tagColor: role.tagColor || '',
  })

  // Group permissions by subject
  const groupedPermissions = availablePermissions.reduce(
    (acc, permission) => {
      if (!acc[permission.subject]) {
        acc[permission.subject] = []
      }
      acc[permission.subject].push(permission)
      return acc
    },
    {} as Record<PermissionSubject, Permission[]>
  )

  const togglePermission = (permissionId: string) => {
    const currentPermissions = [...data.permissions]
    const index = currentPermissions.indexOf(permissionId)

    if (index === -1) {
      currentPermissions.push(permissionId)
    } else {
      currentPermissions.splice(index, 1)
    }

    setData('permissions', currentPermissions)
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    put(`/dashboard/admin/roles/${role.uuid}`)
  }

  const destroy = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce rôle ? Cette action est irréversible.')) {
      router.delete(`/dashboard/admin/roles/${role.uuid}`)
    }
  }

  return (
    <AppLayout
      layout={'sidebar'}
      breadcrumbs={[
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Rôles', href: '/dashboard/admin/roles' },
        { label: 'Éditer le Rôle' },
      ]}
    >
      <Main>
        <div className="space-y-6 md:space-y-0 md:flex justify-between items-center mb-6 p-4">
          <div>
            <h1 className="text-xl md:text-3xl font-bold tracking-tight">Configuration du Rôle</h1>
            <p className="text-muted-foreground">
              Modifiez les informations et les permissions du rôle.
            </p>
          </div>
          <div className="gap-2 flex">
            <Button variant="destructive" onClick={destroy}>
              <Trash className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
            <Button onClick={submit} disabled={processing}>
              <Save className="mr-2 h-4 w-4" />
              Enregistrer
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Informations Générales */}
          <Card>
            <CardHeader>
              <CardTitle>Informations</CardTitle>
              <CardDescription>Détails de base du rôle.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                  />
                  {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tag">Tag</Label>
                  <Input
                    id="tag"
                    value={data.tag}
                    onChange={(e) => setData('tag', e.target.value)}
                  />
                  {errors.tag && <span className="text-sm text-red-500">{errors.tag}</span>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                  />
                  {errors.description && (
                    <span className="text-sm text-red-500">{errors.description}</span>
                  )}
                </div>
                <div>
                  <Label htmlFor="tagColor">Couleur du Tag (Hex)</Label>
                  <Input
                    id="tagColor"
                    type={"color"}
                    value={data.tagColor}
                    onChange={(e) => setData('tagColor', e.target.value)}
                    placeholder="#ff0000"
                  />
                  {errors.tagColor && (
                    <span className="text-sm text-red-500">{errors.tagColor}</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Permissions */}
          <Card>
            <CardHeader>
              <CardTitle>Permissions</CardTitle>
              <CardDescription>
                Définissez ce que les utilisateurs avec ce rôle peuvent faire.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(groupedPermissions).map(([subject, permissions]) => (
                <div key={subject}>
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="secondary" className="uppercase text-xs">
                      {subject}
                    </Badge>
                    <Separator className="flex-1" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {permissions.map((permission) => {
                      const isChecked = data.permissions.includes(permission.id)
                      return (
                        <div
                          key={permission.id}
                          className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
                            isChecked
                              ? 'bg-primary/5 border-primary/20'
                              : 'bg-transparent border-transparent hover:bg-muted/50'
                          }`}
                        >
                          <Switch
                            id={permission.id}
                            checked={isChecked}
                            onCheckedChange={() => togglePermission(permission.id)}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label
                              htmlFor={permission.id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                              {permission.name}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {permission.description}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              code:{' '}
                              <span className={'text-primary'}>
                                {permission.subject}:{permission.action}
                              </span>
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </Main>
    </AppLayout>
  )
}
