import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, radius, typography, shadow } from '../theme';
import { getWorkouts, getWorkoutDates, createNewWorkout } from '../storage';
import { Workout } from '../types';
import { formatDuration } from '../hooks/useTimer';

type RootStackParamList = {
  WorkoutDetail: { workout: Workout };
  CalendarMain: undefined;
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('uk-UA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

function getWorkoutDuration(workout: Workout): number {
  if (!workout.endTime) return 0;
  return Math.floor(
    (new Date(workout.endTime).getTime() - new Date(workout.startTime).getTime()) / 1000
  );
}

interface WeekDaySummaryProps {
  workouts: Workout[];
}

function WeekSummary({ workouts }: WeekDaySummaryProps) {
  const totalVolume = workouts.reduce((s, w) => s + (w.totalVolume ?? 0), 0);
  const totalDuration = workouts.reduce((s, w) => s + getWorkoutDuration(w), 0);

  return (
    <View style={styles.weekSummary}>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryValue}>{workouts.length}</Text>
        <Text style={styles.summaryLabel}>Тренувань</Text>
      </View>
      <View style={styles.summarySep} />
      <View style={styles.summaryItem}>
        <Text style={styles.summaryValue}>
          {totalVolume > 0 ? `${Math.round(totalVolume / 1000)}k` : '–'}
        </Text>
        <Text style={styles.summaryLabel}>Об'єм (kg)</Text>
      </View>
      <View style={styles.summarySep} />
      <View style={styles.summaryItem}>
        <Text style={styles.summaryValue}>
          {totalDuration > 0 ? formatDuration(totalDuration) : '–'}
        </Text>
        <Text style={styles.summaryLabel}>Час</Text>
      </View>
    </View>
  );
}

export default function CalendarScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const today = getTodayString();
  const [selectedDate, setSelectedDate] = useState(today);
  const [workoutDates, setWorkoutDates] = useState<Record<string, boolean>>({});
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const [dates, workouts] = await Promise.all([getWorkoutDates(), getWorkouts()]);
    setWorkoutDates(dates);
    setRecentWorkouts(
      workouts
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 10)
    );
    const todayWo = workouts.find((w) => w.date === selectedDate);
    setSelectedWorkout(todayWo ?? null);
  }, [selectedDate]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const handleDayPress = async (day: DateData) => {
    setSelectedDate(day.dateString);
    const workouts = await getWorkouts();
    const wo = workouts.find((w) => w.date === day.dateString);
    setSelectedWorkout(wo ?? null);
  };

  const handleOpenWorkout = () => {
    const workout = selectedWorkout ?? createNewWorkout(selectedDate);
    navigation.navigate('WorkoutDetail', { workout });
  };

  // Build marked dates for calendar
  const markedDates: any = {};
  Object.keys(workoutDates).forEach((date) => {
    markedDates[date] = {
      marked: true,
      dotColor: colors.accent,
    };
  });
  if (selectedDate) {
    markedDates[selectedDate] = {
      ...markedDates[selectedDate],
      selected: true,
      selectedColor: colors.accent,
      selectedTextColor: '#fff',
    };
  }
  if (today !== selectedDate) {
    markedDates[today] = {
      ...markedDates[today],
      today: true,
    };
  }

  // This week workouts
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekWorkouts = recentWorkouts.filter((w) => {
    const d = new Date(w.date + 'T00:00:00');
    return d >= weekStart;
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Milka Power</Text>
          <Text style={styles.headerDate}>
            {new Date().toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' })}
          </Text>
        </View>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={20} color={colors.warning} />
          <Text style={styles.streakText}>{recentWorkouts.length}</Text>
        </View>
      </View>

      {/* Week summary */}
      <WeekSummary workouts={weekWorkouts} />

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        <Calendar
          current={today}
          onDayPress={handleDayPress}
          markedDates={markedDates}
          theme={{
            backgroundColor: colors.surface,
            calendarBackground: colors.surface,
            textSectionTitleColor: colors.textSecondary,
            selectedDayBackgroundColor: colors.accent,
            selectedDayTextColor: '#fff',
            todayTextColor: colors.accent,
            dayTextColor: colors.text,
            textDisabledColor: colors.textMuted,
            dotColor: colors.accent,
            monthTextColor: colors.text,
            arrowColor: colors.accent,
            indicatorColor: colors.accent,
          }}
          style={styles.calendar}
          enableSwipeMonths
        />
      </View>

      {/* Selected day card */}
      <View style={styles.dayCard}>
        <View style={styles.dayCardHeader}>
          <View>
            <Text style={styles.dayCardTitle}>{formatDate(selectedDate)}</Text>
            {selectedDate === today && (
              <View style={styles.todayTag}>
                <Text style={styles.todayTagText}>Сьогодні</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.openWorkoutBtn} onPress={handleOpenWorkout}>
            {selectedWorkout ? (
              <>
                <Ionicons name="pencil" size={16} color={colors.accent} />
                <Text style={styles.openWorkoutText}>Відкрити</Text>
              </>
            ) : (
              <>
                <Ionicons name="add" size={16} color={colors.accent} />
                <Text style={styles.openWorkoutText}>Нове</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {selectedWorkout ? (
          <WorkoutPreview workout={selectedWorkout} />
        ) : (
          <View style={styles.noWorkout}>
            <Ionicons name="barbell-outline" size={32} color={colors.textMuted} />
            <Text style={styles.noWorkoutText}>Немає тренування</Text>
            <Text style={styles.noWorkoutSub}>
              Натисни «Нове» щоб додати
            </Text>
          </View>
        )}
      </View>

      {/* Recent workouts */}
      {recentWorkouts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Останні тренування</Text>
          {recentWorkouts.slice(0, 5).map((w) => (
            <TouchableOpacity
              key={w.id}
              style={styles.recentCard}
              onPress={() => navigation.navigate('WorkoutDetail', { workout: w })}
            >
              <View style={styles.recentLeft}>
                <Text style={styles.recentDate}>
                  {new Date(w.date + 'T00:00:00').toLocaleDateString('uk-UA', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
                <Text style={styles.recentExercises}>
                  {w.exercises.map((e) => e.name).join(', ') || 'Без вправ'}
                </Text>
              </View>
              <View style={styles.recentRight}>
                {w.totalVolume ? (
                  <Text style={styles.recentVolume}>
                    {w.totalVolume >= 1000
                      ? `${(w.totalVolume / 1000).toFixed(1)}k`
                      : `${Math.round(w.totalVolume)}`}{' '}
                    kg
                  </Text>
                ) : null}
                {w.endTime && (
                  <Text style={styles.recentDuration}>
                    {formatDuration(getWorkoutDuration(w))}
                  </Text>
                )}
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function WorkoutPreview({ workout }: { workout: Workout }) {
  const duration = getWorkoutDuration(workout);
  return (
    <View style={styles.preview}>
      {/* Stats row */}
      <View style={styles.previewStats}>
        <View style={styles.previewStat}>
          <Text style={styles.previewStatValue}>{workout.exercises.length}</Text>
          <Text style={styles.previewStatLabel}>Вправ</Text>
        </View>
        {workout.totalVolume ? (
          <View style={styles.previewStat}>
            <Text style={styles.previewStatValue}>
              {workout.totalVolume >= 1000
                ? `${(workout.totalVolume / 1000).toFixed(1)}k`
                : Math.round(workout.totalVolume)}
            </Text>
            <Text style={styles.previewStatLabel}>кг об'єм</Text>
          </View>
        ) : null}
        {duration > 0 && (
          <View style={styles.previewStat}>
            <Text style={styles.previewStatValue}>{formatDuration(duration)}</Text>
            <Text style={styles.previewStatLabel}>Тривалість</Text>
          </View>
        )}
        {workout.mood && (
          <View style={styles.previewStat}>
            <Text style={styles.previewStatValue}>
              {['😫', '😕', '😐', '😊', '💪'][workout.mood - 1]}
            </Text>
            <Text style={styles.previewStatLabel}>Настрій</Text>
          </View>
        )}
      </View>

      {/* Exercise list */}
      <View style={styles.previewExercises}>
        {workout.exercises.slice(0, 4).map((ex) => (
          <View key={ex.id} style={styles.previewExercise}>
            <View
              style={[
                styles.previewExDot,
                {
                  backgroundColor:
                    ex.type === 'cardio' ? colors.cardio : colors.accent,
                },
              ]}
            />
            <Text style={styles.previewExName}>{ex.name}</Text>
            <Text style={styles.previewExDetail}>
              {ex.type === 'cardio' && ex.cardio
                ? formatDuration(ex.cardio.duration)
                : ex.sets
                ? `${ex.sets.length} підходів`
                : ''}
            </Text>
          </View>
        ))}
        {workout.exercises.length > 4 && (
          <Text style={styles.previewMore}>
            +{workout.exercises.length - 4} ще...
          </Text>
        )}
      </View>

      {workout.notes ? (
        <Text style={styles.previewNotes} numberOfLines={2}>
          {workout.notes}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 56,
    paddingBottom: spacing.lg,
  },
  greeting: {
    ...typography.h1,
    color: colors.accent,
  },
  headerDate: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.warningDim,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.warning + '40',
  },
  streakText: {
    ...typography.h4,
    color: colors.warning,
  },
  weekSummary: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.small,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summarySep: {
    width: 1,
    backgroundColor: colors.border,
  },
  summaryValue: {
    ...typography.h3,
    color: colors.accent,
  },
  summaryLabel: {
    ...typography.caption,
    marginTop: 4,
  },
  calendarContainer: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow.small,
    marginBottom: spacing.lg,
  },
  calendar: {
    borderRadius: radius.lg,
  },
  dayCard: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadow.small,
  },
  dayCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  dayCardTitle: {
    ...typography.h4,
    flex: 1,
  },
  todayTag: {
    backgroundColor: colors.accentGlow,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  todayTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
  },
  openWorkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accentGlow,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.accent + '40',
  },
  openWorkoutText: {
    ...typography.buttonSmall,
    color: colors.accent,
  },
  noWorkout: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  noWorkoutText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  noWorkoutSub: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  // Preview
  preview: {
    gap: spacing.md,
  },
  previewStats: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  previewStat: {
    flex: 1,
    alignItems: 'center',
  },
  previewStatValue: {
    ...typography.h4,
  },
  previewStatLabel: {
    ...typography.caption,
    marginTop: 2,
  },
  previewExercises: {
    gap: spacing.xs,
  },
  previewExercise: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  previewExDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  previewExName: {
    ...typography.body,
    flex: 1,
  },
  previewExDetail: {
    ...typography.bodySmall,
  },
  previewMore: {
    ...typography.caption,
    color: colors.textMuted,
    marginLeft: spacing.lg,
  },
  previewNotes: {
    ...typography.bodySmall,
    color: colors.textMuted,
    fontStyle: 'italic',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  // Recent
  section: {
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.small,
  },
  recentLeft: {
    flex: 1,
  },
  recentDate: {
    ...typography.h4,
    color: colors.accent,
  },
  recentExercises: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  recentRight: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: spacing.sm,
    alignSelf: 'center',
  },
  recentVolume: {
    ...typography.label,
    color: colors.textSecondary,
  },
  recentDuration: {
    ...typography.label,
    color: colors.textMuted,
  },
});
