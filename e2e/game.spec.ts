import { test, expect } from '@playwright/test';

test.describe('Sokoban Classic Warehouse - Level Click & Navigation E2E', () => {
  test('should load game page without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await expect(page).toHaveTitle(/Sokoban Classic Warehouse/i);

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    expect(consoleErrors).toHaveLength(0);
  });

  test('should allow clicking on unlocked levels and navigate into GameScene', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForSelector('canvas');

    // Start LevelSelectScene
    await page.evaluate(() => {
      (window as any).game.scene.start('LevelSelectScene');
    });
    await page.waitForTimeout(500);

    // Start GameScene with valid LevelData
    await page.evaluate(() => {
      const game = (window as any).game;
      const levelData = {
        id: 'mb_01',
        chapter: 1,
        name: '1-1: Nhập Môn Micro 1',
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
      game.scene.start('GameScene', { levelData });
    });
    await page.waitForTimeout(500);

    // Header overlay should now be visible with correct level name
    const header = page.locator('#game-header');
    await expect(header).toBeVisible();

    const title = page.locator('#level-title');
    await expect(title).toContainText('1-1: Nhập Môn Micro 1');

    expect(consoleErrors).toHaveLength(0);
  });
});
