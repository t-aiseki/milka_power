import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography } from '../theme';
import { useCountdown, formatTimer } from '../hooks/useTimer';

interface RestTimerModalProps {
  visible: boolean;
  initialSeconds: number;
  onClose: () => void;
}

export default function RestTimerModal({
  visible,
  initialSeconds,
  onClose,
}: RestTimerModalProps) {
  const { remaining, running, start, pause, reset, addTime } = useCountdown(
    initialSeconds,
    onClose
  );

  useEffect(() => {
    if (visible) {
      reset(initialSeconds);
      start();
    }
  }, [visible, initialSeconds]);

  const progress = remaining / initialSeconds;
  const isUrgent = remaining <= 10 && remaining > 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Rest Timer</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Timer display */}
          <View style={styles.timerSection}>
            <View style={[styles.timerRing, isUrgent && styles.timerRingUrgent]}>
              <Text style={[styles.timerText, isUrgent && styles.timerTextUrgent]}>
                {formatTimer(remaining)}
              </Text>
              <Text style={styles.timerLabel}>remaining</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: `${progress * 100}%` as any,
                  backgroundColor: isUrgent ? colors.error : colors.accent,
                },
              ]}
            />
          </View>

          {/* Quick add buttons */}
          <View style={styles.quickAdd}>
            {[15, 30, 60].map((sec) => (
              <TouchableOpacity
                key={sec}
                style={styles.quickAddBtn}
                onPress={() => addTime(sec)}
              >
                <Text style={styles.quickAddText}>+{sec}s</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={onClose}
            >
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.playPauseBtn}
              onPress={running ? pause : start}
            >
              <Ionicons
                name={running ? 'pause' : 'play'}
                size={28}
                color={colors.text}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => reset(initialSeconds)}
            >
              <Ionicons name="refresh" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Common presets */}
          <View style={styles.presets}>
            <Text style={styles.presetsLabel}>Presets</Text>
            <View style={styles.presetsRow}>
              {[60, 90, 120, 180, 240].map((sec) => (
                <TouchableOpacity
                  key={sec}
                  style={[
                    styles.presetBtn,
                    initialSeconds === sec && styles.presetBtnActive,
                  ]}
                  onPress={() => reset(sec)}
                >
                  <Text
                    style={[
                      styles.presetText,
                      initialSeconds === sec && styles.presetTextActive,
                    ]}
                  >
                    {sec < 60 ? `${sec}s` : `${sec / 60}m`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingBottom: 40,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h3,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  timerRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 4,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentGlow,
  },
  timerRingUrgent: {
    borderColor: colors.error,
    backgroundColor: colors.errorDim,
  },
  timerText: {
    fontSize: 44,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 2,
  },
  timerTextUrgent: {
    color: colors.error,
  },
  timerLabel: {
    ...typography.caption,
    marginTop: 4,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  quickAdd: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  quickAddBtn: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  quickAddText: {
    ...typography.buttonSmall,
    color: colors.accent,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },
  skipBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  skipText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  playPauseBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  presets: {
    alignItems: 'center',
  },
  presetsLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  presetsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  presetBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetBtnActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accentGlow,
  },
  presetText: {
    ...typography.bodySmall,
  },
  presetTextActive: {
    color: colors.accent,
  },
});
