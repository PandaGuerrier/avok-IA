const incidents = [
    { date: '18 Décembre 2025', color: 'bg-red-500', punishment: ["Exclusion de 2 jours", "Travaux d'interêts généraux"] },
]

export function IncidentsPage() {
    return (
        <div className="h-full overflow-auto">
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8">Incidents</h2>
                    <div className="space-y-6">
                        {incidents.map((item, index) => (
                            <div key={index} className="p-6 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className={`w-4 h-4 rounded-full ${item.color}`} />
                                    <span className="text-sm font-semibold text-gray-500">{item.date}</span>
                                </div>
                                <ul className="space-y-1 ml-8">
                                    {item.punishment.map((p, i) => (
                                        <li key={i} className="text-lg font-medium text-gray-800">• {p}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
