import AsyncStorage from '@react-native-async-storage/async-storage';
import { Workout, Exercise, PersonalRecord, Template } from '../types';
import { DEFAULT_EXERCISES } from '../data/exercises';

const KEYS = {
  WORKOUTS: 'workouts_v1',
  EXERCISES: 'exercises_v1',
  PERSONAL_RECORDS: 'personal_records_v1',
  TEMPLATES: 'templates_v1',
};

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ─── Workouts ────────────────────────────────────────────────────────────────

export async function getWorkouts(): Promise<Workout[]> {
  const raw = await AsyncStorage.getItem(KEYS.WORKOUTS);
  return raw ? JSON.parse(raw) : [];
}

export async function getWorkoutByDate(date: string): Promise<Workout | null> {
  const workouts = await getWorkouts();
  return workouts.find((w) => w.date === date) ?? null;
}

export async function getWorkoutById(id: string): Promise<Workout | null> {
  const workouts = await getWorkouts();
  return workouts.find((w) => w.id === id) ?? null;
}

export async function saveWorkout(workout: Workout): Promise<void> {
  const workouts = await getWorkouts();
  const idx = workouts.findIndex((w) => w.id === workout.id);
  if (idx >= 0) {
    workouts[idx] = workout;
  } else {
    workouts.push(workout);
  }
  await AsyncStorage.setItem(KEYS.WORKOUTS, JSON.stringify(workouts));
}

export async function deleteWorkout(id: string): Promise<void> {
  const workouts = await getWorkouts();
  await AsyncStorage.setItem(
    KEYS.WORKOUTS,
    JSON.stringify(workouts.filter((w) => w.id !== id))
  );
}

export function createNewWorkout(date: string, templateId?: string): Workout {
  return {
    id: generateId(),
    date,
    startTime: new Date().toISOString(),
    notes: '',
    exercises: [],
    templateId,
  };
}

// ─── Exercises ───────────────────────────────────────────────────────────────

export async function getExercises(): Promise<Exercise[]> {
  const raw = await AsyncStorage.getItem(KEYS.EXERCISES);
  const custom: Exercise[] = raw ? JSON.parse(raw) : [];
  return [...DEFAULT_EXERCISES, ...custom];
}

export async function saveCustomExercise(
  name: string,
  type: Exercise['type'],
  muscleGroup?: string
): Promise<Exercise> {
  const raw = await AsyncStorage.getItem(KEYS.EXERCISES);
  const custom: Exercise[] = raw ? JSON.parse(raw) : [];
  const exercise: Exercise = {
    id: generateId(),
    name,
    type,
    muscleGroup,
    isCustom: true,
  };
  custom.push(exercise);
  await AsyncStorage.setItem(KEYS.EXERCISES, JSON.stringify(custom));
  return exercise;
}

export async function deleteCustomExercise(id: string): Promise<void> {
  const raw = await AsyncStorage.getItem(KEYS.EXERCISES);
  const custom: Exercise[] = raw ? JSON.parse(raw) : [];
  await AsyncStorage.setItem(
    KEYS.EXERCISES,
    JSON.stringify(custom.filter((e) => e.id !== id))
  );
}

// ─── Personal Records ────────────────────────────────────────────────────────

export async function getPersonalRecords(): Promise<PersonalRecord[]> {
  const raw = await AsyncStorage.getItem(KEYS.PERSONAL_RECORDS);
  return raw ? JSON.parse(raw) : [];
}

export async function getExercisePR(exerciseId: string): Promise<PersonalRecord | null> {
  const records = await getPersonalRecords();
  return records.find((r) => r.exerciseId === exerciseId) ?? null;
}

export function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  // Epley formula
  return Math.round(weight * (1 + reps / 30));
}

export async function checkAndUpdatePR(
  exerciseId: string,
  exerciseName: string,
  weight: number,
  reps: number,
  date: string,
  workoutId: string
): Promise<boolean> {
  if (!weight || weight <= 0) return false;
  const oneRepMax = calculate1RM(weight, reps);
  const records = await getPersonalRecords();
  const existingIdx = records.findIndex((r) => r.exerciseId === exerciseId);

  if (existingIdx < 0 || oneRepMax > records[existingIdx].oneRepMax) {
    const newPR: PersonalRecord = {
      id: generateId(),
      exerciseId,
      exerciseName,
      weight,
      reps,
      oneRepMax,
      date,
      workoutId,
    };
    if (existingIdx >= 0) {
      records[existingIdx] = newPR;
    } else {
      records.push(newPR);
    }
    await AsyncStorage.setItem(KEYS.PERSONAL_RECORDS, JSON.stringify(records));
    return true;
  }
  return false;
}

// ─── Templates ───────────────────────────────────────────────────────────────

export async function getTemplates(): Promise<Template[]> {
  const raw = await AsyncStorage.getItem(KEYS.TEMPLATES);
  return raw ? JSON.parse(raw) : [];
}

export async function saveTemplate(template: Template): Promise<void> {
  const templates = await getTemplates();
  const idx = templates.findIndex((t) => t.id === template.id);
  if (idx >= 0) {
    templates[idx] = template;
  } else {
    templates.push(template);
  }
  await AsyncStorage.setItem(KEYS.TEMPLATES, JSON.stringify(templates));
}

export async function deleteTemplate(id: string): Promise<void> {
  const templates = await getTemplates();
  await AsyncStorage.setItem(
    KEYS.TEMPLATES,
    JSON.stringify(templates.filter((t) => t.id !== id))
  );
}

export async function createTemplateFromWorkout(
  workout: Workout,
  name: string
): Promise<Template> {
  const template: Template = {
    id: generateId(),
    name,
    exercises: workout.exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      name: ex.name,
      type: ex.type,
      muscleGroup: ex.muscleGroup,
      defaultSets: ex.sets?.length ?? 3,
      defaultReps: ex.sets?.[0]?.reps,
      defaultWeight: ex.sets?.[0]?.weight,
    })),
    createdAt: new Date().toISOString(),
    useCount: 0,
  };
  await saveTemplate(template);
  return template;
}

export async function applyTemplateToWorkout(
  workout: Workout,
  template: Template
): Promise<Workout> {
  const updatedTemplate = { ...template, useCount: template.useCount + 1, lastUsed: new Date().toISOString() };
  await saveTemplate(updatedTemplate);

  return {
    ...workout,
    templateId: template.id,
    exercises: template.exercises.map((te, idx) => ({
      id: generateId(),
      exerciseId: te.exerciseId,
      name: te.name,
      type: te.type as any,
      muscleGroup: te.muscleGroup,
      order: idx,
      sets: te.type !== 'cardio'
        ? Array.from({ length: te.defaultSets }, (_, i) => ({
            id: generateId(),
            setNumber: i + 1,
            reps: te.defaultReps,
            weight: te.defaultWeight,
          }))
        : undefined,
    })),
  };
}

// ─── Progress Data ────────────────────────────────────────────────────────────

export async function getExerciseHistory(
  exerciseId: string
): Promise<{ date: string; sets: { weight?: number; reps?: number }[] }[]> {
  const workouts = await getWorkouts();
  return workouts
    .filter((w) => w.exercises.some((e) => e.exerciseId === exerciseId))
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((w) => {
      const ex = w.exercises.find((e) => e.exerciseId === exerciseId)!;
      return {
        date: w.date,
        sets: (ex.sets ?? []).map((s) => ({ weight: s.weight, reps: s.reps })),
      };
    });
}

export async function getWorkoutDates(): Promise<Record<string, boolean>> {
  const workouts = await getWorkouts();
  return workouts.reduce((acc, w) => ({ ...acc, [w.date]: true }), {});
}
