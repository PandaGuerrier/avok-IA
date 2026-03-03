import { Toaster } from '@workspace/ui/components/sonner'

import { AppLogo } from '#common/ui/components/app_logo'
import { EtheralShadow } from '@workspace/ui/components/etheral-shadow'
import React, { useEffect, useState } from 'react'
import { AppLangChanger } from '#common/ui/components/app_lang_changer'
import { ToggleTheme } from '#common/ui/components/toggle_theme'
import { ThemeProvider } from '@workspace/ui/components/theme-provider'

export interface AuthLayoutProps extends React.PropsWithChildren {}

export const citations = [
  {
    'text': "La simplicité est la sophistication suprême. – Simplicity is the ultimate sophistication.",
    'author': "Leonardo da Vinci"
  },
  {
    'text': "You must be the change you wish to see in the world. – Tu dois être le changement que tu veux voir dans le monde.",
    'author': "Mahatma Gandhi"
  },
  {
    'text': "Rien de grand ne s’est accompli sans passion. – Nothing great was ever achieved without passion.",
    'author': "Georg Wilhelm Friedrich Hegel"
  },
  {
    'text': "The only way to do great work is to love what you do. – La seule façon de faire du bon travail, c’est d’aimer ce que tu fais.",
    'author': "Steve Jobs"
  },
  {
    'text': "Il faut toujours viser la lune, car même en cas d’échec, on atterrit dans les étoiles. – Always aim for the moon; even if you miss, you’ll land among the stars.",
    'author': "Oscar Wilde"
  },
  {
    'text': "Happiness is not something ready made. It comes from your own actions. – Le bonheur vient de nos propres actions.",
    'author': "Dalai Lama"
  },
  {
    'text': "Le futur appartient à ceux qui croient à la beauté de leurs rêves. – The future belongs to those who believe in the beauty of their dreams.",
    'author': "Eleanor Roosevelt"
  },
  {
    'text': "In the middle of difficulty lies opportunity. – Au cœur de la difficulté se cache l’opportunité.",
    'author': "Albert Einstein"
  },
  {
    'text': "Créer, c’est vivre deux fois. – To create is to live twice.",
    'author': "Albert Camus"
  },
  {
    'text': "Do not go where the path may lead, go instead where there is no path and leave a trail. – Ne va pas là où le chemin te mène, mais là où il n’existe pas encore.",
    'author': "Ralph Waldo Emerson"
  }
]


export default function AuthLayout({ children }: AuthLayoutProps) {
  const [citation, setCitation] = useState(citations[0])

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * citations.length)
    setCitation(citations[randomIndex])
  }, [])

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Toaster />

      <div className="grid min-h-screen lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <AppLogo />
            <AppLangChanger />
            <ToggleTheme />
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">{children}</div>
          </div>
        </div>
        <div className="relative hidden bg-muted lg:block">
          <div className="absolute inset-0 flex items-center justify-center bg-background/40">
            <EtheralShadow
              color="oklch(62.7% 0.265 303.9)"
              animation={{ scale: 100, speed: 90 }}
              noise={{ opacity: 0, scale: 1.2 }}
              sizing="fill"
            >
              <div className="w-full h-full flex items-center justify-center p-6 text-center">
                <div>
                  <blockquote className="text-lg italic">“{citation.text}”</blockquote>
                  <p className="mt-4 text-sm font-semibold">- {citation.author}</p>
                </div>

              </div>
            </EtheralShadow>
          </div>
        </div>
      </div>
    </ThemeProvider>
  )
}
