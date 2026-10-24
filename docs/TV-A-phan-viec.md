# Thành viên A — Sáng tạo & Tài khoản — phần việc

Nhánh gợi ý: `feature/a-creator-auth` · Bắt đầu chạy thử: mở `login.html?next=creator-profile.html` (máy chủ tĩnh, xem README) · Tài khoản mẫu: ha.nguyen@example.com (mật khẩu `CultureTrail1`).

## Trang bạn sở hữu (9 trang · 83,303 ký tự, 32.1% tổng)

| Trang | Bộ ba tệp | Chức năng |
|---|---|---|
| `creator-event-editor` | `creator-event-editor.html` · `css/pages/creator-event-editor.css` · `js/pages/creator-event-editor.js` | Soạn sự kiện: kiểm tra ngày/giờ/sức chứa, xuất bản, hủy, thông báo khi đổi lịch. |
| `creator-event-management` | `creator-event-management.html` · `css/pages/creator-event-management.css` · `js/pages/creator-event-management.js` | Quản lý sự kiện: tab trạng thái, xuất bản, hủy có lý do (thông báo người đã lưu), tạo bản sao. |
| `creator-profile` | `creator-profile.html` · `css/pages/creator-profile.css` · `js/pages/creator-profile.js` | Hồ sơ nhà sáng tạo: sửa hồ sơ, ảnh chân dung, thư viện ảnh tác phẩm, xem công khai. |
| `creator-story-editor` | `creator-story-editor.html` · `css/pages/creator-story-editor.css` · `js/pages/creator-story-editor.js` | Soạn câu chuyện: tự động lưu, kiểm tra điều kiện gửi duyệt, khóa gửi khi thiếu nguồn ảnh, AI tóm tắt (AI-3). |
| `creator-story-management` | `creator-story-management.html` · `css/pages/creator-story-management.css` · `js/pages/creator-story-management.js` | Quản lý câu chuyện: tab trạng thái, tìm kiếm, gửi duyệt, rút về nháp, lưu trữ, xóa nháp, xem phản hồi. |
| `forgot-password` | `forgot-password.html` · `css/pages/forgot-password.css` · `js/pages/forgot-password.js` | Quên mật khẩu: gửi liên kết (trung lập), đếm ngược 60 giây, hiệu lực 30 phút, đặt mật khẩu mới. |
| `index` | `index.html` · `css/pages/index.css` · `js/pages/index.js` | Trang chủ: hero, câu chuyện nổi bật, bộ sưu tập nổi bật, 3 bước hành trình, lời mời đăng ký nhà sáng tạo. |
| `login` | `login.html` · `css/pages/login.css` · `js/pages/login.js` | Đăng nhập: kiểm tra biểu mẫu, hiện/ẩn mật khẩu, ghi nhớ, tài khoản bị vô hiệu hóa, lỗi mạng, chuyển hướng `?next=`. |
| `register` | `register.html` · `css/pages/register.css` · `js/pages/register.js` | Đăng ký: kiểm tra biểu mẫu, độ mạnh mật khẩu, trùng email, chọn vai trò ban đầu, đồng ý điều khoản. |

Tính năng AI của bạn: AI-3 (tóm tắt) trong `creator-story-editor`.

## Trang đi kèm gói (không thuộc bạn — đừng sửa)
`403.html` (thuộc B), `404.html` (thuộc B) — có sẵn để đăng nhập và kiểm tra phân quyền khi chạy riêng; giống hệt ở cả 3 gói.

## File dùng chung (đừng sửa trong nhánh của bạn)
`css/base|layout|components|responsive.css`, `js/api.js`, `js/main.js`, `js/modules/*`, `assets/*`, `tests/`, `docs/` chung. Muốn đổi → báo nhóm, làm PR riêng (xem `docs/GITHUB.md`).

## Điểm nối với phần việc của người khác
- Bài gửi duyệt (`status = pending`) do **B** xử lý ở `curator-content-review` / `curator-review-detail`; kết quả (duyệt, yêu cầu sửa) quay về trang soạn bài của bạn qua `feedback` và thông báo.
- Sự kiện `upcoming` và hồ sơ `creators` được **C** hiển thị ở `explorer-place-detail` và `explorer-story-detail`.
- `login` / `register` / `forgot-password` đọc-ghi bảng `users`; **B** (admin) cấp vai trò và vô hiệu hóa tài khoản nên ảnh hưởng đăng nhập.
- Dùng `js/modules/creator.js` (`CT.su`, `CT.eu`) chung với B và `CT.ai.summaryPanel` chung với C.

Khi chạy **riêng một mình**, liên kết tới trang của người khác sẽ ra 404 cho tới khi ghép; dữ liệu mẫu đã đủ để phần của bạn hoạt động. Đọc `docs/data-contract.md` trước khi đổi cấu trúc dữ liệu.

## Việc cần làm ngoài mã nguồn (đề bài yêu cầu)
- [ ] Mô phỏng Figma/Canva cho các trang trên → ghi liên kết vào `design/figma-link.txt` (làm chung).
- [ ] Quay video OBS cho **từng trang** của bạn (giải thích HTML ngữ nghĩa, CSS, JS, kiểm tra biểu mẫu, responsive, trạng thái, AI nếu có).
- [ ] Commit theo từng trang bằng tài khoản GitHub của bạn; mở PR vào `dev`; cập nhật bảng công việc.
- [ ] Đọc và hiểu mã, chỉnh sửa theo ý nhóm, và điền `docs/ai-usage-report.md` đúng thực tế.
- [ ] Kiểm tra thủ công: bàn phím (Tab/Enter/Esc), 390px và 1440px, thử Chế độ demo (mạng chậm / lỗi / lỗi AI).

## Kiểm thử nhanh phần của bạn
```bash
pip install playwright && playwright install chromium
sh tests/run.sh smoke_a.py      # mở các trang của bạn, báo lỗi JS
```
