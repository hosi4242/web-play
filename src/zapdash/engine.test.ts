import { describe, expect, it } from 'vitest';
import { initialZapState, dailyWaitMs, SESSION_OPTIONS_MS, chooseSignalCue, registerFalseStart, registerMiss, registerSuccess, speedBonus, streakMultiplier, successPoints, summarize } from './engine';

describe('Zapdash scoring and statistics',()=>{
  it('offers 30-second, 1-minute, and 90-second session durations',()=>{expect(SESSION_OPTIONS_MS).toEqual([30_000,60_000,90_000]);});
  it('keeps daily challenge wait times stable for the same date and round',()=>{expect(dailyWaitMs('2026-10-25',2)).toBe(dailyWaitMs('2026-10-25',2));expect(dailyWaitMs('2026-10-25',2)).not.toBe(dailyWaitMs('2026-10-25',3));expect(dailyWaitMs('2026-10-25',2)).toBeGreaterThanOrEqual(800);expect(dailyWaitMs('2026-10-25',2)).toBeLessThanOrEqual(2500);});
  it('chooses both mint and violet cues in Choice mode and preserves other mode behavior',()=>{expect(chooseSignalCue('choice',0.1)).toBe('mint');expect(chooseSignalCue('choice',0.9)).toBe('violet');expect(chooseSignalCue('classic',0.9)).toBe('normal');expect(chooseSignalCue('fake',0.1)).toBe('decoy');expect(chooseSignalCue('fake',0.9)).toBe('normal');});
  it('clamps speed bonus at both boundaries',()=>{expect(speedBonus(100)).toBe(50);expect(speedBonus(150)).toBe(50);expect(speedBonus(500)).toBe(0);expect(speedBonus(900)).toBe(0);});
  it('caps streak multiplier at 1.5x and floors score',()=>{expect(streakMultiplier(1)).toBe(1);expect(streakMultiplier(20)).toBe(1.5);expect(successPoints(150,2)).toBe(157);});
  it('penalizes false starts without going below zero and resets streak',()=>{const s={...initialZapState(),score:10,streak:5};const next=registerFalseStart(s);expect(next.score).toBe(0);expect(next.falseStarts).toBe(1);expect(next.streak).toBe(0);});
  it('counts misses and resets streak',()=>{const next=registerMiss({...initialZapState(),streak:3});expect(next.misses).toBe(1);expect(next.streak).toBe(0);});
  it('calculates median, mean, population standard deviation and accuracy',()=>{const s=registerSuccess(registerSuccess(initialZapState(),100),300);const withMiss=registerMiss(s);const stats=summarize(withMiss);expect(stats.mean).toBe(200);expect(stats.median).toBe(200);expect(stats.best).toBe(100);expect(stats.stddev).toBe(100);expect(stats.accuracy).toBeCloseTo(200/3);});
  it('returns null statistics when no valid reaction exists',()=>{const stats=summarize(initialZapState());expect(stats.mean).toBeNull();expect(stats.median).toBeNull();expect(stats.stddev).toBeNull();expect(stats.accuracy).toBeNull();});
});
