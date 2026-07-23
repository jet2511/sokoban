import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Generate all procedural retro pixel textures
    this.createWallTexture();
    this.createFloorTexture();
    this.createTargetTexture();
    this.createBoxTexture();
    this.createBoxOnTargetTexture();
    this.createPlayerTexture();
  }

  create() {
    this.scene.start('MenuScene');
  }

  private createWallTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    const size = 32;

    // Wall base
    graphics.fillStyle(0x3b4866);
    graphics.fillRect(0, 0, size, size);

    // Brick pattern lines
    graphics.fillStyle(0x232c40);
    // Horizontal mortar
    graphics.fillRect(0, 10, size, 2);
    graphics.fillRect(0, 21, size, 2);
    // Vertical mortar
    graphics.fillRect(15, 0, 2, 10);
    graphics.fillRect(30, 0, 2, 10);
    graphics.fillRect(7, 12, 2, 9);
    graphics.fillRect(22, 12, 2, 9);
    graphics.fillRect(15, 23, 2, 9);

    // Brick highlights
    graphics.fillStyle(0x566891);
    graphics.fillRect(1, 1, 14, 2);
    graphics.fillRect(17, 1, 13, 2);
    graphics.fillRect(9, 12, 13, 2);
    graphics.fillRect(1, 23, 14, 2);

    graphics.generateTexture('wall', size, size);
    graphics.destroy();
  }

  private createFloorTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    const size = 32;

    // Floor base (Dark wooden plank floor)
    graphics.fillStyle(0x1a2130);
    graphics.fillRect(0, 0, size, size);

    // Subtle floor grid & wood grain
    graphics.fillStyle(0x121724);
    graphics.fillRect(0, 0, size, 1);
    graphics.fillRect(0, 0, 1, size);
    graphics.fillRect(0, 16, size, 1);

    graphics.fillStyle(0x263147);
    graphics.fillRect(4, 6, 8, 1);
    graphics.fillRect(18, 10, 10, 1);
    graphics.fillRect(8, 22, 12, 1);

    graphics.generateTexture('floor', size, size);
    graphics.destroy();
  }

  private createTargetTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    const size = 32;

    // Floor background
    graphics.fillStyle(0x1a2130);
    graphics.fillRect(0, 0, size, size);

    // Glowing target marker (Gold / Cyan dot ring)
    graphics.fillStyle(0x00e676);
    graphics.fillCircle(16, 16, 10);

    graphics.fillStyle(0x1a2130);
    graphics.fillCircle(16, 16, 7);

    graphics.fillStyle(0xffd700);
    graphics.fillCircle(16, 16, 4);

    graphics.generateTexture('target', size, size);
    graphics.destroy();
  }

  private createBoxTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    const size = 32;

    // Outer shadow border
    graphics.fillStyle(0x6e3c15);
    graphics.fillRect(0, 0, size, size);

    // Crate body (Wooden brown)
    graphics.fillStyle(0xba6820);
    graphics.fillRect(2, 2, size - 4, size - 4);

    // Bevel highlights
    graphics.fillStyle(0xdb8335);
    graphics.fillRect(2, 2, size - 4, 3);
    graphics.fillRect(2, 2, 3, size - 4);

    // Bevel shadows
    graphics.fillStyle(0x8c440d);
    graphics.fillRect(2, size - 5, size - 4, 3);
    graphics.fillRect(size - 5, 2, 3, size - 4);

    // Diagonal bracing
    graphics.fillStyle(0x6e3c15);
    graphics.lineStyle(2, 0x6e3c15);
    graphics.strokeLineShape(new Phaser.Geom.Line(4, 4, size - 4, size - 4));
    graphics.strokeLineShape(new Phaser.Geom.Line(size - 4, 4, 4, size - 4));

    // Corner brass bolts
    graphics.fillStyle(0xffd700);
    graphics.fillRect(4, 4, 3, 3);
    graphics.fillRect(size - 7, 4, 3, 3);
    graphics.fillRect(4, size - 7, 3, 3);
    graphics.fillRect(size - 7, size - 7, 3, 3);

    graphics.generateTexture('box', size, size);
    graphics.destroy();
  }

  private createBoxOnTargetTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    const size = 32;

    // Glowing green outer aura
    graphics.fillStyle(0x00e676);
    graphics.fillRect(0, 0, size, size);

    // Crate body (Active glowing box)
    graphics.fillStyle(0x2e7d32);
    graphics.fillRect(2, 2, size - 4, size - 4);

    // Bevel highlights
    graphics.fillStyle(0x4caf50);
    graphics.fillRect(2, 2, size - 4, 3);
    graphics.fillRect(2, 2, 3, size - 4);

    // Diagonal bracing
    graphics.lineStyle(2, 0x1b5e20);
    graphics.strokeLineShape(new Phaser.Geom.Line(4, 4, size - 4, size - 4));
    graphics.strokeLineShape(new Phaser.Geom.Line(size - 4, 4, 4, size - 4));

    // Center glowing star icon
    graphics.fillStyle(0xffd700);
    graphics.fillCircle(16, 16, 5);

    graphics.generateTexture('box_target', size, size);
    graphics.destroy();
  }

  private createPlayerTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0 });
    const size = 32;

    // Worker character (Retro Overalls & Red Cap)
    // Red Cap
    graphics.fillStyle(0xe53935);
    graphics.fillRect(8, 2, 16, 6);
    graphics.fillRect(6, 6, 20, 3); // Visor

    // Head / Face
    graphics.fillStyle(0xffcc80);
    graphics.fillRect(10, 8, 12, 8);
    // Eyes
    graphics.fillStyle(0x212121);
    graphics.fillRect(12, 11, 2, 3);
    graphics.fillRect(18, 11, 2, 3);

    // Shirt (Yellow)
    graphics.fillStyle(0xfbc02d);
    graphics.fillRect(8, 16, 16, 6);

    // Blue Overalls & Straps
    graphics.fillStyle(0x1976d2);
    graphics.fillRect(10, 17, 3, 11);
    graphics.fillRect(19, 17, 3, 11);
    graphics.fillRect(9, 20, 14, 8);

    // Boots
    graphics.fillStyle(0x4e342e);
    graphics.fillRect(8, 27, 6, 4);
    graphics.fillRect(18, 27, 6, 4);

    graphics.generateTexture('player', size, size);
    graphics.destroy();
  }
}
