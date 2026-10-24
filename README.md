# CultureTrail — Khám phá văn hóa theo câu chuyện (BTL-26)

Nguyên mẫu **Frontend** nhiều vai trò, thuần HTML + CSS + JavaScript (không framework, không build, không backend).
Dữ liệu giả lập lưu trong **LocalStorage**; AI là mô phỏng theo luật (không gọi dịch vụ ngoài, không gửi dữ liệu cá nhân).

## Chạy thử

```bash
# Cách 1: mở trực tiếp index.html bằng trình duyệt
# Cách 2 (khuyến nghị): máy chủ tĩnh
python3 -m http.server 8000      # rồi mở http://localhost:8000
```

- Cần Internet **chỉ** để tải phông Inter / Noto Serif / Roboto Mono từ Google Fonts. Không có mạng vẫn chạy, dùng phông dự phòng.
- Chân trang có **Chế độ demo**: mạng chậm, lỗi kết nối, lỗi AI, và “Đặt lại dữ liệu mẫu”.

## Tài khoản mẫu (mật khẩu: `CultureTrail1`)

| Email | Vai trò | Ghi chú |
|---|---|---|
| ha.nguyen@example.com | Nghệ nhân (Thu Hà) | có bài nháp / chờ duyệt / bị yêu cầu sửa, sự kiện, hành trình |
| phuong@example.com | Biên tập (Mai Phương) | duyệt bài, bộ sưu tập, bản đồ nội dung |
| nam@example.com | Quản trị (Hoàng Nam) | thẻ, người dùng, thống kê |
| an@example.com | Nghệ nhân (Minh An) | |
| linh@example.com | Nghệ nhân — **bị vô hiệu hóa** | thử trạng thái “vô hiệu hóa” |

Ai đăng nhập cũng dùng được không gian **Người khám phá**. Các không gian khác chỉ mở khi được cấp quyền; sai quyền → `403.html`, liên kết hỏng / nội dung đã ẩn → `404.html`.

## Cấu trúc

```
index.html, login.html, … (27 trang HTML, đặt ở gốc, tên tệp theo bảng kiểm kê)
css/base.css          token màu/chữ/khoảng cách, reset
css/layout.css        header, thanh bên, chân trang
css/components.css    nút, thẻ, biểu mẫu, bảng, hộp thoại, trạng thái…
css/responsive.css    ≤1100px (tablet), ≤720px (di động: thanh điều hướng dưới, bảng → thẻ)
css/pages/<tên>.css   CSS riêng của từng trang (27 tệp)
js/api.js             LocalStorage, phiên đăng nhập, “API” giả lập có độ trễ/lỗi
js/main.js            header, sidebar theo vai trò, footer, phân quyền 401/403
js/modules/ui.js      toast, hộp thoại, kiểm tra biểu mẫu, bảng, trạng thái, sơ đồ minh họa
js/modules/ai.js      3 tính năng AI + bảng tóm tắt dùng chung
js/modules/creator.js kiểm tra điều kiện gửi duyệt bài / sự kiện, hủy sự kiện
js/pages/<tên>.js     logic riêng của từng trang (25 tệp)
assets/data/seed.js   dữ liệu mẫu (stories, places, creators, events, collections, trails, tags, users…)
assets/images/*.svg   ảnh minh họa
docs/                 kiểm kê màn hình, vai trò & tính năng, báo cáo AI, báo cáo kiểm thử
```

> Đề bài gợi ý thư mục `pages/`; bản này đặt trang HTML ở gốc để `index.html` là trang chủ và giữ nguyên đường dẫn tương đối. Có thể chuyển vào `pages/` nếu nhóm muốn (cần sửa đường dẫn `css/`, `js/`, `assets/`).

**Mỗi trang = 1 bộ ba `<tên>.html` + `css/pages/<tên>.css` + `js/pages/<tên>.js`** để chia việc cho từng sinh viên và ghép lại sau. Xem `docs/page-files.md` (bảng bộ ba theo SV, thứ tự tải, cách ghép).

## Phạm vi đã làm

- **25 màn hình desktop** theo bảng kiểm kê (SV1: 12, SV2: 5, SV3: 8) + `403.html`, `404.html`.
- **Responsive** cho toàn bộ trang. 6 màn hình di động trong kiểm kê (`*-mobile.html`) được thể hiện bằng **cùng tệp HTML** qua CSS responsive (không tạo 6 tệp riêng): chi tiết duyệt chia tab *Nội dung / Nguồn & AI*, bảng chuyển thành thẻ, điểm dừng dùng ↑ ↓.
- **3 tính năng AI** đúng quy trình *đầu vào → kiểm tra → xử lý → kết quả & giải thích → chấp nhận/sửa/từ chối/tạo lại → lưu*:
  - AI-1 gợi ý thẻ (Biên tập) — chỉ dùng danh mục có sẵn, không tự duyệt/tự gán.
  - AI-2 tạo hành trình (Người khám phá) — chỉ lưu khi người dùng xác nhận.
  - AI-3 tóm tắt (Người đọc, Nhà sáng tạo) — giữ nguồn/tác giả, tạo lại không ghi đè bản đã lưu.
  - Đủ trạng thái: hợp lệ, thiếu đầu vào, đang xử lý (dừng được), không đủ dữ liệu, chưa chắc chắn, lỗi (thử lại/bỏ qua).
- **Quy tắc nghiệp vụ chính**: vòng đời bài (nháp → chờ duyệt → đang xử lý → duyệt/yêu cầu sửa/từ chối → gửi lại), sửa bài đã duyệt tạo phiên bản mới mà **bản công khai giữ nguyên**, lý do bắt buộc khi từ chối/yêu cầu sửa/hủy sự kiện/vô hiệu hóa/đổi quyền, gộp thẻ chuyển liên kết, bộ sưu tập chỉ nhận bài đã duyệt và lưu nháp không đổi bản công khai, không vô hiệu hóa quản trị viên cuối cùng, thông báo tới người bị ảnh hưởng.
- **Trạng thái UI**: đang tải (skeleton), rỗng, lỗi + Thử lại, thành công (toast/notice), chờ duyệt, bị từ chối, hoàn thành, hủy/lưu trữ, vô hiệu hóa, 403/404, cảnh báo thay đổi chưa lưu.

## Chưa có / nhóm cần tự bổ sung

Những mục sau là **hoạt động của nhóm**, không thể sinh trong mã nguồn:

- Bản mô phỏng Figma/Canva (`design/`), lịch sử Git + nhánh + PR, bảng Trello/Jira/Notion, **video OBS cho từng trang**, phân công/commit từng sinh viên.
- Điền `docs/ai-usage-report.md` đúng thực tế sử dụng AI của nhóm (đề bài bắt buộc khai báo).

Giới hạn kỹ thuật cần biết:

- Ảnh là **SVG minh họa**, không phải ảnh tư liệu như bản mô phỏng; mọi ảnh/KPI/sơ đồ đều gắn nhãn “minh họa/dữ liệu mẫu”.
- Mật khẩu lưu dạng văn bản thường trong LocalStorage (chỉ vì là nguyên mẫu — **không dùng cho hệ thống thật**).
- Tải ảnh lên giới hạn 1 MB (LocalStorage ~5 MB).
- Chưa kiểm thử bằng trình đọc màn hình, Safari/Firefox, hoặc thiết bị thật (xem `docs/test-report.md`).
