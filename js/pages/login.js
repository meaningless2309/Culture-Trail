CT.ready(() => {
  const f = CT.$("#f"),
    alertBox = CT.$("#alert");
  CT.ui.bindPwToggle(f);
  const q = new URLSearchParams(location.search);
  if (q.get("error") === "disabled")
    alertBox.innerHTML = CT.ui.notice(
      "Tài khoản đã bị vô hiệu hóa",
      "Bạn không thể đăng nhập. Liên hệ bộ phận hỗ trợ để được mở lại.",
      "err",
    );
  if (q.get("reset"))
    alertBox.innerHTML = CT.ui.notice(
      "Đặt lại mật khẩu thành công",
      "Bạn có thể đăng nhập bằng mật khẩu mới.",
      "ok",
    );
  const cu = CT.auth.user();
  if (cu && cu.status === "active" && !q.get("error")) {
    location.replace("explorer-story-discovery.html");
    return;
  }
  const demos = [
    ["ha.nguyen@example.com", "Thu Hà · Nghệ nhân"],
    ["phuong@example.com", "Mai Phương · Biên tập"],
    ["an@example.com", "Minh An · Nghệ nhân"],
    ["nam@example.com", "Hoàng Nam · Quản trị"],
    ["linh@example.com", "Ngọc Linh · bị vô hiệu hóa"],
  ];
  CT.$("#demo").innerHTML = demos
    .map(
      (d) =>
        `<button type="button" class="chip" data-e="${d[0]}">${d[1]}</button>`,
    )
    .join("");
  CT.$("#demo").onclick = (e) => {
    const b = e.target.closest("[data-e]");
    if (b) {
      f.email.value = b.dataset.e;
      f.password.value = "CultureTrail1";
      f.password.focus();
    }
  };
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    alertBox.innerHTML = "";
    const ok = CT.ui.validate(f, {
      email: CT.ui.val.email,
      password: CT.ui.val.req("Nhập mật khẩu."),
    });
    if (!ok) return;
    const btn = CT.$("#go");
    btn.disabled = true;
    btn.textContent = "Đang đăng nhập…";
    try {
      const u = await CT.api.run(() =>
        CT.db
          .all("users")
          .find(
            (x) => x.email.toLowerCase() === f.email.value.trim().toLowerCase(),
          ),
      );
      if (!u || u.password !== f.password.value) {
        alertBox.innerHTML = CT.ui.notice(
          "Email hoặc mật khẩu chưa đúng",
          "Kiểm tra lại thông tin hoặc dùng “Quên mật khẩu”.",
          "err",
        );
      } else if (u.status === "disabled") {
        alertBox.innerHTML = CT.ui.notice(
          "Tài khoản đã bị vô hiệu hóa",
          "Liên hệ bộ phận hỗ trợ để được mở lại.",
          "err",
        );
      } else {
        CT.auth.login(u, f.remember.checked, "explorer");
        const next = q.get("next");
        location.href =
          next && /^[\w-]+\.html/.test(next)
            ? next
            : "explorer-story-discovery.html";
        return;
      }
    } catch (err) {
      alertBox.innerHTML = CT.ui.notice(
        "Không thể xử lý yêu cầu lúc này",
        "Thông tin bạn đã nhập vẫn được giữ. Hãy thử lại.",
        "err",
      );
    }
    btn.disabled = false;
    btn.textContent = "→ Đăng nhập";
  });
});
