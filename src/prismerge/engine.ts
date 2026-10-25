export const DEFAULT_BOARD_SIZE = 7;
export const BOARD_SIZE = DEFAULT_BOARD_SIZE;
export const BOARD_SIZES = [5, 7, 10] as const;
export const CELL_COUNT = DEFAULT_BOARD_SIZE * DEFAULT_BOARD_SIZE;
export const MAX_GRADE = 8;
export const HAND_SIZE = 3;
export interface Tile { id: number; grade: number; charge: number }
export interface GameState {
  board: (Tile | null)[];
  boardSize: number;
  hand: number[];
  score: number;
  bestScore: number;
  maxGrade: number;
  maxChain: number;
  chain: number;
  gameState: 'playing' | 'gameOver';
  seed: number;
  rngState: number;
  bag: number[];
  nextTileId: number;
  turns: number;
}
export interface TurnResult { state: GameState; events: { type: 'merge' | 'place' | 'gameOver'; cell: number; grade?: number; count?: number; chain?: number }[]; error?: string }
function nextRandom(state: GameState): [number, GameState] {
  let t = (state.rngState += 0x6D2B79F5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return [value, { ...state, rngState: state.rngState >>> 0 }];
}
function refillBag(state: GameState): [number[], GameState] {
  const bag = [1, 1, 1, 1, 1, 1, 2, 2, 2, 3];
  let next = state;
  for (let i = bag.length - 1; i > 0; i--) {
    const [r, n] = nextRandom(next); next = n;
    const j = Math.floor(r * (i + 1)); [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return [bag, next];
}
function drawGrade(state: GameState): [number, GameState] {
  let next = { ...state, bag: [...state.bag] };
  if (next.bag.length === 0) { const [bag, withRng] = refillBag(next); next = { ...withRng, bag }; }
  const grade = next.bag.shift()!;
  return [grade, next];
}
function newTile(state: GameState, grade: number, charge = 0): [Tile, GameState] {
  return [{ id: state.nextTileId, grade, charge }, { ...state, nextTileId: state.nextTileId + 1 }];
}
function validBoardSize(size: number): boolean { return BOARD_SIZES.some(value => value === size); }
export function createGame(seed = (Date.now() >>> 0), bestScore = 0, boardSize = DEFAULT_BOARD_SIZE): GameState {
  const safeSeed = seed >>> 0;
  const safeSize = validBoardSize(boardSize) ? boardSize : DEFAULT_BOARD_SIZE;
  let s: GameState = { board: Array(safeSize * safeSize).fill(null), boardSize: safeSize, hand: [], score: 0, bestScore, maxGrade: 0, maxChain: 0, chain: 0, gameState: 'playing', seed: safeSeed, rngState: safeSeed || 0x12345678, bag: [], nextTileId: 1, turns: 0 };
  for (let i = 0; i < HAND_SIZE; i++) { const [g, n] = drawGrade(s); s = n; s.hand.push(g); }
  return s;
}
function neighbors(index: number, size: number): number[] {
  const r = Math.floor(index / size), c = index % size, out: number[] = [];
  if (r > 0) out.push(index - size);
  if (r < size - 1) out.push(index + size);
  if (c > 0) out.push(index - 1);
  if (c < size - 1) out.push(index + 1);
  return out;
}
export function connectedGroup(board: (Tile | null)[], start: number, grade: number, boardSize = Math.sqrt(board.length)): number[] {
  if (!Number.isInteger(boardSize) || boardSize < 1 || boardSize * boardSize !== board.length || start < 0 || start >= board.length || board[start]?.grade !== grade) return [];
  const seen = new Set<number>([start]), queue = [start];
  for (let i = 0; i < queue.length; i++) for (const n of neighbors(queue[i], boardSize)) if (!seen.has(n) && board[n]?.grade === grade) { seen.add(n); queue.push(n); }
  return queue;
}
function addScore(grade: number, n: number, chain: number, max: boolean): number {
  const base = grade * grade * n * 10, size = n >= 4 ? 5 * n : 0, nextGrade = grade + 1;
  const gradeBonus = !max && nextGrade >= 5 ? (nextGrade - 4) * 50 : 0, maxBonus = max ? 500 : 0;
  const mult = chain === 1 ? 1 : chain === 2 ? 1.5 : chain === 3 ? 2 : 3;
  return Math.floor((base + size + gradeBonus + maxBonus) * mult);
}
export function placeTile(original: GameState, slot: number, cell: number): TurnResult {
  if (original.gameState !== 'playing') return { state: original, events: [], error: 'Game is over.' };
  if (!Number.isInteger(slot) || slot < 0 || slot >= HAND_SIZE) return { state: original, events: [], error: 'Choose a tile from your hand.' };
  if (!Number.isInteger(cell) || cell < 0 || cell >= original.board.length) return { state: original, events: [], error: 'Choose a valid board cell.' };
  if (original.board[cell]) return { state: original, events: [], error: 'That cell is already occupied.' };
  const size = original.boardSize || Math.sqrt(original.board.length);
  const s: GameState = { ...original, boardSize: size, board: [...original.board], hand: [...original.hand], bag: [...original.bag], turns: original.turns + 1 };
  const [tile, next] = newTile(s, s.hand[slot]); s.nextTileId = next.nextTileId; s.board[cell] = tile;
  const events: TurnResult['events'] = [{ type: 'place', cell, grade: tile.grade }];
  let chain = 0, guard = 0;
  while (true) {
    const active = s.board[cell]; if (!active) break;
    const group = connectedGroup(s.board, cell, active.grade, size); if (group.length < 3) break;
    chain++; guard++; if (guard > 100) throw new Error('Safety guard triggered: merge loop did not converge.');
    const grade = active.grade, max = grade >= MAX_GRADE, gained = addScore(grade, group.length, chain, max);
    s.score = Math.max(0, s.score + gained); s.maxChain = Math.max(s.maxChain, chain);
    for (const idx of group) s.board[idx] = null;
    events.push({ type: 'merge', cell, grade, count: group.length, chain });
    if (max) { s.board[cell] = null; break; }
    const [result, nextTileState] = newTile(s, grade + 1); s.nextTileId = nextTileState.nextTileId; s.board[cell] = result; s.maxGrade = Math.max(s.maxGrade, result.grade);
  }
  s.chain = chain; s.bestScore = Math.max(s.bestScore, s.score);
  const [replacement, drawn] = drawGrade(s); Object.assign(s, { rngState: drawn.rngState, bag: drawn.bag }); s.hand[slot] = replacement;
  if (s.board.every(x => x !== null)) { s.gameState = 'gameOver'; events.push({ type: 'gameOver', cell }); }
  return { state: s, events };
}
