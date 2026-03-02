export function formatRelativeDate(d: Date) {
  const now = Date.now()
  const diffSec = Math.floor((now - d.getTime()) / 1000)

  const SECONDS_IN_MIN = 60
  const SECONDS_IN_HOUR = 3600
  const SECONDS_IN_DAY = 86400

  if (diffSec < SECONDS_IN_MIN) {
    return `Il y a ${diffSec}s`
  }

  if (diffSec < SECONDS_IN_HOUR) {
    const m = Math.floor(diffSec / SECONDS_IN_MIN)
    return `Il y a ${m}m`
  }

  if (diffSec < SECONDS_IN_DAY) {
    const h = Math.floor(diffSec / SECONDS_IN_HOUR)
    return `Il y a ${h}h`
  }

  const days = Math.floor(diffSec / SECONDS_IN_DAY)
  if (days <= 3) {
    return `Il y a ${days}j`
  }

  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function getUpdateInterval(diff: number) {
  let interval: number
  if (diff >= 60 && diff < 3600)
    interval = 60 * 1000 // update chaques minutes
  else if (diff >= 3600 && diff < 86400)
    interval = 60 * 60 * 1000 // chaques heures
  else interval = 60 * 60 * 1000 // chaques jours

  return interval
}

export function formatRemainingTime(expiresAt: string | null) {
  if (!expiresAt) return 'Permanent'

  const expires = new Date(expiresAt)
  const diffSec = Math.floor((expires.getTime() - Date.now()) / 1000)

  if (diffSec <= 0) return 'Expiré'

  const SECONDS_IN_MIN = 60
  const SECONDS_IN_HOUR = 3600
  const SECONDS_IN_DAY = 86400

  if (diffSec < SECONDS_IN_MIN) {
    return `dans ${diffSec}s`
  }

  if (diffSec < SECONDS_IN_HOUR) {
    const m = Math.floor(diffSec / SECONDS_IN_MIN)
    return `dans ${m}m`
  }

  if (diffSec < SECONDS_IN_DAY) {
    const h = Math.floor(diffSec / SECONDS_IN_HOUR)
    return `dans ${h}h`
  }

  const days = Math.floor(diffSec / SECONDS_IN_DAY)
  if (days <= 3) {
    return `dans ${days}j`
  }

  return expires.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

