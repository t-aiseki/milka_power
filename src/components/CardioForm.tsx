import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../theme';
import { CardioSession } from '../types';
import { formatDuration } from '../hooks/useTimer';

interface CardioFormProps {
  cardio: CardioSession;
  onChange: (updates: Partial<CardioSession>) => void;
}

function secsToMinSec(total: number): { min: string; sec: string } {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return { min: String(m), sec: String(s).padStart(2, '0') };
}

function minSecToSecs(min: string, sec: string): number {
  return (parseInt(min || '0', 10) * 60) + parseInt(sec || '0', 10);
}

export default function CardioForm({ cardio, onChange }: CardioFormProps) {
  const { min, sec } = secsToMinSec(cardio.duration);

  const handleDurationChange = (field: 'min' | 'sec', value: string) => {
    const newMin = field === 'min' ? value : min;
    const newSec = field === 'sec' ? value : sec;
    onChange({ duration: minSecToSecs(newMin, newSec) });
  };

  return (
    <View style={styles.container}>
      {/* Duration */}
      <View style={styles.row}>
        <View style={styles.fieldIcon}>
          <Ionicons name="time-outline" size={18} color={colors.cardio} />
        </View>
        <Text style={styles.fieldLabel}>Duration</Text>
        <View style={styles.durationInputs}>
          <TextInput
            style={styles.durationInput}
            value={min}
            onChangeText={(v) => handleDurationChange('min', v)}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.durationSep}>:</Text>
          <TextInput
            style={styles.durationInput}
            value={sec}
            onChangeText={(v) => handleDurationChange('sec', v)}
            keyboardType="number-pad"
            placeholder="00"
            placeholderTextColor={colors.textMuted}
            maxLength={2}
          />
          <Text style={styles.durationUnit}>min</Text>
        </View>
      </View>

      {/* Distance */}
      <View style={styles.row}>
        <View style={styles.fieldIcon}>
          <Ionicons name="map-outline" size={18} color={colors.cardio} />
        </View>
        <Text style={styles.fieldLabel}>Distance</Text>
        <View style={styles.inputWithUnit}>
          <TextInput
            style={styles.valueInput}
            value={cardio.distance?.toString() ?? ''}
            onChangeText={(t) => onChange({ distance: t ? parseFloat(t) : undefined })}
            keyboardType="decimal-pad"
            placeholder="0.0"
            placeholderTextColor={colors.textMuted}
          />
          <TouchableOpacity
            style={styles.unitToggle}
            onPress={() =>
              onChange({
                distanceUnit: cardio.distanceUnit === 'km' ? 'mi' : 'km',
              })
            }
          >
            <Text style={styles.unitText}>{cardio.distanceUnit}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Heart Rate */}
      <View style={styles.row}>
        <View style={styles.fieldIcon}>
          <Ionicons name="heart-outline" size={18} color={colors.error} />
        </View>
        <Text style={styles.fieldLabel}>Avg Heart Rate</Text>
        <View style={styles.inputWithUnit}>
          <TextInput
            style={styles.valueInput}
            value={cardio.avgHeartRate?.toString() ?? ''}
            onChangeText={(t) =>
              onChange({ avgHeartRate: t ? parseInt(t, 10) : undefined })
            }
            keyboardType="number-pad"
            placeholder="–"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.unitLabel}>bpm</Text>
        </View>
      </View>

      {/* Max Heart Rate */}
      <View style={styles.row}>
        <View style={styles.fieldIcon}>
          <Ionicons name="heart" size={18} color={colors.error} />
        </View>
        <Text style={styles.fieldLabel}>Max Heart Rate</Text>
        <View style={styles.inputWithUnit}>
          <TextInput
            style={styles.valueInput}
            value={cardio.maxHeartRate?.toString() ?? ''}
            onChangeText={(t) =>
              onChange({ maxHeartRate: t ? parseInt(t, 10) : undefined })
            }
            keyboardType="number-pad"
            placeholder="–"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.unitLabel}>bpm</Text>
        </View>
      </View>

      {/* Calories */}
      <View style={styles.row}>
        <View style={styles.fieldIcon}>
          <Ionicons name="flame-outline" size={18} color={colors.warning} />
        </View>
        <Text style={styles.fieldLabel}>Calories</Text>
        <View style={styles.inputWithUnit}>
          <TextInput
            style={styles.valueInput}
            value={cardio.calories?.toString() ?? ''}
            onChangeText={(t) =>
              onChange({ calories: t ? parseInt(t, 10) : undefined })
            }
            keyboardType="number-pad"
            placeholder="–"
            placeholderTextColor={colors.textMuted}
          />
          <Text style={styles.unitLabel}>kcal</Text>
        </View>
      </View>

      {/* Pace (auto-calculated if duration + distance) */}
      {cardio.duration > 0 && cardio.distance && cardio.distance > 0 && (
        <View style={[styles.row, styles.paceRow]}>
          <View style={styles.fieldIcon}>
            <Ionicons name="speedometer-outline" size={18} color={colors.accent} />
          </View>
          <Text style={styles.fieldLabel}>Avg Pace</Text>
          <Text style={styles.paceValue}>
            {formatPace(cardio.duration, cardio.distance, cardio.distanceUnit)}
          </Text>
        </View>
      )}
    </View>
  );
}

function formatPace(durationSecs: number, distance: number, unit: string): string {
  const secsPerUnit = durationSecs / distance;
  const m = Math.floor(secsPerUnit / 60);
  const s = Math.round(secsPerUnit % 60);
  return `${m}:${String(s).padStart(2, '0')} /${unit}`;
}

const styles = StyleSheet.create({
  container: {
    gap: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceAlt,
    gap: spacing.md,
  },
  fieldIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cardioDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldLabel: {
    ...typography.body,
    flex: 1,
  },
  durationInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  durationInput: {
    width: 44,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    padding: spacing.sm,
    ...typography.h4,
    color: colors.text,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  durationSep: {
    ...typography.h4,
    color: colors.textSecondary,
  },
  durationUnit: {
    ...typography.caption,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  valueInput: {
    width: 60,
    padding: spacing.sm,
    ...typography.h4,
    color: colors.text,
    textAlign: 'center',
  },
  unitToggle: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  unitText: {
    ...typography.label,
    color: colors.accent,
  },
  unitLabel: {
    ...typography.caption,
    color: colors.textMuted,
    paddingHorizontal: spacing.sm,
  },
  paceRow: {
    backgroundColor: colors.accentGlow,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paceValue: {
    ...typography.h4,
    color: colors.accent,
  },
});
