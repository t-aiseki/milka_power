import { useState, useEffect, useRef, useCallback } from 'react';
import * as Haptics from 'expo-haptics';

export function useStopwatch() {
  const [elapsed, setElapsed] = useState(0); // seconds
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);

  useEffect(() => {
    if (running) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setElapsed(
          accumulatedRef.current + Math.floor((Date.now() - startTimeRef.current) / 1000)
        );
      }, 500);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const start = useCallback(() => {
    setRunning(true);
  }, []);

  const pause = useCallback(() => {
    accumulatedRef.current = elapsed;
    setRunning(false);
  }, [elapsed]);

  const reset = useCallback(() => {
    setRunning(false);
    setElapsed(0);
    accumulatedRef.current = 0;
  }, []);

  const toggle = useCallback(() => {
    if (running) pause();
    else start();
  }, [running, pause, start]);

  return { elapsed, running, start, pause, reset, toggle };
}

export function useCountdown(initialSeconds: number, onComplete?: () => void) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (running && remaining > 0) {
      intervalRef.current = setInterval(() => {
        setRemaining((prev) => {
          if (prev <= 1) {
            setRunning(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
            onCompleteRef.current?.();
            return 0;
          }
          if (prev <= 4) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const start = useCallback(() => {
    if (remaining > 0) setRunning(true);
  }, [remaining]);

  const pause = useCallback(() => setRunning(false), []);

  const reset = useCallback((seconds?: number) => {
    setRunning(false);
    setRemaining(seconds ?? initialSeconds);
  }, [initialSeconds]);

  const addTime = useCallback((seconds: number) => {
    setRemaining((prev) => prev + seconds);
  }, []);

  return { remaining, running, start, pause, reset, addTime };
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (seconds < 3600) return s > 0 ? `${m}m ${s}s` : `${m}m`;
  const h = Math.floor(seconds / 3600);
  const rem = seconds % 3600;
  const mm = Math.floor(rem / 60);
  return `${h}h ${mm}m`;
}

export function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
