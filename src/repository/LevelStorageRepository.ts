import { LevelProgress, LevelData } from '../domain/types';

const PROGRESS_KEY = 'sokoban_progress_v1';
const CUSTOM_LEVELS_KEY = 'sokoban_custom_levels_v1';

export class LevelStorageRepository {
  public static getProgressMap(): Record<string, LevelProgress> {
    try {
      const data = localStorage.getItem(PROGRESS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      console.error('Failed to load progress from localStorage', e);
      return {};
    }
  }

  public static getLevelProgress(levelId: string): LevelProgress {
    const map = this.getProgressMap();
    if (map[levelId]) {
      return map[levelId];
    }
    // Default progress for the first level of each chapter (unlocked by default)
    const firstLevelIds = ['mb_01', 'mb_13', 'mb_25', 'lvl_c1_1', 'lvl_c2_1', 'lvl_c3_1'];
    const isUnlockedByDefault = firstLevelIds.includes(levelId);
    return {
      levelId,
      unlocked: isUnlockedByDefault,
      completed: false,
      bestSteps: null,
      bestTime: null,
      stars: 0
    };
  }

  public static saveLevelProgress(
    levelId: string,
    steps: number,
    timeSeconds: number,
    stars: number,
    nextLevelId?: string
  ): void {
    const map = this.getProgressMap();
    const current = map[levelId] || {
      levelId,
      unlocked: true,
      completed: false,
      bestSteps: null,
      bestTime: null,
      stars: 0
    };

    current.completed = true;
    current.unlocked = true;
    current.stars = Math.max(current.stars, stars);

    if (current.bestSteps === null || steps < current.bestSteps) {
      current.bestSteps = steps;
    }
    if (current.bestTime === null || timeSeconds < current.bestTime) {
      current.bestTime = timeSeconds;
    }

    map[levelId] = current;

    // Unlock next level if provided
    if (nextLevelId) {
      const nextProgress = map[nextLevelId] || {
        levelId: nextLevelId,
        unlocked: false,
        completed: false,
        bestSteps: null,
        bestTime: null,
        stars: 0
      };
      nextProgress.unlocked = true;
      map[nextLevelId] = nextProgress;
    }

    try {
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(map));
    } catch (e) {
      console.error('Failed to save progress to localStorage', e);
    }
  }

  public static getCustomLevels(): LevelData[] {
    try {
      const data = localStorage.getItem(CUSTOM_LEVELS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to load custom levels', e);
      return [];
    }
  }

  public static saveCustomLevel(level: LevelData): void {
    const levels = this.getCustomLevels();
    const existingIdx = levels.findIndex(l => l.id === level.id);
    if (existingIdx >= 0) {
      levels[existingIdx] = level;
    } else {
      levels.push(level);
    }
    try {
      localStorage.setItem(CUSTOM_LEVELS_KEY, JSON.stringify(levels));
    } catch (e) {
      console.error('Failed to save custom level', e);
    }
  }

  public static deleteCustomLevel(levelId: string): void {
    let levels = this.getCustomLevels();
    levels = levels.filter(l => l.id !== levelId);
    try {
      localStorage.setItem(CUSTOM_LEVELS_KEY, JSON.stringify(levels));
    } catch (e) {
      console.error('Failed to delete custom level', e);
    }
  }
}
