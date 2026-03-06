import { Calendar, FileSearch, LucideIcon, Mail, StickyNote } from 'lucide-react'

const DURATION_S = 7 * 60

const PROOF_TYPE_ICONS: Record<string, LucideIcon> = {
  instagram: FileSearch,
  mail: Mail,
  calendar: Calendar,
  note: StickyNote,
}

export { DURATION_S, PROOF_TYPE_ICONS }
