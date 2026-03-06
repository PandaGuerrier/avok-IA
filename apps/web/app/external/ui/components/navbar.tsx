import { Link } from '@inertiajs/react'

interface NavbarProps {
  currentPage: string
  setCurrentPage: (page: string) => void
}

export function Navbar({ currentPage, setCurrentPage }: NavbarProps) {
  return (
    <nav className="w-64 bg-gradient-to-b from-blue-600 to-blue-700 shadow-lg h-screen flex flex-col">
      <div className="p-6 flex flex-col items-center gap-4 border-b border-blue-500">
        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center font-bold text-blue-600 text-lg">
          NT
        </div>
        <h1 className="text-2xl font-bold text-white text-center">NoteTrack</h1>
      </div>
      
      {/* Pages internes */}
      <div className="flex flex-col gap-4 p-6 flex-1">
        <p className="text-white text-sm font-semibold uppercase tracking-wider opacity-75">Naviguation</p>
        {[
          { id: 'dashboard', label: 'Accueil' },
          { id: 'grades', label: 'Notes' },
          { id: 'attendance', label: 'Assiduité' },
          { id: 'incidents', label: 'Incidents' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`w-full py-3 px-4 rounded-lg font-medium transition text-left ${
              currentPage === item.id ? 'bg-white text-blue-600' : 'text-white hover:bg-blue-500'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Applications externes */}
      <div className="border-t border-blue-500 p-6 flex flex-col gap-3">
        <p className="text-white text-sm font-semibold uppercase tracking-wider opacity-75">Applications</p>
        <Link
          href="/external/jaimail"
          className="w-full py-3 px-4 rounded-lg font-medium transition text-left text-white hover:bg-blue-500 bg-blue-500 hover:bg-blue-400"
        >
          📧 J'ai Mail
        </Link>
        <Link
          href="/external/instagrume"
          className="w-full py-3 px-4 rounded-lg font-medium transition text-left text-white hover:bg-blue-500 bg-blue-500 hover:bg-blue-400"
        >
          📸 Instagrume
        </Link>
      </div>
    </nav>
  )
}
