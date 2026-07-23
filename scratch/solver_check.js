import { MICROBAN_LEVELS } from './src/data/levels/microban.ts';
import { XsbLevelParser } from './src/parser/XsbLevelParser.ts';
import { TileType } from './src/domain/types.ts';

console.log('🔍 Checking all 36 Microban levels for validity...\n');

MICROBAN_LEVELS.forEach((level, idx) => {
  const grid = XsbLevelParser.parse(level.xsb);
  let boxes = 0;
  let targets = 0;
  let players = 0;

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const tile = grid[y][x];
      if (tile === TileType.Box) boxes++;
      if (tile === TileType.Target) targets++;
      if (tile === TileType.BoxOnTarget) { boxes++; targets++; }
      if (tile === TileType.Player) players++;
      if (tile === TileType.PlayerOnTarget) { players++; targets++; }
    }
  }

  const isValidCounts = (boxes === targets) && (players === 1) && (boxes > 0);
  const status = isValidCounts ? '✅ OK' : '❌ INVALID';
  console.log(`Level ${level.id} (${level.name}): Boxes=${boxes}, Targets=${targets}, Players=${players} -> ${status}`);
});
