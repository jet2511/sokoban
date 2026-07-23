import Phaser from 'phaser';
import { DEFAULT_LEVELS } from '../data/defaultLevels';
import { LevelStorageRepository } from '../repository/LevelStorageRepository';
import { RetroSoundSynthesizer } from '../audio/RetroSoundSynthesizer';
import { LevelData, GameMode } from '../domain/types';

export class LevelSelectScene extends Phaser.Scene {
  private soundSynth = RetroSoundSynthesizer.getInstance();
  private currentTab: number = 1; // Chapter 1, 2, 3 or 4 (Custom)
  private currentPage: number = 1;
  private itemsPerPage: number = 10; // 5 cols x 2 rows
  private contentContainer: Phaser.GameObjects.Container | null = null;

  constructor() {
    super('LevelSelectScene');
  }

  create() {
    const { width, height } = this.scale;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x121824, 1);
    bg.fillRect(0, 0, width, height);

    // Title
    this.add.text(width / 2, 35, 'CHỌN MÀN CHƠI', {
      fontFamily: 'Silkscreen, monospace',
      fontSize: '28px',
      color: '#ffd700',
      stroke: '#000000',
      strokeThickness: 4
    }).setOrigin(0.5);

    // Back to Menu Button
    const backBtn = this.add.text(30, 35, '◀ MENU', {
      fontFamily: 'Silkscreen, monospace',
      fontSize: '14px',
      color: '#64ffda'
    }).setOrigin(0, 0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerdown', () => {
      this.soundSynth.playClick();
      this.scene.start('MenuScene');
    });

    // Chapter Tabs
    this.createTabs();

    // Render levels for current tab & page
    this.renderLevelGrid();
  }

  private createTabs() {
    const { width } = this.scale;
    const tabY = 85;

    const tabs = [
      { id: 1, label: 'CH.1 TẬP SỰ' },
      { id: 2, label: 'CH.2 THÀNH THẠO' },
      { id: 3, label: 'CH.3 CHUYÊN GIA' },
      { id: 4, label: '⚙ TỰ TẠO' }
    ];

    const tabWidth = 140;
    const startX = width / 2 - (tabs.length * (tabWidth + 10)) / 2 + tabWidth / 2;

    tabs.forEach((tab, idx) => {
      const x = startX + idx * (tabWidth + 10);
      const isSelected = this.currentTab === tab.id;

      const container = this.add.container(x, tabY);
      const bg = this.add.graphics();

      bg.fillStyle(isSelected ? 0x2b7fff : 0x1e2638, 1);
      bg.fillRoundedRect(-tabWidth / 2, -18, tabWidth, 36, 6);
      bg.lineStyle(2, isSelected ? 0x64ffda : 0x3b4866, 1);
      bg.strokeRoundedRect(-tabWidth / 2, -18, tabWidth, 36, 6);

      const text = this.add.text(0, 0, tab.label, {
        fontFamily: 'Silkscreen, monospace',
        fontSize: '11px',
        color: isSelected ? '#ffffff' : '#c4d4f2'
      }).setOrigin(0.5);

      container.add([bg, text]);
      container.setInteractive(
        new Phaser.Geom.Rectangle(-tabWidth / 2, -18, tabWidth, 36),
        Phaser.Geom.Rectangle.Contains
      );

      container.on('pointerdown', () => {
        if (this.currentTab !== tab.id) {
          this.soundSynth.playClick();
          this.currentTab = tab.id;
          this.currentPage = 1;
          this.renderLevelGrid();
        }
      });
    });
  }

  private renderLevelGrid() {
    const { width, height } = this.scale;

    if (this.contentContainer) {
      this.contentContainer.destroy();
    }
    this.contentContainer = this.add.container(0, 0);

    let allLevels: LevelData[] = [];

    if (this.currentTab <= 3) {
      allLevels = DEFAULT_LEVELS.filter(l => l.chapter === this.currentTab);
    } else {
      allLevels = LevelStorageRepository.getCustomLevels();
    }

    if (allLevels.length === 0 && this.currentTab === 4) {
      const emptyText = this.add.text(width / 2, height / 2 + 20, 
        'Chưa có màn chơi tự tạo nào!\nHãy vào TRÌNH TẠO MÀN để tự thiết kế nhé.', {
        fontFamily: 'Silkscreen, monospace',
        fontSize: '13px',
        color: '#8fa0c0',
        align: 'center'
      }).setOrigin(0.5);
      this.contentContainer.add(emptyText);
      return;
    }

    const totalPages = Math.max(1, Math.ceil(allLevels.length / this.itemsPerPage));
    if (this.currentPage > totalPages) {
      this.currentPage = totalPages;
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const pageLevels = allLevels.slice(startIndex, startIndex + this.itemsPerPage);

    const cardWidth = 135;
    const cardHeight = 100;
    const cols = 5;
    const gridWidth = cols * (cardWidth + 15) - 15;
    const startX = width / 2 - gridWidth / 2 + cardWidth / 2;
    const startY = 160;

    pageLevels.forEach((level, pageIdx) => {
      const globalIdx = startIndex + pageIdx;
      const col = pageIdx % cols;
      const row = Math.floor(pageIdx / cols);

      const x = startX + col * (cardWidth + 15);
      const y = startY + row * (cardHeight + 15);

      const progress = LevelStorageRepository.getLevelProgress(level.id);
      const isUnlocked = progress.unlocked || this.currentTab === 4;

      const cardContainer = this.add.container(x, y);

      const bg = this.add.graphics();
      bg.fillStyle(isUnlocked ? (progress.completed ? 0x1c3127 : 0x1e2638) : 0x111622, 1);
      bg.fillRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 8);
      bg.lineStyle(2, isUnlocked ? (progress.completed ? 0x00e676 : 0x3b4866) : 0x222b3d, 1);
      bg.strokeRoundedRect(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight, 8);

      cardContainer.add(bg);

      if (!isUnlocked) {
        const lockText = this.add.text(0, -10, '🔒', { fontSize: '20px' }).setOrigin(0.5);
        const nameText = this.add.text(0, 22, `MÀN ${globalIdx + 1}`, {
          fontFamily: 'Silkscreen, monospace',
          fontSize: '10px',
          color: '#556688'
        }).setOrigin(0.5);
        cardContainer.add([lockText, nameText]);
      } else {
        const numText = this.add.text(0, -22, `${level.chapter ? level.chapter + '-' + (globalIdx + 1) : globalIdx + 1}`, {
          fontFamily: 'Silkscreen, monospace',
          fontSize: '15px',
          color: '#ffd700'
        }).setOrigin(0.5);

        const starsText = this.add.text(0, 2, 
          '★'.repeat(progress.stars) + '☆'.repeat(3 - progress.stars), {
          fontFamily: 'Silkscreen, monospace',
          fontSize: '14px',
          color: progress.stars > 0 ? '#ffd700' : '#4a5773'
        }).setOrigin(0.5);

        const bestStepsText = this.add.text(0, 24, 
          progress.bestSteps ? `Best: ${progress.bestSteps}` : `Par: ${level.parSteps}`, {
          fontFamily: 'Silkscreen, monospace',
          fontSize: '10px',
          color: '#64ffda'
        }).setOrigin(0.5);

        cardContainer.add([numText, starsText, bestStepsText]);
        cardContainer.setInteractive(
          new Phaser.Geom.Rectangle(-cardWidth / 2, -cardHeight / 2, cardWidth, cardHeight),
          Phaser.Geom.Rectangle.Contains
        );

        cardContainer.on('pointerdown', () => {
          this.soundSynth.playClick();
          this.scene.start('GameScene', {
            levelData: level,
            mode: this.currentTab === 4 ? GameMode.Custom : GameMode.Standard
          });
        });
      }

      this.contentContainer!.add(cardContainer);
    });

    // Render Pagination Controls if totalPages > 1
    if (totalPages > 1) {
      const paginationY = startY + 2 * (cardHeight + 15) + 30;
      
      const prevBtn = this.add.text(width / 2 - 100, paginationY, '◀ TRANG TRƯỚC', {
        fontFamily: 'Silkscreen, monospace',
        fontSize: '12px',
        color: this.currentPage > 1 ? '#64ffda' : '#3b4866'
      }).setOrigin(0.5).setInteractive({ useHandCursor: this.currentPage > 1 });

      if (this.currentPage > 1) {
        prevBtn.on('pointerdown', () => {
          this.soundSynth.playClick();
          this.currentPage--;
          this.renderLevelGrid();
        });
      }

      const pageText = this.add.text(width / 2, paginationY, `${this.currentPage} / ${totalPages}`, {
        fontFamily: 'Silkscreen, monospace',
        fontSize: '13px',
        color: '#ffffff'
      }).setOrigin(0.5);

      const nextBtn = this.add.text(width / 2 + 100, paginationY, 'TRANG SAU ▶', {
        fontFamily: 'Silkscreen, monospace',
        fontSize: '12px',
        color: this.currentPage < totalPages ? '#64ffda' : '#3b4866'
      }).setOrigin(0.5).setInteractive({ useHandCursor: this.currentPage < totalPages });

      if (this.currentPage < totalPages) {
        nextBtn.on('pointerdown', () => {
          this.soundSynth.playClick();
          this.currentPage++;
          this.renderLevelGrid();
        });
      }

      this.contentContainer.add([prevBtn, pageText, nextBtn]);
    }
  }
}
