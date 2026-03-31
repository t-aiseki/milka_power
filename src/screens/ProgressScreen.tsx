import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius, typography, shadow } from '../theme';
import {
  getPersonalRecords,
  getExerciseHistory,
  getExercises,
  getWorkouts,
} from '../storage';
import { PersonalRecord, Exercise, Workout } from '../types';
import { formatDuration } from '../hooks/useTimer';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Tab = 'overview' | 'records' | 'exercise';

interface ExerciseHistory {
  date: string;
  maxWeight: number;
  maxReps: number;
  totalVolume: number;
  sets: number;
}

// ─── Simple View-based Bar Chart (zero dependencies) ─────────────────────────

function SimpleBarChart({
  data,
  color = colors.accent,
  height = 160,
}: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}) {
  if (data.length === 0) return null;
  const maxValue = Math.max(...data.map((d) => d.value), 0.01);

  return (
    <View style={{ height, flexDirection: 'row', alignItems: 'flex-end', gap: 6, paddingTop: 24 }}>
      {data.map((d, i) => {
        const barHeight = Math.max(
          (d.value / maxValue) * (height - 44),
          d.value > 0 ? 4 : 0
        );
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
            {d.value > 0 && (
              <Text style={chartStyles.barValue}>
                {d.value % 1 === 0 ? d.value : d.value.toFixed(1)}
              </Text>
            )}
            <View
              style={{
                width: '70%',
                height: barHeight,
                backgroundColor: color,
                borderRadius: 5,
                opacity: 0.7 + (i / Math.max(data.length - 1, 1)) * 0.3,
              }}
            />
            <Text style={chartStyles.barLabel}>{d.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const chartStyles = StyleSheet.create({
  barValue: { fontSize: 10, color: colors.textMuted, marginBottom: 4, fontWeight: '600' },
  barLabel: { fontSize: 9, color: colors.textMuted, marginTop: 4 },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ProgressScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseHistory[]>([]);

  useFocusEffect(
    useCallback(() => {
      Promise.all([getPersonalRecords(), getExercises(), getWorkouts()]).then(
        ([recs, exs, wos]) => {
          setRecords(recs.sort((a, b) => b.oneRepMax - a.oneRepMax));
          setExercises(exs);
          setWorkouts(wos.sort((a, b) => a.date.localeCompare(b.date)));
        }
      );
    }, [])
  );

  useEffect(() => {
    if (selectedExerciseId) {
      getExerciseHistory(selectedExerciseId).then((hist) => {
        const formatted: ExerciseHistory[] = hist.map((h) => {
          const weights = h.sets.map((s) => s.weight ?? 0).filter(Boolean);
          const reps = h.sets.map((s) => s.reps ?? 0).filter(Boolean);
          return {
            date: h.date,
            maxWeight: weights.length > 0 ? Math.max(...weights) : 0,
            maxReps: reps.length > 0 ? Math.max(...reps) : 0,
            totalVolume: h.sets.reduce(
              (s, set) => s + (set.weight ?? 0) * (set.reps ?? 0),
              0
            ),
            sets: h.sets.length,
          };
        });
        setExerciseHistory(formatted);
      });
    }
  }, [selectedExerciseId]);

  const exercisesWithHistory = exercises.filter((e) =>
    records.some((r) => r.exerciseId === e.id)
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Прогрес</Text>
      </View>

      <View style={styles.tabs}>
        {(['overview', 'records', 'exercise'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'overview' ? 'Огляд' : tab === 'records' ? 'PR' : 'Вправи'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'overview' && <OverviewTab workouts={workouts} />}
        {activeTab === 'records' && (
          <RecordsTab
            records={records}
            onSelectExercise={(id) => {
              setSelectedExerciseId(id);
              setActiveTab('exercise');
            }}
          />
        )}
        {activeTab === 'exercise' && (
          <ExerciseTab
            exercises={exercisesWithHistory}
            selectedId={selectedExerciseId}
            onSelect={setSelectedExerciseId}
            history={exerciseHistory}
          />
        )}
      </ScrollView>
    </View>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ workouts }: { workouts: Workout[] }) {
  const totalWorkouts = workouts.length;
  const totalVolume = workouts.reduce((s, w) => s + (w.totalVolume ?? 0), 0);
  const totalDuration = workouts.reduce((s, w) => {
    if (!w.endTime) return s;
    return s + Math.floor(
      (new Date(w.endTime).getTime() - new Date(w.startTime).getTime()) / 1000
    );
  }, 0);
  const avgDuration = totalWorkouts > 0 ? Math.floor(totalDuration / totalWorkouts) : 0;

  const volumeData = workouts.slice(-8).map((w) => ({
    label: w.date.slice(5),
    value: Math.round(((w.totalVolume ?? 0) / 1000) * 10) / 10,
  }));

  const freqData = buildWeeklyFrequency(workouts);

  return (
    <View style={{ gap: spacing.lg }}>
      <View style={styles.statsGrid}>
        <StatCard icon="barbell-outline" label="Тренувань" value={String(totalWorkouts)} color={colors.accent} />
        <StatCard
          icon="layers-outline"
          label="Загальний об'єм"
          value={
            totalVolume >= 1000000
              ? `${(totalVolume / 1000000).toFixed(1)}M`
              : totalVolume >= 1000
              ? `${(totalVolume / 1000).toFixed(1)}k`
              : String(Math.round(totalVolume))
          }
          unit="kg"
          color={colors.purple}
        />
        <StatCard
          icon="time-outline"
          label="Сер. тривалість"
          value={avgDuration > 0 ? formatDuration(avgDuration) : '–'}
          color={colors.cardio}
        />
        <StatCard
          icon="calendar-outline"
          label="Активних місяців"
          value={String(new Set(workouts.map((w) => w.date.slice(0, 7))).size)}
          color={colors.success}
        />
      </View>

      {volumeData.length > 1 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Об'єм тренувань (тонни)</Text>
          <SimpleBarChart data={volumeData} color={colors.accent} />
        </View>
      )}

      {freqData.length > 1 && (
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Тренувань на тиждень</Text>
          <SimpleBarChart data={freqData} color={colors.success} height={120} />
        </View>
      )}

      {workouts.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="stats-chart-outline" size={56} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Ще немає даних</Text>
          <Text style={styles.emptyText}>Почни тренуватись щоб бачити прогрес</Text>
        </View>
      )}
    </View>
  );
}

function StatCard({
  icon, label, value, unit, color,
}: {
  icon: string; label: string; value: string; unit?: string; color: string;
}) {
  return (
    <View style={[styles.statCard, { borderColor: color + '30' }]}>
      <View style={[styles.statIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <View style={styles.statValueRow}>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        {unit && <Text style={styles.statUnit}>{unit}</Text>}
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Records Tab ──────────────────────────────────────────────────────────────

function RecordsTab({
  records, onSelectExercise,
}: {
  records: PersonalRecord[];
  onSelectExercise: (id: string) => void;
}) {
  return (
    <View style={{ gap: spacing.sm }}>
      {records.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="trophy-outline" size={56} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Ще немає рекордів</Text>
          <Text style={styles.emptyText}>Рекорди встановлюються автоматично</Text>
        </View>
      )}
      {records.map((r) => (
        <TouchableOpacity
          key={r.id}
          style={styles.prCard}
          onPress={() => onSelectExercise(r.exerciseId)}
        >
          <View style={styles.prBadgeContainer}>
            <Ionicons name="trophy" size={20} color={colors.warning} />
          </View>
          <View style={styles.prInfo}>
            <Text style={styles.prName}>{r.exerciseName}</Text>
            <Text style={styles.prDate}>
              {new Date(r.date + 'T00:00:00').toLocaleDateString('uk-UA', {
                day: 'numeric', month: 'long', year: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.prStats}>
            <Text style={styles.prWeight}>{r.weight} kg</Text>
            <Text style={styles.prReps}>{r.reps} reps</Text>
            <View style={styles.prORM}>
              <Text style={styles.prORMText}>1RM~{r.oneRepMax}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Exercise Tab ─────────────────────────────────────────────────────────────

function ExerciseTab({
  exercises, selectedId, onSelect, history,
}: {
  exercises: Exercise[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  history: ExerciseHistory[];
}) {
  const weightData = history.slice(-8).map((h) => ({
    label: h.date.slice(5),
    value: h.maxWeight,
  }));

  const volumeData = history.slice(-8).map((h) => ({
    label: h.date.slice(5),
    value: Math.round(h.totalVolume),
  }));

  return (
    <View style={{ gap: spacing.md }}>
      <FlatList
        horizontal
        data={exercises}
        keyExtractor={(e) => e.id}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.sm }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.exChip, selectedId === item.id && styles.exChipActive]}
            onPress={() => onSelect(item.id)}
          >
            <Text style={[styles.exChipText, selectedId === item.id && styles.exChipTextActive]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />

      {selectedId && history.length > 1 && (
        <>
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Максимальна вага (kg)</Text>
            <SimpleBarChart data={weightData} color={colors.accent} height={180} />
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Об'єм (кг × рази)</Text>
            <SimpleBarChart data={volumeData} color={colors.purple} height={160} />
          </View>

          <View style={styles.historyTable}>
            <Text style={styles.chartTitle}>Історія</Text>
            {history
              .slice()
              .reverse()
              .slice(0, 10)
              .map((h, i) => (
                <View key={i} style={styles.historyRow}>
                  <Text style={styles.historyDate}>{h.date}</Text>
                  <Text style={styles.historyWeight}>{h.maxWeight} kg</Text>
                  <Text style={styles.historyReps}>{h.maxReps} reps</Text>
                  <Text style={styles.historyVolume}>{Math.round(h.totalVolume)} vol</Text>
                </View>
              ))}
          </View>
        </>
      )}

      {selectedId && history.length <= 1 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Недостатньо даних</Text>
          <Text style={styles.emptyText}>Потрібно щонайменше 2 тренування</Text>
        </View>
      )}

      {exercises.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="fitness-outline" size={56} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Ще немає даних</Text>
          <Text style={styles.emptyText}>Додай вправи в тренування</Text>
        </View>
      )}
    </View>
  );
}

function buildWeeklyFrequency(workouts: Workout[]): { value: number; label: string }[] {
  const map: Record<string, number> = {};
  workouts.forEach((w) => {
    const d = new Date(w.date + 'T00:00:00');
    const weekNum = Math.ceil(
      ((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7
    );
    const key = `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`;
    map[key] = (map[key] ?? 0) + 1;
  });
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-8)
    .map(([k, v]) => ({ value: v, label: `W${k.slice(-2)}` }));
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: spacing.lg, paddingTop: 56, paddingBottom: spacing.md },
  title: { ...typography.h1 },
  tabs: { flexDirection: 'row', paddingHorizontal: spacing.lg, paddingBottom: spacing.md, gap: spacing.sm },
  tab: { flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md, alignItems: 'center', backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border },
  tabActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  tabText: { ...typography.buttonSmall, color: colors.textSecondary },
  tabTextActive: { color: colors.text },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.lg, paddingBottom: 100 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statCard: {
    flex: 1,
    minWidth: (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm) / 2 - spacing.sm,
    backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md,
    borderWidth: 1, ...shadow.small, gap: spacing.xs,
  },
  statIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.xs },
  statValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: spacing.xs },
  statValue: { fontSize: 22, fontWeight: '800' },
  statUnit: { ...typography.label, color: colors.textMuted },
  statLabel: { ...typography.caption },
  chartCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, ...shadow.small },
  chartTitle: { ...typography.h4, marginBottom: spacing.md },
  emptyState: { alignItems: 'center', paddingVertical: 60, gap: spacing.md },
  emptyTitle: { ...typography.h3, color: colors.textSecondary },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  prCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: spacing.md, borderWidth: 1, borderColor: colors.warningDim, ...shadow.small },
  prBadgeContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.warningDim, alignItems: 'center', justifyContent: 'center' },
  prInfo: { flex: 1 },
  prName: { ...typography.h4 },
  prDate: { ...typography.caption, marginTop: 2 },
  prStats: { alignItems: 'flex-end', gap: 2 },
  prWeight: { ...typography.h4, color: colors.accent },
  prReps: { ...typography.caption },
  prORM: { backgroundColor: colors.accentGlow, borderRadius: radius.sm, paddingHorizontal: spacing.xs, paddingVertical: 2 },
  prORMText: { fontSize: 10, fontWeight: '700', color: colors.accent },
  exChip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceAlt },
  exChipActive: { borderColor: colors.accent, backgroundColor: colors.accentGlow },
  exChipText: { ...typography.bodySmall },
  exChipTextActive: { color: colors.accent, fontWeight: '600' },
  historyTable: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.sm },
  historyDate: { ...typography.label, width: 60 },
  historyWeight: { ...typography.body, color: colors.accent, flex: 1 },
  historyReps: { ...typography.bodySmall, flex: 1 },
  historyVolume: { ...typography.caption, color: colors.textMuted, flex: 1, textAlign: 'right' },
});
