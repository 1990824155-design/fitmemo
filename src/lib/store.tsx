import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type {
  AppData,
  Exercise,
  SetRow,
  Template,
  WorkoutDay,
} from './types'
import { loadData, saveData } from './storage'
import { uid } from './id'
import { todayKey } from './dates'
import { isSetEmpty, isSetFilled } from './sets'

type Store = {
  data: AppData
  today: WorkoutDay | null
  ensureToday: (focus?: string) => WorkoutDay
  updateToday: (patch: Partial<WorkoutDay>) => void
  /** @returns false 表示该日已有该动作，未重复添加 */
  addExerciseToToday: (exercise: Exercise | { name: string; tags?: string[] }) => boolean
  addExerciseToWorkout: (
    workoutId: string,
    exercise: Exercise | { name: string; tags?: string[] },
  ) => boolean
  updateWorkout: (workoutId: string, patch: Partial<WorkoutDay>) => { ok: true } | { ok: false; reason: string }
  removeExerciseFromWorkout: (workoutId: string, entryId: string) => void
  reorderWorkoutExercises: (workoutId: string, activeId: string, overId: string) => void
  removeExerciseFromToday: (entryId: string) => void
  reorderTodayExercises: (activeId: string, overId: string) => void
  addSet: (entryId: string, workoutId?: string) => void
  updateSet: (entryId: string, setId: string, patch: Partial<SetRow>, workoutId?: string) => void
  removeSet: (entryId: string, setId: string, workoutId?: string) => void
  applyTemplate: (template: Template, workoutId?: string) => void
  upsertExercise: (name: string, tags?: string[]) => Exercise
  /** @returns false 表示改名与已有动作冲突或名称为空 */
  updateExercise: (id: string, patch: Partial<Exercise>) => boolean
  /** 从动作库删除（软删除/归档）；历史训练记录保留，并从模板中移除引用 */
  deleteExercise: (id: string) => void
  addTemplate: (name: string, exerciseIds: string[]) => string
  updateTemplate: (id: string, patch: Partial<Pick<Template, 'name' | 'exerciseIds'>>) => void
  deleteTemplate: (id: string) => void
  saveWorkoutDay: (workoutId?: string) => void
  deleteWorkout: (id: string) => void
  replaceAll: (next: AppData) => void
  lastForExercise: (exerciseId: string, excludeWorkoutId?: string) => string | null
}

const Ctx = createContext<Store | null>(null)

function emptySets(): SetRow[] {
  return [{ id: uid('set'), weightKg: '', reps: '', done: false }]
}

function findDay(d: AppData, workoutId: string) {
  return d.workouts.find((w) => w.id === workoutId)
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => loadData())

  useEffect(() => {
    saveData(data)
  }, [data])

  const today = useMemo(
    () => data.workouts.find((w) => w.date === todayKey()) ?? null,
    [data.workouts],
  )

  const mutate = (fn: (draft: AppData) => AppData) => {
    setData((prev) => fn(structuredClone(prev)))
  }

  const ensureToday = (focus = '') => {
    if (today) return today
    const day: WorkoutDay = {
      id: uid('wo'),
      date: todayKey(),
      focus,
      exercises: [],
      performance: 7,
      fatigue: 5,
      note: '',
    }
    mutate((d) => ({ ...d, workouts: [day, ...d.workouts] }))
    return day
  }

  const updateWorkout = (
    workoutId: string,
    patch: Partial<WorkoutDay>,
  ): { ok: true } | { ok: false; reason: string } => {
    if (patch.date) {
      const clash = data.workouts.find((w) => w.date === patch.date && w.id !== workoutId)
      if (clash) {
        return { ok: false, reason: `「${patch.date}」已有另一条训练记录` }
      }
    }

    mutate((d) => {
      const day = findDay(d, workoutId)
      if (!day) return d
      Object.assign(day, patch)
      return d
    })
    return { ok: true }
  }

  const updateToday = (patch: Partial<WorkoutDay>) => {
    const key = todayKey()
    mutate((d) => {
      const idx = d.workouts.findIndex((w) => w.date === key)
      if (idx < 0) {
        const day: WorkoutDay = {
          id: uid('wo'),
          date: key,
          focus: '',
          exercises: [],
          performance: 7,
          fatigue: 5,
          note: '',
          ...patch,
        }
        return { ...d, workouts: [day, ...d.workouts] }
      }
      d.workouts[idx] = { ...d.workouts[idx], ...patch }
      return d
    })
  }

  const upsertExercise = (name: string, tags: string[] = []) => {
    const trimmed = name.trim()
    let found = data.exercises.find((e) => e.name === trimmed && !e.archived)
    if (found) return found
    found = { id: uid('ex'), name: trimmed, tags }
    mutate((d) => ({ ...d, exercises: [found!, ...d.exercises] }))
    return found
  }

  const addExerciseToWorkout = (
    workoutId: string,
    exercise: Exercise | { name: string; tags?: string[] },
  ) => {
    let added = false
    mutate((d) => {
      let lib: Exercise | undefined
      if ('id' in exercise) {
        lib = d.exercises.find((e) => e.id === exercise.id)
      } else {
        const trimmed = exercise.name.trim()
        lib = d.exercises.find((e) => e.name === trimmed && !e.archived)
        if (!lib) {
          lib = { id: uid('ex'), name: trimmed, tags: exercise.tags ?? [] }
          d.exercises = [lib, ...d.exercises]
        }
      }
      if (!lib) return d
      const target = findDay(d, workoutId)
      if (!target) return d
      if (target.exercises.some((e) => e.exerciseId === lib!.id)) return d
      target.exercises.push({
        id: uid('we'),
        exerciseId: lib.id,
        name: lib.name,
        sets: emptySets(),
      })
      added = true
      return d
    })
    return added
  }

  const addExerciseToToday = (exercise: Exercise | { name: string; tags?: string[] }) => {
    let added = false
    mutate((d) => {
      let day = d.workouts.find((w) => w.date === todayKey())
      if (!day) {
        day = {
          id: uid('wo'),
          date: todayKey(),
          focus: '',
          exercises: [],
          performance: 7,
          fatigue: 5,
          note: '',
        }
        d.workouts = [day, ...d.workouts]
      }

      let lib: Exercise | undefined
      if ('id' in exercise) {
        lib = d.exercises.find((e) => e.id === exercise.id)
      } else {
        const trimmed = exercise.name.trim()
        lib = d.exercises.find((e) => e.name === trimmed && !e.archived)
        if (!lib) {
          lib = { id: uid('ex'), name: trimmed, tags: exercise.tags ?? [] }
          d.exercises = [lib, ...d.exercises]
        }
      }
      if (!lib) return d
      if (day.exercises.some((e) => e.exerciseId === lib!.id)) return d
      day.exercises.push({
        id: uid('we'),
        exerciseId: lib.id,
        name: lib.name,
        sets: emptySets(),
      })
      added = true
      return d
    })
    return added
  }

  const removeExerciseFromWorkout = (workoutId: string, entryId: string) => {
    mutate((d) => {
      const day = findDay(d, workoutId)
      if (!day) return d
      day.exercises = day.exercises.filter((e) => e.id !== entryId)
      return d
    })
  }

  const removeExerciseFromToday = (entryId: string) => {
    if (!today) return
    removeExerciseFromWorkout(today.id, entryId)
  }

  const reorderWorkoutExercises = (workoutId: string, activeId: string, overId: string) => {
    if (activeId === overId) return
    mutate((d) => {
      const day = findDay(d, workoutId)
      if (!day) return d
      const from = day.exercises.findIndex((e) => e.id === activeId)
      const to = day.exercises.findIndex((e) => e.id === overId)
      if (from < 0 || to < 0) return d
      const [item] = day.exercises.splice(from, 1)
      day.exercises.splice(to, 0, item)
      return d
    })
  }

  const reorderTodayExercises = (activeId: string, overId: string) => {
    if (!today) return
    reorderWorkoutExercises(today.id, activeId, overId)
  }

  const resolveWorkoutId = (workoutId?: string) => workoutId ?? today?.id

  const addSet = (entryId: string, workoutId?: string) => {
    const wid = resolveWorkoutId(workoutId)
    if (!wid) return
    mutate((d) => {
      const day = findDay(d, wid)
      const ex = day?.exercises.find((e) => e.id === entryId)
      if (!ex) return d
      // 新增空组，便于删掉多余行；重量/次数不必先填
      ex.sets.push({
        id: uid('set'),
        weightKg: '',
        reps: '',
        done: false,
      })
      return d
    })
  }

  const updateSet = (
    entryId: string,
    setId: string,
    patch: Partial<SetRow>,
    workoutId?: string,
  ) => {
    const wid = resolveWorkoutId(workoutId)
    if (!wid) return
    mutate((d) => {
      const day = findDay(d, wid)
      const ex = day?.exercises.find((e) => e.id === entryId)
      const set = ex?.sets.find((s) => s.id === setId)
      if (set) {
        Object.assign(set, patch)
        set.done = isSetFilled(set)
      }
      return d
    })
  }

  const removeSet = (entryId: string, setId: string, workoutId?: string) => {
    const wid = resolveWorkoutId(workoutId)
    if (!wid) return
    mutate((d) => {
      const day = findDay(d, wid)
      const ex = day?.exercises.find((e) => e.id === entryId)
      if (!ex || ex.sets.length <= 1) return d
      ex.sets = ex.sets.filter((s) => s.id !== setId)
      return d
    })
  }

  const applyTemplate = (template: Template, workoutId?: string) => {
    const wid = workoutId ?? ensureToday(template.name).id
    mutate((d) => {
      const day = findDay(d, wid)
      if (!day) return d
      if (!day.focus) day.focus = template.name
      for (const eid of template.exerciseIds) {
        const lib = d.exercises.find((e) => e.id === eid)
        if (!lib || day.exercises.some((e) => e.exerciseId === eid)) continue
        day.exercises.push({
          id: uid('we'),
          exerciseId: lib.id,
          name: lib.name,
          sets: emptySets(),
        })
      }
      return d
    })
  }

  const updateExercise = (id: string, patch: Partial<Exercise>) => {
    let ok = true
    mutate((d) => {
      const ex = d.exercises.find((e) => e.id === id)
      if (!ex) {
        ok = false
        return d
      }
      let next = patch
      if (typeof patch.name === 'string') {
        const trimmed = patch.name.trim()
        if (!trimmed) {
          ok = false
          return d
        }
        const clash = d.exercises.some(
          (e) => e.id !== id && !e.archived && e.name === trimmed,
        )
        if (clash) {
          ok = false
          return d
        }
        next = { ...patch, name: trimmed }
      }
      Object.assign(ex, next)
      if (typeof next.name === 'string') {
        for (const w of d.workouts) {
          for (const we of w.exercises) {
            if (we.exerciseId === id) we.name = next.name
          }
        }
      }
      return d
    })
    return ok
  }

  const deleteExercise = (id: string) => {
    mutate((d) => {
      const ex = d.exercises.find((e) => e.id === id)
      if (ex) ex.archived = true
      d.templates = d.templates.map((t) => ({
        ...t,
        exerciseIds: t.exerciseIds.filter((eid) => eid !== id),
      }))
      return d
    })
  }

  const addTemplate = (name: string, exerciseIds: string[]) => {
    const id = uid('tpl')
    mutate((d) => ({
      ...d,
      templates: [{ id, name, exerciseIds }, ...d.templates],
    }))
    return id
  }

  const updateTemplate = (
    id: string,
    patch: Partial<Pick<Template, 'name' | 'exerciseIds'>>,
  ) => {
    mutate((d) => {
      const t = d.templates.find((x) => x.id === id)
      if (t) Object.assign(t, patch)
      return d
    })
  }

  const deleteTemplate = (id: string) => {
    mutate((d) => ({ ...d, templates: d.templates.filter((t) => t.id !== id) }))
  }

  const saveWorkoutDay = (workoutId?: string) => {
    const wid = resolveWorkoutId(workoutId)
    if (!wid) return
    mutate((d) => {
      const day = findDay(d, wid)
      if (!day) return d
      for (const ex of day.exercises) {
        ex.sets = ex.sets.filter((s) => !isSetEmpty(s))
        if (!ex.sets.length) {
          ex.sets = emptySets()
        }
        for (const s of ex.sets) {
          s.done = isSetFilled(s)
        }
      }
      day.savedAt = new Date().toISOString()
      return d
    })
  }

  const deleteWorkout = (id: string) => {
    mutate((d) => ({ ...d, workouts: d.workouts.filter((w) => w.id !== id) }))
  }

  const replaceAll = (next: AppData) => setData(next)

  const lastForExercise = (exerciseId: string, excludeWorkoutId?: string) => {
    for (const w of data.workouts) {
      if (w.id === excludeWorkoutId) continue
      if (!excludeWorkoutId && w.date === todayKey()) continue
      const entry = w.exercises.find((e) => e.exerciseId === exerciseId)
      if (!entry) continue
      const filled = entry.sets.filter(isSetFilled)
      const ref = filled.length ? filled[filled.length - 1] : null
      if (ref) {
        return `上次: ${ref.weightKg}kg × ${ref.reps}`
      }
    }
    return null
  }

  const value: Store = {
    data,
    today,
    ensureToday,
    updateToday,
    addExerciseToToday,
    addExerciseToWorkout,
    updateWorkout,
    removeExerciseFromWorkout,
    reorderWorkoutExercises,
    removeExerciseFromToday,
    reorderTodayExercises,
    addSet,
    updateSet,
    removeSet,
    applyTemplate,
    upsertExercise,
    updateExercise,
    deleteExercise,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    saveWorkoutDay,
    deleteWorkout,
    replaceAll,
    lastForExercise,
  }

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
