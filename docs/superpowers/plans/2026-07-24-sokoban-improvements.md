# Sokoban Retro Web Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement DOM listener cleanup in `GameScene`, a retro non-blocking Toast UI overlay for `EditorScene`, and normalize Undo/Redo step counting in `GameScene`.

**Architecture:** Add `RetroToast` UI helper for non-blocking notifications, add lifecycle listener cleanup in `GameScene` shutdown, and adjust `undo()` step count arithmetic.

**Tech Stack:** TypeScript, Phaser 3, HTML5 DOM Overlay, CSS3, Vite.

---

### Task 1: Create RetroToast UI Helper & CSS Overlay

**Files:**
- Create: `src/ui/RetroToast.ts`
- Modify: `index.html:13-15`
- Modify: `src/style.css:320-350`

- [ ] **Step 1: Add toast container HTML element in `index.html`**

```html
<div id="toast-container" class="toast-container hidden"></div>
```

- [ ] **Step 2: Add CSS rules for Retro Toast in `src/style.css`**

```css
/* Retro Toast Notification */
.toast-container {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 200;
  display: flex;
  flex-direction: column;
  gap: 8px;
  pointer-events: none;
}

.toast-badge {
  background: var(--panel-bg);
  border: 2px solid var(--panel-border);
  border-radius: 6px;
  padding: 10px 18px;
  font-family: var(--font-retro);
  font-size: 0.8rem;
  color: var(--text-main);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.6);
  animation: toastSlideDown 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.toast-badge.toast-success {
  border-color: #00e676;
  color: #00e676;
}

.toast-badge.toast-warning {
  border-color: #ffd700;
  color: #ffd700;
}

.toast-badge.toast-error {
  border-color: #e63946;
  color: #f0525f;
}

@keyframes toastSlideDown {
  from { transform: translateY(-20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
```

- [ ] **Step 3: Create `src/ui/RetroToast.ts` class**

```typescript
export class RetroToast {
  public static show(message: string, type: 'success' | 'warning' | 'error' = 'success', durationMs: number = 2500): void {
    let container = document.getElementById('toast-container');
    if (!container) return;

    container.classList.remove('hidden');

    const badge = document.createElement('div');
    badge.className = `toast-badge toast-${type}`;
    badge.innerText = message;

    container.appendChild(badge);

    setTimeout(() => {
      badge.style.transition = 'opacity 0.3s ease';
      badge.style.opacity = '0';
      setTimeout(() => {
        badge.remove();
        if (container && container.childElementCount === 0) {
          container.classList.add('hidden');
        }
      }, 300);
    }, durationMs);
  }
}
```

- [ ] **Step 4: Typecheck and test build**

Run: `cmd /c "npm run build"`
Expected: Compilation success with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add index.html src/style.css src/ui/RetroToast.ts
git commit -m "feat: add RetroToast UI helper and toast notification overlay"
```

---

### Task 2: Replace `window.alert()` in `EditorScene.ts` with `RetroToast`

**Files:**
- Modify: `src/scenes/EditorScene.ts:220-295`

- [ ] **Step 1: Import `RetroToast` in `EditorScene.ts`**

```typescript
import { RetroToast } from '../ui/RetroToast';
```

- [ ] **Step 2: Replace native `alert()` calls with `RetroToast.show(...)`**

In `setupActionButtons()` and `validateLevel()`:
- Change `alert('✅ Đã lưu màn chơi tự tạo vào danh sách!');` -> `RetroToast.show('✅ Đã lưu màn chơi tự tạo thành công!', 'success');`
- Change `alert('📋 Đã sao chép mã XSB...');` -> `RetroToast.show('📋 Đã sao chép mã XSB vào Clipboard!', 'success');`
- Change `alert('⚠️ Màn chơi phải có chính xác 1 Nhân Vật (@)!');` -> `RetroToast.show('⚠️ Màn chơi phải có chính xác 1 Nhân Vật (@)!', 'warning');`
- Change `alert('⚠️ Màn chơi phải có ít nhất 1 Thùng ($) và 1 Đích (.));');` -> `RetroToast.show('⚠️ Màn chơi phải có ít nhất 1 Thùng ($) và 1 Đích (.)!', 'warning');`
- Change `alert('⚠️ Số thùng (...) phải bằng số vị trí đích (...)!');` -> `RetroToast.show(`⚠️ Số thùng (${boxCount}) phải bằng số đích (${targetCount})!`, 'warning');`

- [ ] **Step 3: Run build check**

Run: `cmd /c "npm run build"`
Expected: Build passes cleanly.

- [ ] **Step 4: Commit**

```bash
git add src/scenes/EditorScene.ts
git commit -m "refactor: replace browser alerts with RetroToast notifications in EditorScene"
```

---

### Task 3: Implement DOM Listener Cleanup & Undo Step Count Fix in `GameScene.ts`

**Files:**
- Modify: `src/scenes/GameScene.ts:74-112, 423-456`

- [ ] **Step 1: Implement `cleanupHTMLOverlay()` and bind to Phaser Shutdown Event**

```typescript
private setupHTMLOverlay() {
  // Existing setup...

  // Bind cleanup listener on scene shutdown or destroy to prevent memory/closure leaks
  this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanupHTMLOverlay());
  this.events.once(Phaser.Scenes.Events.DESTROY, () => this.cleanupHTMLOverlay());
}

private cleanupHTMLOverlay() {
  const elements = [
    'btn-back', 'btn-sound', 'btn-undo', 'btn-redo', 'btn-reset',
    'btn-restart-win', 'btn-next-level',
    'dpad-up', 'dpad-down', 'dpad-left', 'dpad-right'
  ];
  elements.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.onclick = null;
  });
}
```

- [ ] **Step 2: Update `undo()` to decrement step count**

In `undo()`:
```typescript
this.redoStack.push(action);
this.stepsCount = Math.max(0, this.stepsCount - 1); // Undo decrements move step count
this.updateHUD();
```

- [ ] **Step 3: Run build check**

Run: `cmd /c "npm run build"`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/scenes/GameScene.ts
git commit -m "fix: implement DOM listener cleanup on shutdown and normalize undo step counting"
```
