import type { SimpleTFunction } from '#common/ui/hooks/use_translation'

import {
  FileCheck,
  HomeIcon,
  Scale,
  Shield,
  User,
  Settings2,
} from 'lucide-react'

import type { NavMainItem, NavUserOptionsGroup } from '#common/ui/types/navigation'

export function getNavUser(_: SimpleTFunction): NavUserOptionsGroup[] {
  return [
    [
      {
        title: 'Mon Profil',
        url: '/profile',
        icon: User,
      },
      {
        title: 'Paramètres',
        url: '/settings/',
        icon: Settings2,
      },
    ],
  ]
}

export function getNavMain(t: SimpleTFunction): NavMainItem[] {
  return [
    {
      title: 'GÉNÉRAL',
      items: [
        {
          title: t('common.layout.navMain.dashboard'),
          url: '/',
          icon: HomeIcon,
        },
      ],
    },
  ]
}

export function getNavHome(_: SimpleTFunction): NavMainItem[] {
  return [
    {
      title: 'Légal',
      items: [
        {
          title: 'Politique de Confidentialité',
          url: '/politique-confidentialite',
          icon: Shield,
        },
        {
          title: "Conditions Générales d'Utilisation",
          url: '/cgu',
          icon: FileCheck,
        },
        {
          title: 'Mentions Légales',
          url: '/mentions-legales',
          icon: Scale,
        },
      ],
    },
  ]
}
