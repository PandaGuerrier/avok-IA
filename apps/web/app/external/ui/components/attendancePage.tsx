const attendance = [
  { type: 'Retards', count: 3, color: 'bg-cyan-500', last: '26 Février 2026', reason: 'Transport' },
  { type: 'Absences', count: 7, color: 'bg-yellow-500', last: '9 Février 2026', reason: 'Malade' },
  { type: 'Exclusion', count: 1, color: 'bg-red-500', last: '18 Décembre 2025', reason: "Voir Carnet d'incidents" },
]

export function AttendancePage() {
  return (
    <div className="h-full overflow-auto">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Assiduité</h2>
          <div className="space-y-6">
            {attendance.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-6 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${item.color}`} />
                  <span className="text-lg font-medium text-gray-800">{item.type}</span>
                </div>
                <span className="text-lg font-medium text-gray-800">Dernier : {item.last}</span>
                <span className="text-lg font-medium text-gray-800">Raison : {item.reason}</span>
                <span className="text-2xl font-bold text-gray-800">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
