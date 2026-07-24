# Sokoban Retro Web Improvements - Technical Design Document

**Date:** 2026-07-24
**Project:** Sokoban Classic Warehouse Retro Web Edition
**Author:** Antigravity Architect & Senior Engineer

---

## 1. Overview & Objectives

Following a multi-axis code and architectural review of the Sokoban Retro Web codebase, three key improvements have been identified to enhance software quality, memory management, and user experience:

1. **DOM Listener Hygiene (`GameScene.ts`):** Properly unbind all HTML overlay DOM event listeners (`.onclick`) upon `GameScene` shutdown/destroy to prevent memory leaks and stale closure invocation on orphaned scene instances.
2. **Non-Blocking Retro Toast Notification UI (`EditorScene.ts` & DOM):** Replace native `window.alert()` dialogs in the Level Editor with a custom, non-blocking HTML/CSS retro toast badge that auto-dismisses after 2.5 seconds.
3. **Normalized Undo/Redo Step Counting (`GameScene.ts`):** Update `undo()` to decrease step count (`stepsCount = Math.max(0, stepsCount - 1)`) and `redo()` to increase step count (`stepsCount++`), accurately reflecting actual player moves.

---

## 2. Component Design & Interfaces

### 2.1 DOM Listener Cleanup (`GameScene.ts`)

- **Problem:** `setupHTMLOverlay()` binds `.onclick` directly to shared DOM elements (e.g. `btnBack`, `btnUndo`, `btnRedo`, `btnReset`, `dpad-*`). Upon scene restart or transition to `LevelSelectScene`, these callbacks retain references to destroyed Phaser scene instances.
- **Design:**
  - Create a private method `cleanupHTMLOverlay()` in `GameScene`.
  - Register `cleanupHTMLOverlay()` to `this.events.once(Phaser.Scenes.Events.SHUTDOWN, ...)` and `this.events.once(Phaser.Scenes.Events.DESTROY, ...)`.
  - Nullify `.onclick` handlers on all referenced DOM elements (`btn-back`, `btn-sound`, `btn-undo`, `btn-redo`, `btn-reset`, `btn-restart-win`, `btn-next-level`, `dpad-up`, `dpad-left`, `dpad-right`, `dpad-down`).

### 2.2 Retro Toast Notification UI Overlay (`index.html`, `style.css`, `EditorScene.ts`)

- **Problem:** Native browser `alert()` pauses the Web Audio Context and blocks the Phaser game loop.
- **Design:**
  - **HTML Structure:** Add `<div id="toast-container" class="toast-container hidden"></div>` to `index.html`.
  - **CSS Styling (`src/style.css`):**
    - Class `.toast-container`: Fixed top-center alignment (`top: 20px; left: 50%; transform: translateX(-50%)`), z-index 200.
    - Class `.toast-badge`: Retro pixel border, `font-family: var(--font-retro)`, background `#1e2638`, border `2px solid var(--panel-border)`, shadow, slide-down animation `@keyframes toastSlideIn`.
    - Modifiers `.toast-success` (`color: #00e676`), `.toast-warning` (`color: #ffd700`), `.toast-error` (`color: #e63946`).
  - **Toast Helper Class (`src/ui/RetroToast.ts`):**
    - `public static show(message: string, type: 'success' | 'warning' | 'error' = 'info', durationMs: number = 2500): void`
    - Creates or reuses `#toast-container`, appends badge with auto-removal via `setTimeout`.
  - **`EditorScene.ts` Integration:** Replace all `alert(...)` invocations with `RetroToast.show(...)`.

### 2.3 Undo / Redo Step Counter (`GameScene.ts`)

- **Design:**
  - **`undo()`:**
    - Reduce step count: `this.stepsCount = Math.max(0, this.stepsCount - 1);`
    - Revert player and box grid states.
    - Update HUD via `this.updateHUD()`.
  - **`redo()`:**
    - Re-apply move & increase step count: `this.stepsCount++;`
    - Update HUD via `this.updateHUD()`.

---

## 3. Verification Plan

1. **Type Check:** Run `npx tsc --noEmit` to ensure 0 TypeScript errors.
2. **Build Verification:** Run `npm run build` to verify clean production compilation.
3. **Functionality Check:**
   - Verify Undo reduces step count in HUD.
   - Verify Redo increases step count in HUD.
   - Verify Editor scene displays retro toast badge instead of browser `alert()`.
   - Verify clean scene transitions without double-event triggering or memory leaks.
