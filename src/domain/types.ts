export enum TileType {
  Empty = 0,
  Wall = 1,
  Target = 2,
  Box = 3,
  BoxOnTarget = 4,
  Player = 5,
  PlayerOnTarget = 6
}

export enum Direction {
  Up = 'UP',
  Down = 'DOWN',
  Left = 'LEFT',
  Right = 'RIGHT'
}

export interface Position {
  x: number;
  y: number;
}

export interface MoveActionDelta {
  playerFrom: Position;
  playerTo: Position;
  pushedBoxFrom?: Position;
  pushedBoxTo?: Position;
  wasBoxOnTargetBefore?: boolean;
  isBoxOnTargetAfter?: boolean;
}

export interface LevelData {
  id: string;
  chapter: number;
  name: string;
  grid: TileType[][];
  width: number;
  height: number;
  parSteps: number; // Target steps for 3 stars
  author?: string;
}

export interface LevelProgress {
  levelId: string;
  unlocked: boolean;
  completed: boolean;
  bestSteps: number | null;
  bestTime: number | null; // in seconds
  stars: number; // 0 to 3
}

export enum GameMode {
  Standard = 'STANDARD',
  Custom = 'CUSTOM'
}
