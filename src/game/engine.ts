/** Pure, renderer-independent 2048 rules. Coordinates are zero-based. */
export type Direction = 'up' | 'down' | 'left' | 'right'
export interface Tile {
  id: number
  value: number
  row: number
  col: number
}
export type Random = () => number
export const SIZE = 4

export function copyTiles(tiles: Tile[]): Tile[] {
  return tiles.map((tile) => ({ ...tile }))
}

export function canMove(tiles: Tile[]): boolean {
  if (tiles.length < SIZE * SIZE) return true
  return tiles.some((tile) =>
    tiles.some(
      (other) =>
        other.value === tile.value &&
        Math.abs(other.row - tile.row) + Math.abs(other.col - tile.col) === 1,
    ),
  )
}

export function spawnTile(tiles: Tile[], nextId: number, random: Random = Math.random) {
  const empty: { row: number; col: number }[] = []
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (!tiles.some((tile) => tile.row === row && tile.col === col)) empty.push({ row, col })
    }
  }
  if (!empty.length) return { tiles: copyTiles(tiles), nextId, spawnedId: null }
  const position = empty[Math.min(empty.length - 1, Math.floor(random() * empty.length))]!
  const tile = { ...position, value: random() < 0.9 ? 2 : 4, id: nextId }
  return { tiles: [...copyTiles(tiles), tile], nextId: nextId + 1, spawnedId: tile.id }
}

/** Each source pair is consumed once, so [2,2,2,2] becomes [4,4,0,0].
 * motionTiles includes consumed tiles, allowing the UI to animate both gems.
 */
export function moveTiles(tiles: Tile[], direction: Direction) {
  const result: Tile[] = []
  const motionTiles: Tile[] = []
  const mergedIds: number[] = []
  let scoreDelta = 0
  const vertical = direction === 'up' || direction === 'down'
  const reverse = direction === 'right' || direction === 'down'
  for (let line = 0; line < SIZE; line++) {
    const sources = tiles
      .filter((tile) => (vertical ? tile.col : tile.row) === line)
      .sort((a, b) => (vertical ? a.row - b.row : a.col - b.col) * (reverse ? -1 : 1))
    let destination = 0
    for (let i = 0; i < sources.length; i++) {
      const source = sources[i]!
      const position = reverse ? SIZE - 1 - destination : destination
      const target = vertical ? { row: position, col: line } : { row: line, col: position }
      const moved = { ...source, ...target }
      motionTiles.push(moved)
      const neighbor = sources[i + 1]
      // Keep values safe even in exceptionally long continued games.
      if (neighbor?.value === source.value && Number.isSafeInteger(source.value * 2)) {
        motionTiles.push({ ...neighbor, ...target })
        result.push({ ...moved, value: source.value * 2 })
        mergedIds.push(source.id)
        scoreDelta += source.value * 2
        i++
      } else {
        result.push(moved)
      }
      destination++
    }
  }
  const moved =
    mergedIds.length > 0 ||
    motionTiles.some((tile) => {
      const original = tiles.find((item) => item.id === tile.id)!
      return tile.row !== original.row || tile.col !== original.col
    })
  return { tiles: result, motionTiles, mergedIds, scoreDelta, moved }
}
