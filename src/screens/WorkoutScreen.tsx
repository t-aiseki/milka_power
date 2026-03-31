import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { colors, spacing, radius, typography, shadow, muscleGroupColors } from '../theme';
import { Workout, WorkoutExercise, SetEntry, Exercise, ExerciseType, Mood } from '../types';
import { useWorkoutEditor } from '../hooks/useWorkouts';
import { useStopwatch, formatDuration, formatTimer } from '../hooks/useTimer';
import SetRow from '../components/SetRow';
import RestTimerModal from '../components/RestTimerModal';
import CardioForm from '../components/CardioForm';
import ExercisePicker from '../components/ExercisePicker';
import { getExercises, saveCustomExercise } from '../storage';

const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

type RootStackParamList = {
  WorkoutDetail: { workout: Workout };
};

const MOOD_LABELS: Record<number, string> = {
  1: '😫 Погано',
  2: '😕 Слабо',
  3: '😐 Нормально',
  4: '😊 Добре',
  5: '💪 Відмінно',
};

export default function WorkoutScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'WorkoutDetail'>>();
  const initialWorkout = route.params.workout;

  const {
    workout,
    saving,
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
  } = useWorkoutEditor(initialWorkout);

  const stopwatch = useStopwatch();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [restTimerVisible, setRestTimerVisible] = useState(false);
  const [restSeconds, setRestSeconds] = useState(90);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    getExercises().then(setExercises);
  }, []);

  // Start stopwatch if workout has no end time
  useEffect(() => {
    if (!initialWorkout.endTime) {
      stopwatch.start();
    }
  }, []);

  const handleFinishWorkout = useCallback(async () => {
    stopwatch.pause();
    const endTime = new Date().toISOString();
    setEndTime(endTime);
  }, [stopwatch, setEndTime]);

  const handleSave = useCallback(async () => {
    if (!workout.endTime) {
      handleFinishWorkout();
    }
    const prs = await save();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    if (prs && prs.length > 0) {
      Alert.alert(
        '🏆 Особистий рекорд!',
        `Новий PR у: ${prs.join(', ')}`,
        [{ text: 'Відмінно!' }]
      );
    }
  }, [workout.endTime, save, handleFinishWorkout]);

  const handleAddExercise = useCallback(
    (exercise: Exercise) => {
      const wo: WorkoutExercise = {
        id: generateId(),
        exerciseId: exercise.id,
        name: exercise.name,
        type: exercise.type,
        muscleGroup: exercise.muscleGroup,
        order: workout.exercises.length,
        sets:
          exercise.type !== 'cardio'
            ? [
                {
                  id: generateId(),
                  setNumber: 1,
                },
              ]
            : undefined,
        cardio:
          exercise.type === 'cardio'
            ? { duration: 0, distanceUnit: 'km' }
            : undefined,
      };
      addExercise(wo);
      setExpandedExercise(wo.id);
      setShowPicker(false);
    },
    [workout.exercises.length, addExercise]
  );

  const handleCreateCustom = useCallback(
    async (name: string, type: ExerciseType, muscleGroup?: string) => {
      const ex = await saveCustomExercise(name, type, muscleGroup);
      const allEx = await getExercises();
      setExercises(allEx);
      handleAddExercise(ex);
    },
    [handleAddExercise]
  );

  const handleStartRestTimer = useCallback((seconds: number) => {
    setRestSeconds(seconds);
    setRestTimerVisible(true);
  }, []);

  const handleRemoveExercise = useCallback(
    (id: string) => {
      Alert.alert('Видалити вправу?', 'Всі підходи будуть втрачені.', [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: () => removeExercise(id),
        },
      ]);
    },
    [removeExercise]
  );

  const workoutDuration = workout.endTime
    ? Math.floor(
        (new Date(workout.endTime).getTime() -
          new Date(workout.startTime).getTime()) /
          1000
      )
    : stopwatch.elapsed;

  const isNew = !initialWorkout.endTime && initialWorkout.exercises.length === 0;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerDate}>
            {new Date(workout.date + 'T00:00:00').toLocaleDateString('uk-UA', {
              day: 'numeric',
              month: 'long',
            })}
          </Text>
          <View style={styles.headerTimer}>
            <Ionicons name="time-outline" size={14} color={colors.accent} />
            <Text style={styles.headerTimerText}>
              {formatTimer(workoutDuration)}
            </Text>
            {!workout.endTime && (
              <View style={styles.liveIndicator} />
            )}
          </View>
        </View>
        <TouchableOpacity
          style={[styles.saveBtn, saveSuccess && styles.saveBtnSuccess]}
          onPress={handleSave}
          disabled={saving}
        >
          <Ionicons
            name={saveSuccess ? 'checkmark' : 'save-outline'}
            size={20}
            color={saveSuccess ? colors.success : colors.text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Time row */}
        <View style={styles.timeRow}>
          <TimeEditor
            icon="play-circle"
            label="Початок"
            time={workout.startTime}
            onChange={setStartTime}
          />
          <View style={styles.timeSep}>
            <Ionicons name="arrow-forward" size={16} color={colors.textMuted} />
          </View>
          <TimeEditor
            icon="stop-circle"
            label="Кінець"
            time={workout.endTime}
            onChange={setEndTime}
            isEnd
            onFinish={handleFinishWorkout}
          />
        </View>

        {/* Mood picker */}
        <View style={styles.moodRow}>
          <Text style={styles.sectionLabel}>Самопочуття</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScroll}>
            {([1, 2, 3, 4, 5] as Mood[]).map((m) => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.moodBtn,
                  workout.mood === m && styles.moodBtnActive,
                ]}
                onPress={() => setMood(workout.mood === m ? undefined : m)}
              >
                <Text style={styles.moodEmoji}>{MOOD_LABELS[m].split(' ')[0]}</Text>
                <Text style={[styles.moodLabel, workout.mood === m && { color: colors.text }]}>
                  {MOOD_LABELS[m].split(' ')[1]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.sectionLabel}>Нотатки</Text>
          <TextInput
            style={styles.notesInput}
            value={workout.notes}
            onChangeText={updateNotes}
            placeholder="Як пройшло тренування? Що відчував? Нотатки..."
            placeholderTextColor={colors.textMuted}
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Exercises */}
        <View style={styles.exercisesSection}>
          <Text style={styles.sectionTitle}>
            Вправи ({workout.exercises.length})
          </Text>

          {workout.exercises.map((ex) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              isExpanded={expandedExercise === ex.id}
              onToggle={() =>
                setExpandedExercise(expandedExercise === ex.id ? null : ex.id)
              }
              onAddSet={() => addSet(ex.id)}
              onRemoveSet={(setId) => removeSet(ex.id, setId)}
              onUpdateSet={(setId, updates) => updateSet(ex.id, setId, updates)}
              onUpdateCardio={(updates) => updateCardio(ex.id, updates)}
              onUpdateNotes={(notes) => updateExerciseNotes(ex.id, notes)}
              onRemove={() => handleRemoveExercise(ex.id)}
              onStartRestTimer={handleStartRestTimer}
            />
          ))}

          {workout.exercises.length === 0 && (
            <View style={styles.emptyExercises}>
              <Ionicons name="barbell-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>Додай першу вправу</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.addExerciseBtn}
            onPress={() => setShowPicker(true)}
          >
            <Ionicons name="add-circle" size={22} color={colors.accent} />
            <Text style={styles.addExerciseText}>Додати вправу</Text>
          </TouchableOpacity>
        </View>

        {/* Finish button */}
        {!workout.endTime && (
          <TouchableOpacity style={styles.finishBtn} onPress={handleSave}>
            <Ionicons name="checkmark-circle" size={22} color={colors.text} />
            <Text style={styles.finishBtnText}>Завершити тренування</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <ExercisePicker
        visible={showPicker}
        exercises={exercises}
        onSelect={handleAddExercise}
        onClose={() => setShowPicker(false)}
        onCreateCustom={handleCreateCustom}
      />

      <RestTimerModal
        visible={restTimerVisible}
        initialSeconds={restSeconds}
        onClose={() => setRestTimerVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

// ─── TimeEditor ───────────────────────────────────────────────────────────────

function TimeEditor({
  icon,
  label,
  time,
  onChange,
  isEnd,
  onFinish,
}: {
  icon: string;
  label: string;
  time?: string;
  onChange: (t: string) => void;
  isEnd?: boolean;
  onFinish?: () => void;
}) {
  const formatTime = (iso?: string) => {
    if (!iso) return '--:--';
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <View style={styles.timeEditor}>
      <Ionicons name={icon as any} size={18} color={isEnd ? colors.error : colors.success} />
      <Text style={styles.timeLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.timeValue}
        onPress={isEnd && !time && onFinish ? onFinish : undefined}
      >
        <Text style={[styles.timeText, !time && styles.timeTextMuted]}>
          {formatTime(time)}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── ExerciseCard ─────────────────────────────────────────────────────────────

function ExerciseCard({
  exercise,
  isExpanded,
  onToggle,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onUpdateCardio,
  onUpdateNotes,
  onRemove,
  onStartRestTimer,
}: {
  exercise: WorkoutExercise;
  isExpanded: boolean;
  onToggle: () => void;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  onUpdateSet: (setId: string, updates: Partial<SetEntry>) => void;
  onUpdateCardio: (updates: any) => void;
  onUpdateNotes: (notes: string) => void;
  onRemove: () => void;
  onStartRestTimer: (seconds: number) => void;
}) {
  const typeColor =
    exercise.type === 'cardio'
      ? colors.cardio
      : exercise.type === 'bodyweight'
      ? colors.bodyweight
      : colors.accent;

  const totalVolume =
    exercise.sets?.reduce((s, set) => s + (set.weight ?? 0) * (set.reps ?? 0), 0) ?? 0;

  return (
    <View style={styles.exerciseCard}>
      <TouchableOpacity style={styles.exerciseHeader} onPress={onToggle}>
        <View style={[styles.exerciseTypeBar, { backgroundColor: typeColor }]} />
        <View style={styles.exerciseHeaderInfo}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <View style={styles.exerciseMeta}>
            {exercise.muscleGroup && (
              <Text
                style={[
                  styles.muscleTag,
                  {
                    color:
                      muscleGroupColors[exercise.muscleGroup] ??
                      colors.textSecondary,
                  },
                ]}
              >
                {exercise.muscleGroup}
              </Text>
            )}
            {exercise.type !== 'cardio' && exercise.sets && exercise.sets.length > 0 && (
              <Text style={styles.exerciseSetCount}>
                {exercise.sets.length} підх.
              </Text>
            )}
            {totalVolume > 0 && (
              <Text style={styles.exerciseVolume}>
                {totalVolume >= 1000
                  ? `${(totalVolume / 1000).toFixed(1)}k`
                  : Math.round(totalVolume)}{' '}
                kg
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity onPress={onRemove} style={styles.removeExerciseBtn}>
          <Ionicons name="trash-outline" size={18} color={colors.error + '80'} />
        </TouchableOpacity>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.textSecondary}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.exerciseBody}>
          {exercise.type === 'cardio' ? (
            <CardioForm
              cardio={exercise.cardio ?? { duration: 0, distanceUnit: 'km' }}
              onChange={onUpdateCardio}
            />
          ) : (
            <>
              {/* Sets header */}
              <View style={styles.setsHeader}>
                <Text style={[styles.setsHeaderCell, { width: 28 }]}>#</Text>
                <Text style={[styles.setsHeaderCell, { width: 60 }]}>Попер.</Text>
                {exercise.type === 'strength' && (
                  <Text style={[styles.setsHeaderCell, { flex: 1 }]}>Вага</Text>
                )}
                <Text style={[styles.setsHeaderCell, { flex: 1 }]}>Рази</Text>
                <Text style={[styles.setsHeaderCell, { width: 40 }]}>Відп.</Text>
                <View style={{ width: 64 }} />
              </View>

              {exercise.sets?.map((set) => (
                <SetRow
                  key={set.id}
                  set={set}
                  exerciseType={exercise.type as 'strength' | 'bodyweight'}
                  onUpdate={(updates) => onUpdateSet(set.id, updates)}
                  onDelete={() => onRemoveSet(set.id)}
                  onStartRestTimer={onStartRestTimer}
                />
              ))}

              <TouchableOpacity style={styles.addSetBtn} onPress={onAddSet}>
                <Ionicons name="add" size={18} color={colors.accent} />
                <Text style={styles.addSetText}>Додати підхід</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Notes per exercise */}
          <TextInput
            style={styles.exerciseNotes}
            value={exercise.notes ?? ''}
            onChangeText={onUpdateNotes}
            placeholder="Нотатки до вправи..."
            placeholderTextColor={colors.textMuted}
            multiline
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 52,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...shadow.small,
  },
  backBtn: {
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerDate: {
    ...typography.h4,
  },
  headerTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: 2,
  },
  headerTimerText: {
    ...typography.label,
    color: colors.accent,
    fontVariant: ['tabular-nums'],
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  saveBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnSuccess: {
    backgroundColor: colors.successDim,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  // Time row
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  timeEditor: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  timeLabel: {
    ...typography.label,
  },
  timeValue: {
    flex: 1,
    alignItems: 'flex-end',
  },
  timeText: {
    ...typography.h4,
    color: colors.accent,
    fontVariant: ['tabular-nums'],
  },
  timeTextMuted: {
    color: colors.textMuted,
  },
  timeSep: {
    paddingHorizontal: spacing.sm,
  },
  // Mood
  moodRow: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  moodScroll: {
    marginTop: spacing.sm,
  },
  moodBtn: {
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: radius.md,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
    minWidth: 64,
  },
  moodBtnActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentGlow,
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 4,
  },
  // Notes
  notesSection: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  sectionLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  notesInput: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.border,
  },
  // Exercises
  exercisesSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  emptyExercises: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
    gap: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  addExerciseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accentGlow,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.accent + '40',
    borderStyle: 'dashed',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  addExerciseText: {
    ...typography.button,
    color: colors.accent,
  },
  finishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.success,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    ...shadow.accent,
  },
  finishBtnText: {
    ...typography.button,
    fontSize: 17,
  },
  // Exercise card
  exerciseCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.small,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  exerciseTypeBar: {
    width: 4,
    height: 40,
    borderRadius: 2,
  },
  exerciseHeaderInfo: {
    flex: 1,
  },
  exerciseName: {
    ...typography.h4,
  },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  muscleTag: {
    ...typography.caption,
    fontWeight: '600',
  },
  exerciseSetCount: {
    ...typography.caption,
    color: colors.textMuted,
  },
  exerciseVolume: {
    ...typography.caption,
    color: colors.accent,
  },
  removeExerciseBtn: {
    padding: spacing.xs,
  },
  exerciseBody: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  setsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    gap: spacing.sm,
  },
  setsHeaderCell: {
    ...typography.label,
    textAlign: 'center',
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  addSetText: {
    ...typography.buttonSmall,
    color: colors.accent,
  },
  exerciseNotes: {
    margin: spacing.md,
    marginTop: 0,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.sm,
    ...typography.bodySmall,
    color: colors.text,
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
