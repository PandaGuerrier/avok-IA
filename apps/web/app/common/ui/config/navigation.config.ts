import type { SimpleTFunction } from '#common/ui/hooks/use_translation'

import {
  FileCheck,
  Scale,
  Shield,
  User,
  Settings2,
  Camera,
  Mail,
  BookOpen,
  Bot,
  Gamepad2,
} from 'lucide-react'

import type { NavMainItem, NavUserOptionsGroup } from '#common/ui/types/navigation'

export function getNavUser(_: SimpleTFunction, isAdmin?: boolean): NavUserOptionsGroup[] {
  const groups: NavUserOptionsGroup[] = [
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

  if (isAdmin) {
    groups.push([
      {
        title: 'Config IA',
        url: '/admin/ia',
        icon: Bot,
      },
      {
        title: 'Parties',
        url: '/admin/games',
        icon: Gamepad2,
      },
    ])
  }

  return groups
}

export function getNavMain(_: SimpleTFunction, gameUuid?: string): NavMainItem[] {
  return [
    ...(gameUuid
      ? [
          {
            title: 'GLOBAL',
            items: [
              {
                title: 'Tribunal',
                url: `/game/${gameUuid}`,
                icon: Scale,
                external: false,
              },
            ],
          },
          {
            title: 'RÉSEAUX SOCIAUX',
            items: [
              {
                title: 'Instagrume',
                url: `/game/${gameUuid}/instagrume`,
                icon: Camera,
                external: false,
              },
              {
                title: 'Jaimail',
                url: `/game/${gameUuid}/jaimail`,
                icon: Mail,
                external: false,
              },
              {
                title: 'NoteTrack',
                url: `/game/${gameUuid}/notetrack`,
                icon: BookOpen,
                external: false,
              },
            ],
          },
        ]
      : []),
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
