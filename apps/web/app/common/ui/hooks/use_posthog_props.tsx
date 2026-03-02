import usePageProps from './use_page_props'

export default function usePosthogProps() {
  const { posthog } = usePageProps<{ posthog: any }>()
  return posthog
}
