import { Link } from '@inertiajs/react'

interface AppsNavigationProps {
  currentApp: 'jaimail' | 'note_track' | 'instagrume'
}

export function AppsNavigation({ currentApp }: AppsNavigationProps) {
  const apps = [
    { id: 'jaimail', label: '📧 J\'ai Mail', href: '/external/jaimail' },
    { id: 'note_track', label: '📚 NoteTrack', href: '/external/note-track' },
    { id: 'instagrume', label: '📸 Instagrume', href: '/external/instagrume' },
  ]

  return (
    <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <div className="flex items-center gap-1 px-4 py-3 overflow-x-auto">
        {apps.map((app) => (
          <Link
            key={app.id}
            href={app.href}
            className={`px-4 py-2 rounded-lg font-medium transition-all text-sm whitespace-nowrap ${
              currentApp === app.id
                ? 'bg-brand-cyan text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {app.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
