export type ExerciseType = 'strength' | 'cardio' | 'bodyweight';

export interface SetEntry {
  id: string;
  setNumber: number;
  reps?: number;
  weight?: number; // kg
  setDuration?: number; // seconds - how long the set took
  restDuration?: number; // seconds - rest after this set
  completedAt?: string; // ISO timestamp
  isWarmup?: boolean;
}

export interface CardioSession {
  duration: number; // seconds
  distance?: number;
  distanceUnit: 'km' | 'mi';
  avgHeartRate?: number;
  maxHeartRate?: number;
  calories?: number;
  pace?: string; // e.g. "5:30/km"
  notes?: string;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  name: string;
  type: ExerciseType;
  muscleGroup?: string;
  sets?: SetEntry[];
  cardio?: CardioSession;
  notes?: string;
  order: number;
}

export type Mood = 1 | 2 | 3 | 4 | 5;

export interface Workout {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // ISO timestamp
  endTime?: string; // ISO timestamp
  notes: string;
  exercises: WorkoutExercise[];
  mood?: Mood;
  templateId?: string;
  totalVolume?: number; // kg * reps sum
}

export interface Exercise {
  id: string;
  name: string;
  type: ExerciseType;
  muscleGroup?: string;
  isCustom?: boolean;
}

export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  weight: number;
  reps: number;
  oneRepMax: number;
  date: string;
  workoutId: string;
}

export interface TemplateExercise {
  exerciseId: string;
  name: string;
  type: ExerciseType;
  muscleGroup?: string;
  defaultSets: number;
  defaultReps?: number;
  defaultWeight?: number;
}

export interface Template {
  id: string;
  name: string;
  exercises: TemplateExercise[];
  createdAt: string;
  lastUsed?: string;
  useCount: number;
}

export interface ProgressPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ExerciseProgress {
  exerciseId: string;
  exerciseName: string;
  volumeHistory: ProgressPoint[];
  maxWeightHistory: ProgressPoint[];
  maxRepsHistory: ProgressPoint[];
  workoutCount: number;
}
