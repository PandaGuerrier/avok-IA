import { create } from 'zustand'

export type ActionKey =
  | 'interrogated'
  | 'usedProof'
  | 'instaPostAlibi'
  | 'instaConvAlibi'
  | 'mailAlibi'
  | 'usedAlibi'
  | 'usedCustomChoice'

interface TutorialData {
  step: 0 | 1 | 2 | 3 | 4
  interrogated: boolean
  usedProof: boolean
  instaPostAlibi: boolean
  instaConvAlibi: boolean
  mailAlibi: boolean
  usedAlibi: boolean
  usedCustomChoice: boolean
}

interface TutorialState extends TutorialData {
  gameUuid: string | null
  initialized: boolean
  init(gameUuid: string): void
  markAction(key: ActionKey, gameUuid: string): void
  isUnlocked(app: 'instagrume' | 'jaimail' | 'notetrack'): boolean
  needsGlow(action: ActionKey): boolean
}

const defaultData: TutorialData = {
  step: 0,
  interrogated: false,
  usedProof: false,
  instaPostAlibi: false,
  instaConvAlibi: false,
  mailAlibi: false,
  usedAlibi: false,
  usedCustomChoice: false,
}

function saveToLocalStorage(gameUuid: string, data: TutorialData) {
  localStorage.setItem(`avok_tuto_${gameUuid}`, JSON.stringify(data))
}

function checkAdvance(data: TutorialData, gameUuid: string): TutorialData {
  const { step } = data
  const allDone: Record<number, boolean> = {
    0: data.interrogated && data.usedProof,
    1: data.instaPostAlibi && data.instaConvAlibi,
    2: data.mailAlibi,
    3: data.usedAlibi && data.usedCustomChoice,
  }
  if (step < 4 && allDone[step]) {
    const nextStep = (step + 1) as 0 | 1 | 2 | 3 | 4
    const newData = { ...data, step: nextStep }
    saveToLocalStorage(gameUuid, newData)
    return newData
  }
  return data
}

export const useTutorialStore = create<TutorialState>((set, get) => ({
  ...defaultData,
  gameUuid: null,
  initialized: false,

  init(gameUuid: string) {
    // Avoid re-initializing for the same game
    if (get().gameUuid === gameUuid && get().initialized) return
    const saved = localStorage.getItem(`avok_tuto_${gameUuid}`)
    if (saved) {
      try {
        const parsed: TutorialData = JSON.parse(saved)
        set({ ...parsed, gameUuid, initialized: true })
      } catch {
        const data = { ...defaultData }
        saveToLocalStorage(gameUuid, data)
        set({ ...data, gameUuid, initialized: true })
      }
    } else {
      const data = { ...defaultData }
      saveToLocalStorage(gameUuid, data)
      set({ ...data, gameUuid, initialized: true })
    }
  },

  markAction(key: ActionKey, gameUuid: string) {
    const state = get()
    const data: TutorialData = {
      step: state.step,
      interrogated: state.interrogated,
      usedProof: state.usedProof,
      instaPostAlibi: state.instaPostAlibi,
      instaConvAlibi: state.instaConvAlibi,
      mailAlibi: state.mailAlibi,
      usedAlibi: state.usedAlibi,
      usedCustomChoice: state.usedCustomChoice,
    }
    const updated = { ...data, [key]: true }
    const advanced = checkAdvance(updated, gameUuid)
    saveToLocalStorage(gameUuid, advanced)
    set({ ...advanced, gameUuid, initialized: true })
  },

  isUnlocked(app: 'instagrume' | 'jaimail' | 'notetrack') {
    const { initialized, step } = get()
    if (!initialized) return true // Safe default before init
    if (app === 'instagrume') return step >= 1
    if (app === 'jaimail') return step >= 2
    if (app === 'notetrack') return step >= 3
    return false
  },

  needsGlow(action: ActionKey) {
    const s = get()
    if (!s.initialized || s.step >= 4) return false
    const stepMap: Partial<Record<number, ActionKey[]>> = {
      0: ['interrogated', 'usedProof'],
      1: ['instaPostAlibi', 'instaConvAlibi'],
      2: ['mailAlibi'],
      3: ['usedAlibi', 'usedCustomChoice'],
    }
    const currentActions = stepMap[s.step] ?? []
    if (!currentActions.includes(action)) return false
    // For step 3: glow usedCustomChoice only after usedAlibi is done
    if (action === 'usedCustomChoice' && !s.usedAlibi) return false
    return !s[action]
  },
}))
