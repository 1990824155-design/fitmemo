export type SetRow = {
  id: string
  weightKg: number | ''
  reps: number | ''
  done: boolean
}

export type WorkoutExercise = {
  id: string
  exerciseId: string
  name: string
  bilateral?: boolean
  note?: string
  sets: SetRow[]
}

export type WorkoutDay = {
  id: string
  date: string // YYYY-MM-DD
  focus: string
  exercises: WorkoutExercise[]
  performance: number
  fatigue: number
  note: string
  savedAt?: string
}

export type Exercise = {
  id: string
  name: string
  tags: string[]
  archived?: boolean
}

export type Template = {
  id: string
  name: string
  exerciseIds: string[]
}

export type WeightEntry = {
  id: string
  date: string
  kg: number
}

export type MeasurementEntry = {
  id: string
  date: string
  chest?: number
  waist?: number
  hip?: number
  arm?: number
  thigh?: number
  calf?: number
}

export type BodyFatEntry = {
  id: string
  date: string
  bodyFatPct: number
  muscleKg?: number
  fatKg?: number
}

export type AppData = {
  version: 1
  exercises: Exercise[]
  templates: Template[]
  workouts: WorkoutDay[]
  weights: WeightEntry[]
  measurements: MeasurementEntry[]
  bodyFat: BodyFatEntry[]
}
