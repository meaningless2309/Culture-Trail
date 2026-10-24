# Hướng dẫn đẩy lên GitHub (3 người, không xung đột)

Mỗi gói zip chứa **lớp dùng chung giống hệt nhau** + **trang của riêng người đó**. Vì file chung không khác nhau, khi giải nén đè lên repo Git chỉ thấy file mới của bạn.

## Nhánh
`main` (bản ổn định) ← `dev` ← `feature/a-creator-auth` · `feature/b-review-admin` · `feature/c-explore-collections`

## Bước 1 — Một người (nên là thành viên A) lập repo
1. Tạo repo trống trên GitHub (không tick “Add README”), mời hai bạn còn lại làm Collaborator.
2. Giải nén gói của A, rồi:
```bash
cd culturetrail-a-sang-tao-tai-khoan
git init
git add .
git commit -m "chore: khung dự án CultureTrail (lớp dùng chung) và phần của A"
git branch -M main
git remote add origin https://github.com/<tài-khoản>/<tên-repo>.git
git push -u origin main
git checkout -b dev && git push -u origin dev
```

## Bước 2 — B và C lấy repo về, thêm phần của mình
```bash
git clone https://github.com/<tài-khoản>/<tên-repo>.git
cd <tên-repo>
git checkout dev
git checkout -b feature/b-review-admin       # C: feature/c-explore-collections
# Giải nén gói của bạn ĐÈ vào thư mục này (chọn “Replace/Ghi đè”)
git status                                    # chỉ nên thấy file trang của bạn là mới
```
Nếu `git status` báo file chung bị sửa → bạn đã vô tình đổi nó; hoàn tác bằng `git checkout -- <file>`.

## Bước 3 — Commit theo từng trang (để có lịch sử rõ từng sinh viên)
```bash
git config user.name  "Tên của bạn"
git config user.email "email-gắn-với-github@example.com"
git add curator-content-review.html css/pages/curator-content-review.css js/pages/curator-content-review.js
git commit -m "feat(curator): hàng đợi duyệt nội dung"
# …lặp lại cho từng trang…
git push -u origin feature/b-review-admin
```
Mở **Pull Request** vào `dev`, nhờ một bạn khác xem rồi merge. Khi `dev` ổn định thì merge `dev` → `main`.

## Bước 4 — Sau khi cả ba đã merge
```bash
git checkout dev && git pull
sh tests/run.sh smoke.py        # mở đủ 27 trang, không lỗi JS
sh tests/run.sh flows.py        # 58 luồng nghiệp vụ xuyên 3 phần việc
```
(Cần `pip install playwright && playwright install chromium`.)

## Quy ước
- **Trang đi kèm**: mỗi gói có thêm vài trang của người khác (`login`, `403`, `404`) để chạy riêng được; chúng giống hệt nhau ở cả 3 gói. Chỉ chủ sở hữu (xem `docs/page-files.md`) được sửa, và sửa bằng PR riêng.
- Chỉ sửa **bộ ba trang của mình** (`<tên>.html`, `css/pages/<tên>.css`, `js/pages/<tên>.js`).
- Muốn đổi phần dùng chung (`css/base|layout|components|responsive.css`, `js/api.js`, `js/main.js`, `js/modules/*`, `assets/data/seed.js`) → báo cả nhóm và làm **PR riêng** nhỏ, không gộp với việc của trang.
- Đổi cấu trúc dữ liệu → cập nhật `docs/data-contract.md` trong cùng PR.
- Xung đột thường chỉ xảy ra ở `seed.js`: một người sửa, người khác `git pull` rồi mới sửa tiếp.
- Commit message: `feat(<khu vực>): …`, `fix(<khu vực>): …`, `docs: …`, `style: …`.

## Lưu ý trung thực
Mã nguồn được sinh với sự hỗ trợ của AI (xem `docs/ai-usage-report.md`). Mỗi người cần **đọc, chạy, hiểu và tự chỉnh phần của mình**, đồng thời ghi đúng thực tế vào báo cáo AI. Lịch sử commit nên phản ánh công việc thật của từng người.
