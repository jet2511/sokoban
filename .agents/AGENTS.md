# Sokoban Retro Web - Agent Guidelines & Project Rules

Tài liệu này chứa các quy tắc kiến trúc, phong cách lập trình và hướng dẫn dành cho AI Agent khi tham gia phát triển dự án **Sokoban Classic Warehouse Retro Web Edition**.

---

## 🏗️ 1. Quy Tắc Kiến Trúc (Architecture Rules)

### Clean Architecture & Separation of Concerns
1. **Phân tách Rõ Ràng giữa Render Engine & UI Overlay:**
   - **Phaser 3 Canvas:** Chỉ đảm nhận render 2D Tilemap, Sprites và hiệu ứng hạt (Particles). Không lồng các UI phức tạp (bảng đếm bước, timer, nút bấm điều khiển) vào Canvas nếu HTML/CSS có thể xử lý tốt hơn.
   - **HTML5/CSS DOM Overlay:** Quản lý HUD header, thông số bàn chơi, bảng nút điều khiển `Undo`/`Redo`/`Reset`, nút D-Pad mobile và các thoại Modal Thắng Màn.
2. **Domain Model Độc Lập:**
   - Tất cả các kiểu dữ liệu lõi (`TileType`, `Direction`, `Position`, `MoveActionDelta`, `LevelData`) phải nằm trong `src/domain/types.ts` và không phụ thuộc vào Phaser.
3. **Đặt Tên Domain-Specific (Tránh Generic Naming Anti-Pattern):**
   - Không tạo các file chung chung như `utils.ts`, `helpers.ts`.
   - Sử dụng các tên class theo miền nghiệp vụ cụ thể: `SokobanPathfinder`, `XsbLevelParser`, `RetroSoundSynthesizer`, `LevelStorageRepository`.

---

## 🎨 2. Quy Tắc Thiết Kế Giao Diện (UI/UX Pro Max Rules)

1. **Retro Pixel Art Consistency:**
   - Giữ cấu hình `pixelArt: true` và `roundPixels: true` trong Phaser Config.
   - Luôn thêm CSS `image-rendering: pixelated` cho thẻ canvas.
2. **Không Dùng Emoji Làm Icon Trong Canvas Text:**
   - Font chữ pixel (`Silkscreen`, `Press Start 2P`) không hỗ trợ Unicode Emoji. Tránh đưa emoji vào `this.add.text()` để không bị lỗi ký tự vuông đen. Sử dụng các ký hiệu retro vector như `▶`, `⚙`, `?`, `★`, `🔒`.
3. **Interactive Container Hit Areas:**
   - Khi tạo nút bấm dạng `Phaser.GameObjects.Container` căn giữa `(0,0)`, luôn khai báo vùng chạm `Rectangle` rõ ràng:
     ```typescript
     container.setInteractive(
       new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
       Phaser.Geom.Rectangle.Contains
     );
     ```
4. **Xóa Sạch Bóng Ma Scene Màn Cũ (Scene Transition Cleanup):**
   - Mọi Scene mới khi `create()` phải vẽ một lớp nền màu tối phủ kín `bgGraphics.fillRect(0, 0, width, height)` để xóa sạch đồ họa đè của scene cũ.

---

## 🧪 3. Quy Trình Kiểm Thử & Kiểm Duyệt (Verification Workflow)

Mỗi khi chỉnh sửa mã nguồn hoặc thêm tính năng mới, Agent bắt buộc phải chạy các bước kiểm tra sau trước khi công bố hoàn thành:

1. **Kiểm tra kiểu dữ liệu TypeScript:**
   ```powershell
   npx tsc --noEmit
   ```
2. **Kiểm tra đóng gói Production Build:**
   ```powershell
   npm run build
   ```
3. **Visual & Console Inspection via Playwright:**
   - Kiểm tra giao diện thực tế trên trình duyệt, đảm bảo **0 Console Errors** và không bị lệch khung canvas hay đè lớp chữ.
