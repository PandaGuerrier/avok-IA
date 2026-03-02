import { useState, useCallback, useRef } from 'react'
import { router } from '@inertiajs/react'
import { AnimatePresence, motion } from 'framer-motion'

import AuthLayout from '#auth/ui/components/layout'
import { EmailStep } from '#auth/ui/components/steps/email_step'
import { LoginStep } from '#auth/ui/components/steps/login_step'
import { PasswordStep } from '#auth/ui/components/steps/password_step'
import { ProfileStep } from '#auth/ui/components/steps/profile_step'
import { TermsStep } from '#auth/ui/components/steps/terms_step'

import type { ProfileData } from '#auth/ui/components/steps/profile_step'

type Step = 'email' | 'login' | 'password' | 'profile' | 'terms'

const STEP_ORDER: Step[] = ['email', 'login', 'password', 'profile', 'terms']

export default function StartPage() {
  const [step, setStep] = useState<Step>('email')
  const directionRef = useRef(1)
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [emailError, setEmailError] = useState('')

  // Register data stored across steps
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [profileData, setProfileData] = useState<ProfileData | null>(null)

  const navigateToStep = useCallback(
    (next: Step) => {
      const currentIndex = STEP_ORDER.indexOf(step)
      const nextIndex = STEP_ORDER.indexOf(next)
      directionRef.current = nextIndex >= currentIndex ? 1 : -1
      setStep(next)
    },
    [step]
  )

  const handleCheckEmail = useCallback(async () => {
    if (!email.trim()) return

    setIsLoading(true)
    setEmailError('')

    try {
      const res = await fetch('/auth/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': decodeURIComponent(
            document.cookie
              .split('; ')
              .find((row) => row.startsWith('XSRF-TOKEN='))
              ?.split('=')[1] ?? ''
          ),
        },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        if (data?.errors) {
          const firstError = data.errors[0]?.message || 'Invalid email'
          setEmailError(firstError)
        }
        return
      }

      const data = await res.json()

      if (data.exists) {
        navigateToStep('login')
      } else {
        navigateToStep('password')
      }
    } catch {
      setEmailError('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [email])

  const handleLogin = useCallback(
    (pwd: string) => {
      setIsLoading(true)
      setErrors({})

      router.post(
        '/auth/login',
        { email, password: pwd },
        {
          onError: (errs) => {
            setErrors(errs)
            setIsLoading(false)
          },
          onFinish: () => {
            setIsLoading(false)
          },
        }
      )
    },
    [email]
  )

  const handlePasswordSubmit = useCallback((pwd: string, pwdConfirm: string) => {
    setPassword(pwd)
    setPasswordConfirmation(pwdConfirm)
    navigateToStep('profile')
  }, [navigateToStep])

  const handleProfileSubmit = useCallback((data: ProfileData) => {
    setProfileData(data)
    navigateToStep('terms')
  }, [navigateToStep])

  const handleRegister = useCallback(() => {
    setIsLoading(true)
    setErrors({})

    router.post(
      '/auth/register',
      {
        email,
        password,
        passwordConfirmation,
        fullName: profileData?.fullName ?? '',
        data: {
          account_type: profileData?.accountType || null,
          job: profileData?.job || null,
          project: profileData?.project || null,
        },
        hasAcceptedTerms: 'on',
      },
      {
        onError: (errs) => {
          setErrors(errs)
          setIsLoading(false)
        },
        onFinish: () => {
          setIsLoading(false)
        },
      }
    )
  }, [email, password, passwordConfirmation, profileData])

  const handleBackToEmail = useCallback(() => {
    navigateToStep('email')
    setErrors({})
    setEmailError('')
  }, [navigateToStep])

  const direction = directionRef.current

  const slideVariants = {
    enter: (d: number) => ({ x: d * 80, opacity: 0, filter: 'blur(4px)' }),
    center: { x: 0, opacity: 1, filter: 'blur(0px)' },
    exit: (d: number) => ({ x: d * -80, opacity: 0, filter: 'blur(4px)' }),
  }

  return (
    <AuthLayout>
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] as const }}
            className="p-6"
          >
            {step === 'email' && (
              <EmailStep
                email={email}
                onEmailChange={setEmail}
                onSubmit={handleCheckEmail}
                isLoading={isLoading}
                error={emailError}
              />
            )}

            {step === 'login' && (
              <LoginStep
                email={email}
                onBack={handleBackToEmail}
                onSubmit={handleLogin}
                isLoading={isLoading}
                errors={errors}
              />
            )}

            {step === 'password' && (
              <PasswordStep
                onBack={handleBackToEmail}
                onSubmit={handlePasswordSubmit}
              />
            )}

            {step === 'profile' && (
              <ProfileStep
                onBack={() => navigateToStep('password')}
                onSubmit={handleProfileSubmit}
              />
            )}

            {step === 'terms' && (
              <TermsStep
                onBack={() => navigateToStep('profile')}
                onSubmit={handleRegister}
                isLoading={isLoading}
                errors={errors}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </AuthLayout>
  )
}
