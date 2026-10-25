CT.ready(() => {
  let u = CT.auth.user();
  const f = CT.$("#f");
  const first = () => u.name.split(" ").slice(-2).join(" ");
  const fill = () => {
    f.name.value = u.name;
    f.city.value = u.city || "";
    f.bio.value = u.bio || "";
  };
  const head = () => {
    CT.$("#hello").textContent = "Xin chào, " + first();
    CT.$("#pc").textContent = u.name;
    CT.$("#pcBody").innerHTML = `<p class="dot">${CT.auth
      .roles(u)
      .map((r) => CT.ROLE_LABEL[r])
      .join(
        " · ",
      )}</p><p class="muted">${CT.esc(u.city || "Chưa cập nhật nơi sống")} · Tham gia tháng ${u.joined.slice(5, 7)}/${u.joined.slice(0, 4)}</p><p>${CT.esc(u.bio || "Hãy thêm vài dòng giới thiệu về bạn.")}</p><button class="link-btn" type="button" id="edit">Chỉnh sửa hồ sơ</button>`;
    CT.$("#edit").onclick = () => f.name.focus();
    const role = CT.auth.role();
    const has = CT.auth.roles(u).filter((r) => r !== "explorer");
    CT.$("#wsBody").innerHTML =
      `<p class="dot">Đang dùng · ${CT.ROLE_LABEL[role]}</p>${has.map((r) => `<p class="pg-4"><a href="${CT.ROLE_HOME[r]}" data-role-link="${r}"><b>${CT.ROLE_FULL[r]} ↗</b></a></p>`).join("")}<p class="small muted">${has.length ? "Quyền đã được cấp. Chọn không gian không đồng nghĩa với việc tự cấp thêm quyền." : "Tài khoản này chưa có quyền nhà sáng tạo, biên tập hay quản trị."}</p>${u.permRequest ? `<p class="chip warn">Đã gửi yêu cầu ${CT.esc(u.permRequest.role)} · chờ quản trị viên</p>` : '<button class="btn btn-outline btn-sm" type="button" id="reqPerm">Yêu cầu thêm quyền</button>'}`;
    const rp = CT.$("#reqPerm");
    if (rp)
      rp.onclick = async () => {
        const r = await CT.ui.confirm({
          title: "Yêu cầu quyền nhà sáng tạo",
          text: "Quản trị viên sẽ xem xét và cấp quyền nếu phù hợp. Chỉ quản trị viên được sửa vai trò.",
          confirm: "Gửi yêu cầu",
          reason: {
            label: "Vì sao bạn muốn đăng bài?",
            required: true,
            placeholder: "Ví dụ: Tôi muốn kể về nghề đan tre của gia đình.",
          },
        });
        if (!r) return;
        u = CT.db.update("users", u.id, {
          permRequest: {
            role: "Nhà sáng tạo",
            reason: r.reason,
            at: new Date().toISOString(),
          },
        });
        CT.notify("u5", {
          type: "system",
          title: "Yêu cầu quyền mới",
          body: u.name + " xin quyền nhà sáng tạo: " + r.reason,
          link: "admin-user-management.html",
          linkLabel: "Xem người dùng",
        });
        CT.ui.toast("Đã gửi yêu cầu quyền.");
        head();
      };
  };
  const stats = () => {
    const trails = CT.db
      .all("trails")
      .filter((t) => t.userId === u.id && t.status !== "archived").length;
    CT.$("#stats").innerHTML = [
      [(u.saved || []).length, "Câu chuyện đã lưu"],
      [trails, "Hành trình cá nhân"],
      [(u.followed || []).length, "Bộ sưu tập theo dõi"],
    ]
      .map((x) => `<div class="stat"><b>${x[0]}</b><span>${x[1]}</span></div>`)
      .join("");
  };
  const saved = () => {
    const list = (u.saved || [])
      .map((id) => CT.story(id))
      .filter((s) => s && s.live);
    CT.$("#saved").innerHTML = list.length
      ? `<div class="grid g2">${list.map((s) => CT.ui.storyCard(s).replace("data-save=", 'data-after="1" data-save=')).join("")}</div>`
      : CT.ui.empty(
          "Chưa lưu câu chuyện nào",
          "Lưu những câu chuyện bạn muốn đọc lại.",
          '<a class="btn" href="explorer-story-discovery.html">Khám phá câu chuyện</a>',
        );
  };
  document.addEventListener("ct:saved", () => {
    u = CT.auth.user();
    stats();
    saved();
  });
  fill();
  head();
  stats();
  saved();
  CT.$("#cancel").onclick = () => {
    fill();
    CT.$$(".field", f).forEach((x) => x.classList.remove("invalid"));
    CT.ui.toast("Đã hủy thay đổi.");
  };
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!CT.ui.validate(f, { name: CT.ui.val.req("Nhập họ và tên.") })) return;
    try {
      u = await CT.api.run(() =>
        CT.db.update("users", u.id, {
          name: f.name.value.trim(),
          city: f.city.value,
          bio: f.bio.value.trim(),
        }),
      );
      head();
      stats();
      CT.ui.toast("Đã lưu hồ sơ.");
    } catch (err) {
      CT.ui.toast(
        "Không thể lưu lúc này. Dữ liệu đã nhập được giữ lại.",
        "err",
      );
    }
  });
});
