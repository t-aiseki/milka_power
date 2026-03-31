import { useState, useCallback } from 'react';
import {
  getWorkouts,
  getWorkoutById,
  saveWorkout,
  deleteWorkout,
  getWorkoutDates,
  checkAndUpdatePR,
} from '../storage';
import { Workout, WorkoutExercise, SetEntry } from '../types';

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export function useWorkoutEditor(initialWorkout: Workout) {
  const [workout, setWorkout] = useState<Workout>(initialWorkout);
  const [saving, setSaving] = useState(false);
  const [newPRs, setNewPRs] = useState<string[]>([]);

  const updateNotes = useCallback((notes: string) => {
    setWorkout((w) => ({ ...w, notes }));
  }, []);

  const setStartTime = useCallback((time: string) => {
    setWorkout((w) => ({ ...w, startTime: time }));
  }, []);

  const setEndTime = useCallback((time: string) => {
    setWorkout((w) => ({ ...w, endTime: time }));
  }, []);

  const setMood = useCallback((mood: Workout['mood']) => {
    setWorkout((w) => ({ ...w, mood }));
  }, []);

  const addExercise = useCallback((exercise: WorkoutExercise) => {
    setWorkout((w) => ({
      ...w,
      exercises: [...w.exercises, { ...exercise, order: w.exercises.length }],
    }));
  }, []);

  const removeExercise = useCallback((exerciseId: string) => {
    setWorkout((w) => ({
      ...w,
      exercises: w.exercises
        .filter((e) => e.id !== exerciseId)
        .map((e, i) => ({ ...e, order: i })),
    }));
  }, []);

  const addSet = useCallback((exerciseId: string) => {
    setWorkout((w) => ({
      ...w,
      exercises: w.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const prevSets = ex.sets ?? [];
        const prevSet = prevSets[prevSets.length - 1];
        const newSet: SetEntry = {
          id: generateId(),
          setNumber: prevSets.length + 1,
          reps: prevSet?.reps,
          weight: prevSet?.weight,
        };
        return { ...ex, sets: [...prevSets, newSet] };
      }),
    }));
  }, []);

  const removeSet = useCallback((exerciseId: string, setId: string) => {
    setWorkout((w) => ({
      ...w,
      exercises: w.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const sets = (ex.sets ?? [])
          .filter((s) => s.id !== setId)
          .map((s, i) => ({ ...s, setNumber: i + 1 }));
        return { ...ex, sets };
      }),
    }));
  }, []);

  const updateSet = useCallback(
    (exerciseId: string, setId: string, updates: Partial<SetEntry>) => {
      setWorkout((w) => ({
        ...w,
        exercises: w.exercises.map((ex) => {
          if (ex.id !== exerciseId) return ex;
          return {
            ...ex,
            sets: (ex.sets ?? []).map((s) =>
              s.id === setId ? { ...s, ...updates } : s
            ),
          };
        }),
      }));
    },
    []
  );

  const updateCardio = useCallback(
    (exerciseId: string, updates: Partial<WorkoutExercise['cardio']>) => {
      setWorkout((w) => ({
        ...w,
        exercises: w.exercises.map((ex) => {
          if (ex.id !== exerciseId) return ex;
          return {
            ...ex,
            cardio: { distanceUnit: 'km', duration: 0, ...ex.cardio, ...updates },
          };
        }),
      }));
    },
    []
  );

  const updateExerciseNotes = useCallback((exerciseId: string, notes: string) => {
    setWorkout((w) => ({
      ...w,
      exercises: w.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, notes } : ex
      ),
    }));
  }, []);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      // Check for PRs
      const prs: string[] = [];
      for (const ex of workout.exercises) {
        if (ex.type === 'strength' && ex.sets) {
          for (const set of ex.sets) {
            if (set.weight && set.reps) {
              const isPR = await checkAndUpdatePR(
                ex.exerciseId,
                ex.name,
                set.weight,
                set.reps,
                workout.date,
                workout.id
              );
              if (isPR && !prs.includes(ex.name)) prs.push(ex.name);
            }
          }
        }
      }
      // Calculate total volume
      const totalVolume = workout.exercises.reduce((total, ex) => {
        if (ex.sets) {
          return total + ex.sets.reduce((sum, s) => sum + (s.weight ?? 0) * (s.reps ?? 0), 0);
        }
        return total;
      }, 0);
      const finalWorkout = { ...workout, totalVolume };
      await saveWorkout(finalWorkout);
      setNewPRs(prs);
      return prs;
    } finally {
      setSaving(false);
    }
  }, [workout]);

  return {
    workout,
    saving,
    newPRs,
    updateNotes,
    setStartTime,
    setEndTime,
    setMood,
    addExercise,
    removeExercise,
    addSet,
    removeSet,
    updateSet,
    updateCardio,
    updateExerciseNotes,
    save,
  };
}
