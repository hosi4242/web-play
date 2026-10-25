export type Phase = 'ready' | 'waiting' | 'signal' | 'feedback' | 'paused' | 'finished';
export type ZapMode = 'classic' | 'daily' | 'fake' | 'choice';
export type SignalCue = 'normal' | 'decoy' | 'mint' | 'violet';
export interface ZapState {
  phase: Phase; score: number; bestScore: number; correctTaps: number; falseStarts: number; misses: number;
  reactionTimes: number[]; streak: number; startedAt: number | null; elapsedBeforePause: number;
  signalShownAt: number | null; feedback: string; feedbackKind: 'good' | 'bad' | 'neutral';
  mode: ZapMode; cue: SignalCue;
}
export const SESSION_MS = 30_000;
export const SESSION_OPTIONS_MS = [30_000, 60_000, 90_000] as const;
export const SIGNAL_TIMEOUT_MS = 1_500;
export const FALSE_START_MS = 100;
export const WAIT_MIN_MS = 800;
export const WAIT_MAX_MS = 2_500;
export const ROUND_GAP_MS = 300;

/** Select the cue for a round; Choice mode deliberately alternates by random half-probability. */
export function chooseSignalCue(mode: ZapMode, random = Math.random()): SignalCue {
  if (mode === 'fake' && random < 0.32) return 'decoy';
  if (mode === 'choice') return random < 0.5 ? 'mint' : 'violet';
  return 'normal';
}
export const initialZapState = (bestScore = 0, mode: ZapMode = 'classic'): ZapState => ({ phase:'ready', score:0, bestScore, correctTaps:0, falseStarts:0, misses:0, reactionTimes:[], streak:0, startedAt:null, elapsedBeforePause:0, signalShownAt:null, feedback:'Ready when you are.', feedbackKind:'neutral', mode, cue:'normal' });
export function speedBonus(rt: number): number { return Math.round(50 * Math.max(0, Math.min(1, (500 - rt) / (500 - 150)))); }
export function streakMultiplier(streakAfterSuccess: number): number { return 1 + Math.min(.5, .05 * Math.max(0, streakAfterSuccess - 1)); }
export function successPoints(rt: number, nextStreak: number): number { return Math.floor((100 + speedBonus(rt)) * streakMultiplier(nextStreak)); }
export function registerFalseStart(s: ZapState): ZapState { return { ...s, phase:'feedback', score:Math.max(0,s.score-50), falseStarts:s.falseStarts+1, streak:0, signalShownAt:null, cue:'normal', feedback:'Too early — wait for the signal.', feedbackKind:'bad' }; }
export function registerMiss(s: ZapState): ZapState { return { ...s, phase:'feedback', misses:s.misses+1, streak:0, signalShownAt:null, cue:'normal', feedback:'Missed that one. Reset and go again.', feedbackKind:'bad' }; }
export function registerSuccess(s: ZapState, rt: number): ZapState {
  const streak = s.streak + 1;
  return { ...s, phase:'feedback', score:s.score+successPoints(rt,streak), correctTaps:s.correctTaps+1, reactionTimes:[...s.reactionTimes,rt], streak, signalShownAt:null, cue:'normal', feedback:`${Math.round(rt)} ms — nice reaction!`, feedbackKind:'good' };
}
export function summarize(s: ZapState) {
  const sorted = [...s.reactionTimes].sort((a,b)=>a-b); const n=sorted.length;
  const mean = n ? sorted.reduce((a,b)=>a+b,0)/n : null;
  const median = n ? (n%2 ? sorted[(n-1)/2] : (sorted[n/2-1]+sorted[n/2])/2) : null;
  const stddev = n && mean !== null ? Math.sqrt(sorted.reduce((sum,x)=>sum+(x-mean)**2,0)/n) : null;
  const attempts = s.correctTaps+s.falseStarts+s.misses;
  return {mean,median,best:n?sorted[0]:null,stddev,accuracy:attempts?s.correctTaps/attempts*100:null,attempts};
}

/** Stable date-and-round wait for a daily challenge, independent of reloads. */
export function dailyWaitMs(dateKey: string, round: number): number {
  let hash = 2166136261;
  for (const char of `${dateKey}:${round}`) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  const unit = (hash >>> 0) / 4294967295;
  return Math.floor(WAIT_MIN_MS + unit * (WAIT_MAX_MS - WAIT_MIN_MS));
}
