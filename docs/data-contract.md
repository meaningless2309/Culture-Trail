# Hợp đồng dữ liệu giữa 3 phần việc

Dữ liệu mẫu ở `assets/data/seed.js`, lưu vào LocalStorage (khóa `ct2_<bảng>`) qua `js/api.js`. **Ba người dùng chung các bảng này**, nên đổi tên trường/giá trị trạng thái cần báo cả nhóm.

## Ai ghi, ai đọc

Các cột là **khu vực chức năng**, không phải người: Thành viên A làm khu *Sáng tạo* (+ đăng nhập/đăng ký/trang chủ), B làm *Biên tập duyệt & Quản trị* (+ thông báo), C làm *Khám phá* (+ bộ sưu tập, hồ sơ, cài đặt).

| Bảng | Khu Khám phá & chung | Khu Sáng tạo | Khu Biên tập & Quản trị |
|---|---|---|---|
| `users` | đăng ký, hồ sơ, cài đặt, lưu bài/sự kiện | — | **cấp/đổi vai trò, vô hiệu hóa** |
| `stories` | đọc bài `live`; lưu bài | **ghi** nháp / gửi duyệt / rút / lưu trữ | **ghi** nhận bài / duyệt / yêu cầu sửa / từ chối / thẻ / địa danh |
| `events` | đọc `upcoming`; lưu sự kiện | **ghi** toàn bộ | — |
| `collections` | đọc `published` | — | **ghi** toàn bộ |
| `trails` | **ghi** toàn bộ | — | — |
| `tags` | hiển thị tên thẻ | dùng cho AI tóm tắt (không ghi) | **ghi** (admin) + gán vào bài (biên tập) |
| `places` | đọc | đọc (chọn địa danh) | đọc; **liên kết** bài ↔ địa danh |
| `creators` | đọc (thẻ Người kể chuyện) | **ghi** hồ sơ & ảnh | — |
| `notifications` | đọc / ẩn | tạo (gửi duyệt, hủy sự kiện) | tạo (duyệt, trả bài, đổi quyền) |

## Trạng thái & giá trị cố định
- `stories.status`: `draft` · `pending` · `processing` · `approved` · `rejected` · `archived`. `rejected` có `feedback[-1].kind` = `revise` (cần chỉnh sửa) hoặc `reject` (từ chối).
- `stories.live` (boolean) = đang hiển thị công khai. Sửa bài đã duyệt tạo `liveSnapshot` (bản công khai cũ), `version + 1`, `status = draft`; **mọi trang người đọc luôn đọc qua `CT.pub(story)`** để người đọc thấy bản công khai.
- `stories.topic` / `places.topic`: `craft` · `heritage` · `food` · `festival`.
- `events.status`: `draft` · `upcoming` · `completed` · `cancelled`; ngày `YYYY-MM-DD`, giờ `HH:MM`.
- `collections.status`: `draft` · `published` · `archived`; `draft` (object) chứa phiên bản đang soạn của bộ đã xuất bản.
- `tags.status`: `active` · `archived` · `review`; `parentId = null` nghĩa là danh mục.
- `users.roles`: mảng gồm `creator` · `curator` · `admin` (mọi tài khoản đều có không gian khám phá). `users.status`: `active` · `disabled`.
- `trails.status`: `active` · `archived`; `stops[] = {id, placeId, start, end}`.
- `notifications.type`: `content` · `event` · `trail` · `system`.

## Quy tắc xuyên suốt
- Mọi thao tác ghi đi qua `CT.api.run(...)` (có trễ/lỗi giả lập) và bọc `try/catch` để hiện trạng thái lỗi.
- Thao tác ảnh hưởng người khác (duyệt, hủy sự kiện, đổi quyền…) phải tạo `notifications` cho người đó.
- Chuỗi nghiệp vụ chính: A (soạn bài) gửi duyệt (`pending`) → B (biên tập) nhận (`processing`) → duyệt (`approved`, `live`) → C (khám phá) hiển thị.
