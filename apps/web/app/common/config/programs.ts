// Centralised academic programs/tracks/years and campuses used across the app

export const PROGRAMS_DATA: Record<string, { label: string; years: number[]; tracks: string[] }> = {
  PREPA: {
    label: 'Prépa',
    years: [1, 2],
    tracks: ['Classique', 'Internationale', 'Bio & Numérique', 'Renforcée', 'Rentrée décalée'],
  },
  BACHELOR: {
    label: 'Bachelor',
    years: [1, 2, 3],
    tracks: [
      'Cybersécurité & Ethical Hacking',
      'Développeur Web & Application',
      'Marketing Digital & Communication',
      'Stratégie Digitale et Innovation',
      'Business & Nouvelles Technologies',
      'Ingénierie & Numérique',
      'Concepteur Développeur Global Programming',
      'International Communication Management',
    ],
  },
  INGENIEUR: {
    label: 'Cycle Ingénieur',
    years: [3, 4, 5],
    tracks: [
      'Software Engineering',
      'IT for Finance',
      'Digital Transformation',
      'Cybersécurité, SI & Gouvernance',
      'Cybersécurité, Infrastructure & Logiciels',
      'Big Data & Machine Learning',
      'Business Intelligence & Analytics',
      'Transports Intelligents',
      'Systèmes Robotiques & Drones',
      'Bio-informatique',
      'Imagerie & Réalité Virtuelle',
      'Networks & Cloud Infrastructure',
    ],
  },
  MASTERE: {
    label: 'Mastère',
    years: [4, 5],
    tracks: [
      'Networks & Security Manager',
      'Dev Manager Full Stack',
      'Data Engineering & IA',
      'Marketing Digital et Management',
      'Cybersécurité & Management',
      'E-Business, Stratégie et Transformation Digitale',
    ],
  },
}

export const YEARS: number[] = [1, 2, 3, 4, 5]

export const CAMPUSES: string[] = ['paris', 'bordeaux']

export const ALL_PROGRAM_LABELS: string[] = Object.values(PROGRAMS_DATA).map((p) => p.label)

export const ALL_TRACKS: string[] = Array.from(
  new Set(Object.values(PROGRAMS_DATA).flatMap((p) => p.tracks))
)
