import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, radius, typography } from '../theme';
import { SetEntry } from '../types';

interface SetRowProps {
  set: SetEntry;
  exerciseType: 'strength' | 'bodyweight';
  previousSet?: { weight?: number; reps?: number };
  onUpdate: (updates: Partial<SetEntry>) => void;
  onDelete: () => void;
  onStartRestTimer: (seconds: number) => void;
  isPR?: boolean;
}

export default function SetRow({
  set,
  exerciseType,
  previousSet,
  onUpdate,
  onDelete,
  onStartRestTimer,
  isPR,
}: SetRowProps) {
  const [showTimer, setShowTimer] = useState(false);

  const showWeight = exerciseType === 'strength';

  const handleComplete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const restTime = set.restDuration ?? 90;
    onStartRestTimer(restTime);
  };

  return (
    <View style={styles.container}>
      {/* Set number */}
      <View style={[styles.setNumber, set.isWarmup && styles.setNumberWarmup]}>
        {set.isWarmup ? (
          <Text style={styles.warmupText}>W</Text>
        ) : (
          <Text style={styles.setNumberText}>{set.setNumber}</Text>
        )}
      </View>

      {/* Previous performance hint */}
      <View style={styles.prevContainer}>
        {previousSet ? (
          <Text style={styles.prevText}>
            {showWeight && previousSet.weight ? `${previousSet.weight}kg × ` : ''}
            {previousSet.reps ?? '-'}
          </Text>
        ) : (
          <Text style={styles.prevText}>–</Text>
        )}
      </View>

      {/* Weight input */}
      {showWeight && (
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={set.weight?.toString() ?? ''}
            onChangeText={(t) => onUpdate({ weight: t ? parseFloat(t) : undefined })}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            returnKeyType="next"
          />
          <Text style={styles.inputUnit}>kg</Text>
        </View>
      )}

      {/* Reps input */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={set.reps?.toString() ?? ''}
          onChangeText={(t) => onUpdate({ reps: t ? parseInt(t, 10) : undefined })}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={colors.textMuted}
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
        <Text style={styles.inputUnit}>reps</Text>
      </View>

      {/* Rest time */}
      <TouchableOpacity
        style={styles.restBtn}
        onPress={() => {
          const options = [60, 90, 120, 180];
          const current = set.restDuration ?? 90;
          const nextIdx = (options.indexOf(current) + 1) % options.length;
          onUpdate({ restDuration: options[nextIdx] });
        }}
      >
        <Ionicons name="timer-outline" size={14} color={colors.textSecondary} />
        <Text style={styles.restText}>{set.restDuration ?? 90}s</Text>
      </TouchableOpacity>

      {/* PR badge */}
      {isPR && (
        <View style={styles.prBadge}>
          <Text style={styles.prText}>PR</Text>
        </View>
      )}

      {/* Done button */}
      <TouchableOpacity style={styles.doneBtn} onPress={handleComplete}>
        <Ionicons name="checkmark" size={18} color={colors.accent} />
      </TouchableOpacity>

      {/* Delete */}
      <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
        <Ionicons name="close" size={16} color={colors.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  setNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accentDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumberWarmup: {
    backgroundColor: colors.warningDim,
  },
  setNumberText: {
    ...typography.label,
    color: colors.accent,
  },
  warmupText: {
    ...typography.label,
    color: colors.warning,
  },
  prevContainer: {
    width: 60,
    alignItems: 'center',
  },
  prevText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    flex: 1,
  },
  input: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    textAlign: 'center',
    minWidth: 36,
    padding: 0,
  },
  inputUnit: {
    ...typography.caption,
    color: colors.textMuted,
    marginLeft: 2,
  },
  restBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: spacing.xs,
  },
  restText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  prBadge: {
    backgroundColor: colors.warning,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  prText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000',
  },
  doneBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accentGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
