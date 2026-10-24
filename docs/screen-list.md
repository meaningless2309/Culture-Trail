# Bảng kiểm kê màn hình (đã triển khai)

SV1 = khám phá & chung · SV2 = sáng tạo · SV3 = biên tập & quản trị. Mọi trang đều: HTML ngữ nghĩa, CSS token chung, responsive, dữ liệu giả lập LocalStorage, trạng thái tải/rỗng/lỗi khi phù hợp, nhãn trợ năng cơ bản.

| # | Vai trò | SV | Tệp | CRUD / trạng thái | AI |
|---|---|---|---|---|---|
| 1 | Chung | SV1 | index.html | R nội dung nổi bật | lối vào tạo hành trình |
| 2 | Chung | SV1 | login.html | R phiên; sai mật khẩu, vô hiệu hóa, lỗi mạng | — |
| 3 | Chung | SV1 | register.html | C tài khoản; trùng email, độ mạnh mật khẩu | — |
| 4 | Chung | SV1 | forgot-password.html | U mật khẩu; trung lập, đếm ngược 60s, hết hạn 30 phút | — |
| 5 | Chung | SV1 | personal-profile.html | R/U hồ sơ; yêu cầu quyền; bài đã lưu | — |
| 6 | Chung | SV1 | account-settings.html | R/U đổi mật khẩu, tùy chọn, xuất dữ liệu, ngừng tài khoản | — |
| 7 | Chung | SV1 | notifications.html | R/U/D đọc / ẩn; lọc, tìm, xem cũ hơn | — |
| 8 | Khám phá | SV1 | explorer-story-discovery.html | R tìm kiếm, lọc, sắp xếp, phân trang; bộ sưu tập công khai (`?collection=`) | — |
| 9 | Khám phá | SV1 | explorer-story-detail.html | R/C/D lưu bài; phản hồi | AI-3 tóm tắt |
| 10 | Khám phá | SV1 | explorer-place-detail.html | R/C thêm điểm vào hành trình; lưu sự kiện | — |
| 11 | Khám phá | SV1 | explorer-my-trail.html | C/R/U/D lưu, lưu trữ, khôi phục, xóa; đổi thứ tự/giờ | dùng gợi ý có kiểm tra |
| 12 | Khám phá | SV1 | explorer-ai-trail-generator.html | C/U hành trình | AI-2 |
| 13 | Sáng tạo | SV2 | creator-profile.html | C/R/U/D ảnh & hồ sơ | — |
| 14 | Sáng tạo | SV2 | creator-story-management.html | C/R/U/D nháp / chờ / duyệt / từ chối / lưu trữ | — |
| 15 | Sáng tạo | SV2 | creator-story-editor.html | C/U nháp, tự động lưu, gửi duyệt, khóa gửi khi thiếu nguồn ảnh | AI-3 |
| 16 | Sáng tạo | SV2 | creator-event-management.html | C/R/U nháp / sắp / hủy / hoàn thành; sao chép | — |
| 17 | Sáng tạo | SV2 | creator-event-editor.html | C/U kiểm tra lịch, sức chứa; xuất bản / hủy có lý do | — |
| 18 | Biên tập | SV3 | curator-content-review.html | R/U nhận bài, lọc | — |
| 19 | Biên tập | SV3 | curator-review-detail.html | R/U duyệt / yêu cầu sửa / từ chối (lý do bắt buộc) | AI-1 |
| 20 | Biên tập | SV3 | curator-collection-management.html | C/R/U tạo, lưu trữ, khôi phục, sao chép | — |
| 21 | Biên tập | SV3 | curator-collection-editor.html | C/U nháp → phiên bản mới; kiểm tra trước xuất bản | — |
| 22 | Biên tập | SV3 | curator-content-map.html | R/U liên kết / gỡ địa danh | sơ đồ minh họa |
| 23 | Quản trị | SV3 | admin-tag-management.html | C/R/U tạo, sửa, gộp, lưu trữ, khôi phục | danh mục cho AI-1 |
| 24 | Quản trị | SV3 | admin-user-management.html | C/R/U thêm, cấp vai trò, vô hiệu hóa, kích hoạt | — |
| 25 | Quản trị | SV3 | admin-culture-dashboard.html | R báo cáo dữ liệu giả lập, xuất CSV / PDF | — |
| + | Chung | — | 403.html, 404.html | ranh giới truy cập | — |

**Di động (6 màn hình đề xuất):** thể hiện bằng CSS responsive trong chính các tệp trên (discovery, story-detail, place-detail, my-trail, creator-story-editor, curator-review-detail), không có tệp `*-mobile.html` riêng.

## Định nghĩa hoàn thành — tình trạng

| Mục | Tình trạng |
|---|---|
| HTML ngữ nghĩa, CSS, Responsive, JS, kiểm tra biểu mẫu, dữ liệu giả lập | ✅ làm & kiểm thử tự động |
| Trạng thái rỗng / tải / lỗi, trợ năng cơ bản | ✅ (chưa thử trình đọc màn hình) |
| Mô phỏng Figma/Canva, PR/hợp nhất `dev`, video OBS, cập nhật Trello | ⬜ nhóm tự thực hiện |
