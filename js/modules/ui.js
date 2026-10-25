/* CultureTrail — thành phần giao diện dùng chung */
(function () {
  const CT = (window.CT = window.CT || {});
  const esc = (s) =>
    String(s == null ? "" : s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  CT.esc = esc;
  CT.$ = $;
  CT.$$ = $$;
  CT.debounce = (fn, ms) => {
    let t;
    return (...a) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...a), ms || 250);
    };
  };
  CT.norm = (s) =>
    String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");

  const ui = (CT.ui = {});

  /* ---------- Trạng thái nhãn ---------- */
  const STATUS = {
    story: {
      draft: ["Bản nháp", "off"],
      pending: ["Chờ duyệt", "warn"],
      processing: ["Đang xử lý", "warn"],
      approved: ["Đã duyệt", ""],
      archived: ["Lưu trữ", "off"],
    },
    event: {
      draft: ["Bản nháp", "off"],
      upcoming: ["Sắp diễn ra", ""],
      completed: ["Hoàn thành", ""],
      cancelled: ["Đã hủy", "bad"],
    },
    coll: {
      published: ["Đã xuất bản", ""],
      draft: ["Bản nháp", "warn"],
      archived: ["Đã lưu trữ", "off"],
    },
    tag: {
      active: ["Đang dùng", ""],
      archived: ["Lưu trữ", "off"],
      review: ["Cần rà soát", "warn"],
    },
    user: { active: ["Hoạt động", ""], disabled: ["Vô hiệu hóa", "bad"] },
  };
  ui.chip = (kind, st, story) => {
    let [l, c] = (STATUS[kind] && STATUS[kind][st]) || [st, "off"];
    if (kind === "story" && st === "rejected") {
      const fb = story && (story.feedback || []).slice(-1)[0];
      l = fb && fb.kind === "revise" ? "Cần chỉnh sửa" : "Bị từ chối";
      c = "bad";
    }
    return `<span class="chip ${c}">${esc(l)}</span>`;
  };
  ui.statusText = (kind, st, story) => {
    const m = ui.chip(kind, st, story).match(/>([^<]+)</);
    return m ? m[1] : st;
  };

  /* ---------- Ảnh minh họa ---------- */
  ui.img = (name, alt) =>
    `<img src="assets/images/${esc(name || "clay")}.svg" alt="${esc(alt || "")}" loading="lazy">`;
  ui.media = (name, o) => {
    o = o || {};
    return `<figure class="media ${o.cls || ""} u-1">${ui.img(name, o.alt || "")}${o.caption ? `<figcaption>${esc(o.caption)}</figcaption>` : ""}</figure>`;
  };

  /* ---------- Toast ---------- */
  ui.toast = (msg, type) => {
    let box = $(".toasts");
    if (!box) {
      box = document.createElement("div");
      box.className = "toasts";
      box.setAttribute("role", "status");
      box.setAttribute("aria-live", "polite");
      document.body.appendChild(box);
    }
    const t = document.createElement("div");
    t.className = "toast " + (type || "");
    t.textContent = msg;
    box.appendChild(t);
    setTimeout(() => t.remove(), 4200);
  };

  /* ---------- Hộp thoại ---------- */
  ui.dialog = (o) =>
    new Promise((res) => {
      const d = document.createElement("dialog");
      if (o.wide) d.classList.add("wide");
      d.setAttribute("aria-labelledby", "dlg-t");
      d.innerHTML = `<div class="dlg"><h2 id="dlg-t">${esc(o.title)}</h2><div class="dlg-body">${o.html || ""}</div><div class="actions dlg-actions">${(o.actions || [{ label: "Đóng", value: null, cls: "btn-outline" }]).map((a, i) => `<button type="button" class="btn ${a.cls || ""}" data-i="${i}">${esc(a.label)}</button>`).join("")}</div></div>`;
      document.body.appendChild(d);
      let done = false;
      const close = (v) => {
        if (done) return;
        done = true;
        d.close();
        d.remove();
        res(v);
      };
      d.addEventListener("cancel", (e) => {
        e.preventDefault();
        close(null);
      });
      d.addEventListener("click", (e) => {
        const b = e.target.closest("[data-i]");
        if (b) {
          const a = (o.actions || [{ value: null }])[+b.dataset.i];
          if (a.validate && !a.validate(d)) return;
          close(a.value !== undefined ? a.value : null);
        } else if (e.target === d) close(null);
      });
      d.showModal();
      if (o.onOpen) o.onOpen(d);
    });

  /* confirm có thể yêu cầu lý do bắt buộc */
  ui.confirm = (o) =>
    new Promise((res) => {
      const r = o.reason;
      const html =
        (o.text ? `<p class="muted">${o.text}</p>` : "") +
        (r
          ? `<div class="field"><label for="dlg-reason">${esc(r.label || "Lý do")}${r.required ? " *" : ""}</label><textarea id="dlg-reason" rows="3" placeholder="${esc(r.placeholder || "")}">${esc(r.value || "")}</textarea><span class="msg"></span></div>`
          : "");
      let reason = "";
      ui.dialog({
        title: o.title,
        html,
        actions: [
          { label: o.cancel || "Quay lại", value: null, cls: "btn-ghost" },
          {
            label: o.confirm || "Xác nhận",
            value: "ok",
            cls: o.danger ? "btn-danger" : "",
            validate: (d) => {
              if (!r) return true;
              const ta = $("#dlg-reason", d);
              const f = ta.closest(".field");
              if (r.required && !ta.value.trim()) {
                f.classList.add("invalid");
                $(".msg", f).textContent = r.error || "Vui lòng nhập lý do.";
                ta.focus();
                return false;
              }
              reason = ta.value.trim();
              return true;
            },
          },
        ],
        onOpen: (d) => {
          const ta = $("#dlg-reason", d);
          if (ta)
            ta.addEventListener("input", () =>
              ta.closest(".field").classList.remove("invalid"),
            );
        },
      }).then((v) => res(v === "ok" ? { ok: true, reason } : null));
    });

  /* ---------- Kiểm tra biểu mẫu ---------- */
  ui.setErr = (el, msg) => {
    const f = el.closest(".field") || el.closest(".check") || el.parentElement;
    f.classList.add("invalid");
    el.setAttribute("aria-invalid", "true");
    let m = f.querySelector(".msg");
    if (!m) {
      m = document.createElement("span");
      m.className = "msg";
      f.appendChild(m);
    }
    if (!m.id) m.id = "m" + Math.random().toString(36).slice(2, 7);
    m.textContent = msg;
    el.setAttribute("aria-describedby", m.id);
  };
  ui.clearErr = (el) => {
    const f = el.closest(".field") || el.closest(".check") || el.parentElement;
    if (f) f.classList.remove("invalid");
    el.removeAttribute("aria-invalid");
  };
  /* rules: { tênTrường: giáTrị => 'thông báo lỗi' | '' } — trả về true nếu hợp lệ */
  ui.validate = (form, rules) => {
    if (!form._live) {
      form._live = true;
      form.addEventListener("input", (e) => ui.clearErr(e.target));
      form.addEventListener("change", (e) => ui.clearErr(e.target));
    }
    let first = null;
    Object.keys(rules).forEach((n) => {
      const el = form.elements[n];
      if (!el) return;
      const v = el.type === "checkbox" ? el.checked : el.value;
      const m = rules[n](v, el);
      if (m) {
        ui.setErr(el, m);
        first = first || el;
      } else ui.clearErr(el);
    });
    if (first) first.focus();
    return !first;
  };
  ui.val = {
    req: (m) => (v) => (String(v).trim() ? "" : m),
    email: (v) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim())
        ? ""
        : "Nhập email hợp lệ, ví dụ ha@example.com.",
    pw: (v) =>
      String(v).length >= 8 && /[A-Za-zÀ-ỹ]/.test(v) && /\d/.test(v)
        ? ""
        : "Mật khẩu tối thiểu 8 ký tự, gồm chữ và số.",
  };
  ui.pwStrength = (pw) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Za-z]/.test(pw) && /\d/.test(pw)) s++;
    if (pw.length >= 12 || /[^A-Za-z0-9]/.test(pw)) s++;
    return pw ? Math.max(1, s) : 0;
  };
  ui.bindPwToggle = (root) => {
    CT.$$(".pw button", root).forEach((b) =>
      b.addEventListener("click", () => {
        const i = b.parentElement.querySelector("input");
        const show = i.type === "password";
        i.type = show ? "text" : "password";
        b.textContent = show ? "Ẩn mật khẩu" : "Hiện mật khẩu";
        b.setAttribute("aria-pressed", show);
      }),
    );
  };

  /* ---------- Bảng (tự chuyển thành thẻ trên di động) ---------- */
  ui.table = (cols, rows) =>
    `<div class="table-wrap"><table class="t"><thead><tr>${cols.map((c) => `<th scope="col">${esc(c.h)}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${cols.map((c) => `<td data-label="${esc(c.h)}">${c.r(r)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;

  /* ---------- Phân trang ---------- */
  ui.paginate = (arr, page, size) => {
    const pages = Math.max(1, Math.ceil(arr.length / size));
    page = Math.min(Math.max(1, page), pages);
    return {
      items: arr.slice((page - 1) * size, page * size),
      page,
      pages,
      total: arr.length,
    };
  };
  ui.pager = (el, p, label, onPage) => {
    el.innerHTML = `<span>Hiển thị ${p.items.length} / ${p.total} ${esc(label)} · Dữ liệu mẫu</span><span>${Array.from({ length: p.pages }, (_, i) => `<button type="button" data-p="${i + 1}" ${i + 1 === p.page ? 'aria-current="page"' : ""}>${i + 1}</button>`).join("")}${p.page < p.pages ? `<button type="button" data-p="${p.page + 1}">Tiếp →</button>` : ""}</span><span class="dot grey">Trang ${p.page} / ${p.pages}</span>`;
    el.onclick = (e) => {
      const b = e.target.closest("[data-p]");
      if (b) onPage(+b.dataset.p);
    };
  };

  /* ---------- Trạng thái: tải / trống / lỗi ---------- */
  ui.skeleton = (n, cls) =>
    `<div class="grid ${cls || "g2"}" aria-busy="true" aria-label="Đang tải">${Array.from({ length: n || 2 }, () => `<div class="sk-card"><div class="skeleton u-2"></div><div class="skeleton u-3"></div><div class="skeleton u-4"></div></div>`).join("")}</div>`;
  ui.skeletonRows = (n) =>
    `<div aria-busy="true" aria-label="Đang tải">${Array.from({ length: n || 4 }, () => `<div class="skeleton u-5"></div>`).join("")}</div>`;
  ui.empty = (title, text, actions) =>
    `<div class="state-box"><h3>${esc(title)}</h3><p>${esc(text)}</p><div class="actions">${actions || ""}</div></div>`;
  ui.showError = (el, retry, text) => {
    el.innerHTML = `<div class="state-box err" role="alert"><h3>Không tải được dữ liệu</h3><p>${esc(text || "Lỗi kết nối. Dữ liệu và bộ lọc bạn đã nhập vẫn được giữ.")}</p><div class="actions"><button class="btn" type="button" data-retry>Thử lại</button><a class="btn btn-ghost" href="javascript:history.back()">Về trang trước</a></div></div>`;
    el.querySelector("[data-retry]").onclick = retry;
  };
  ui.notice = (title, text, kind) =>
    `<div class="notice ${kind ? "notice--" + kind : ""}" role="${kind === "err" ? "alert" : "status"}"><strong>${esc(title)}</strong><p>${text}</p></div>`;

  /* ---------- Sơ đồ minh họa (KHÔNG phải bản đồ thật) ---------- */
  ui.schematic = (pts, o) => {
    o = o || {};
    const W = 700,
      H = 300;
    const P = pts.map((p) => ({
      ...p,
      px: (p.x / 100) * (W - 140) + 20,
      py: (p.y / 100) * (H - 60) + 10,
    }));
    const line =
      P.length > 1
        ? `<polyline points="${P.map((p) => `${p.px + 40},${p.py + 14}`).join(" ")}" fill="none" stroke="#AC5137" stroke-width="3" stroke-dasharray="9 7"/>`
        : "";
    const nodes = P.map((p) => {
      const w = Math.max(90, p.label.length * 6.6 + 18);
      return `<g class="pt" ${p.id ? `data-id="${esc(p.id)}" tabindex="0" role="button" aria-label="${esc(p.label)}"` : ""}><rect x="${p.px}" y="${p.py}" width="${w}" height="30" rx="6" fill="${p.hollow ? "#FFFDF7" : "#fff"}" stroke="${p.hollow ? "#AC5137" : "none"}"/><text x="${p.px + 10}" y="${p.py + 19}">${esc(p.label)}</text></g>`;
    }).join("");
    return `<div class="schematic" role="img" aria-label="Sơ đồ minh họa các điểm dừng, không dùng để chỉ đường"><p class="cap">Sơ đồ minh họa · Không dùng để chỉ đường</p><p class="sub">${esc(o.sub || "Vị trí và thời gian là dữ liệu mẫu, chưa xác minh.")}</p><svg viewBox="0 0 ${W} ${H}" aria-hidden="true">${line}${nodes}</svg></div>`;
  };

  /* ---------- Điểm dừng hành trình ---------- */
  ui.stopCard = (s, i, n) => {
    const p = CT.place(s.placeId) || { name: "(địa danh không còn)", note: "" };
    return `<article class="stop" data-i="${i}"><h3>${i + 1} · ${esc(p.name)}</h3><div class="small muted">${esc(p.note || p.lead || "")}${p.mins ? " · " + p.mins + " phút" : ""}</div><div class="ctrl"><span class="time">${esc(s.start)} – ${esc(s.end)}</span><button type="button" data-act="time">Sửa giờ</button><span aria-hidden="true">·</span><button type="button" data-act="up" ${i === 0 ? "disabled" : ""} aria-label="Đưa điểm ${i + 1} lên">↑</button><button type="button" data-act="down" ${i === n - 1 ? "disabled" : ""} aria-label="Đưa điểm ${i + 1} xuống">↓</button><span aria-hidden="true">·</span><button type="button" class="danger" data-act="del">Xóa</button></div></article>`;
  };
  const timeFields = (a, b) =>
    `<div class="form-grid"><div class="field"><label for="ts">Giờ bắt đầu</label><input id="ts" type="time" value="${a}"><span class="msg"></span></div><div class="field"><label for="te">Giờ kết thúc</label><input id="te" type="time" value="${b}"><span class="msg"></span></div></div>`;
  const checkTime = (d) => {
    const a = d.querySelector("#ts"),
      b = d.querySelector("#te");
    let ok = true;
    if (!a.value) {
      ui.setErr(a, "Chọn giờ bắt đầu.");
      ok = false;
    }
    if (!b.value) {
      ui.setErr(b, "Chọn giờ kết thúc.");
      ok = false;
    } else if (a.value && b.value <= a.value) {
      ui.setErr(b, "Giờ kết thúc phải sau giờ bắt đầu.");
      ok = false;
    }
    return ok;
  };
  ui.editTime = async (s) => {
    let out = null;
    const r = await ui.dialog({
      title: "Sửa giờ điểm dừng",
      html: timeFields(s.start, s.end),
      actions: [
        { label: "Quay lại", value: null, cls: "btn-ghost" },
        {
          label: "Lưu giờ",
          value: "ok",
          validate: (d) => {
            if (!checkTime(d)) return false;
            out = {
              start: d.querySelector("#ts").value,
              end: d.querySelector("#te").value,
            };
            return true;
          },
        },
      ],
    });
    return r ? out : null;
  };
  ui.addStop = async (exclude, preferParent) => {
    let out = null;
    const places = CT.db
      .all("places")
      .filter((p) => p.parentId && !(exclude || []).includes(p.id));
    if (!places.length) {
      ui.toast("Không còn điểm dừng nào trong kho nội dung để thêm.");
      return null;
    }
    const opts = places
      .map(
        (p) =>
          `<option value="${p.id}">${esc(p.name)} · ${esc(p.city)}</option>`,
      )
      .join("");
    const r = await ui.dialog({
      title: "Thêm địa danh vào hành trình",
      html: `<div class="field u-6"><label for="pl">Địa danh *</label><select id="pl">${opts}</select></div>${timeFields("09:00", "10:00")}<p class="small muted">Điểm được thêm cuối danh sách, bạn có thể đổi thứ tự sau.</p>`,
      actions: [
        { label: "Quay lại", value: null, cls: "btn-ghost" },
        {
          label: "Xác nhận thêm điểm",
          value: "ok",
          validate: (d) => {
            if (!checkTime(d)) return false;
            out = {
              id: CT.uid("st"),
              placeId: d.querySelector("#pl").value,
              start: d.querySelector("#ts").value,
              end: d.querySelector("#te").value,
            };
            return true;
          },
        },
      ],
      onOpen: (d) => {
        if (preferParent) {
          const o = places.find((p) => p.parentId === preferParent);
          if (o) d.querySelector("#pl").value = o.id;
        }
      },
    });
    return r ? out : null;
  };
  ui.bindStops = (el, getStops, onChange) =>
    el.addEventListener("click", async (e) => {
      const b = e.target.closest("[data-act]");
      if (!b || !b.closest(".stop")) return;
      const i = +b.closest(".stop").dataset.i,
        st = getStops(),
        a = b.dataset.act;
      if (a === "up" && i > 0) [st[i - 1], st[i]] = [st[i], st[i - 1]];
      if (a === "down" && i < st.length - 1)
        [st[i + 1], st[i]] = [st[i], st[i + 1]];
      if (a === "del") st.splice(i, 1);
      if (a === "time") {
        const t = await ui.editTime(st[i]);
        if (!t) return;
        Object.assign(st[i], t);
      }
      onChange();
    });
  ui.stopsPoints = (stops) =>
    stops.map((s, i) => {
      const p = CT.place(s.placeId) || { name: "?", x: 50, y: 50 };
      return {
        label:
          i +
          1 +
          " · " +
          p.name
            .replace(/^(Cổng làng|Xưởng gốm|Không gian trưng bày) /, (m) => m)
            .replace("Không gian trưng bày gốm", "Trưng bày gốm")
            .replace("Xưởng gốm Thu Hà", "Xưởng Thu Hà")
            .replace("Cổng làng Bát Tràng", "Cổng làng"),
        x: p.x,
        y: p.y,
      };
    });

  /* Thêm một địa danh vào hành trình của người dùng (dùng ở trang địa danh & chi tiết câu chuyện) */
  CT.trail = {
    async addPlace(placeId) {
      const u = CT.auth.user();
      if (!u) {
        CT.needLogin("Đăng nhập để thêm địa danh vào hành trình.");
        return;
      }
      const place = CT.place(placeId);
      if (!place) return;
      const trails = CT.db
        .all("trails")
        .filter((t) => t.userId === u.id && t.status === "active");
      const def =
        CT.db.all("places").find((p) => p.parentId === placeId) || place;
      let out = null;
      const r = await ui.dialog({
        title: "Thêm “" + place.name + "” vào hành trình",
        html: `<div class="field u-6"><label for="tr">Chọn hành trình</label><select id="tr">${trails.map((t) => `<option value="${t.id}">${esc(t.name)}</option>`).join("")}<option value="__new">＋ Tạo hành trình mới</option></select></div>${timeFields("09:00", "12:00")}<p class="small muted">Điểm được thêm cuối danh sách, có thể đổi thứ tự sau. Thời gian là dự kiến.</p>`,
        actions: [
          { label: "Quay lại", value: null, cls: "btn-ghost" },
          {
            label: "Xác nhận thêm điểm",
            value: "ok",
            validate: (d) => {
              if (!checkTime(d)) return false;
              out = {
                tr: d.querySelector("#tr").value,
                start: d.querySelector("#ts").value,
                end: d.querySelector("#te").value,
              };
              return true;
            },
          },
        ],
      });
      if (!r) return;
      try {
        const res = await CT.api.run(() => {
          const stop = {
            id: CT.uid("st"),
            placeId: def.id,
            start: out.start,
            end: out.end,
          };
          let t;
          if (out.tr === "__new")
            t = CT.db.insert("trails", {
              id: CT.uid("t"),
              userId: u.id,
              name: "Hành trình mới · " + place.name,
              date: "",
              city: place.province,
              status: "active",
              notes: "",
              stops: [stop],
              updatedAt: new Date().toISOString(),
            });
          else
            t = CT.db.update("trails", out.tr, (x) => {
              x.stops.push(stop);
              x.updatedAt = new Date().toISOString();
            });
          return t;
        });
        ui.toast("Đã thêm vào “" + res.name + "”.");
        const b = document.querySelector("[data-trail-link]");
        if (b) {
          b.href = "explorer-my-trail.html?id=" + res.id;
          b.hidden = false;
        }
      } catch (e) {
        ui.toast("Không thể thêm lúc này. Hãy thử lại.", "err");
      }
    },
  };

  ui.download = (name, text, mime) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([text], { type: mime || "text/plain" }),
    );
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 500);
  };
  ui.copy = async (t) => {
    try {
      await navigator.clipboard.writeText(t);
      return true;
    } catch (e) {
      return false;
    }
  };

  /* chip & mô tả thẻ câu chuyện */
  ui.storyCard = (s, o) => {
    s = CT.pub(s);
    o = o || {};
    const pl = CT.place(s.placeId) || {};
    const cr = CT.user(s.creatorId) || {};
    const u = CT.auth.user();
    const saved = u && (u.saved || []).includes(s.id);
    return `<article class="story-card">${o.noImg ? "" : ui.media(s.img || "clay", { alt: "Ảnh minh họa cho " + s.title })}<div class="body"><div class="kicker">${esc(CT.TOPICS[s.topic] || "")} · ${s.readMin} phút đọc</div><h3><a href="explorer-story-detail.html?id=${esc(s.id)}">${esc(s.title)}</a></h3><div class="meta">${esc(pl.name ? pl.name.replace(/^Làng gốm |^Phố cổ /, "") : s.placeHint || "")} · ${esc(pl.province || "")} • ${esc(cr.name || "")}</div><div class="links"><a href="explorer-story-detail.html?id=${esc(s.id)}">Đọc câu chuyện →</a>${o.noSave ? "" : `<button type="button" class="save-btn" data-save="${esc(s.id)}" aria-pressed="${!!saved}">Lưu</button>`}</div></div></article>`;
  };
  /* gắn sự kiện Lưu cho mọi nút [data-save] trong root */
  ui.bindSave = (root) => {
    (root || document).addEventListener("click", (e) => {
      const b = e.target.closest("[data-save]");
      if (!b) return;
      const u = CT.auth.user();
      if (!u) {
        ui.toast("Đăng nhập để lưu câu chuyện.");
        setTimeout(
          () =>
            (location.href =
              "login.html?next=" +
              encodeURIComponent(
                location.pathname.split("/").pop() + location.search,
              )),
          700,
        );
        return;
      }
      const id = b.dataset.save;
      const on = b.getAttribute("aria-pressed") !== "true";
      CT.db.update("users", u.id, (x) => {
        x.saved = (x.saved || []).filter((i) => i !== id);
        if (on) x.saved.push(id);
      });
      b.setAttribute("aria-pressed", on);
      ui.toast(on ? "Đã lưu câu chuyện." : "Đã bỏ lưu.");
      if (b.dataset.after)
        document.dispatchEvent(
          new CustomEvent("ct:saved", { detail: { id, on } }),
        );
    });
  };

  /* Trường nhập sinh bằng JS: ui.field({id,label,value,...}) */
  ui.field = (o) => {
    const a = `id="${o.id}" name="${o.name || o.id}" ${o.req ? "required" : ""} ${o.attrs || ""}`;
    let inp;
    if (o.options)
      inp = `<select ${a}>${o.options
        .map((x) => {
          const [v, l] = Array.isArray(x) ? x : [x, x];
          return `<option value="${esc(v)}" ${String(v) === String(o.value) ? "selected" : ""}>${esc(l)}</option>`;
        })
        .join("")}</select>`;
    else if (o.rows)
      inp = `<textarea ${a} rows="${o.rows}">${esc(o.value || "")}</textarea>`;
    else
      inp = `<input ${a} type="${o.type || "text"}" value="${esc(o.value || "")}">`;
    return `<div class="field ${o.cls || ""}"><label for="${o.id}">${esc(o.label)}${o.req ? " *" : ""}</label>${inp}${o.hint ? `<span class="hint">${esc(o.hint)}</span>` : ""}<span class="msg"></span></div>`;
  };
})();
