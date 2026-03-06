interface NavbarProps {
  currentPage: string
  setCurrentPage: (page: string) => void
}

export function Navbar({ currentPage, setCurrentPage }: NavbarProps) {
  return (
    <nav id="tour-note-navbar" className="w-64 bg-gradient-to-b from-blue-600 to-blue-700 shadow-lg h-screen flex flex-col">
      <div className="p-6 flex flex-col items-center gap-4 border-b border-blue-500">
        <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center font-bold text-blue-600 text-lg">
          NT
        </div>
        <h1 className="text-2xl font-bold text-white text-center">NoteTrack</h1>
      </div>
      <div className="flex flex-col gap-4 p-6 flex-1">
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
    </nav>
  )
}
