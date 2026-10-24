import { describe, expect, it } from 'vitest';
import { initialZapState, registerFalseStart, registerMiss, registerSuccess, speedBonus, streakMultiplier, successPoints, summarize } from './engine';

describe('Zapdash scoring and statistics',()=>{
  it('clamps speed bonus at both boundaries',()=>{expect(speedBonus(100)).toBe(50);expect(speedBonus(150)).toBe(50);expect(speedBonus(500)).toBe(0);expect(speedBonus(900)).toBe(0);});
  it('caps streak multiplier at 1.5x and floors score',()=>{expect(streakMultiplier(1)).toBe(1);expect(streakMultiplier(20)).toBe(1.5);expect(successPoints(150,2)).toBe(157);});
  it('penalizes false starts without going below zero and resets streak',()=>{const s={...initialZapState(),score:10,streak:5};const next=registerFalseStart(s);expect(next.score).toBe(0);expect(next.falseStarts).toBe(1);expect(next.streak).toBe(0);});
  it('counts misses and resets streak',()=>{const next=registerMiss({...initialZapState(),streak:3});expect(next.misses).toBe(1);expect(next.streak).toBe(0);});
  it('calculates median, mean, population standard deviation and accuracy',()=>{const s=registerSuccess(registerSuccess(initialZapState(),100),300);const withMiss=registerMiss(s);const stats=summarize(withMiss);expect(stats.mean).toBe(200);expect(stats.median).toBe(200);expect(stats.best).toBe(100);expect(stats.stddev).toBe(100);expect(stats.accuracy).toBeCloseTo(200/3);});
  it('returns null statistics when no valid reaction exists',()=>{const stats=summarize(initialZapState());expect(stats.mean).toBeNull();expect(stats.median).toBeNull();expect(stats.stddev).toBeNull();expect(stats.accuracy).toBeNull();});
});
