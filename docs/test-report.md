# Báo cáo kiểm thử (tự động, Chromium headless / Playwright)

| Bộ kiểm thử | Nội dung | Kết quả |
|---|---|---|
| `tests/smoke.py` | mở 27 trang đúng vai trò, bắt `pageerror` + lỗi console | 27/27 không lỗi |
| `tests/flows.py` | 58 kiểm tra nghiệp vụ: phân quyền 401/403, đăng nhập/đăng ký, tìm/lọc, gửi duyệt → nhận bài → AI thẻ → duyệt, bản công khai giữ nguyên khi sửa, kiểm tra lịch/sức chứa sự kiện, hủy có lý do, hành trình (đổi thứ tự, lưu, xóa có xác nhận), 3 trạng thái AI + lỗi mạng, gộp thẻ, bảo vệ quản trị viên cuối, vô hiệu hóa, thông báo, liên kết địa danh, bộ sưu tập phiên bản | 58/58 đạt |
| `tests/layout_a11y.py` | không tràn ngang ở 390px; ảnh có `alt`, ô nhập có nhãn, 1 `h1`/trang, không trùng `id`, có `lang` | không có vấn đề thật (một số cảnh báo “nút rỗng” là dương tính giả do menu `<details>` đóng) |

Chạy lại: `pip install playwright && playwright install chromium && sh tests/run.sh flows.py`

## Đã sửa trong quá trình kiểm thử
- Lưới 2 cột bị bóp hẹp trên di động do style nội tuyến → ép 1 cột ở ≤1100px.
- AI hành trình đẩy xưởng lên đầu → giữ thứ tự Cổng làng → Xưởng → Trưng bày, chỉ dành nhiều thời gian hơn cho xưởng.
- Dữ liệu mẫu mâu thuẫn (bài “chờ duyệt” nhưng đã có dòng “nhận duyệt”).

## Chưa kiểm thử
Trình đọc màn hình, Safari/Firefox, thiết bị thật, tương phản màu bằng công cụ chuyên dụng, hiệu năng, in PDF thực tế. Chưa so khớp pixel với ảnh thiết kế (chỉ xem bằng mắt các trang chính).
