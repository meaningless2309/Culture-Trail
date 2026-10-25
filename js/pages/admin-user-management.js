CT.ready(() => {
  const me = CT.auth.user(),
    $ = CT.$,
    f = $("#f");
  let users = [],
    tab = "all",
    q = "",
    desc = true,
    page = 1,
    editId = null;
  const RL = { creator: "Sáng tạo", curator: "Biên tập", admin: "Quản trị" };
  const roleText = (u) =>
    u.roles.length
      ? (u.roles.includes("admin") && u.roles.length === 1 ? [] : ["Khám phá"])
          .concat(u.roles.map((r) => RL[r]))
          .join(" · ")
      : "Khám phá";
  const log = (t) =>
    CT.db.insert("logs", {
      id: CT.uid("l"),
      at: new Date().toISOString(),
      text: `${me.name} ${t}`,
    });
  const admins = () =>
    users.filter((u) => u.roles.includes("admin") && u.status === "active");
  const load = () => {
    $("#list").innerHTML = CT.ui.skeletonRows(4);
    CT.api
      .list("users")
      .then((d) => {
        users = d;
        draw();
      })
      .catch(() => CT.ui.showError($("#list"), load));
  };
  const grp = {
    all: () => true,
    explorer: (u) => !u.roles.length,
    creator: (u) => u.roles.includes("creator"),
    curator: (u) => u.roles.includes("curator"),
    admin: (u) => u.roles.includes("admin"),
    disabled: (u) => u.status === "disabled",
  };
  const draw = () => {
    const T = [
      ["all", "Tất cả"],
      ["explorer", "Người khám phá"],
      ["creator", "Nhà sáng tạo"],
      ["curator", "Biên tập"],
      ["admin", "Quản trị"],
      ["disabled", "Đã vô hiệu hóa"],
    ];
    $("#tabs").innerHTML = T.map(
      (t) =>
        `<button role="tab" type="button" data-t="${t[0]}" aria-selected="${tab === t[0]}">${t[1]}${t[0] === "all" ? " (" + users.length + ")" : ""}</button>`,
    ).join("");
    let l = users.filter(
      (u) =>
        grp[tab](u) &&
        (!q || CT.norm(u.name + " " + u.email).includes(CT.norm(q))),
    );
    l.sort((a, b) => (desc ? -1 : 1) * (a.joined < b.joined ? -1 : 1));
    const p = CT.ui.paginate(l, page, 5);
    const acts = (u) =>
      u.status === "disabled"
        ? `<button class="link-btn" data-a="why" data-id="${u.id}" type="button">Xem lý do</button><button class="link-btn" data-a="react" data-id="${u.id}" type="button">Kích hoạt</button>`
        : `<button class="link-btn" data-a="edit" data-id="${u.id}" type="button">Sửa quyền</button>${u.id === me.id ? "" : `<button class="link-btn danger" data-a="off" data-id="${u.id}" type="button">Vô hiệu hóa</button>`}`;
    $("#list").innerHTML = l.length
      ? CT.ui.table(
          [
            {
              h: "Người dùng",
              r: (u) =>
                CT.esc(u.name) +
                (u.permRequest
                  ? '<div class="tiny pg-4">Có yêu cầu quyền: ' +
                    CT.esc(u.permRequest.role) +
                    "</div>"
                  : "") +
                (u.deactivationRequest
                  ? '<div class="tiny pg-5">Yêu cầu ngừng tài khoản</div>'
                  : ""),
            },
            { h: "Email", r: (u) => CT.esc(u.email) },
            { h: "Vai trò", r: (u) => roleText(u) },
            {
              h: "Trạng thái",
              r: (u) =>
                CT.ui.statusText("user", u.status) +
                (u.invited ? " · đã mời" : ""),
            },
            {
              h: "Thao tác",
              r: (u) => `<span class="cell-actions">${acts(u)}</span>`,
            },
          ],
          p.items,
        )
      : CT.ui.empty(
          "Không có người dùng phù hợp",
          "Thử đổi từ khóa hoặc nhóm vai trò.",
          '<button class="btn" id="clr" type="button">Xóa bộ lọc</button>',
        );
    CT.ui.pager($("#pager"), p, "tài khoản", (n) => {
      page = n;
      draw();
    });
    $("#pager").hidden = !l.length;
    const c = $("#clr");
    if (c)
      c.onclick = () => {
        tab = "all";
        q = "";
        $("#q").value = "";
        draw();
      };
    $("#log").innerHTML = CT.db
      .all("logs")
      .slice()
      .reverse()
      .slice(0, 5)
      .map(
        (x) => `<li><time>${CT.fmt.short(x.at)}</time>${CT.esc(x.text)}</li>`,
      )
      .join("");
  };
  const fill = (id) => {
    editId = id;
    const u = users.find((x) => x.id === id);
    f.name.value = u ? u.name : "";
    f.email.value = u ? u.email : "";
    f.email.disabled = !!u;
    ["creator", "curator", "admin"].forEach(
      (r) => (f["r_" + r].checked = !!u && u.roles.includes(r)),
    );
    f.reason.value = "";
    $("#ft").textContent = u
      ? "Chỉnh sửa tài khoản: " + u.name
      : "Thêm tài khoản mới";
    $("#invite").hidden = !!u;
    $("#save").textContent = u ? "Lưu quyền" : "Tạo & gửi lời mời";
    CT.$$(".field", f).forEach((x) => x.classList.remove("invalid"));
  };
  const rolesOf = () =>
    ["creator", "curator", "admin"].filter((r) => f["r_" + r].checked);
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const u = users.find((x) => x.id === editId),
      roles = rolesOf();
    const changed =
      !u || roles.slice().sort().join() !== u.roles.slice().sort().join();
    const ok = CT.ui.validate(f, {
      name: CT.ui.val.req("Nhập họ và tên."),
      email: (v) => {
        const m = CT.ui.val.email(v);
        if (m) return m;
        return !u &&
          users.some((x) => x.email.toLowerCase() === v.trim().toLowerCase())
          ? "Email này đã tồn tại."
          : "";
      },
      reason: (v) =>
        (changed && roles.length && !v.trim()) || (u && changed && !v.trim())
          ? "Nhập lý do thay đổi quyền."
          : "",
    });
    if (!ok) return;
    if (
      u &&
      u.roles.includes("admin") &&
      !roles.includes("admin") &&
      admins().length <= 1
    ) {
      CT.ui.setErr(
        f.r_admin,
        "Không thể gỡ quyền của quản trị viên cuối cùng.",
      );
      return;
    }
    if (
      u &&
      u.id === me.id &&
      u.roles.includes("admin") &&
      !roles.includes("admin")
    ) {
      CT.ui.setErr(
        f.r_admin,
        "Bạn không thể tự gỡ toàn bộ quyền quản trị của mình.",
      );
      return;
    }
    try {
      await CT.api.run(() => {
        if (u) {
          CT.db.update("users", u.id, (x) => {
            x.name = f.name.value.trim();
            x.roles = roles;
            if (roles.includes("creator")) delete x.permRequest;
          });
          if (changed) {
            log(
              `cập nhật quyền của ${u.name}: ${roles.map((r) => RL[r]).join(", ") || "chỉ Khám phá"} (${f.reason.value.trim()}).`,
            );
            CT.notify(u.id, {
              type: "system",
              title: "Quyền truy cập của bạn đã thay đổi",
              body:
                "Vai trò hiện tại: " +
                (roles.map((r) => RL[r]).join(", ") || "Người khám phá") +
                ". Lý do: " +
                f.reason.value.trim(),
              link: "personal-profile.html",
              linkLabel: "Xem không gian làm việc",
            });
          }
        } else {
          const n = CT.db.insert("users", {
            id: CT.uid("u"),
            name: f.name.value.trim(),
            email: f.email.value.trim(),
            password: null,
            invited: true,
            roles,
            status: "active",
            city: "",
            bio: "",
            joined: new Date().toISOString().slice(0, 10),
            saved: [],
            savedEvents: [],
            prefs: {
              review: true,
              events: true,
              weekly: true,
              publicProfile: false,
            },
            summaries: {},
            emailVerified: false,
          });
          log(`thêm tài khoản ${n.name} và gửi lời mời đặt mật khẩu.`);
        }
      });
      users = CT.db.all("users");
      CT.ui.toast(
        u
          ? "Đã lưu quyền."
          : "Đã tạo tài khoản và gửi lời mời đặt mật khẩu (mô phỏng).",
      );
      fill(null);
      draw();
    } catch (err) {
      CT.ui.toast(
        "Không thể lưu lúc này. Dữ liệu đã nhập được giữ lại.",
        "err",
      );
    }
  });
  $("#invite").onclick = () => {
    if (!CT.ui.validate(f, { email: CT.ui.val.email })) return;
    CT.ui.toast(
      "Đã gửi lại lời mời tới " + f.email.value.trim() + " (mô phỏng).",
    );
  };
  $("#cancel").onclick = () => {
    fill(null);
    CT.ui.toast("Đã hủy thay đổi.");
  };
  $("#newU").onclick = () => {
    fill(null);
    f.name.focus();
    f.scrollIntoView({ behavior: "smooth" });
  };
  $("#list").onclick = async (e) => {
    const b = e.target.closest("[data-a]");
    if (!b) return;
    const u = users.find((x) => x.id === b.dataset.id),
      a = b.dataset.a;
    try {
      if (a === "edit") {
        fill(u.id);
        f.scrollIntoView({ behavior: "smooth" });
        f.name.focus();
        return;
      }
      if (a === "why")
        return CT.ui.dialog({
          title: "Lý do vô hiệu hóa",
          html: `<div class="notice notice--warn"><strong>${CT.esc(u.name)}</strong><p>${CT.esc(u.disabledReason || "Không ghi lý do.")}</p></div>`,
        });
      if (a === "off") {
        if (u.roles.includes("admin") && admins().length <= 1) {
          CT.ui.toast("Không thể vô hiệu hóa quản trị viên cuối cùng.", "err");
          return;
        }
        const r = await CT.ui.confirm({
          title: "Vô hiệu hóa tài khoản?",
          text: `${CT.esc(u.name)} sẽ không thể đăng nhập; nội dung đã duyệt không bị xóa tự động. Cần lý do và thông báo cho chủ tài khoản.`,
          confirm: "Vô hiệu hóa",
          danger: true,
          reason: {
            label: "Lý do",
            required: true,
            placeholder: "Ví dụ: Theo yêu cầu tạm ngưng của chủ tài khoản.",
          },
        });
        if (!r) return;
        await CT.api.run(() => {
          CT.db.update("users", u.id, {
            status: "disabled",
            disabledReason: r.reason,
          });
          log(`vô hiệu hóa tài khoản ${u.name}: ${r.reason}`);
          CT.notify(u.id, {
            type: "system",
            title: "Tài khoản đã bị vô hiệu hóa",
            body: "Lý do: " + r.reason,
            link: "login.html",
            linkLabel: "Liên hệ hỗ trợ",
          });
        });
        CT.ui.toast("Đã vô hiệu hóa tài khoản.");
      }
      if (a === "react") {
        const r = await CT.ui.confirm({
          title: "Kích hoạt lại tài khoản?",
          text: `${CT.esc(u.name)} sẽ lấy lại các vai trò đã cấp. Chủ tài khoản nhận thông báo và có thể đăng nhập lại.`,
          confirm: "Kích hoạt lại",
        });
        if (!r) return;
        await CT.api.run(() => {
          CT.db.update("users", u.id, (x) => {
            x.status = "active";
            delete x.disabledReason;
            delete x.deactivationRequest;
          });
          log(`kích hoạt lại tài khoản ${u.name}.`);
          CT.notify(u.id, {
            type: "system",
            title: "Tài khoản đã được kích hoạt lại",
            body: "Bạn có thể đăng nhập và dùng các vai trò đã được cấp.",
            link: "login.html",
            linkLabel: "Đăng nhập",
          });
        });
        CT.ui.toast("Đã kích hoạt lại tài khoản.");
      }
      users = CT.db.all("users");
      draw();
    } catch (err) {
      CT.ui.toast("Không thể xử lý lúc này. Hãy thử lại.", "err");
    }
  };
  $("#tabs").onclick = (e) => {
    const b = e.target.closest("[data-t]");
    if (b) {
      tab = b.dataset.t;
      page = 1;
      draw();
    }
  };
  $("#q").oninput = CT.debounce((e) => {
    q = e.target.value;
    page = 1;
    draw();
  }, 200);
  $("#sort").onclick = (e) => {
    desc = !desc;
    e.target.textContent = desc ? "Mới cập nhật ↓" : "Cũ nhất ↑";
    draw();
  };
  fill(null);
  load();
});
