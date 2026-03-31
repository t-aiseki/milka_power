import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, muscleGroupColors } from '../theme';
import { Exercise, ExerciseType } from '../types';
import { MUSCLE_GROUPS } from '../data/exercises';

interface ExercisePickerProps {
  visible: boolean;
  exercises: Exercise[];
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
  onCreateCustom: (name: string, type: ExerciseType, muscleGroup?: string) => void;
}

const TYPE_ICONS: Record<ExerciseType, string> = {
  strength: 'barbell-outline',
  cardio: 'heart-outline',
  bodyweight: 'body-outline',
};

const TYPE_COLORS: Record<ExerciseType, string> = {
  strength: colors.accent,
  cardio: colors.cardio,
  bodyweight: colors.bodyweight,
};

export default function ExercisePicker({
  visible,
  exercises,
  onSelect,
  onClose,
  onCreateCustom,
}: ExercisePickerProps) {
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('All');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<ExerciseType>('strength');
  const [newGroup, setNewGroup] = useState('');

  const filtered = useMemo(() => {
    return exercises.filter((e) => {
      const matchSearch = e.name.toLowerCase().includes(search.toLowerCase());
      const matchGroup =
        selectedGroup === 'All' || e.muscleGroup === selectedGroup;
      return matchSearch && matchGroup;
    });
  }, [exercises, search, selectedGroup]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    onCreateCustom(newName.trim(), newType, newGroup || undefined);
    setNewName('');
    setNewType('strength');
    setNewGroup('');
    setShowCreate(false);
  };

  const renderExercise = ({ item }: { item: Exercise }) => (
    <TouchableOpacity style={styles.exerciseItem} onPress={() => onSelect(item)}>
      <View style={[styles.typeIcon, { backgroundColor: TYPE_COLORS[item.type] + '20' }]}>
        <Ionicons
          name={TYPE_ICONS[item.type] as any}
          size={18}
          color={TYPE_COLORS[item.type]}
        />
      </View>
      <View style={styles.exerciseInfo}>
        <Text style={styles.exerciseName}>{item.name}</Text>
        {item.muscleGroup && (
          <Text style={[styles.muscleGroup, { color: muscleGroupColors[item.muscleGroup] ?? colors.textSecondary }]}>
            {item.muscleGroup}
          </Text>
        )}
      </View>
      {item.isCustom && (
        <View style={styles.customBadge}>
          <Text style={styles.customBadgeText}>Custom</Text>
        </View>
      )}
      <Ionicons name="add-circle-outline" size={22} color={colors.accent} />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="chevron-down" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.title}>Add Exercise</Text>
          <TouchableOpacity onPress={() => setShowCreate(true)}>
            <Ionicons name="add" size={24} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search exercises..."
            placeholderTextColor={colors.textMuted}
            autoFocus
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Muscle group filter */}
        <FlatList
          horizontal
          data={MUSCLE_GROUPS}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedGroup === item && styles.filterChipActive,
              ]}
              onPress={() => setSelectedGroup(item)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedGroup === item && styles.filterChipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Exercise list */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderExercise}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="barbell-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>No exercises found</Text>
              <TouchableOpacity
                style={styles.createBtn}
                onPress={() => { setNewName(search); setShowCreate(true); }}
              >
                <Text style={styles.createBtnText}>Create "{search}"</Text>
              </TouchableOpacity>
            </View>
          }
        />

        {/* Create custom exercise sheet */}
        <Modal visible={showCreate} transparent animationType="slide" onRequestClose={() => setShowCreate(false)}>
          <View style={styles.createOverlay}>
            <View style={styles.createSheet}>
              <Text style={styles.createTitle}>New Exercise</Text>

              <TextInput
                style={styles.createInput}
                value={newName}
                onChangeText={setNewName}
                placeholder="Exercise name"
                placeholderTextColor={colors.textMuted}
                autoFocus
              />

              <Text style={styles.createLabel}>Type</Text>
              <View style={styles.typeRow}>
                {(['strength', 'cardio', 'bodyweight'] as ExerciseType[]).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.typeBtn, newType === t && styles.typeBtnActive]}
                    onPress={() => setNewType(t)}
                  >
                    <Ionicons
                      name={TYPE_ICONS[t] as any}
                      size={16}
                      color={newType === t ? TYPE_COLORS[t] : colors.textMuted}
                    />
                    <Text style={[styles.typeBtnText, newType === t && { color: TYPE_COLORS[t] }]}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.createLabel}>Muscle Group (optional)</Text>
              <View style={styles.groupGrid}>
                {MUSCLE_GROUPS.filter(g => g !== 'All').map((g) => (
                  <TouchableOpacity
                    key={g}
                    style={[styles.groupChip, newGroup === g && styles.groupChipActive]}
                    onPress={() => setNewGroup(newGroup === g ? '' : g)}
                  >
                    <Text style={[styles.groupChipText, newGroup === g && { color: muscleGroupColors[g] }]}>
                      {g}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.createActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowCreate(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, !newName.trim() && styles.confirmBtnDisabled]}
                  onPress={handleCreate}
                  disabled={!newName.trim()}
                >
                  <Text style={styles.confirmText}>Create</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
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
    padding: spacing.lg,
    paddingTop: 56,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.h3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    margin: spacing.lg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    padding: 0,
  },
  filterList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  filterChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentGlow,
  },
  filterChipText: {
    ...typography.bodySmall,
  },
  filterChipTextActive: {
    color: colors.accent,
    fontWeight: '600',
  },
  list: {
    padding: spacing.lg,
  },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  typeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    ...typography.h4,
  },
  muscleGroup: {
    ...typography.caption,
    marginTop: 2,
    fontWeight: '600',
  },
  customBadge: {
    backgroundColor: colors.purpleDim,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  customBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.purple,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    gap: spacing.md,
  },
  emptyText: {
    ...typography.body,
    color: colors.textMuted,
  },
  createBtn: {
    backgroundColor: colors.accentGlow,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  createBtnText: {
    ...typography.buttonSmall,
    color: colors.accent,
  },
  // Create sheet
  createOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  createSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.xxl,
    paddingBottom: 40,
  },
  createTitle: {
    ...typography.h3,
    marginBottom: spacing.xl,
  },
  createInput: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  createLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceAlt,
  },
  typeBtnActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentGlow,
  },
  typeBtnText: {
    ...typography.buttonSmall,
    color: colors.textMuted,
  },
  groupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  groupChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  groupChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.surfaceAlt,
  },
  groupChipText: {
    ...typography.bodySmall,
  },
  createActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelBtn: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  confirmBtn: {
    flex: 1,
    padding: spacing.md,
    alignItems: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.accent,
  },
  confirmBtnDisabled: {
    opacity: 0.4,
  },
  confirmText: {
    ...typography.button,
  },
});
