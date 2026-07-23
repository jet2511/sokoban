import { test, expect } from '@playwright/test';

test.describe('Sokoban Classic Warehouse - Retro Pixel Web', () => {
  test('should load game page without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await expect(page).toHaveTitle(/Sokoban Classic Warehouse/i);

    // Wait for canvas element
    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    // Verify 0 console errors
    expect(consoleErrors).toHaveLength(0);
  });

  test('should render Phaser game scenes and allow scene navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('canvas');

    // Verify game instance is attached
    const isGameReady = await page.evaluate(() => {
      return typeof (window as any).game !== 'undefined';
    });
    expect(isGameReady).toBe(true);

    // Navigate to LevelSelectScene
    await page.evaluate(() => {
      (window as any).game.scene.start('LevelSelectScene');
    });
    await page.waitForTimeout(500);

    // Navigate to GameScene for level 1-1
    await page.evaluate(() => {
      const levelData = {
        id: 'lvl_c1_1',
        chapter: 1,
        name: '1-1: Nhập Môn Nhà Kho',
        parSteps: 8,
        grid: [
          [1, 1, 1, 1, 1],
          [1, 5, 0, 0, 1],
          [1, 0, 3, 0, 1],
          [1, 0, 2, 0, 1],
          [1, 1, 1, 1, 1]
        ],
        width: 5,
        height: 5
      };
      (window as any).game.scene.start('GameScene', { levelData });
    });
    await page.waitForTimeout(500);

    // Check header overlay is visible in GameScene
    const header = page.locator('#game-header');
    await expect(header).toBeVisible();

    const title = page.locator('#level-title');
    await expect(title).toHaveText('1-1: Nhập Môn Nhà Kho');
  });
});
