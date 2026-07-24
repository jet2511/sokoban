import Phaser from 'phaser';
import { TileType, LevelData, GameMode } from '../domain/types';
import { XsbLevelParser } from '../parser/XsbLevelParser';
import { LevelStorageRepository } from '../repository/LevelStorageRepository';
import { RetroSoundSynthesizer } from '../audio/RetroSoundSynthesizer';
import { RetroToast } from '../ui/RetroToast';

export class EditorScene extends Phaser.Scene {
  private soundSynth = RetroSoundSynthesizer.getInstance();

  private gridWidth: number = 10;
  private gridHeight: number = 8;
  private grid: TileType[][] = [];
  private selectedTileType: TileType = TileType.Wall;

  private tileSize: number = 40;
  private boardOffsetX: number = 0;
  private boardOffsetY: number = 0;
  private tileSprites: Phaser.GameObjects.Sprite[][] = [];
  private paletteButtons: { container: Phaser.GameObjects.Container; tileType: TileType; bg: Phaser.GameObjects.Graphics }[] = [];

  constructor() {
    super('EditorScene');
  }

  create() {
    const { width, height } = this.scale;

    // Initialize empty 10x8 level bounded by walls
    this.grid = [];
    for (let y = 0; y < this.gridHeight; y++) {
      const row: TileType[] = [];
      for (let x = 0; x < this.gridWidth; x++) {
        if (x === 0 || x === this.gridWidth - 1 || y === 0 || y === this.gridHeight - 1) {
          row.push(TileType.Wall);
        } else {
          row.push(TileType.Empty);
        }
      }
      this.grid.push(row);
    }

    // Header Title
    this.add.text(width / 2, 35, 'TRÌNH TẠO MÀN CHƠI (LEVEL EDITOR)', {
      fontFamily: 'Silkscreen, monospace',
      fontSize: '22px',
      color: '#ffd700'
    }).setOrigin(0.5);

    // Back Button
    const backBtn = this.add.text(30, 35, '◀ MENU', {
      fontFamily: 'Silkscreen, monospace',
      fontSize: '14px',
      color: '#64ffda'
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerdown', () => {
      this.soundSynth.playClick();
      this.scene.start('MenuScene');
    });

    this.setupPalette();
    this.setupBoardDimensions();
    this.renderEditorBoard();
    this.setupActionButtons();

    // Hide Game HUD Overlay
    const header = document.getElementById('game-header');
    if (header) header.classList.add('hidden');
    const controls = document.getElementById('game-controls-overlay');
    if (controls) controls.classList.add('hidden');
    const dpad = document.getElementById('dpad-overlay');
    if (dpad) dpad.classList.add('hidden');
  }

  private setupPalette() {
    const { width } = this.scale;
    const paletteY = 85;

    const paletteItems = [
      { tile: TileType.Wall, label: 'Tường (#)' },
      { tile: TileType.Empty, label: 'Sàn ( )' },
      { tile: TileType.Target, label: 'Đích (.)' },
      { tile: TileType.Box, label: 'Thùng ($)' },
      { tile: TileType.Player, label: 'Nhân Vật (@)' }
    ];

    const itemWidth = 110;
    const startX = width / 2 - (paletteItems.length * (itemWidth + 8)) / 2 + itemWidth / 2;

    paletteItems.forEach((item, idx) => {
      const x = startX + idx * (itemWidth + 8);
      const isSelected = this.selectedTileType === item.tile;

      const container = this.add.container(x, paletteY);

      const bg = this.add.graphics();
      this.drawPaletteBg(bg, itemWidth, isSelected);

      const icon = this.add.sprite(-30, 0, this.getTextureForTile(item.tile)).setDisplaySize(24, 24);
      const text = this.add.text(0, 0, item.label, {
        fontFamily: 'Silkscreen, monospace',
        fontSize: '10px',
        color: '#ffffff'
      }).setOrigin(0.3, 0.5);

      container.add([bg, icon, text]);
      container.setSize(itemWidth, 34);
      container.setInteractive({ useHandCursor: true });

      this.paletteButtons.push({ container, tileType: item.tile, bg });

      container.on('pointerdown', () => {
        this.soundSynth.playClick();
        this.selectedTileType = item.tile;
        this.updatePaletteSelection();
      });
    });
  }

  private drawPaletteBg(bg: Phaser.GameObjects.Graphics, width: number, isSelected: boolean) {
    bg.clear();
    bg.fillStyle(isSelected ? 0x2b7fff : 0x1e2638, 1);
    bg.fillRoundedRect(-width / 2, -17, width, 34, 6);
    bg.lineStyle(2, isSelected ? 0x64ffda : 0x3b4866, 1);
    bg.strokeRoundedRect(-width / 2, -17, width, 34, 6);
  }

  private updatePaletteSelection() {
    this.paletteButtons.forEach(btn => {
      const isSelected = btn.tileType === this.selectedTileType;
      this.drawPaletteBg(btn.bg, 110, isSelected);
    });
  }

  private setupBoardDimensions() {
    const { width, height } = this.scale;
    const maxTileW = Math.floor((width - 60) / this.gridWidth);
    const maxTileH = Math.floor((height - 200) / this.gridHeight);
    this.tileSize = Math.max(32, Math.min(54, Math.min(maxTileW, maxTileH)));

    const boardW = this.gridWidth * this.tileSize;
    const boardH = this.gridHeight * this.tileSize;

    this.boardOffsetX = Math.floor((width - boardW) / 2);
    this.boardOffsetY = Math.floor((height - boardH) / 2) + 20;
  }

  private renderEditorBoard() {
    this.tileSprites = [];

    for (let y = 0; y < this.gridHeight; y++) {
      const rowSprites: Phaser.GameObjects.Sprite[] = [];
      for (let x = 0; x < this.gridWidth; x++) {
        const posX = this.boardOffsetX + x * this.tileSize + this.tileSize / 2;
        const posY = this.boardOffsetY + y * this.tileSize + this.tileSize / 2;

        const floor = this.add.sprite(posX, posY, 'floor');
        floor.setDisplaySize(this.tileSize, this.tileSize);

        const sprite = this.add.sprite(posX, posY, this.getTextureForTile(this.grid[y][x]));
        sprite.setDisplaySize(this.tileSize, this.tileSize);
        sprite.setInteractive();

        const currentX = x;
        const currentY = y;

        sprite.on('pointerdown', () => {
          this.applyTile(currentX, currentY);
        });
        sprite.on('pointerover', (pointer: Phaser.Input.Pointer) => {
          if (pointer.isDown) {
            this.applyTile(currentX, currentY);
          }
        });

        rowSprites.push(sprite);
      }
      this.tileSprites.push(rowSprites);
    }
  }

  private applyTile(x: number, y: number) {
    // If placing player, remove existing player from grid
    if (this.selectedTileType === TileType.Player) {
      for (let ry = 0; ry < this.gridHeight; ry++) {
        for (let rx = 0; rx < this.gridWidth; rx++) {
          if (this.grid[ry][rx] === TileType.Player) {
            this.grid[ry][rx] = TileType.Empty;
            this.tileSprites[ry][rx].setTexture('floor');
          }
        }
      }
    }

    this.grid[y][x] = this.selectedTileType;
    this.tileSprites[y][x].setTexture(this.getTextureForTile(this.selectedTileType));
    this.soundSynth.playClick();
  }

  private getTextureForTile(tile: TileType): string {
    switch (tile) {
      case TileType.Wall: return 'wall';
      case TileType.Target: return 'target';
      case TileType.Box: return 'box';
      case TileType.BoxOnTarget: return 'box_target';
      case TileType.Player: return 'player';
      case TileType.Empty:
      default: return 'floor';
    }
  }

  private setupActionButtons() {
    const { width, height } = this.scale;
    const btnY = height - 40;

    this.createActionButton(width / 2 - 160, btnY, '▶ THỬ MÀN CHƠI', '#2b7fff', () => {
      if (this.validateLevel()) {
        const customLevel = this.buildCustomLevelData();
        this.scene.start('GameScene', { levelData: customLevel, mode: GameMode.Custom });
      }
    });

    this.createActionButton(width / 2, btnY, '💾 LƯU MÀN CHƠI', '#00e676', () => {
      if (this.validateLevel()) {
        const customLevel = this.buildCustomLevelData();
        LevelStorageRepository.saveCustomLevel(customLevel);
        this.soundSynth.playWin();
        RetroToast.show('✅ Đã lưu màn chơi tự tạo vào danh sách!', 'success');
      }
    });

    this.createActionButton(width / 2 + 160, btnY, '📋 XUẤT MÃ XSB', '#ffd700', () => {
      const xsb = XsbLevelParser.serialize(this.grid);
      navigator.clipboard.writeText(xsb).then(() => {
        RetroToast.show('📋 Đã sao chép mã XSB vào Clipboard!', 'success');
      }).catch(() => {
        RetroToast.show('Mã XSB: ' + xsb.substring(0, 30) + '...', 'info');
      });
    });
  }

  private createActionButton(x: number, y: number, label: string, colorHex: string, onClick: () => void) {
    const btnContainer = this.add.container(x, y);

    const btnWidth = 140;
    const btnHeight = 38;

    const bg = this.add.graphics();
    bg.fillStyle(0x1e2638, 1);
    bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);
    bg.lineStyle(2, Phaser.Display.Color.HexStringToColor(colorHex).color, 1);
    bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 6);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Silkscreen, monospace',
      fontSize: '11px',
      color: colorHex
    }).setOrigin(0.5);

    btnContainer.add([bg, text]);
    btnContainer.setSize(btnWidth, btnHeight);
    btnContainer.setInteractive({ useHandCursor: true });

    btnContainer.on('pointerdown', onClick);
  }

  private validateLevel(): boolean {
    let playerCount = 0;
    let boxCount = 0;
    let targetCount = 0;

    for (let y = 0; y < this.gridHeight; y++) {
      for (let x = 0; x < this.gridWidth; x++) {
        const tile = this.grid[y][x];
        if (tile === TileType.Player || tile === TileType.PlayerOnTarget) playerCount++;
        if (tile === TileType.Box) boxCount++;
        if (tile === TileType.Target) targetCount++;
        if (tile === TileType.BoxOnTarget) {
          boxCount++;
          targetCount++;
        }
      }
    }

    if (playerCount !== 1) {
      RetroToast.show('⚠️ Màn chơi phải có chính xác 1 Nhân Vật (@)!', 'warning');
      return false;
    }
    if (boxCount === 0 || targetCount === 0) {
      RetroToast.show('⚠️ Màn chơi phải có ít nhất 1 Thùng ($) và 1 Đích (.)!', 'warning');
      return false;
    }
    if (boxCount !== targetCount) {
      RetroToast.show(`⚠️ Số thùng (${boxCount}) phải bằng số vị trí đích (${targetCount})!`, 'warning');
      return false;
    }

    return true;
  }

  private buildCustomLevelData(): LevelData {
    const id = `custom_${Date.now()}`;
    return {
      id,
      chapter: 4,
      name: 'Màn Chơi Tự Tạo',
      grid: this.grid.map(row => [...row]),
      width: this.gridWidth,
      height: this.gridHeight,
      parSteps: 25
    };
  }
}
