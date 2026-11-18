import {
  canMove,
  copyTiles,
  moveTiles,
  spawnTile,
  type Direction,
  type Random,
  type Tile,
} from './engine.ts'

export interface Snapshot {
  tiles: Tile[]
  score: number
  nextId: number
  over: boolean
  hasWon: boolean
  winAcknowledged: boolean
}
export interface GameState extends Snapshot {
  version: 1
  bestScore: number
  unlocked: number[]
  undoUsed: boolean
  previous: Snapshot | null
}

export function newGame(
  profile?: Pick<GameState, 'bestScore' | 'unlocked'>,
  random: Random = Math.random,
): GameState {
  const first = spawnTile([], 1, random)
  const second = spawnTile(first.tiles, first.nextId, random)
  return {
    version: 1,
    tiles: second.tiles,
    nextId: second.nextId,
    score: 0,
    bestScore: profile?.bestScore ?? 0,
    unlocked: [
      ...new Set([...(profile?.unlocked ?? []), ...second.tiles.map((tile) => tile.value)]),
    ].sort((a, b) => a - b),
    over: false,
    hasWon: false,
    winAcknowledged: false,
    undoUsed: false,
    previous: null,
  }
}

export function playTurn(state: GameState, direction: Direction, random: Random = Math.random) {
  if (state.over) return null
  const movement = moveTiles(state.tiles, direction)
  if (!movement.moved) return null
  const spawned = spawnTile(movement.tiles, state.nextId, random)
  const score = state.score + movement.scoreDelta
  const newlyUnlocked = spawned.tiles
    .map((tile) => tile.value)
    .filter((value) => !state.unlocked.includes(value))
  const previous: Snapshot = {
    tiles: copyTiles(state.tiles),
    score: state.score,
    nextId: state.nextId,
    over: state.over,
    hasWon: state.hasWon,
    winAcknowledged: state.winAcknowledged,
  }
  const next: GameState = {
    ...state,
    tiles: spawned.tiles,
    nextId: spawned.nextId,
    score,
    bestScore: Math.max(state.bestScore, score),
    unlocked: [...new Set([...state.unlocked, ...newlyUnlocked])].sort((a, b) => a - b),
    over: !canMove(spawned.tiles),
    hasWon: state.hasWon || spawned.tiles.some((tile) => tile.value >= 2048),
    previous: state.undoUsed ? null : previous,
  }
  return {
    state: next,
    ...movement,
    spawnedId: spawned.spawnedId,
    newlyUnlocked: [...new Set(newlyUnlocked)],
  }
}

export function undoTurn(state: GameState): GameState | null {
  if (state.undoUsed || !state.previous) return null
  return {
    ...state,
    ...state.previous,
    tiles: copyTiles(state.previous.tiles),
    undoUsed: true,
    previous: null,
  }
}
