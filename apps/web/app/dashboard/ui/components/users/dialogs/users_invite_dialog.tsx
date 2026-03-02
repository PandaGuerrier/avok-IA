import React from 'react'
import { useForm } from '@inertiajs/react'

import { MailPlus, Send } from 'lucide-react'
import { Button } from '@workspace/ui/components/button'
import { Textarea } from '@workspace/ui/components/textarea'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@workspace/ui/components/dialog'
import { ScrollArea } from '@workspace/ui/components/scroll-area'
import { Input } from '@workspace/ui/components/input'
import { Field, FieldLabel } from '@workspace/ui/components/field'
import { Progress } from '@workspace/ui/components/progress'
import { toast } from '@workspace/ui/hooks/use-toast'
import { cn } from '@workspace/ui/lib/utils'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from '@workspace/ui/components/select'
import { FieldErrorBag } from '@workspace/ui/components/field-error-bag'
import { useTranslation } from '#common/ui/hooks/use_translation'

import type UserDto from '#users/dtos/user'
import RoleDto from '#users/dtos/role'

interface Props {
  roles: RoleDto[]
  currentRow?: UserDto
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersInviteDialog({ roles, open, onOpenChange }: Props) {
  const { data, setData, errors, post, progress, clearErrors, reset } = useForm<{
    email: string
    roleUuid: string
    description: string | null
  }>({
    email: '',
    roleUuid: '',
    description: '',
  })

  const { t } = useTranslation()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    post('/dashboard/users/invite', {
      preserveScroll: true,
      preserveState: false,
      onSuccess: () => {
        onOpenChange(false)
        setTimeout(() => {
          reset()
          clearErrors()
        }, 500)
        toast(t('users.invite.toast.title'), {
          description: (
            <div className="mt-2 max-w-[320px] overflow-x-auto rounded-md bg-slate-950 p-4">
              <pre className="text-white whitespace-pre-wrap break-words">
                <code>{JSON.stringify(data, null, 2)}</code>
              </pre>
            </div>
          ),
        })
      },
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        onOpenChange(state)
        setTimeout(() => {
          reset()
          clearErrors()
        }, 500)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="flex items-center gap-2">
            <MailPlus /> {t('users.invite.title')}
          </DialogTitle>
          <DialogDescription>{t('users.invite.description')}</DialogDescription>
        </DialogHeader>
        <ScrollArea>
          <form id="user-form" onSubmit={handleSubmit} className="space-y-4">
            <Field>
              <FieldLabel htmlFor="email">{t('users.invite.form.email.label')}</FieldLabel>
              <Input
                id="email"
                placeholder={t('users.invite.form.email.placeholder')}
                value={data.email}
                onChange={(element) => setData('email', element.target.value)}
                className={`${errors?.email ? 'border-destructive' : ''}`}
              />
              <FieldErrorBag errors={errors} field="email" />
            </Field>

            <Field>
              <FieldLabel htmlFor="role">{t('users.invite.form.role.label')}</FieldLabel>
              <Select value={data.roleUuid} onValueChange={(value) => setData('roleUuid', value)}>
                <SelectTrigger className={errors?.roleUuid ? 'border-destructive' : ''}>
                  <SelectValue placeholder={t('users.invite.form.role.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {roles.map((role) => {
                      return (
                        <SelectItem key={role.uuid} value={role.uuid}>
                          <span className="flex gap-x-2 items-center">
                            <span className="capitalize text-sm">{role.tag}</span>
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FieldErrorBag errors={errors} field="roleUuid" />
            </Field>

            <Field>
              <FieldLabel htmlFor="description">
                {t('users.invite.form.description.label')}
              </FieldLabel>
              <Textarea
                id="description"
                placeholder={t('users.invite.form.description.placeholder')}
                value={data.description ?? ''}
                onChange={(element) => setData('description', element.target.value)}
                className={cn('resize-none', `${errors?.description ? 'border-destructive' : ''}`)}
              />
              <FieldErrorBag errors={errors} field="description" />
            </Field>

            {progress && (
              <Progress value={progress.percentage} max={100} className="w-full h-2 rounded mt-2" />
            )}
          </form>
        </ScrollArea>
        <DialogFooter className="gap-y-2">
          <DialogClose asChild>
            <Button variant="outline">{t('users.invite.actions.cancel')}</Button>
          </DialogClose>
          <Button type="submit" form="user-form">
            {t('users.invite.actions.submit')} <Send />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
