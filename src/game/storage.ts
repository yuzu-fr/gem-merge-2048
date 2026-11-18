import { canMove, type Tile } from './engine.ts'
import type { GameState, Snapshot } from './session.ts'

export const STORAGE_KEY = 'gem-merge-2048:v1'
export interface StoragePort {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}
export type LoadResult = {
  state: GameState | null
  status: 'ok' | 'empty' | 'corrupt' | 'unavailable'
}
const integer = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
const gemValue = (value: unknown): value is number =>
  integer(value) && value >= 2 && Number.isInteger(Math.log2(value))

function validTiles(value: unknown): value is Tile[] {
  if (!Array.isArray(value) || value.length < 2 || value.length > 16) return false
  const positions = new Set<string>()
  const ids = new Set<number>()
  for (const tile of value) {
    if (
      !tile ||
      !integer(tile.id) ||
      tile.id < 1 ||
      !gemValue(tile.value) ||
      !integer(tile.row) ||
      tile.row > 3 ||
      !integer(tile.col) ||
      tile.col > 3
    )
      return false
    const key = `${tile.row},${tile.col}`
    if (positions.has(key) || ids.has(tile.id)) return false
    positions.add(key)
    ids.add(tile.id)
  }
  return true
}

function validSnapshot(value: unknown): value is Snapshot {
  if (!value || typeof value !== 'object') return false
  const v = value as Snapshot
  return (
    validTiles(v.tiles) &&
    integer(v.score) &&
    integer(v.nextId) &&
    v.nextId > Math.max(...v.tiles.map((tile) => tile.id)) &&
    typeof v.over === 'boolean' &&
    typeof v.hasWon === 'boolean' &&
    typeof v.winAcknowledged === 'boolean'
  )
}

export function loadGame(storage: StoragePort): LoadResult {
  let raw: string | null
  try {
    raw = storage.getItem(STORAGE_KEY)
  } catch {
    return { state: null, status: 'unavailable' }
  }
  if (!raw) return { state: null, status: 'empty' }
  try {
    const value = JSON.parse(raw) as GameState
    if (
      !validSnapshot(value) ||
      value.version !== 1 ||
      !integer(value.bestScore) ||
      !Array.isArray(value.unlocked) ||
      !value.unlocked.every(gemValue) ||
      typeof value.undoUsed !== 'boolean' ||
      !(value.previous === null || validSnapshot(value.previous))
    ) {
      return { state: null, status: 'corrupt' }
    }
    // Recalculate derived fields instead of trusting stale save flags.
    value.over = !canMove(value.tiles)
    value.hasWon = value.hasWon || value.tiles.some((tile) => tile.value >= 2048)
    value.bestScore = Math.max(value.bestScore, value.score)
    value.unlocked = [
      ...new Set([...value.unlocked, ...value.tiles.map((tile) => tile.value)]),
    ].sort((a, b) => a - b)
    if (value.undoUsed) value.previous = null
    if (value.previous) value.previous.over = !canMove(value.previous.tiles)
    return { state: value, status: 'ok' }
  } catch {
    return { state: null, status: 'corrupt' }
  }
}

export function saveGame(storage: StoragePort, state: GameState): boolean {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}
