import { Exercise } from '../types';

export const DEFAULT_EXERCISES: Exercise[] = [
  // Chest
  { id: 'bench_press', name: 'Bench Press', type: 'strength', muscleGroup: 'Chest' },
  { id: 'incline_bench', name: 'Incline Bench Press', type: 'strength', muscleGroup: 'Chest' },
  { id: 'decline_bench', name: 'Decline Bench Press', type: 'strength', muscleGroup: 'Chest' },
  { id: 'dumbbell_fly', name: 'Dumbbell Fly', type: 'strength', muscleGroup: 'Chest' },
  { id: 'cable_crossover', name: 'Cable Crossover', type: 'strength', muscleGroup: 'Chest' },
  { id: 'pushup', name: 'Push-Up', type: 'bodyweight', muscleGroup: 'Chest' },
  { id: 'dips', name: 'Dips', type: 'bodyweight', muscleGroup: 'Chest' },

  // Back
  { id: 'deadlift', name: 'Deadlift', type: 'strength', muscleGroup: 'Back' },
  { id: 'barbell_row', name: 'Barbell Row', type: 'strength', muscleGroup: 'Back' },
  { id: 'pullup', name: 'Pull-Up', type: 'bodyweight', muscleGroup: 'Back' },
  { id: 'chinup', name: 'Chin-Up', type: 'bodyweight', muscleGroup: 'Back' },
  { id: 'lat_pulldown', name: 'Lat Pulldown', type: 'strength', muscleGroup: 'Back' },
  { id: 'seated_cable_row', name: 'Seated Cable Row', type: 'strength', muscleGroup: 'Back' },
  { id: 'dumbbell_row', name: 'Dumbbell Row', type: 'strength', muscleGroup: 'Back' },
  { id: 'tbar_row', name: 'T-Bar Row', type: 'strength', muscleGroup: 'Back' },
  { id: 'face_pull', name: 'Face Pull', type: 'strength', muscleGroup: 'Back' },

  // Shoulders
  { id: 'overhead_press', name: 'Overhead Press', type: 'strength', muscleGroup: 'Shoulders' },
  { id: 'dumbbell_ohp', name: 'Dumbbell OHP', type: 'strength', muscleGroup: 'Shoulders' },
  { id: 'lateral_raise', name: 'Lateral Raise', type: 'strength', muscleGroup: 'Shoulders' },
  { id: 'front_raise', name: 'Front Raise', type: 'strength', muscleGroup: 'Shoulders' },
  { id: 'rear_delt_fly', name: 'Rear Delt Fly', type: 'strength', muscleGroup: 'Shoulders' },
  { id: 'arnold_press', name: 'Arnold Press', type: 'strength', muscleGroup: 'Shoulders' },

  // Arms - Biceps
  { id: 'barbell_curl', name: 'Barbell Curl', type: 'strength', muscleGroup: 'Biceps' },
  { id: 'dumbbell_curl', name: 'Dumbbell Curl', type: 'strength', muscleGroup: 'Biceps' },
  { id: 'hammer_curl', name: 'Hammer Curl', type: 'strength', muscleGroup: 'Biceps' },
  { id: 'cable_curl', name: 'Cable Curl', type: 'strength', muscleGroup: 'Biceps' },
  { id: 'preacher_curl', name: 'Preacher Curl', type: 'strength', muscleGroup: 'Biceps' },
  { id: 'concentration_curl', name: 'Concentration Curl', type: 'strength', muscleGroup: 'Biceps' },

  // Arms - Triceps
  { id: 'tricep_pushdown', name: 'Tricep Pushdown', type: 'strength', muscleGroup: 'Triceps' },
  { id: 'skull_crusher', name: 'Skull Crusher', type: 'strength', muscleGroup: 'Triceps' },
  { id: 'overhead_tricep', name: 'Overhead Tricep Extension', type: 'strength', muscleGroup: 'Triceps' },
  { id: 'close_grip_bench', name: 'Close Grip Bench Press', type: 'strength', muscleGroup: 'Triceps' },
  { id: 'tricep_dips', name: 'Tricep Dips', type: 'bodyweight', muscleGroup: 'Triceps' },

  // Legs
  { id: 'squat', name: 'Squat', type: 'strength', muscleGroup: 'Legs' },
  { id: 'front_squat', name: 'Front Squat', type: 'strength', muscleGroup: 'Legs' },
  { id: 'goblet_squat', name: 'Goblet Squat', type: 'strength', muscleGroup: 'Legs' },
  { id: 'leg_press', name: 'Leg Press', type: 'strength', muscleGroup: 'Legs' },
  { id: 'lunges', name: 'Lunges', type: 'strength', muscleGroup: 'Legs' },
  { id: 'leg_curl', name: 'Leg Curl', type: 'strength', muscleGroup: 'Legs' },
  { id: 'leg_extension', name: 'Leg Extension', type: 'strength', muscleGroup: 'Legs' },
  { id: 'calf_raise', name: 'Calf Raise', type: 'strength', muscleGroup: 'Legs' },
  { id: 'rdl', name: 'Romanian Deadlift', type: 'strength', muscleGroup: 'Legs' },
  { id: 'hip_thrust', name: 'Hip Thrust', type: 'strength', muscleGroup: 'Glutes' },
  { id: 'glute_bridge', name: 'Glute Bridge', type: 'bodyweight', muscleGroup: 'Glutes' },

  // Core
  { id: 'plank', name: 'Plank', type: 'bodyweight', muscleGroup: 'Core' },
  { id: 'crunch', name: 'Crunch', type: 'bodyweight', muscleGroup: 'Core' },
  { id: 'leg_raise', name: 'Leg Raise', type: 'bodyweight', muscleGroup: 'Core' },
  { id: 'russian_twist', name: 'Russian Twist', type: 'bodyweight', muscleGroup: 'Core' },
  { id: 'ab_wheel', name: 'Ab Wheel Rollout', type: 'bodyweight', muscleGroup: 'Core' },
  { id: 'cable_crunch', name: 'Cable Crunch', type: 'strength', muscleGroup: 'Core' },
  { id: 'hanging_leg_raise', name: 'Hanging Leg Raise', type: 'bodyweight', muscleGroup: 'Core' },

  // Cardio
  { id: 'running', name: 'Running', type: 'cardio', muscleGroup: 'Cardio' },
  { id: 'cycling', name: 'Cycling', type: 'cardio', muscleGroup: 'Cardio' },
  { id: 'rowing', name: 'Rowing', type: 'cardio', muscleGroup: 'Cardio' },
  { id: 'jumping_rope', name: 'Jump Rope', type: 'cardio', muscleGroup: 'Cardio' },
  { id: 'swimming', name: 'Swimming', type: 'cardio', muscleGroup: 'Cardio' },
  { id: 'elliptical', name: 'Elliptical', type: 'cardio', muscleGroup: 'Cardio' },
  { id: 'stair_climber', name: 'Stair Climber', type: 'cardio', muscleGroup: 'Cardio' },
  { id: 'hiit', name: 'HIIT', type: 'cardio', muscleGroup: 'Cardio' },
  { id: 'walking', name: 'Walking', type: 'cardio', muscleGroup: 'Cardio' },
];

export const MUSCLE_GROUPS = [
  'All',
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Legs',
  'Glutes',
  'Core',
  'Cardio',
];
