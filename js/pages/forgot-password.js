CT.ready(() => {
  const f1 = CT.$("#f1"),
    f2 = CT.$("#f2");
  CT.ui.bindPwToggle(f2);
  let sentAt = 0,
    email = "",
    timer;
  const countdown = () => {
    const b = CT.$("#resend");
    let n = 60;
    b.disabled = true;
    clearInterval(timer);
    const tick = () => {
      if (n <= 0) {
        clearInterval(timer);
        b.disabled = false;
        b.textContent = "Gửi lại liên kết";
      } else {
        b.textContent = "Gửi lại sau " + n + " giây";
        n--;
      }
    };
    tick();
    timer = setInterval(tick, 1000);
  };
  const send = async () => {
    const btn = CT.$("#send");
    btn.disabled = true;
    btn.textContent = "Đang gửi…";
    try {
      await CT.api.run(() => 1);
      email = f1.email.value.trim().toLowerCase();
      sentAt = Date.now();
      CT.$("#sent").classList.remove("hidden");
      countdown();
      CT.ui.toast("Nếu email tồn tại, liên kết đã được gửi.");
    } catch (e) {
      CT.ui.toast("Không thể xử lý yêu cầu lúc này. Hãy thử lại.", "err");
    }
    btn.disabled = false;
    btn.textContent = "Gửi liên kết đặt lại";
  };
  f1.addEventListener("submit", (e) => {
    e.preventDefault();
    if (CT.ui.validate(f1, { email: CT.ui.val.email })) send();
  });
  CT.$("#resend").onclick = () => {
    send();
  };
  CT.$("#open").onclick = () => {
    if (Date.now() - sentAt > 30 * 60000) {
      CT.ui.toast("Liên kết đã hết hiệu lực. Hãy gửi lại.", "err");
      return;
    }
    CT.$("#reset").classList.remove("hidden");
    CT.$("#reset").scrollIntoView({ behavior: "smooth" });
    f2.np.focus();
  };
  f2.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (
      !CT.ui.validate(f2, {
        np: CT.ui.val.pw,
        nc: (v) =>
          v === f2.np.value && v ? "" : "Mật khẩu xác nhận chưa khớp.",
      })
    )
      return;
    const btn = CT.$("#save");
    btn.disabled = true;
    try {
      await CT.api.run(() => {
        const u = CT.db
          .all("users")
          .find((x) => x.email.toLowerCase() === email);
        if (u) CT.db.update("users", u.id, { password: f2.np.value });
        const s = CT.auth.session();
        if (s && u && s.userId === u.id) CT.auth.logout();
      });
      f2.classList.add("hidden");
      CT.$("#ok").classList.remove("hidden");
    } catch (err) {
      CT.ui.toast(
        "Không thể lưu lúc này. Dữ liệu đã nhập được giữ, hãy thử lại.",
        "err",
      );
      btn.disabled = false;
    }
  });
});
