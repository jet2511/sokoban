import { TileType } from '../domain/types';

export class XsbLevelParser {
  /**
   * Parses an ASCII XSB Sokoban string map into a 2D TileType matrix.
   */
  public static parse(xsbString: string): TileType[][] {
    const lines = xsbString.trimEnd().split(/\r?\n/);
    let maxWidth = 0;
    lines.forEach(line => {
      if (line.length > maxWidth) maxWidth = line.length;
    });

    const grid: TileType[][] = [];

    for (let y = 0; y < lines.length; y++) {
      const row: TileType[] = [];
      const line = lines[y];
      for (let x = 0; x < maxWidth; x++) {
        const char = x < line.length ? line[x] : ' ';
        row.push(this.charToTile(char));
      }
      grid.push(row);
    }

    return grid;
  }

  /**
   * Serializes a 2D TileType matrix into standard XSB string format.
   */
  public static serialize(grid: TileType[][]): string {
    const lines: string[] = [];

    for (let y = 0; y < grid.length; y++) {
      let line = '';
      for (let x = 0; x < grid[y].length; x++) {
        line += this.tileToChar(grid[y][x]);
      }
      lines.push(line);
    }

    return lines.join('\n');
  }

  private static charToTile(char: string): TileType {
    switch (char) {
      case '#': return TileType.Wall;
      case '@': return TileType.Player;
      case '+': return TileType.PlayerOnTarget;
      case '$': return TileType.Box;
      case '*': return TileType.BoxOnTarget;
      case '.': return TileType.Target;
      case ' ':
      case '_':
      default:
        return TileType.Empty;
    }
  }

  private static tileToChar(tile: TileType): string {
    switch (tile) {
      case TileType.Wall: return '#';
      case TileType.Player: return '@';
      case TileType.PlayerOnTarget: return '+';
      case TileType.Box: return '$';
      case TileType.BoxOnTarget: return '*';
      case TileType.Target: return '.';
      case TileType.Empty:
      default:
        return ' ';
    }
  }
}
