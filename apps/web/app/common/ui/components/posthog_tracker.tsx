import { ReactNode, useEffect, useRef } from 'react'
import { usePage } from '@inertiajs/react'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import useUser from '#auth/ui/hooks/use_user'
import usePosthogProps from '#common/ui/hooks/use_posthog_props'

interface Props {
  children?: ReactNode
}

export default function PostHogTracker({ children }: Props) {
  const { url } = usePage()
  const user = useUser()
  const posthogConfig = usePosthogProps()
  const isInitialized = useRef(false)

  useEffect(() => {
    if (!posthogConfig?.apiKey || posthog.__loaded || isInitialized.current) {
      return
    }

    posthog.init(posthogConfig.apiKey, {
      api_host: posthogConfig.host || 'https://eu.posthog.com',
      capture_pageview: false,
      loaded: () => {
        isInitialized.current = true
      },
    })
  }, [posthogConfig])

  useEffect(() => {
    if (!posthogConfig?.apiKey) return

    if (user) {
      posthog.identify(user.uuid, { ...user })
    } else {
      posthog.reset()
    }
    posthog.capture('$pageview')

    console.log('PostHog: Page view tracked for', url)
  }, [url, user, posthogConfig])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
