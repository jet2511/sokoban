import Phaser from 'phaser';
import { TileType, Direction, Position, MoveActionDelta, LevelData, GameMode } from '../domain/types';
import { SokobanPathfinder } from '../navigation/SokobanPathfinder';
import { RetroSoundSynthesizer } from '../audio/RetroSoundSynthesizer';
import { LevelStorageRepository } from '../repository/LevelStorageRepository';
import { DEFAULT_LEVELS } from '../data/defaultLevels';

export class GameScene extends Phaser.Scene {
  private soundSynth = RetroSoundSynthesizer.getInstance();

  private levelData!: LevelData;
  private mode: GameMode = GameMode.Standard;
  private grid: TileType[][] = [];
  private playerPos: Position = { x: 0, y: 0 };
  private totalTargets: number = 0;

  // Render Objects
  private tileSize: number = 48;
  private tileMapSprites: Phaser.GameObjects.Sprite[][] = [];
  private playerSprite!: Phaser.GameObjects.Sprite;
  private boardOffsetX: number = 0;
  private boardOffsetY: number = 0;

  // State & History
  private stepsCount: number = 0;
  private elapsedTime: number = 0;
  private timerEvent: Phaser.Time.TimerEvent | null = null;
  private undoStack: MoveActionDelta[] = [];
  private redoStack: MoveActionDelta[] = [];
  private isAutoMoving: boolean = false;
  private isGameFinished: boolean = false;

  // Input Listeners
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };

  constructor() {
    super('GameScene');
  }

  init(data: { levelData: LevelData; mode?: GameMode }) {
    this.levelData = data.levelData;
    this.mode = data.mode || GameMode.Standard;
    this.stepsCount = 0;
    this.elapsedTime = 0;
    this.undoStack = [];
    this.redoStack = [];
    this.isAutoMoving = false;
    this.isGameFinished = false;

    // Deep copy grid matrix
    this.grid = this.levelData.grid.map(row => [...row]);
    this.totalTargets = 0;

    // Find player position & target count
    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        const tile = this.grid[y][x];
        if (tile === TileType.Player || tile === TileType.PlayerOnTarget) {
          this.playerPos = { x, y };
        }
        if (tile === TileType.Target || tile === TileType.BoxOnTarget || tile === TileType.PlayerOnTarget) {
          this.totalTargets++;
        }
      }
    }
  }

  create() {
    const { width, height } = this.scale;

    // Solid background fill to clear previous scene graphics
    const bgGraphics = this.add.graphics();
    bgGraphics.fillStyle(0x121824, 1);
    bgGraphics.fillRect(0, 0, width, height);

    // Decorative subtle retro grid
    bgGraphics.lineStyle(1, 0x1e2638, 0.4);
    for (let x = 0; x < width; x += 32) {
      bgGraphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 32) {
      bgGraphics.lineBetween(0, y, width, y);
    }

    this.setupBoardDimensions();

    this.renderBoard();
    this.setupInputListeners();
    this.setupHTMLOverlay();

    // Start timer
    if (this.timerEvent) this.timerEvent.destroy();
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: () => {
        if (!this.isGameFinished) {
          this.elapsedTime++;
          this.updateHUD();
        }
      },
      loop: true
    });

    this.updateHUD();
  }

  private setupBoardDimensions() {
    const { width, height } = this.scale;

    // Dynamic tile size fitting screen
    const maxTileW = Math.floor((width - 60) / this.levelData.width);
    const maxTileH = Math.floor((height - 160) / this.levelData.height);
    this.tileSize = Math.max(24, Math.min(64, Math.min(maxTileW, maxTileH)));

    const boardWidth = this.levelData.width * this.tileSize;
    const boardHeight = this.levelData.height * this.tileSize;

    this.boardOffsetX = Math.floor((width - boardWidth) / 2);
    this.boardOffsetY = Math.floor((height - boardHeight) / 2) + 20;
  }

  private renderBoard() {
    this.tileMapSprites = [];

    for (let y = 0; y < this.grid.length; y++) {
      const rowSprites: Phaser.GameObjects.Sprite[] = [];
      for (let x = 0; x < this.grid[y].length; x++) {
        const posX = this.boardOffsetX + x * this.tileSize + this.tileSize / 2;
        const posY = this.boardOffsetY + y * this.tileSize + this.tileSize / 2;

        // Render floor as base tile
        const floorSprite = this.add.sprite(posX, posY, 'floor');
        floorSprite.setDisplaySize(this.tileSize, this.tileSize);

        const tileType = this.grid[y][x];
        const textureName = this.getTextureForTile(tileType);

        const tileSprite = this.add.sprite(posX, posY, textureName);
        tileSprite.setDisplaySize(this.tileSize, this.tileSize);
        tileSprite.setInteractive();

        // Click-to-move tile handler
        const currentX = x;
        const currentY = y;
        tileSprite.on('pointerdown', () => {
          this.handleTileClick(currentX, currentY);
        });

        rowSprites.push(tileSprite);

        // Keep reference to player sprite separately for smooth movement animation
        if (tileType === TileType.Player || tileType === TileType.PlayerOnTarget) {
          this.playerSprite = tileSprite;
        }
      }
      this.tileMapSprites.push(rowSprites);
    }
  }

  private getTextureForTile(tile: TileType): string {
    switch (tile) {
      case TileType.Wall: return 'wall';
      case TileType.Target: return 'target';
      case TileType.Box: return 'box';
      case TileType.BoxOnTarget: return 'box_target';
      case TileType.Player:
      case TileType.PlayerOnTarget: return 'player';
      case TileType.Empty:
      default: return 'floor';
    }
  }

  private setupInputListeners() {
    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.wasdKeys = {
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
      };

      // Direct key presses
      this.input.keyboard.on('keydown', (event: KeyboardEvent) => {
        if (this.isGameFinished || this.isAutoMoving) return;

        if (event.code === 'KeyZ' && (event.ctrlKey || event.metaKey)) {
          this.undo();
          return;
        }
        if (event.code === 'KeyY' && (event.ctrlKey || event.metaKey)) {
          this.redo();
          return;
        }
        if (event.code === 'KeyR') {
          this.resetLevel();
          return;
        }

        let dir: Direction | null = null;
        if (event.code === 'ArrowUp' || event.code === 'KeyW') dir = Direction.Up;
        if (event.code === 'ArrowDown' || event.code === 'KeyS') dir = Direction.Down;
        if (event.code === 'ArrowLeft' || event.code === 'KeyA') dir = Direction.Left;
        if (event.code === 'ArrowRight' || event.code === 'KeyD') dir = Direction.Right;

        if (dir) {
          this.movePlayer(dir);
        }
      });
    }

    // HTML D-Pad Touch Listeners
    this.bindDPadButton('dpad-up', Direction.Up);
    this.bindDPadButton('dpad-down', Direction.Down);
    this.bindDPadButton('dpad-left', Direction.Left);
    this.bindDPadButton('dpad-right', Direction.Right);
  }

  private bindDPadButton(elementId: string, dir: Direction) {
    const btn = document.getElementById(elementId);
    if (btn) {
      btn.onclick = (e) => {
        e.preventDefault();
        if (!this.isGameFinished && !this.isAutoMoving) {
          this.movePlayer(dir);
        }
      };
    }
  }

  private setupHTMLOverlay() {
    const header = document.getElementById('game-header');
    if (header) {
      header.classList.remove('hidden');
      const titleElem = document.getElementById('level-title');
      if (titleElem) titleElem.innerText = this.levelData.name;
    }

    const controls = document.getElementById('game-controls-overlay');
    if (controls) controls.classList.remove('hidden');

    const dpad = document.getElementById('dpad-overlay');
    if (dpad) dpad.classList.remove('hidden');

    // Header buttons
    const btnBack = document.getElementById('btn-back');
    if (btnBack) {
      btnBack.onclick = () => {
        this.soundSynth.playClick();
        this.scene.start('LevelSelectScene');
      };
    }

    const btnSound = document.getElementById('btn-sound');
    if (btnSound) {
      btnSound.onclick = () => {
        const isMuted = this.soundSynth.toggleMute();
        const icon = document.getElementById('sound-icon');
        if (icon) icon.innerText = isMuted ? '🔇' : '🔊';
      };
    }

    // Control buttons
    const btnUndo = document.getElementById('btn-undo');
    if (btnUndo) {
      btnUndo.onclick = () => this.undo();
    }

    const btnRedo = document.getElementById('btn-redo');
    if (btnRedo) {
      btnRedo.onclick = () => this.redo();
    }

    const btnReset = document.getElementById('btn-reset');
    if (btnReset) {
      btnReset.onclick = () => this.resetLevel();
    }

    // Modal buttons
    const modal = document.getElementById('modal-win');
    if (modal) modal.classList.add('hidden');

    const btnRestartWin = document.getElementById('btn-restart-win');
    if (btnRestartWin) {
      btnRestartWin.onclick = () => {
        this.soundSynth.playClick();
        if (modal) modal.classList.add('hidden');
        this.scene.restart();
      };
    }

    const btnNextLevel = document.getElementById('btn-next-level');
    if (btnNextLevel) {
      btnNextLevel.onclick = () => {
        this.soundSynth.playClick();
        if (modal) modal.classList.add('hidden');
        this.loadNextLevel();
      };
    }
  }

  private handleTileClick(tx: number, ty: number) {
    if (this.isGameFinished || this.isAutoMoving) return;

    // Use SokobanPathfinder BFS to find shortest route
    const path = SokobanPathfinder.findPath(this.grid, this.playerPos, { x: tx, y: ty });
    if (path && path.length > 0) {
      this.executeAutoPath(path);
    }
  }

  private executeAutoPath(path: Direction[]) {
    this.isAutoMoving = true;
    let stepIndex = 0;

    const timer = this.time.addEvent({
      delay: 70, // Smooth rapid steps
      callback: () => {
        if (stepIndex < path.length && !this.isGameFinished) {
          this.movePlayer(path[stepIndex]);
          stepIndex++;
        } else {
          timer.destroy();
          this.isAutoMoving = false;
        }
      },
      loop: true
    });
  }

  public movePlayer(dir: Direction): boolean {
    const delta = this.getDirectionDelta(dir);
    const targetX = this.playerPos.x + delta.x;
    const targetY = this.playerPos.y + delta.y;

    if (targetY < 0 || targetY >= this.grid.length || targetX < 0 || targetX >= this.grid[0].length) {
      return false;
    }

    const targetTile = this.grid[targetY][targetX];

    // Case 1: Target is Wall -> Blocked
    if (targetTile === TileType.Wall) {
      return false;
    }

    let pushedBoxFrom: Position | undefined;
    let pushedBoxTo: Position | undefined;
    let wasBoxOnTargetBefore = false;
    let isBoxOnTargetAfter = false;

    // Case 2: Target is Box or BoxOnTarget -> Try pushing box
    if (targetTile === TileType.Box || targetTile === TileType.BoxOnTarget) {
      const boxTargetX = targetX + delta.x;
      const boxTargetY = targetY + delta.y;

      if (boxTargetY < 0 || boxTargetY >= this.grid.length || boxTargetX < 0 || boxTargetX >= this.grid[0].length) {
        return false;
      }

      const boxTargetTile = this.grid[boxTargetY][boxTargetX];

      // Box can only be pushed into Empty floor or Target tile
      if (boxTargetTile !== TileType.Empty && boxTargetTile !== TileType.Target) {
        return false;
      }

      pushedBoxFrom = { x: targetX, y: targetY };
      pushedBoxTo = { x: boxTargetX, y: boxTargetY };
      wasBoxOnTargetBefore = targetTile === TileType.BoxOnTarget;
      isBoxOnTargetAfter = boxTargetTile === TileType.Target;

      // Update box new position
      this.grid[boxTargetY][boxTargetX] = isBoxOnTargetAfter ? TileType.BoxOnTarget : TileType.Box;
      this.updateTileSprite(boxTargetX, boxTargetY);

      if (isBoxOnTargetAfter) {
        this.soundSynth.playTarget();
      } else {
        this.soundSynth.playPush();
      }
    } else {
      this.soundSynth.playMove();
    }

    // Case 3: Move player to new position
    const prevPlayerPos = { ...this.playerPos };
    const isPlayerTargetBefore = this.grid[prevPlayerPos.y][prevPlayerPos.x] === TileType.PlayerOnTarget;
    this.grid[prevPlayerPos.y][prevPlayerPos.x] = isPlayerTargetBefore ? TileType.Target : TileType.Empty;
    this.updateTileSprite(prevPlayerPos.x, prevPlayerPos.y);

    const isPlayerTargetAfter = targetTile === TileType.Target || targetTile === TileType.BoxOnTarget;
    this.grid[targetY][targetX] = isPlayerTargetAfter ? TileType.PlayerOnTarget : TileType.Player;
    this.playerPos = { x: targetX, y: targetY };
    this.updateTileSprite(targetX, targetY);

    // Save step delta for Undo
    const actionDelta: MoveActionDelta = {
      playerFrom: prevPlayerPos,
      playerTo: { x: targetX, y: targetY },
      pushedBoxFrom,
      pushedBoxTo,
      wasBoxOnTargetBefore,
      isBoxOnTargetAfter
    };

    this.undoStack.push(actionDelta);
    this.redoStack = []; // Clear redo stack on new move
    this.stepsCount++;

    this.updateHUD();
    this.checkWinCondition();

    return true;
  }

  public undo(): void {
    if (this.undoStack.length === 0 || this.isGameFinished) return;

    const action = this.undoStack.pop()!;
    this.soundSynth.playUndo();

    // 1. Revert player
    const currPlayerTile = this.grid[action.playerTo.y][action.playerTo.x];
    const playerOnTargetTo = currPlayerTile === TileType.PlayerOnTarget;
    this.grid[action.playerTo.y][action.playerTo.x] = playerOnTargetTo ? TileType.Target : TileType.Empty;
    this.updateTileSprite(action.playerTo.x, action.playerTo.y);

    const playerTileFrom = this.grid[action.playerFrom.y][action.playerFrom.x];
    const playerOnTargetFrom = playerTileFrom === TileType.Target;
    this.grid[action.playerFrom.y][action.playerFrom.x] = playerOnTargetFrom ? TileType.PlayerOnTarget : TileType.Player;
    this.playerPos = { ...action.playerFrom };
    this.updateTileSprite(action.playerFrom.x, action.playerFrom.y);

    // 2. Revert box if pushed
    if (action.pushedBoxFrom && action.pushedBoxTo) {
      const currBoxTile = this.grid[action.pushedBoxTo.y][action.pushedBoxTo.x];
      const isBoxTargetTo = currBoxTile === TileType.BoxOnTarget;
      this.grid[action.pushedBoxTo.y][action.pushedBoxTo.x] = isBoxTargetTo ? TileType.Target : TileType.Empty;
      this.updateTileSprite(action.pushedBoxTo.x, action.pushedBoxTo.y);

      const restoreBoxTile = action.wasBoxOnTargetBefore ? TileType.BoxOnTarget : TileType.Box;
      this.grid[action.pushedBoxFrom.y][action.pushedBoxFrom.x] = restoreBoxTile;
      this.updateTileSprite(action.pushedBoxFrom.x, action.pushedBoxFrom.y);
    }

    this.redoStack.push(action);
    this.stepsCount++; // Undo counts as step
    this.updateHUD();
  }

  public redo(): void {
    if (this.redoStack.length === 0 || this.isGameFinished) return;

    const action = this.redoStack.pop()!;
    this.soundSynth.playMove();

    // Re-apply player move & box push
    if (action.pushedBoxFrom && action.pushedBoxTo) {
      this.grid[action.pushedBoxTo.y][action.pushedBoxTo.x] = action.isBoxOnTargetAfter ? TileType.BoxOnTarget : TileType.Box;
      this.updateTileSprite(action.pushedBoxTo.x, action.pushedBoxTo.y);
    }

    const prevPlayerTile = this.grid[action.playerFrom.y][action.playerFrom.x];
    this.grid[action.playerFrom.y][action.playerFrom.x] = prevPlayerTile === TileType.PlayerOnTarget ? TileType.Target : TileType.Empty;
    this.updateTileSprite(action.playerFrom.x, action.playerFrom.y);

    const targetTile = this.grid[action.playerTo.y][action.playerTo.x];
    const isPlayerTargetAfter = targetTile === TileType.Target || targetTile === TileType.BoxOnTarget;
    this.grid[action.playerTo.y][action.playerTo.x] = isPlayerTargetAfter ? TileType.PlayerOnTarget : TileType.Player;
    this.playerPos = { ...action.playerTo };
    this.updateTileSprite(action.playerTo.x, action.playerTo.y);

    this.undoStack.push(action);
    this.stepsCount++;
    this.updateHUD();
    this.checkWinCondition();
  }

  private resetLevel() {
    this.soundSynth.playClick();
    this.scene.restart();
  }

  private updateTileSprite(x: number, y: number) {
    if (y < 0 || y >= this.tileMapSprites.length || x < 0 || x >= this.tileMapSprites[y].length) return;
    const tileType = this.grid[y][x];
    const textureName = this.getTextureForTile(tileType);
    this.tileMapSprites[y][x].setTexture(textureName);
  }

  private getDirectionDelta(dir: Direction): Position {
    switch (dir) {
      case Direction.Up: return { x: 0, y: -1 };
      case Direction.Down: return { x: 0, y: 1 };
      case Direction.Left: return { x: -1, y: 0 };
      case Direction.Right: return { x: 1, y: 0 };
    }
  }

  private countBoxesOnTarget(): number {
    let count = 0;
    for (let y = 0; y < this.grid.length; y++) {
      for (let x = 0; x < this.grid[y].length; x++) {
        if (this.grid[y][x] === TileType.BoxOnTarget) {
          count++;
        }
      }
    }
    return count;
  }

  private updateHUD() {
    const stepsElem = document.getElementById('stat-steps');
    if (stepsElem) stepsElem.innerText = this.stepsCount.toString();

    const timeElem = document.getElementById('stat-time');
    if (timeElem) {
      const mins = Math.floor(this.elapsedTime / 60).toString().padStart(2, '0');
      const secs = (this.elapsedTime % 60).toString().padStart(2, '0');
      timeElem.innerText = `${mins}:${secs}`;
    }

    const boxesElem = document.getElementById('stat-boxes');
    if (boxesElem) {
      boxesElem.innerText = `${this.countBoxesOnTarget()}/${this.totalTargets}`;
    }

    const undoCount = document.getElementById('undo-count');
    if (undoCount) undoCount.innerText = this.undoStack.length.toString();

    const redoCount = document.getElementById('redo-count');
    if (redoCount) redoCount.innerText = this.redoStack.length.toString();
  }

  private checkWinCondition() {
    if (this.countBoxesOnTarget() === this.totalTargets && this.totalTargets > 0) {
      this.isGameFinished = true;
      this.soundSynth.playWin();

      // Particle effect celebration
      const { width, height } = this.scale;
      const emitter = this.add.particles(width / 2, height / 2, 'target', {
        speed: { min: 150, max: 350 },
        scale: { start: 0.8, end: 0 },
        blendMode: 'ADD',
        lifespan: 1200,
        gravityY: 200,
        quantity: 30
      });

      this.time.delayedCall(400, () => {
        emitter.stop();
        this.showWinModal();
      });
    }
  }

  private showWinModal() {
    // Star rating
    const par = this.levelData.parSteps || 20;
    let stars = 1;
    if (this.stepsCount <= par) {
      stars = 3;
    } else if (this.stepsCount <= Math.floor(par * 1.4)) {
      stars = 2;
    }

    // Save progress
    const progress = LevelStorageRepository.getLevelProgress(this.levelData.id);
    const nextLevel = this.findNextLevelId();
    LevelStorageRepository.saveLevelProgress(
      this.levelData.id,
      this.stepsCount,
      this.elapsedTime,
      stars,
      nextLevel
    );

    const modal = document.getElementById('modal-win');
    if (modal) modal.classList.remove('hidden');

    const winSteps = document.getElementById('win-steps');
    if (winSteps) winSteps.innerText = this.stepsCount.toString();

    const winBestSteps = document.getElementById('win-best-steps');
    if (winBestSteps) {
      winBestSteps.innerText = (progress.bestSteps ? Math.min(progress.bestSteps, this.stepsCount) : this.stepsCount).toString();
    }

    const winTime = document.getElementById('win-time');
    if (winTime) {
      const mins = Math.floor(this.elapsedTime / 60).toString().padStart(2, '0');
      const secs = (this.elapsedTime % 60).toString().padStart(2, '0');
      winTime.innerText = `${mins}:${secs}`;
    }

    const winStarsContainer = document.getElementById('win-stars');
    if (winStarsContainer) {
      winStarsContainer.innerHTML = 
        `<span class="star ${stars >= 1 ? 'lit' : ''}">★</span>` +
        `<span class="star ${stars >= 2 ? 'lit' : ''}">★</span>` +
        `<span class="star ${stars >= 3 ? 'lit' : ''}">★</span>`;
    }
  }

  private findNextLevelId(): string | undefined {
    const idx = DEFAULT_LEVELS.findIndex(l => l.id === this.levelData.id);
    if (idx >= 0 && idx < DEFAULT_LEVELS.length - 1) {
      return DEFAULT_LEVELS[idx + 1].id;
    }
    return undefined;
  }

  private loadNextLevel() {
    const nextId = this.findNextLevelId();
    if (nextId) {
      const nextLevelData = DEFAULT_LEVELS.find(l => l.id === nextId);
      if (nextLevelData) {
        this.scene.restart({ levelData: nextLevelData, mode: GameMode.Standard });
        return;
      }
    }
    // If no next level, return to level select
    this.scene.start('LevelSelectScene');
  }
}
