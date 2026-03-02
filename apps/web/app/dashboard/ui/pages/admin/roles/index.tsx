import Role from '#users/dtos/role'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card'
import { Button } from '@workspace/ui/components/button'
import { Plus, Settings2 } from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@workspace/ui/components/table'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@workspace/ui/components/dialog'
import { useForm } from '@inertiajs/react'
import { Label } from '@workspace/ui/components/label'
import { Input } from '@workspace/ui/components/input'
import { useState } from 'react'
import AppLayout from '#common/ui/components/app_layout'
import { Main } from '#common/ui/components/main'
import RoleTag from '#common/ui/components/role_tag'

interface Props {
    roles: Role[]
}

export default function RolesIndex({ roles }: Props) {
    const [open, setOpen] = useState(false)
    const { data, setData, post, processing, errors, reset } = useForm({
      name: '',
      description: '',
      tag: '',
      tagColor: '#000000',
    })

    const submit = (e: React.FormEvent) => {
        e.preventDefault()
        post('/dashboard/admin/roles', {
            onSuccess: () => {
                setOpen(false)
                reset()
            },
        })
    }

    return (
      <AppLayout
        layout={'sidebar'}
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Rôles' }]}
      >
        <Main>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Gestion des Rôles</h1>
              <p className="text-muted-foreground">Gérez les rôles et leurs permissions.</p>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nouveau Rôle
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={submit}>
                  <DialogHeader>
                    <DialogTitle>Créer un rôle</DialogTitle>
                    <DialogDescription>
                      Ajoutez un nouveau rôle. Vous pourrez configurer ses permissions ensuite.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nom</Label>
                      <Input
                        id="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Ex: Modérateur"
                      />
                      {errors.name && <span className="text-sm text-red-500">{errors.name}</span>}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                        placeholder="Une courte description..."
                      />
                      {errors.description && (
                        <span className="text-sm text-red-500">{errors.description}</span>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="tag">Tag (Label)</Label>
                      <Input
                        id="tag"
                        value={data.tag}
                        onChange={(e) => setData('tag', e.target.value)}
                        placeholder="Ex: MOD"
                      />
                      {errors.tag && <span className="text-sm text-red-500">{errors.tag}</span>}
                    </div>
                    <div>
                      <Label>Couleur du tag</Label>
                      <input
                        type="color"
                        value={data.tagColor}
                        onChange={(e) => setData('tagColor', e.target.value)}
                        className="w-10 h-10 p-0 border-0 rounded-md"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Vous pourrez configurer les permissions du rôle après sa création.
                      </p>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={processing}>
                      Créer
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Liste des rôles</CardTitle>
              <CardDescription>{roles.length} rôles configurés sur la plateforme.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Tag</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roles.map((role) => (
                    <TableRow key={role.uuid}>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>
                        <RoleTag role={role} />
                      </TableCell>
                      <TableCell>{role.description}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          href={`/dashboard/admin/roles/${role.uuid}`}
                        >
                          <Settings2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Main>
      </AppLayout>
    )
}
