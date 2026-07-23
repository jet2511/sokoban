import fs from 'fs';

const content = fs.readFileSync('src/data/levels/microban.ts', 'utf8');

// Regex to extract all xsb blocks and names
const levelRegex = /id:\s*['"]([^'"]+)['"][\s\S]*?name:\s*['"]([^'"]+)['"][\s\S]*?xsb:\s*`([^`]+)`/g;

let match;
const levels = [];
while ((match = levelRegex.exec(content)) !== null) {
  levels.push({ id: match[1], name: match[2], xsb: match[3] });
}

console.log(`Found ${levels.length} levels in microban.ts.\n`);

function solveSokoban(rawXsb) {
  const lines = rawXsb.trim().split('\n');
  let height = lines.length;
  let width = Math.max(...lines.map(l => l.length));

  let playerPos = null;
  let targets = new Set();
  let boxes = [];

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
    return { solvable: false, reason: `Lệch số lượng: ${boxes.length} thùng vs ${targets.size} đích` };
  }

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

  let maxIterations = 80000;
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
        const newKey = keyOf(nextP, b);
        if (!visited.has(newKey)) {
          visited.add(newKey);
          queue.push({ p: nextP, b, steps: steps + 1 });
        }
      } else {
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
    return { solvable: false, reason: 'Quá giới hạn tìm kiếm (Map quá phức tạp hoặc kẹt)' };
  }
  return { solvable: false, reason: 'Bị kẹt góc / Không có đường thắng' };
}

levels.forEach(level => {
  const res = solveSokoban(level.xsb);
  const mark = res.solvable ? '✅ OK' : '❌ KHÔNG THỂ THẮNG';
  console.log(`[${level.id}] ${level.name}: ${mark} -> ${res.solvable ? `${res.steps} bước` : res.reason}`);
});
