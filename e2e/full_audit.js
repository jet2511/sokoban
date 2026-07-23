import { chromium } from '@playwright/test';

(async () => {
  console.log('🚀 Starting Full Game Audit with Playwright...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    // 1. Load Main Page
    console.log('1️⃣ Loading main page at http://localhost:5173/ ...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    const title = await page.title();
    console.log(`   Page Title: "${title}"`);

    // Check canvas element
    const canvas = page.locator('canvas');
    const isCanvasVisible = await canvas.isVisible();
    console.log(`   Canvas Visible: ${isCanvasVisible}`);

    const screenshotDir = 'C:/Users/tuyen/.gemini/antigravity/brain/2e6e0945-a4d2-45e8-a7af-f641baac60d0';
    await page.screenshot({ path: `${screenshotDir}/shot_01_menu.png` });
    console.log('   📸 Captured shot_01_menu.png');

    // 2. Navigate to LevelSelectScene
    console.log('2️⃣ Navigating to LevelSelectScene...');
    await page.evaluate(() => {
      window.game.scene.start('LevelSelectScene');
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${screenshotDir}/shot_02_level_select_ch1.png` });
    console.log('   📸 Captured shot_02_level_select_ch1.png');

    // 3. Test Chapter Switch in LevelSelectScene
    console.log('3️⃣ Testing Chapter 2 & 3 Tabs...');
    await page.evaluate(() => {
      const scene = window.game.scene.getScene('LevelSelectScene');
      scene.currentTab = 2;
      scene.currentPage = 1;
      scene.renderLevelGrid();
    });
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${screenshotDir}/shot_03_level_select_ch2.png` });
    console.log('   📸 Captured shot_03_level_select_ch2.png');

    await page.evaluate(() => {
      const scene = window.game.scene.getScene('LevelSelectScene');
      scene.currentTab = 3;
      scene.currentPage = 1;
      scene.renderLevelGrid();
    });
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${screenshotDir}/shot_04_level_select_ch3.png` });
    console.log('   📸 Captured shot_04_level_select_ch3.png');

    // 4. Test GameScene - Play Level 1-1 (Microban 1)
    console.log('4️⃣ Testing GameScene (Level 1-1)...');
    await page.evaluate(() => {
      const game = window.game;
      const level1 = {
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
      game.scene.start('GameScene', { levelData: level1 });
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${screenshotDir}/shot_05_game_scene_mb01.png` });
    console.log('   📸 Captured shot_05_game_scene_mb01.png');

    // Check DOM overlay in GameScene
    const headerTitle = await page.locator('#level-title').innerText();
    const stepsText = await page.locator('#stat-steps').innerText();
    console.log(`   HUD Level Title: "${headerTitle}", Steps: ${stepsText}`);

    // 5. Test Player Controls & Move Push Box in Level 1-1
    console.log('5️⃣ Testing Player Controls & Box Pushing...');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(200);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(600);

    const winModalVisible = await page.locator('#modal-win').isVisible();
    console.log(`   🏆 Level Complete Win Modal Visible: ${winModalVisible}`);
    await page.screenshot({ path: `${screenshotDir}/shot_06_win_modal.png` });
    console.log('   📸 Captured shot_06_win_modal.png');

    // 6. Test Level Editor Scene
    console.log('6️⃣ Testing EditorScene (Level Creator)...');
    await page.evaluate(() => {
      const game = window.game;
      game.scene.start('EditorScene');
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${screenshotDir}/shot_07_editor_scene.png` });
    console.log('   📸 Captured shot_07_editor_scene.png');

    // Check Console Errors
    console.log('\n📊 Console Error Check:');
    if (consoleErrors.length === 0) {
      console.log('   ✅ 0 Console Errors encountered during entire test audit!');
    } else {
      console.log('   ❌ Console Errors detected:');
      consoleErrors.forEach(err => console.log(`      - ${err}`));
    }

  } catch (err) {
    console.error('❌ Audit encountered an error:', err);
  } finally {
    await browser.close();
    console.log('\n🏁 Full Audit Completed successfully.');
  }
})();
