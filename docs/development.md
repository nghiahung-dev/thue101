# Phát triển tài liệu (local)

Tài liệu trong kho này được dựng và xem trước bằng Mintlify.

## Yêu cầu

- Node.js (khuyến nghị bản LTS)
- npm

## Cài công cụ xem trước

Cài Mintlify CLI (cài toàn cục):

```bash
npm i -g mint
```

## Chạy chế độ xem trước

Tại thư mục gốc của repo (nơi có `docs.json`), chạy:

```bash
mint dev
```

Sau đó mở trình duyệt tại:

- [http://localhost:3000](http://localhost:3000)

## Cấu trúc nội dung

- `docs.json`: cấu hình website tài liệu (tên, điều hướng, màu sắc, logo…)
- `thue/`: các trang nội dung dạng `.mdx`
- `images/`, `logo/`: tài nguyên hình ảnh

## Quy ước viết nội dung (khuyến nghị)

- Viết ngắn gọn, ưu tiên ví dụ và các bước thực hành.
- Dùng tiêu đề rõ ràng (H2/H3) để dễ tra cứu.
- Nếu có số liệu/điều kiện, ghi rõ giả định và phạm vi áp dụng.
- Tránh dùng thuật ngữ mơ hồ; nếu bắt buộc, thêm giải thích ngay sau đó.

## Lỗi thường gặp

- Không chạy được `mint dev`: thử cập nhật CLI bằng `mint update`.
- Mở trang bị 404 khi xem trước: kiểm tra `docs.json` có trỏ đúng đường dẫn trang (ví dụ `thue/tinh-thue`).
