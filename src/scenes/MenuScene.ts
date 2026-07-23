import Phaser from 'phaser';
import { RetroSoundSynthesizer } from '../audio/RetroSoundSynthesizer';

export class MenuScene extends Phaser.Scene {
  private soundSynth = RetroSoundSynthesizer.getInstance();

  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;

    // Background title decoration
    const bgGraphics = this.add.graphics();
    bgGraphics.fillGradientStyle(0x121824, 0x121824, 0x1e2638, 0x1e2638, 1);
    bgGraphics.fillRect(0, 0, width, height);

    // Decorative retro grid
    bgGraphics.lineStyle(1, 0x2e3b54, 0.4);
    for (let x = 0; x < width; x += 32) {
      bgGraphics.lineBetween(x, 0, x, height);
    }
    for (let y = 0; y < height; y += 32) {
      bgGraphics.lineBetween(0, y, width, y);
    }

    // Title Text
    const titleText = this.add.text(width / 2, height * 0.22, 'SOKOBAN', {
      fontFamily: 'Silkscreen, monospace',
      fontSize: '48px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 8,
      align: 'center'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.32, 'CLASSIC WAREHOUSE - RETRO PIXEL', {
      fontFamily: 'Silkscreen, monospace',
      fontSize: '14px',
      color: '#64ffda',
      align: 'center'
    }).setOrigin(0.5);

    // Decorative Sprite Animation (Player pushing a box in menu)
    const demoY = height * 0.44;
    this.add.image(width / 2 - 48, demoY, 'floor').setScale(1.5);
    this.add.image(width / 2, demoY, 'floor').setScale(1.5);
    this.add.image(width / 2 + 48, demoY, 'floor').setScale(1.5);

    this.add.image(width / 2 - 48, demoY, 'player').setScale(1.5);
    this.add.image(width / 2, demoY, 'box').setScale(1.5);
    this.add.image(width / 2 + 48, demoY, 'target').setScale(1.5);

    // Floating bounce effect for title
    this.tweens.add({
      targets: titleText,
      y: titleText.y - 6,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Buttons with clean retro text (no broken emoji glyphs in canvas font)
    this.createMenuButton(width / 2, height * 0.58, '▶ CHƠI THEO MÀN', () => {
      this.soundSynth.playClick();
      this.scene.start('LevelSelectScene');
    });

    this.createMenuButton(width / 2, height * 0.68, '⚙ TRÌNH TẠO MÀN (EDITOR)', () => {
      this.soundSynth.playClick();
      this.scene.start('EditorScene');
    });

    this.createMenuButton(width / 2, height * 0.78, '? HƯỚNG DẪN CHƠI', () => {
      this.soundSynth.playClick();
      this.showHelpModal();
    });

    // Hide HTML Header if visible
    const header = document.getElementById('game-header');
    if (header) header.classList.add('hidden');
    const controls = document.getElementById('game-controls-overlay');
    if (controls) controls.classList.add('hidden');
    const dpad = document.getElementById('dpad-overlay');
    if (dpad) dpad.classList.add('hidden');
  }

  private createMenuButton(x: number, y: number, label: string, onClick: () => void) {
    const btnContainer = this.add.container(x, y);

    const btnWidth = 320;
    const btnHeight = 48;

    const bg = this.add.graphics();
    bg.fillStyle(0x1e2638, 1);
    bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
    bg.lineStyle(3, 0x3b4866, 1);
    bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);

    const text = this.add.text(0, 0, label, {
      fontFamily: 'Silkscreen, monospace',
      fontSize: '15px',
      color: '#f0f4fc'
    }).setOrigin(0.5);

    btnContainer.add([bg, text]);
    
    // Explicit interactive hit area for Phaser container centered at 0,0
    btnContainer.setInteractive(
      new Phaser.Geom.Rectangle(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight),
      Phaser.Geom.Rectangle.Contains
    );

    btnContainer.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(0x2a354d, 1);
      bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
      bg.lineStyle(3, 0x64ffda, 1);
      bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
      text.setColor('#ffd700');
    });

    btnContainer.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x1e2638, 1);
      bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
      bg.lineStyle(3, 0x3b4866, 1);
      bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 8);
      text.setColor('#f0f4fc');
    });

    btnContainer.on('pointerdown', onClick);
  }

  private showHelpModal() {
    const { width, height } = this.scale;
    const overlay = this.add.container(0, 0).setDepth(100);

    const backdrop = this.add.graphics();
    backdrop.fillStyle(0x05080e, 0.85);
    backdrop.fillRect(0, 0, width, height);
    backdrop.setInteractive({ useHandCursor: true });

    const card = this.add.graphics();
    card.fillStyle(0x1e2638, 1);
    card.fillRoundedRect(width / 2 - 200, height / 2 - 160, 400, 320, 12);
    card.lineStyle(4, 0x3b4866, 1);
    card.strokeRoundedRect(width / 2 - 200, height / 2 - 160, 400, 320, 12);

    const title = this.add.text(width / 2, height / 2 - 130, '📜 HƯỚNG DẪN CHƠI', {
      fontFamily: 'Silkscreen, monospace',
      fontSize: '18px',
      color: '#ffd700'
    }).setOrigin(0.5);

    const content = this.add.text(width / 2, height / 2 - 20, 
      '1. Di chuyển bằng phím WASD / Mũi Tên hoặc D-Pad trên màn hình.\n\n' +
      '2. Chạm/Nhấp chuột vào ô sàn trống để Nhân Vật TỰ ĐỘNG TÌM ĐƯỜNG di chuyển.\n\n' +
      '3. Đẩy tất cả các THÙNG GỖ ($) vào vị trí MỤC TIÊU (.) để giành chiến thắng.\n\n' +
      '4. Sử dụng nút UNDO (Ctrl+Z) nếu đi nhầm bước.', {
      fontFamily: 'Silkscreen, monospace',
      fontSize: '12px',
      color: '#c4d4f2',
      wordWrap: { width: 360 },
      align: 'left'
    }).setOrigin(0.5);

    const closeBtn = this.add.text(width / 2, height / 2 + 120, '[ ĐÃ HIỂU - ĐÓNG ]', {
      fontFamily: 'Silkscreen, monospace',
      fontSize: '14px',
      color: '#64ffda'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerdown', () => {
      this.soundSynth.playClick();
      overlay.destroy();
    });

    overlay.add([backdrop, card, title, content, closeBtn]);
  }
}
