import test from 'node:test'
import assert from 'node:assert/strict'
import { canMove, moveTiles, spawnTile, type Direction, type Tile } from '../src/game/engine.ts'
import { newGame, playTurn, undoTurn, type GameState } from '../src/game/session.ts'
import { loadGame, saveGame, STORAGE_KEY, type StoragePort } from '../src/game/storage.ts'
import { swipeDirection } from '../src/game/gestures.ts'

function board(rows: number[][]): Tile[] {
  return rows.flatMap((row, r) =>
    row.flatMap((value, c) => (value ? [{ id: r * 4 + c + 1, value, row: r, col: c }] : [])),
  )
}
function matrix(tiles: Tile[]) {
  return Array.from({ length: 4 }, (_, row) =>
    Array.from(
      { length: 4 },
      (_, col) => tiles.find((tile) => tile.row === row && tile.col === col)?.value ?? 0,
    ),
  )
}
function fixture(rows: number[][]): GameState {
  const tiles = board(rows)
  return {
    ...newGame(undefined, () => 0),
    tiles,
    nextId: 17,
    unlocked: [...new Set(tiles.map((tile) => tile.value))],
    over: !canMove(tiles),
  }
}
function memoryStorage(): StoragePort {
  const store = new Map<string, string>()
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value)
    },
  }
}

test('[2,2,2,2] merges into [4,4,0,0] with score 8 and no mutation', () => {
  const tiles = board([[2, 2, 2, 2]])
  const original = JSON.stringify(tiles)
  const turn = moveTiles(tiles, 'left')
  assert.deepEqual(matrix(turn.tiles)[0], [4, 4, 0, 0])
  assert.equal(turn.scoreDelta, 8)
  assert.equal(turn.mergedIds.length, 2)
  assert.equal(turn.motionTiles.length, 4)
  assert.equal(JSON.stringify(tiles), original)
})

test('newly merged tiles do not merge again in the same turn', () => {
  for (const [input, expected] of [
    [
      [2, 2, 4, 0],
      [4, 4, 0, 0],
    ],
    [
      [4, 2, 2, 4],
      [4, 4, 4, 0],
    ],
    [
      [2, 0, 2, 2],
      [4, 2, 0, 0],
    ],
    [
      [4, 4, 8, 8],
      [8, 16, 0, 0],
    ],
  ])
    assert.deepEqual(matrix(moveTiles(board([input!]), 'left').tiles)[0], expected)
})

test('right, up and down traverse from the correct edge', () => {
  assert.deepEqual(matrix(moveTiles(board([[2, 2, 2, 0]]), 'right').tiles)[0], [0, 0, 2, 4])
  const vertical = board([[2], [2], [2], [2]])
  assert.deepEqual(
    matrix(moveTiles(vertical, 'up').tiles).map((row) => row[0]),
    [4, 4, 0, 0],
  )
  assert.deepEqual(
    matrix(moveTiles(vertical, 'down').tiles).map((row) => row[0]),
    [0, 0, 4, 4],
  )
})

test('invalid move does not spawn, change state, consume undo or call RNG', () => {
  const state = fixture([[2, 4, 8, 16]])
  const before = JSON.stringify(state)
  const result = playTurn(state, 'left', () => {
    throw Error('RNG must not be called')
  })
  assert.equal(result, null)
  assert.equal(JSON.stringify(state), before)
})

test('spawn uses empty cells and the exact 90/10 probability boundary', () => {
  const tiles = board([[2, 4, 8, 16]])
  for (const [sample, value] of [
    [0, 2],
    [0.899999, 2],
    [0.9, 4],
    [0.999999, 4],
  ]) {
    let call = 0
    const result = spawnTile(tiles, 5, () => (++call === 1 ? 0 : sample!))
    assert.equal(result.tiles[result.tiles.length - 1]?.value, value)
    assert.equal(result.tiles[result.tiles.length - 1]?.row, 1)
    assert.equal(result.nextId, 6)
  }
})

test('new game contains exactly two unique tiles and resets the undo allowance', () => {
  const state = newGame({ bestScore: 100, unlocked: [2, 4, 8] }, () => 0)
  assert.equal(state.tiles.length, 2)
  assert.equal(state.score, 0)
  assert.equal(state.undoUsed, false)
  assert.equal(state.previous, null)
  assert.equal(state.bestScore, 100)
  assert.deepEqual(state.unlocked, [2, 4, 8])
  assert.equal(new Set(state.tiles.map((t) => `${t.row},${t.col}`)).size, 2)
})

test('game over requires a full board and no horizontal or vertical matching neighbors', () => {
  const rows = [
    [2, 4, 2, 4],
    [4, 2, 4, 2],
    [2, 4, 2, 4],
    [4, 2, 4, 2],
  ]
  assert.equal(canMove(board(rows)), false)
  const horizontal = structuredClone(rows)
  horizontal[3]![2] = 2
  assert.equal(canMove(board(horizontal)), true)
  const vertical = structuredClone(rows)
  vertical[3]![3] = 4
  assert.equal(canMove(board(vertical)), true)
  const empty = structuredClone(rows)
  empty[3]![3] = 0
  assert.equal(canMove(board(empty)), true)
})

test('the tile spawned by a valid move can end the game', () => {
  const state = fixture([
    [4, 2, 4, 2],
    [2, 4, 2, 4],
    [4, 2, 4, 2],
    [4, 2, 4, 0],
  ])
  const turn = playTurn(state, 'right', () => 0)!
  assert.equal(turn.state.over, true)
  assert.equal(turn.state.tiles.length, 16)
  assert.equal(playTurn(turn.state, 'left'), null)
  assert.equal(undoTurn(turn.state)?.over, false)
})

test('score, all-time best and collection update only as appropriate', () => {
  const state = fixture([[4, 4, 2, 2]])
  const turn = playTurn(state, 'left', () => 0)!
  assert.equal(turn.state.score, 12)
  assert.equal(turn.state.bestScore, 12)
  assert.deepEqual(turn.state.unlocked, [2, 4, 8])
  const undone = undoTurn(turn.state)!
  assert.equal(undone.score, 0)
  assert.equal(undone.bestScore, 12)
  assert.deepEqual(undone.unlocked, [2, 4, 8])
  assert.deepEqual(undone.tiles, state.tiles)
  assert.equal(undone.nextId, state.nextId)
  assert.equal(undoTurn(undone), null)
  assert.equal(playTurn(undone, 'left', () => 0)!.state.previous, null)
})

test('2048 celebrates once after acknowledgment, while 4096 continues normally', () => {
  const state = fixture([[1024, 1024, 0, 0]])
  const win = playTurn(state, 'left', () => 0)!.state
  assert.equal(win.hasWon, true)
  assert.equal(win.winAcknowledged, false)
  const resumed = playTurn({ ...win, winAcknowledged: true }, 'right', () => 0)!.state
  assert.equal(resumed.winAcknowledged, true)
  assert.equal(resumed.over, false)
  const beyond = playTurn(fixture([[2048, 2048, 0, 0]]), 'left', () => 0)!.state
  assert.equal(beyond.tiles[0]?.value, 4096)
  assert.equal(beyond.score, 4096)
  assert.equal(undoTurn(win)?.hasWon, false)
})

test('save/reload preserves board, score, best, collection, undo snapshot and win state', () => {
  const storage = memoryStorage()
  const state = playTurn(fixture([[4, 4, 2, 2]]), 'left', () => 0)!.state
  assert.equal(saveGame(storage, state), true)
  assert.deepEqual(loadGame(storage), { state, status: 'ok' })
  const undone = undoTurn(loadGame(storage).state!)!
  saveGame(storage, undone)
  assert.equal(loadGame(storage).state?.undoUsed, true)
  assert.equal(undoTurn(loadGame(storage).state!), null)
  const ended = fixture([
    [2, 4, 2, 4],
    [4, 2, 4, 2],
    [2, 4, 2, 4],
    [4, 2, 4, 2],
  ])
  saveGame(storage, ended)
  assert.equal(loadGame(storage).state?.over, true)
})

test('corrupt JSON, duplicate positions, malformed snapshot and storage denial are handled', () => {
  const storage = memoryStorage()
  assert.equal(loadGame(storage).status, 'empty')
  for (const raw of [
    '{',
    'null',
    JSON.stringify({ version: 9 }),
    JSON.stringify({ ...newGame(undefined, () => 0), previous: {} }),
  ]) {
    storage.setItem(STORAGE_KEY, raw)
    assert.equal(loadGame(storage).status, 'corrupt')
  }
  const invalid = newGame(undefined, () => 0)
  invalid.tiles[1] = { ...invalid.tiles[0]! }
  storage.setItem(STORAGE_KEY, JSON.stringify(invalid))
  assert.equal(loadGame(storage).status, 'corrupt')
  const denied: StoragePort = {
    getItem() {
      throw Error('denied')
    },
    setItem() {
      throw Error('full')
    },
  }
  assert.equal(loadGame(denied).status, 'unavailable')
  assert.equal(saveGame(denied, newGame()), false)
})

test('swipes reject taps and map all four directions by their dominant axis', () => {
  assert.equal(swipeDirection(10, 20), null)
  assert.equal(swipeDirection(23, 0), null)
  assert.equal(swipeDirection(24, 0), 'right')
  assert.equal(swipeDirection(-50, 10), 'left')
  assert.equal(swipeDirection(10, -90), 'up')
  assert.equal(swipeDirection(20, 90), 'down')
})

test('500 deterministic random boards preserve tile mass, unique positions and merge accounting', () => {
  let seed = 42
  const random = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32
  for (let i = 0; i < 500; i++) {
    const rows = Array.from({ length: 4 }, () =>
      Array.from({ length: 4 }, () => (random() < 0.25 ? 0 : 2 ** (1 + Math.floor(random() * 6)))),
    )
    const tiles = board(rows)
    for (const direction of ['up', 'down', 'left', 'right'] as Direction[]) {
      const moved = moveTiles(tiles, direction)
      assert.equal(
        moved.tiles.reduce((sum, t) => sum + t.value, 0),
        tiles.reduce((sum, t) => sum + t.value, 0),
      )
      assert.equal(new Set(moved.tiles.map((t) => `${t.row},${t.col}`)).size, moved.tiles.length)
      assert.equal(new Set(moved.tiles.map((t) => t.id)).size, moved.tiles.length)
      assert.equal(tiles.length - moved.tiles.length, moved.mergedIds.length)
      assert.equal(
        moved.scoreDelta,
        moved.tiles
          .filter((t) => moved.mergedIds.includes(t.id))
          .reduce((sum, t) => sum + t.value, 0),
      )
      assert.ok(moved.tiles.every((t) => t.row >= 0 && t.row <= 3 && t.col >= 0 && t.col <= 3))
    }
  }
})

test('20 full games terminate correctly and can restart with their collection intact', () => {
  let seed = 311
  const random = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32
  const directions: Direction[] = ['up', 'left', 'down', 'right']
  for (let game = 0; game < 20; game++) {
    let state = newGame(undefined, random)
    let attempts = 0
    while (!state.over && attempts < 20000) {
      const result = playTurn(state, directions[Math.floor(random() * 4)]!, random)
      if (result) state = result.state
      attempts++
    }
    assert.ok(state.over, `game ${game} did not terminate`)
    assert.equal(canMove(state.tiles), false)
    assert.equal(state.tiles.length, 16)
    const fresh = newGame(state, random)
    assert.equal(fresh.bestScore, state.bestScore)
    assert.ok(state.unlocked.every((value) => fresh.unlocked.includes(value)))
  }
})
