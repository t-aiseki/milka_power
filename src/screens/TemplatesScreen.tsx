import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing, radius, typography, shadow, muscleGroupColors } from '../theme';
import {
  getTemplates,
  saveTemplate,
  deleteTemplate,
  applyTemplateToWorkout,
  createNewWorkout,
} from '../storage';
import { Template, Workout } from '../types';

type RootStackParamList = {
  WorkoutDetail: { workout: Workout };
};

export default function TemplatesScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getTemplates().then(setTemplates);
    }, [])
  );

  const handleDelete = (id: string, name: string) => {
    Alert.alert(
      `Видалити "${name}"?`,
      'Шаблон буде видалено назавжди.',
      [
        { text: 'Скасувати', style: 'cancel' },
        {
          text: 'Видалити',
          style: 'destructive',
          onPress: async () => {
            await deleteTemplate(id);
            setTemplates((t) => t.filter((x) => x.id !== id));
          },
        },
      ]
    );
  };

  const handleStartWorkout = async (template: Template) => {
    const date = new Date().toISOString().split('T')[0];
    const newWorkout = createNewWorkout(date, template.id);
    const filledWorkout = await applyTemplateToWorkout(newWorkout, template);
    navigation.navigate('WorkoutDetail', { workout: filledWorkout });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Шаблони</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowCreate(true)}
        >
          <Ionicons name="add" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {templates.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="copy-outline" size={64} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Немає шаблонів</Text>
          <Text style={styles.emptyText}>
            Зберігай тренування як шаблон щоб швидко повторювати їх
          </Text>
          <TouchableOpacity
            style={styles.createFirstBtn}
            onPress={() => setShowCreate(true)}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.accent} />
            <Text style={styles.createFirstText}>Створити шаблон</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={templates.sort((a, b) => (b.lastUsed ?? b.createdAt).localeCompare(a.lastUsed ?? a.createdAt))}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TemplateCard
              template={item}
              onStart={() => handleStartWorkout(item)}
              onDelete={() => handleDelete(item.id, item.name)}
            />
          )}
        />
      )}

      {showCreate && (
        <CreateTemplateSheet
          onClose={() => setShowCreate(false)}
          onCreate={async (name, exercises) => {
            const t: Template = {
              id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              name,
              exercises,
              createdAt: new Date().toISOString(),
              useCount: 0,
            };
            await saveTemplate(t);
            setTemplates((prev) => [...prev, t]);
            setShowCreate(false);
          }}
        />
      )}
    </View>
  );
}

function TemplateCard({
  template,
  onStart,
  onDelete,
}: {
  template: Template;
  onStart: () => void;
  onDelete: () => void;
}) {
  const muscleGroups = [
    ...new Set(
      template.exercises
        .map((e) => e.muscleGroup)
        .filter(Boolean) as string[]
    ),
  ];

  return (
    <View style={styles.templateCard}>
      <View style={styles.templateHeader}>
        <View style={styles.templateIcon}>
          <Ionicons name="copy-outline" size={20} color={colors.accent} />
        </View>
        <View style={styles.templateInfo}>
          <Text style={styles.templateName}>{template.name}</Text>
          <Text style={styles.templateMeta}>
            {template.exercises.length} вправ
            {template.useCount > 0 ? ` · Використано ${template.useCount}×` : ''}
          </Text>
        </View>
        <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
          <Ionicons name="trash-outline" size={18} color={colors.error + '80'} />
        </TouchableOpacity>
      </View>

      {/* Exercises list */}
      <View style={styles.exercisesList}>
        {template.exercises.map((ex, i) => (
          <View key={i} style={styles.exerciseItem}>
            <View
              style={[
                styles.exDot,
                {
                  backgroundColor:
                    ex.type === 'cardio'
                      ? colors.cardio
                      : ex.type === 'bodyweight'
                      ? colors.bodyweight
                      : colors.accent,
                },
              ]}
            />
            <Text style={styles.exName}>{ex.name}</Text>
            {ex.defaultSets && (
              <Text style={styles.exSets}>
                {ex.type === 'cardio'
                  ? ''
                  : `${ex.defaultSets} × ${ex.defaultReps ?? '?'}`}
                {ex.defaultWeight ? ` @ ${ex.defaultWeight}kg` : ''}
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Muscle groups */}
      {muscleGroups.length > 0 && (
        <View style={styles.muscleGroups}>
          {muscleGroups.slice(0, 5).map((mg) => (
            <View
              key={mg}
              style={[
                styles.muscleChip,
                { borderColor: (muscleGroupColors[mg] ?? colors.accent) + '60' },
              ]}
            >
              <Text
                style={[
                  styles.muscleChipText,
                  { color: muscleGroupColors[mg] ?? colors.textSecondary },
                ]}
              >
                {mg}
              </Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.startBtn} onPress={onStart}>
        <Ionicons name="play" size={18} color={colors.text} />
        <Text style={styles.startBtnText}>Почати тренування</Text>
      </TouchableOpacity>
    </View>
  );
}

function CreateTemplateSheet({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (name: string, exercises: Template['exercises']) => void;
}) {
  const [name, setName] = useState('');
  const [exercises, setExercises] = useState<Template['exercises']>([]);
  const [showExAdd, setShowExAdd] = useState(false);
  const [newExName, setNewExName] = useState('');
  const [newExSets, setNewExSets] = useState('3');
  const [newExReps, setNewExReps] = useState('10');

  const handleAdd = () => {
    if (!newExName.trim()) return;
    setExercises((prev) => [
      ...prev,
      {
        exerciseId: `custom_${Date.now()}`,
        name: newExName.trim(),
        type: 'strength',
        defaultSets: parseInt(newExSets) || 3,
        defaultReps: parseInt(newExReps) || undefined,
      },
    ]);
    setNewExName('');
    setNewExSets('3');
    setNewExReps('10');
    setShowExAdd(false);
  };

  return (
    <View style={styles.sheet}>
      <View style={styles.sheetOverlay}>
        <TouchableOpacity style={{ flex: 1 }} onPress={onClose} />
      </View>
      <View style={styles.sheetContent}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Новий шаблон</Text>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.nameInput}
          value={name}
          onChangeText={setName}
          placeholder="Назва шаблону (напр. Ноги, Верх тіла...)"
          placeholderTextColor={colors.textMuted}
          autoFocus
        />

        <Text style={styles.sheetSubtitle}>Вправи ({exercises.length})</Text>

        {exercises.map((ex, i) => (
          <View key={i} style={styles.addedEx}>
            <Ionicons name="barbell-outline" size={16} color={colors.accent} />
            <Text style={styles.addedExName}>{ex.name}</Text>
            <Text style={styles.addedExDetail}>
              {ex.defaultSets}×{ex.defaultReps ?? '?'}
            </Text>
            <TouchableOpacity onPress={() => setExercises((p) => p.filter((_, j) => j !== i))}>
              <Ionicons name="close" size={16} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        ))}

        {showExAdd ? (
          <View style={styles.addExForm}>
            <TextInput
              style={styles.addExInput}
              value={newExName}
              onChangeText={setNewExName}
              placeholder="Назва вправи"
              placeholderTextColor={colors.textMuted}
            />
            <View style={styles.addExRow}>
              <View style={styles.addExField}>
                <Text style={styles.addExLabel}>Підходи</Text>
                <TextInput
                  style={styles.addExSmall}
                  value={newExSets}
                  onChangeText={setNewExSets}
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.addExField}>
                <Text style={styles.addExLabel}>Повтори</Text>
                <TextInput
                  style={styles.addExSmall}
                  value={newExReps}
                  onChangeText={setNewExReps}
                  keyboardType="number-pad"
                />
              </View>
              <TouchableOpacity style={styles.addExConfirm} onPress={handleAdd}>
                <Ionicons name="checkmark" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addExBtn}
            onPress={() => setShowExAdd(true)}
          >
            <Ionicons name="add" size={18} color={colors.accent} />
            <Text style={styles.addExBtnText}>Додати вправу</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.saveTemplateBtn, !name.trim() && styles.saveBtnDisabled]}
          onPress={() => name.trim() && onCreate(name.trim(), exercises)}
          disabled={!name.trim()}
        >
          <Text style={styles.saveTemplateBtnText}>Зберегти шаблон</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 56,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.h1,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    gap: spacing.md,
  },
  emptyTitle: {
    ...typography.h2,
    color: colors.textSecondary,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  createFirstBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accentGlow,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.accent + '40',
    marginTop: spacing.md,
  },
  createFirstText: {
    ...typography.button,
    color: colors.accent,
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: 100,
  },
  templateCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.small,
    gap: spacing.md,
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  templateIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accentGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    ...typography.h3,
  },
  templateMeta: {
    ...typography.bodySmall,
    marginTop: 2,
  },
  deleteBtn: {
    padding: spacing.xs,
  },
  exercisesList: {
    gap: spacing.xs,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  exDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  exName: {
    ...typography.body,
    flex: 1,
  },
  exSets: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  muscleGroups: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  muscleChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    backgroundColor: colors.surfaceAlt,
  },
  muscleChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  startBtnText: {
    ...typography.button,
  },
  // Create sheet
  sheet: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheetContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xxl,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  sheetTitle: {
    ...typography.h3,
  },
  nameInput: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  sheetSubtitle: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  addedEx: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  addedExName: {
    ...typography.body,
    flex: 1,
  },
  addedExDetail: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },
  addExBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.accent + '40',
    borderRadius: radius.md,
    borderStyle: 'dashed',
    marginVertical: spacing.sm,
  },
  addExBtnText: {
    ...typography.buttonSmall,
    color: colors.accent,
  },
  addExForm: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
    gap: spacing.sm,
  },
  addExInput: {
    ...typography.body,
    color: colors.text,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.sm,
  },
  addExRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  addExField: {
    flex: 1,
  },
  addExLabel: {
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  addExSmall: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.sm,
    ...typography.h4,
    color: colors.text,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  addExConfirm: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  saveTemplateBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveTemplateBtnText: {
    ...typography.button,
  },
});
