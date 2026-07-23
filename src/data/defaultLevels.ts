import { LevelData } from '../domain/types';
import { XsbLevelParser } from '../parser/XsbLevelParser';
import { MICROBAN_LEVELS } from './levels/microban';

export const DEFAULT_LEVELS: LevelData[] = MICROBAN_LEVELS.map(raw => {
  const grid = XsbLevelParser.parse(raw.xsb);
  return {
    id: raw.id,
    chapter: raw.chapter,
    name: raw.name,
    grid,
    width: grid[0].length,
    height: grid.length,
    parSteps: raw.parSteps,
    author: raw.author
  };
});
