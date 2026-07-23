import { MICROBAN_LEVELS } from '../src/data/levels/microban.js';
import { XsbLevelParser } from '../src/parser/XsbLevelParser.js';

// BFS Solver to check solvability of small Sokoban levels
function solveSokoban(rawXsb) {
  const lines = rawXsb.trim().split('\n');
  let height = lines.length;
  let width = Math.max(...lines.map(l => l.length));

  let playerPos = null;
  let targets = new Set();
  let boxes = [];

  // Parse grid
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < lines[y].length; x++) {
      const char = lines[y][x];
      if (char === '@') playerPos = { x, y };
      if (char === '+') { playerPos = { x, y }; targets.add(`${x},${y}`); }
      if (char === '$') boxes.push({ x, y });
      if (char === '*') { boxes.push({ x, y }); targets.add(`${x},${y}`); }
      if (char === '.') targets.add(`${x},${y}`);
    }
  }

  if (boxes.length !== targets.size) {
    return { solvable: false, reason: `Mismatch: ${boxes.length} boxes vs ${targets.size} targets` };
  }

  // BFS State: "playerX,playerY|box1X,box1Y,box2X,box2Y..."
  const keyOf = (p, bList) => {
    const sortedBoxes = [...bList].map(b => `${b.x},${b.y}`).sort().join(';');
    return `${p.x},${p.y}|${sortedBoxes}`;
  };

  const isWall = (x, y) => {
    if (y < 0 || y >= height || x < 0 || x >= lines[y].length) return true;
    return lines[y][x] === '#';
  };

  const isWin = (bList) => bList.every(b => targets.has(`${b.x},${b.y}`));

  const queue = [{ p: playerPos, b: boxes, steps: 0 }];
  const visited = new Set([keyOf(playerPos, boxes)]);

  const DIRS = [
    { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }
  ];

  let maxIterations = 100000;
  let iterations = 0;

  while (queue.length > 0 && iterations < maxIterations) {
    iterations++;
    const { p, b, steps } = queue.shift();

    if (isWin(b)) {
      return { solvable: true, steps };
    }

    for (const dir of DIRS) {
      const nextP = { x: p.x + dir.x, y: p.y + dir.y };
      if (isWall(nextP.x, nextP.y)) continue;

      const boxIdx = b.findIndex(box => box.x === nextP.x && box.y === nextP.y);

      if (boxIdx === -1) {
        // Simple move
        const newKey = keyOf(nextP, b);
        if (!visited.has(newKey)) {
          visited.add(newKey);
          queue.push({ p: nextP, b, steps: steps + 1 });
        }
      } else {
        // Push box
        const nextBox = { x: nextP.x + dir.x, y: nextP.y + dir.y };
        if (isWall(nextBox.x, nextBox.y)) continue;
        if (b.some(box => box.x === nextBox.x && box.y === nextBox.y)) continue;

        const newBoxes = [...b];
        newBoxes[boxIdx] = nextBox;

        const newKey = keyOf(nextP, newBoxes);
        if (!visited.has(newKey)) {
          visited.add(newKey);
          queue.push({ p: nextP, b: newBoxes, steps: steps + 1 });
        }
      }
    }
  }

  if (iterations >= maxIterations) {
    return { solvable: false, reason: 'Search space limit reached' };
  }
  return { solvable: false, reason: 'Deadlock / No solution path' };
}

console.log('🔍 Checking solvability of all 36 Microban levels...\n');

MICROBAN_LEVELS.forEach((level, idx) => {
  const result = solveSokoban(level.xsb);
  const status = result.solvable ? `✅ SOLVABLE (${result.steps} steps)` : `❌ UNSOLVABLE (${result.reason})`;
  console.log(`[${level.id}] ${level.name} -> ${status}`);
});
