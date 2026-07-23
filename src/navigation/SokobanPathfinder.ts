import { TileType, Position, Direction } from '../domain/types';

export class SokobanPathfinder {
  /**
   * Finds the shortest walkable path for the player from start to target.
   * Player can only walk on empty floor or target tiles (not walls or boxes).
   * Returns array of Directions to reach the target, or null if un-reachable.
   */
  public static findPath(grid: TileType[][], start: Position, target: Position): Direction[] | null {
    if (start.x === target.x && start.y === target.y) return [];

    const height = grid.length;
    const width = grid[0].length;

    if (target.y < 0 || target.y >= height || target.x < 0 || target.x >= width) {
      return null;
    }

    const targetTile = grid[target.y][target.x];
    if (targetTile === TileType.Wall || targetTile === TileType.Box || targetTile === TileType.BoxOnTarget) {
      return null;
    }

    const queue: { pos: Position; path: Direction[] }[] = [{ pos: start, path: [] }];
    const visited = new Set<string>();
    visited.add(`${start.x},${start.y}`);

    const directions: { dir: Direction; delta: Position }[] = [
      { dir: Direction.Up, delta: { x: 0, y: -1 } },
      { dir: Direction.Down, delta: { x: 0, y: 1 } },
      { dir: Direction.Left, delta: { x: -1, y: 0 } },
      { dir: Direction.Right, delta: { x: 1, y: 0 } }
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;
      const { pos, path } = current;

      if (pos.x === target.x && pos.y === target.y) {
        return path;
      }

      for (const { dir, delta } of directions) {
        const nx = pos.x + delta.x;
        const ny = pos.y + delta.y;

        if (ny < 0 || ny >= height || nx < 0 || nx >= width) continue;

        const key = `${nx},${ny}`;
        if (visited.has(key)) continue;

        const tile = grid[ny][nx];
        // Player can walk on Empty (0), Target (2), Player (5), PlayerOnTarget (6)
        if (tile === TileType.Empty || tile === TileType.Target || tile === TileType.Player || tile === TileType.PlayerOnTarget) {
          visited.add(key);
          queue.push({
            pos: { x: nx, y: ny },
            path: [...path, dir]
          });
        }
      }
    }

    return null; // Path not found
  }
}
