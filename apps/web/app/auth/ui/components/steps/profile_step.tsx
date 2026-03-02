import React, { useState } from 'react'
import { motion } from 'framer-motion'

import { Button } from '@workspace/ui/components/button'
import { Input } from '@workspace/ui/components/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select'
import { FieldSet, FieldGroup, Field, FieldLabel } from '@workspace/ui/components/field'

import { useTranslation } from '#common/ui/hooks/use_translation'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.4, 0, 0.2, 1] as const } },
}

export interface ProfileData {
  fullName: string
  accountType: string
  job: string
  project: string
}

interface ProfileStepProps {
  onBack: () => void
  onSubmit: (data: ProfileData) => void
}

export function ProfileStep({ onBack, onSubmit }: ProfileStepProps) {
  const { t } = useTranslation()
  const [fullName, setFullName] = useState('')
  const [accountType, setAccountType] = useState('')
  const [job, setJob] = useState('')
  const [project, setProject] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName.trim()) return
    onSubmit({ fullName, accountType, job, project })
  }

  const accountTypes = ['student', 'company', 'independent', 'other'] as const

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex flex-col gap-6"
      variants={stagger}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={fadeUp} className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">{t('auth.register.profile.title')}</h1>
        <p className="text-balance text-sm text-muted-foreground">
          {t('auth.register.profile.description')}
        </p>
      </motion.div>

      <motion.div variants={fadeUp}>
        <FieldSet>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="fullName">
                {t('auth.register.profile.full_name.label')}
              </FieldLabel>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('auth.register.profile.full_name.placeholder')}
                autoFocus
                required
              />
            </Field>

            <Field>
              <FieldLabel>{t('auth.register.profile.account_type.label')}</FieldLabel>
              <Select value={accountType} onValueChange={setAccountType}>
                <SelectTrigger>
                  <SelectValue placeholder={t('auth.register.profile.account_type.placeholder')} />
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`auth.register.profile.account_type.options.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field>
              <FieldLabel htmlFor="job">{t('auth.register.profile.job.label')}</FieldLabel>
              <Input
                id="job"
                type="text"
                value={job}
                onChange={(e) => setJob(e.target.value)}
                placeholder={t('auth.register.profile.job.placeholder')}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="project">{t('auth.register.profile.project.label')}</FieldLabel>
              <Input
                id="project"
                type="text"
                value={project}
                onChange={(e) => setProject(e.target.value)}
                placeholder={t('auth.register.profile.project.placeholder')}
              />
            </Field>

            <Button type="submit" className="w-full">
              {t('auth.actions.next')}
            </Button>
          </FieldGroup>
        </FieldSet>
      </motion.div>

      <motion.div variants={fadeUp} className="text-center text-sm">
        <button
          type="button"
          onClick={onBack}
          className="underline underline-offset-4 hover:text-primary"
        >
          {t('auth.actions.back')}
        </button>
      </motion.div>
    </motion.form>
  )
}
