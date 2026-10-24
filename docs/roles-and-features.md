# Vai trò & tính năng

| Vai trò | Quyền | Tính năng chính |
|---|---|---|
| Người khám phá | mọi tài khoản đăng nhập (xem công khai cả khi chưa đăng nhập) | tìm/lọc câu chuyện, đọc & tóm tắt AI, lưu bài/sự kiện, xem địa danh, tạo hành trình (thủ công hoặc AI), thông báo, hồ sơ, cài đặt |
| Nghệ nhân / Nhà sáng tạo | `roles` chứa `creator` | hồ sơ + thư viện ảnh, viết & gửi duyệt bài, nhận phản hồi, quản lý sự kiện (xuất bản, hủy có lý do) |
| Biên tập văn hóa | `curator` | hàng đợi duyệt, kiểm tra nguồn, AI gợi ý thẻ, duyệt/trả bài, bộ sưu tập, liên kết địa danh |
| Quản trị viên | `admin` | danh mục & thẻ (gộp/lưu trữ), người dùng & vai trò (có nhật ký), thống kê |

**Ranh giới truy cập:** chọn không gian trong menu không tự cấp quyền; sai vai trò → 403; chưa đăng nhập → đăng nhập rồi quay lại; liên kết cũ / nội dung ẩn → 404.

## Thực thể (LocalStorage, khóa `ct2_*`)
`stories` · `places` · `creators` · `events` · `collections` · `trails` · `tags` · `users` · `notifications` · `logs` · `taglogs`.

## Quy tắc nghiệp vụ đã cài
1. Gửi duyệt cần: tiêu đề ≤100 ký tự, địa danh, nội dung ≥300 từ, nguồn ảnh, xác nhận chịu trách nhiệm; thiếu → khóa gửi nhưng vẫn lưu nháp.
2. Bài chờ duyệt không sửa được (chỉ rút về nháp). Sửa bài đã duyệt → phiên bản mới (`liveSnapshot`), người đọc vẫn thấy bản cũ cho tới khi biên tập duyệt.
3. Duyệt cần tick 3 mục kiểm tra, có nguồn ảnh và địa danh; từ chối / yêu cầu sửa bắt buộc lý do và gửi thông báo cho tác giả.
4. AI không tự duyệt/xuất bản, không tạo thẻ mới; thẻ chỉ áp dụng sau khi biên tập chấp nhận.
5. Sự kiện: giờ kết thúc sau giờ bắt đầu, sức chứa nguyên dương ≥ số đã đăng ký; hủy cần lý do và thông báo cho người đã lưu; đổi lịch thông báo người đã lưu.
6. Bộ sưu tập chỉ nhận bài đã duyệt; lưu nháp không đổi bản công khai; xuất bản tăng phiên bản.
7. Thẻ: tên duy nhất, gộp chuyển liên kết bài sang thẻ đích, lưu trữ không xóa lịch sử.
8. Người dùng: đổi quyền & vô hiệu hóa cần lý do + thông báo; không gỡ/khóa quản trị viên cuối cùng; không tự gỡ quyền quản trị của mình.
