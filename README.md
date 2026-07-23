# 📦 Sokoban Classic Warehouse - Retro Pixel Web Edition

Dự án game **Sokoban** trên trình duyệt web được xây dựng bằng **Vite + TypeScript + Phaser 3 Engine**, mang phong cách đồ họa **Classic Warehouse Retro Pixel** hoài niệm, bộ tổng hợp âm thanh 8-bit thời gian thực (Web Audio API), 15 màn chơi chuẩn và Trình thiết kế màn chơi (Level Editor).

---

## ✨ Tính Năng Nổi Bật

### 1. 🎨 Retro Pixel Art Graphics & Engine
- **Phaser 3 Renderer:** Cấu hình chuẩn `pixelArt: true` và `image-rendering: pixelated` giúp đồ họa luôn sắc cạnh trên mọi màn hình.
- **Procedural Sprite Generation:** Khởi tạo tài nguyên pixel tự động (`BootScene`), không lo lỗi nạp file ảnh bên ngoài:
  - **Tường kho gạch (#):** Họa tiết gạch kho với đường vữa tối và dải highlight 3D pixel.
  - **Thùng gỗ ($):** Thùng gỗ nẹp chéo gia cố kèm đinh tán đồng ở góc.
  - **Thùng vào đích (*):** Thùng gỗ phát sáng aura xanh lá kèm ngôi sao vàng ở tâm.
  - **Mục tiêu (.):** Vòng pod phát sáng vàng/xanh neon.
  - **Thủ kho (@):** Nhân vật đội mũ lưỡi trai đỏ, áo phông vàng và quần yếm denim.

### 2. 🎮 3 Chế Độ Điều Khiển & Auto-Pathfinding
- **Bàn Phím:** Hỗ trợ phím `WASD` và `Mũi Tên`.
- **Cảm Ứng Di Động:** Nút bấm D-Pad chuẩn 46x46px góc dưới màn hình.
- **Click-To-Move (Tìm Đường Tự Động):** Người chơi nhấp chuột/chạm vào bất kỳ ô sàn trống nào, thuật toán BFS (`SokobanPathfinder`) sẽ tự động điều khiển nhân vật bước theo đường ngắn nhất.

### 3. ↩️ Undo / Redo Không Giới Hạn
- Quản lý stack bước đi dạng Delta `MoveActionDelta` nhẹ và chính xác.
- Hỗ trợ phím tắt: `Ctrl+Z` (Undo), `Ctrl+Y` (Redo), `R` (Reset màn chơi).

### 4. 🎵 Web Audio API 8-Bit Synthesizer
- Tự động sinh hiệu ứng âm thanh 8-bit chíp-tún thời gian thực (`RetroSoundSynthesizer`):
  - Tiếng bước chân, tiếng đẩy thùng ịch ịch, tiếng ting-ting vào đích, và nhạc hoành tráng mừng chiến thắng.

### 5. 🛠️ Trình Thiết Kế Màn Chơi (Level Editor)
- Công cụ vẽ map trực quan với cọ tile.
- Tự động kiểm tra tính hợp lệ của màn chơi (1 nhân vật, số thùng = số đích).
- Hỗ trợ **Chơi Thử (Test Game)**, **Lưu vào LocalStorage**, và **Xuất mã XSB ASCII** chuẩn quốc tế.

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

- **Core Engine:** [Phaser 3](https://phaser.io/) (v3.80+)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (v5.4+)
- **Build Tool:** [Vite](https://vitejs.dev/) (v5.2+)
- **Styling:** CSS3 Vanilla (Retro Pixel HUD & Responsive Layout)
- **Audio:** Web Audio API Native Synthesizer

---

## 📁 Cấu Trúc Dự Án

```
sokoban/
├── index.html                           # Giao diện khung HTML, Overlay HUD & Touch D-Pad
├── package.json                         # Đăng ký phụ thuộc dự án & scripts
├── tsconfig.json                        # Cấu hình TypeScript compiler
├── README.md                            # Tài liệu hướng dẫn dự án
├── .agents/
│   └── AGENTS.md                        # Quy chuẩn phát triển dành cho AI Agent
└── src/
    ├── main.ts                          # Điểm khởi chạy game Phaser
    ├── style.css                        # Retro CSS styling & font Silkscreen
    ├── domain/
    │   └── types.ts                     # Khai báo Type/Enum domain (TileType, Direction, MoveActionDelta)
    ├── audio/
    │   └── RetroSoundSynthesizer.ts     # Bộ tổng hợp âm thanh 8-bit Web Audio API
    ├── navigation/
    │   └── SokobanPathfinder.ts         # Thuật toán BFS tìm đường ngắn nhất
    ├── parser/
    │   └── XsbLevelParser.ts            # Bộ đọc/ghi mã chuẩn Sokoban XSB ASCII
    ├── repository/
    │   └── LevelStorageRepository.ts    # Quản lý LocalStorage cho tiến trình & Level tự tạo
    ├── data/
    │   └── defaultLevels.ts             # 15 màn chơi tiêu chuẩn chia 3 Chapter
    └── scenes/
        ├── BootScene.ts                 # Tạo texture procedural retro pixel
        ├── MenuScene.ts                 # Scene Menu chính & Hướng dẫn
        ├── LevelSelectScene.ts          # Scene chọn màn chơi & Đánh giá sao
        ├── GameScene.ts                 # Scene chơi game chính
        └── EditorScene.ts               # Scene trình tạo màn chơi
```

---

## 🚀 Hướng Dẫn Chạy Dự Án

### Yêu cầu môi trường
- [Node.js](https://nodejs.org/) (v18.0 trở lên)
- `npm` hoặc `yarn`

### 1. Cài đặt các gói phụ thuộc
```powershell
npm install
```

### 2. Chạy môi trường phát triển (Dev Server)
```powershell
npm run dev
```
Mở trình duyệt tại địa chỉ: `http://localhost:5173`

### 3. Kiểm tra kiểu dữ liệu TypeScript
```powershell
npx tsc --noEmit
```

### 4. Đóng gói ứng dụng Production (Build)
```powershell
npm run build
```
Mã nguồn đóng gói sẽ nằm trong thư mục `dist/`.

---

## 📜 Giấy Phép (License)

Dự án được phát hành theo giấy phép [MIT License](LICENSE).
