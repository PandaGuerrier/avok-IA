const gradesList = [
  { subject: 'Mathématiques', grades: [15.5, 12.0, 14.2, 13.8], color: 'bg-green-100' },
  { subject: 'Anglais', grades: [17.5, 16.2, 18.0, 15.8], color: 'bg-blue-100' },
  { subject: 'Histoire', grades: [11.5, 8.0, 10.5, 8.2], color: 'bg-purple-100' },
  { subject: 'Sciences', grades: [16.0, 14.5, 15.8, 13.2], color: 'bg-orange-100' },
  { subject: 'Français', grades: [6.5, 4.0, 8.2, 4.5], color: 'bg-red-100' },
]

const calculateAverage = (grades: number[]) => {
  return (grades.reduce((acc, g) => acc + g, 0) / grades.length).toFixed(2)
}

export function GradesPage() {
  const allGrades = gradesList.flatMap((item) => item.grades)
  const overallAverage = (allGrades.reduce((acc, g) => acc + g, 0) / allGrades.length).toFixed(2)

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Mes Notes</h2>
          <div className="mb-8 text-lg font-semibold text-blue-600">
            Moyenne générale: <span className="text-2xl text-blue-700">{overallAverage}/20</span>
          </div>
          <div className="space-y-6">
            {gradesList.map((item, index) => (
              <div key={index} className={`${item.color} rounded-lg p-6 shadow hover:shadow-lg transition`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-800">{item.subject}</h3>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Moyenne</p>
                    <p className="text-2xl font-bold text-gray-800">{calculateAverage(item.grades)}/20</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {item.grades.map((grade, gradeIndex) => (
                    <div key={gradeIndex} className="bg-white bg-opacity-70 rounded-lg p-3 text-center">
                      <p className="text-xs text-gray-600 mb-1">Devoir {gradeIndex + 1}</p>
                      <p className="text-lg font-bold text-gray-800">{grade}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
