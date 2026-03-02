import type { SimpleTFunction } from '#common/ui/hooks/use_translation'

import {
  HomeIcon,
  Settings2,
  Shield,
  Users,
  User,
  CreditCard,
  BarChart2,
  LayoutGrid,
  Layers,
} from 'lucide-react'

import type { NavMainItem, NavUserOptionsGroup } from '#common/ui/types/navigation'

export function getNavUser(t: SimpleTFunction): NavUserOptionsGroup[] {
  return [
    [
      {
        title: t('common.layout.navUser.profile'),
        url: '/dashboard/users/me',
        icon: User,
      },
      {
        title: t('common.layout.navUser.settings'),
        url: '/settings/',
        icon: Settings2,
      },
    ],
  ]
}

export function getNavMain(t: SimpleTFunction): NavMainItem[] {
  return [
    {
      title: t('common.layout.navMain.general'),
      items: [
        {
          title: t('common.layout.navMain.dashboard'),
          url: '/dashboard',
          icon: HomeIcon,
        },
        {
          title: t('common.layout.navMain.websites'),
          url: '/dashboard/websites',
          icon: LayoutGrid,
        },
        {
          title: t('common.layout.navMain.pricing'),
          url: '/pricing',
          icon: CreditCard,
        },
      ],
    },
    {
      title: t('common.layout.navMain.administration'),
      items: [
        {
          title: t('common.layout.navMain.adminSettings'),
          url: '/dashboard/admin/settings',
          icon: Settings2,
          subject: 'website_settings',
        },
        {
          title: t('common.layout.navMain.users'),
          url: '/dashboard/users',
          icon: Users,
          subject: 'user',
        },
        {
          title: t('common.layout.navMain.roles'),
          url: '/dashboard/admin/roles',
          icon: Shield,
          subject: 'role',
        },
        {
          title: t('common.layout.navMain.subscriptions'),
          url: '/dashboard/admin/subscriptions',
          icon: BarChart2,
          subject: 'subscription',
        },
        {
          title: t('common.layout.navMain.plans'),
          url: '/dashboard/admin/subscriptions/plans',
          icon: CreditCard,
          subject: 'subscription',
        },
        {
          title: t('common.layout.navMain.themes'),
          url: '/dashboard/admin/themes',
          icon: Layers,
          subject: 'subscription',
        },
      ],
    },
  ]
}

export function getNavHome(_: SimpleTFunction): NavMainItem[] {
  return []
}
