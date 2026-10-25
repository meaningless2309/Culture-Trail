CT.ready(() => {
  const me = CT.auth.user(),
    id = CT.param("id"),
    root = CT.$("#root");
  let s,
    applied = [];
  const notFound = () => {
    root.innerHTML = `<div class="state-box pg-3"><p class="eyebrow">404 · KHÔNG TÌM THẤY</p><h1>Không tìm thấy nội dung</h1><div class="actions"><a class="btn" href="curator-content-review.html">Về hàng đợi</a></div></div>`;
  };
  const load = () =>
    CT.api
      .get("stories", id)
      .then((x) => {
        if (!x) return notFound();
        s = x;
        applied = (s.tags || []).slice();
        draw();
      })
      .catch(() => CT.ui.showError(root, load));
  const canAct = () =>
    ["pending", "processing"].includes(s.status) && s.assignee === me.id;
  const draw = () => {
    const cr = CT.user(s.creatorId) || {},
      pl = CT.place(s.placeId);
    const eb =
      {
        pending: "CHỜ DUYỆT",
        processing: "ĐANG XỬ LÝ",
        approved: "ĐÃ DUYỆT",
        rejected: "ĐÃ TRẢ BÀI",
      }[s.status] || "";
    const lastFb = (s.feedback || []).slice(-1)[0];
    root.innerHTML = `
      <p class="crumbs"><a href="curator-content-review.html">Hàng đợi</a> / ${CT.esc(s.title)}</p>
      <p class="eyebrow">${eb} · PHIÊN BẢN ${s.version}</p><h1>${CT.esc(s.title)}</h1>
      <p class="lede">${CT.esc(cr.name || "")} · ${CT.esc(CT.storyPlaceName(s).replace(/^Làng gốm /, ""))} · Gửi ${s.submittedAt ? CT.fmt.dt(s.submittedAt).replace(" ", " lúc ") : "—"}</p>
      <div id="banner" class="mt"></div>
      <div class="tabbar-m"><button type="button" data-mp="a" aria-pressed="true">Nội dung</button><button type="button" data-mp="b" aria-pressed="false">Nguồn & AI ↓</button></div>
      <div class="split mt pg-4">
        <div class="stack">
          <section class="card" data-mpane="a"><div class="pg-5">${CT.ui.media(s.img || "clay", { alt: "Ảnh minh họa của bài", cls: "tall" })}</div>${s.sections.map((x) => `<h3 class="pg-6">${CT.esc(x.h === "Nội dung" ? "Nội dung bài gửi" : x.h)}</h3>${x.p.map((t) => `<p>${CT.esc(t)}</p>`).join("")}`).join("")}<div class="actions"><button class="link-btn" type="button" id="full">Mở bản đọc đầy đủ</button><button class="link-btn" type="button" id="cmp">So sánh phiên bản</button></div></section>
          <section class="card" data-mpane="b"><h2 class="panel-title">Nguồn & xuất xứ</h2><dl class="kv"><dt>Người kể / tác giả</dt><dd>${CT.esc(cr.name || "")} · Hồ sơ mẫu</dd><dt>Nguồn nội dung</dt><dd>Ghi chép cá nhân tại xưởng</dd><dt>Nguồn ảnh</dt><dd>${(s.imageSource || "").trim() ? CT.esc(s.imageSource) : '<b class="pg-7">Chưa có nguồn ảnh / quyền sử dụng</b>'}</dd><dt>Địa danh</dt><dd>${pl ? CT.esc(pl.name + " · " + pl.province) : '<span class="pg-7">Chưa liên kết</span> · ' + CT.esc(s.placeHint || "")}</dd></dl>
            <p class="small muted mt">Người gửi đã xác nhận quyền sử dụng. Biên tập viên vẫn cần đối chiếu và ghi chú kiểm tra.</p>
            <div class="field"><label for="cn">Ghi chú kiểm tra nguồn (nội bộ)</label><textarea id="cn" rows="3" ${canAct() ? "" : "disabled"}>${CT.esc(s.curatorNote || "")}</textarea></div>${canAct() ? '<p class="mt mb0"><button class="link-btn" type="button" id="svn">Lưu ghi chú</button></p>' : ""}</section>
          <section class="card" data-mpane="b"><h2 class="panel-title">Lịch sử xử lý</h2><ul class="timeline">${(s.history || []).map((h) => `<li><time>${CT.fmt.short(h.at)}</time>${CT.esc(h.text)}</li>`).join("") || '<li class="muted">Chưa có lịch sử.</li>'}<li class="muted">${["approved", "rejected"].includes(s.status) ? "Đã có quyết định" : "Chưa có quyết định cuối cùng"}</li></ul></section></div>
        <aside class="stack" data-mpane="b"><section class="card" id="ai"></section><section class="card" id="dec"></section></aside>
      </div>`;
    const bn = CT.$("#banner");
    if (s.status === "pending" && !s.assignee)
      bn.innerHTML = `<div class="notice notice--warn"><strong>Bạn chưa nhận bài này</strong><p>Nhận bài để ghi ghi chú, gán thẻ và đưa ra quyết định. <button class="link-btn" type="button" id="claim">Nhận bài</button></p></div>`;
    else if (
      ["pending", "processing"].includes(s.status) &&
      s.assignee !== me.id
    )
      bn.innerHTML = CT.ui.notice(
        "Bài đang do " +
          ((CT.user(s.assignee) || {}).name || "biên tập viên khác") +
          " phụ trách",
        "Bạn chỉ có thể xem. Không thể đưa ra quyết định thay người khác.",
        "warn",
      );
    else if (s.status === "approved")
      bn.innerHTML = CT.ui.notice(
        "Đã duyệt & xuất bản",
        "Quyết định đã hoàn tất. Thẻ đã gán: " +
          (applied.map((t) => (CT.tag(t) || {}).name).join(", ") || "chưa có") +
          ".",
        "ok",
      );
    else if (s.status === "rejected" && lastFb)
      bn.innerHTML = CT.ui.notice(
        (lastFb.kind === "revise"
          ? "Đã yêu cầu chỉnh sửa"
          : "Đã từ chối nội dung") +
          " · " +
          lastFb.by,
        CT.esc(lastFb.text),
        "warn",
      );
    const cl = CT.$("#claim");
    if (cl)
      cl.onclick = async () => {
        cl.disabled = true;
        try {
          await CT.api.run(() =>
            CT.db.update("stories", id, (x) => {
              x.status = "processing";
              x.assignee = me.id;
              x.history = (x.history || []).concat({
                at: new Date().toISOString(),
                text: me.name + " nhận duyệt",
              });
            }),
          );
          load();
        } catch (e) {
          cl.disabled = false;
          CT.ui.toast("Không thể nhận bài lúc này.", "err");
        }
      };
    CT.$("#full").onclick = () => CT.su.preview(s);
    CT.$("#cmp").onclick = () => {
      const o = s.liveSnapshot;
      CT.ui.dialog({
        title: "So sánh phiên bản",
        wide: true,
        html: o
          ? `<div class="grid g2"><div><h3>Bản công khai</h3><p><b>${CT.esc(o.title)}</b></p>${o.sections.map((x) => x.p.map((t) => `<p class="small">${CT.esc(t)}</p>`).join("")).join("")}</div><div><h3>Phiên bản ${s.version} (đang duyệt)</h3><p><b>${CT.esc(s.title)}</b></p>${s.sections.map((x) => x.p.map((t) => `<p class="small">${CT.esc(t)}</p>`).join("")).join("")}</div></div>`
          : `<p class="muted">Đây là phiên bản đầu tiên (hoặc chưa có bản công khai khác) nên chưa có gì để so sánh. Số từ hiện tại: ${CT.storyWords(s)}.</p>`,
      });
    };
    const sn = CT.$("#svn");
    if (sn)
      sn.onclick = () => {
        CT.db.update("stories", id, { curatorNote: CT.$("#cn").value.trim() });
        CT.ui.toast("Đã lưu ghi chú kiểm tra.");
      };
    tagsPanel();
    decision();
    mobile();
  };
  const mobile = () => {
    const bar = CT.$(".tabbar-m");
    const set = (k) => {
      bar
        .querySelectorAll("button")
        .forEach((b) => b.setAttribute("aria-pressed", b.dataset.mp === k));
      CT.$$("[data-mpane]").forEach((p) =>
        p.classList.toggle("m-off", p.dataset.mpane !== k),
      );
    };
    bar.onclick = (e) => {
      const b = e.target.closest("[data-mp]");
      if (b) {
        set(b.dataset.mp);
        window.scrollTo({ top: 0 });
      }
    };
    set("a");
  };
  /* ---------- AI gợi ý thẻ: con người giữ quyền quyết định ---------- */
  const tagsPanel = () => {
    const el = CT.$("#ai"),
      act = canAct();
    let job = null,
      res = null,
      picked = [];
    const head = '<h2 class="panel-title">AI gợi ý thẻ</h2>';
    const appliedHtml = () =>
      `<div class="field pg-8"><span class="lbl">Thẻ đã gán cho nội dung</span><div class="chips">${applied.length ? applied.map((t) => `<span class="chip">${CT.esc((CT.tag(t) || {}).name)}${act ? `<button type="button" data-un="${t}" aria-label="Gỡ thẻ">×</button>` : ""}</span>`).join("") : '<span class="small muted">Chưa có thẻ nào</span>'}</div></div>`;
    const catalog = () =>
      CT.db.all("tags").filter((t) => t.parentId && t.status !== "archived");
    const manual = () =>
      act
        ? `<div class="field pg-8"><label for="mt">Sửa / thêm thẻ thủ công</label><select id="mt"><option value="">Chọn trong danh mục…</option>${catalog()
            .filter((t) => !applied.includes(t.id))
            .map((t) => `<option value="${t.id}">${CT.esc(t.name)}</option>`)
            .join("")}</select></div>`
        : "";
    const bindCommon = () => {
      el.querySelectorAll("[data-un]").forEach(
        (b) =>
          (b.onclick = () => {
            applied = applied.filter((x) => x !== b.dataset.un);
            CT.db.update("stories", id, { tags: applied });
            CT.ui.toast("Đã gỡ thẻ.");
            idle();
          }),
      );
      const m = el.querySelector("#mt");
      if (m)
        m.onchange = () => {
          if (m.value) {
            applied.push(m.value);
            CT.db.update("stories", id, { tags: applied });
            CT.ui.toast("Đã gán thẻ thủ công.");
            idle();
          }
        };
    };
    const idle = () => {
      el.innerHTML =
        head +
        `<p class="small muted">Kết quả mẫu · chưa áp dụng. AI chỉ gợi ý từ nội dung và danh mục hiện có; không tự tạo thẻ.</p>${appliedHtml()}${manual()}${act ? '<div class="actions"><button class="btn btn-sm" type="button" id="go">Gợi ý thẻ</button></div>' : '<p class="small muted">Nhận bài để dùng gợi ý thẻ.</p>'}`;
      bindCommon();
      const g = el.querySelector("#go");
      if (g) g.onclick = run;
    };
    const run = () => {
      el.innerHTML =
        head +
        `<div role="status" aria-busy="true"><p><b>Đang xử lý…</b> Giữ đầu vào. Đang phân tích và đối chiếu dữ liệu mẫu. Không gửi yêu cầu trùng.</p><div class="skeleton pg-9"></div><div class="skeleton pg-10"></div><div class="actions"><button class="btn btn-ghost btn-sm" type="button" id="stop">Dừng / Bỏ qua AI</button></div></div>`;
      job = CT.ai.recommendTags(s);
      el.querySelector("#stop").onclick = () => {
        job.cancel();
        idle();
      };
      job.promise
        .then((r) => {
          res = r;
          picked = r.suggestions ? r.suggestions.map((x) => x.tagId) : [];
          show();
        })
        .catch((err) => {
          if (err && err.cancelled) return;
          el.innerHTML =
            head +
            `<div class="notice notice--err" role="alert"><strong>Không thể xử lý yêu cầu lúc này</strong><p>Giữ nguyên dữ liệu đã nhập. Không tự lưu kết quả dở dang. Thử lại hoặc bỏ qua để gán thủ công.</p></div><div class="actions"><button class="btn btn-sm" type="button" id="rt">Thử lại</button><button class="btn btn-ghost btn-sm" type="button" id="sk">Bỏ qua</button></div>`;
          el.querySelector("#rt").onclick = run;
          el.querySelector("#sk").onclick = idle;
        });
    };
    const show = () => {
      if (res.status === "insufficient") {
        el.innerHTML =
          head +
          `<div class="notice notice--warn" role="status"><strong>Không đủ dữ liệu để đưa ra đề xuất</strong><p>${CT.esc(res.message)}</p></div>${appliedHtml()}${manual()}<div class="actions"><button class="btn btn-ghost btn-sm" type="button" id="sk">Đóng</button></div>`;
        bindCommon();
        el.querySelector("#sk").onclick = idle;
        return;
      }
      el.innerHTML =
        head +
        `<p class="small muted">Kết quả mẫu · chưa áp dụng</p><div class="field"><span class="lbl">Nguồn phân tích</span>Nội dung phiên bản ${s.version} · ${CT.storyWords(s)} từ</div>
        <div class="tagpick" role="group" aria-label="Thẻ gợi ý">${res.suggestions.map((x) => `<button type="button" class="chip ${x.low ? "low" : ""}" data-pk="${x.tagId}" aria-pressed="${picked.includes(x.tagId)}" style="cursor:pointer;${picked.includes(x.tagId) ? "" : "opacity:.45;text-decoration:line-through"}">${CT.esc(x.name)} ${picked.includes(x.tagId) ? "×" : "＋"}</button>`).join("")}</div>
        ${res.suggestions.map((x) => `<p class="small"><b>${CT.esc(x.name)}:</b> ${CT.esc(x.reason)}</p>`).join("")}
        ${res.status === "uncertain" ? '<div class="notice notice--warn"><strong>Gợi ý chưa chắc chắn</strong><p>Thẻ màu đất nung có thể quá rộng. Xóa thẻ này hoặc chọn thẻ cụ thể trước khi áp dụng.</p></div>' : ""}
        ${manual()}<div class="actions"><button class="btn btn-sm" type="button" id="ap" ${picked.length ? "" : "disabled"}>Chấp nhận ${picked.length} thẻ</button><button class="btn btn-ghost btn-sm" type="button" id="re">Tạo lại</button></div><div class="actions pg-11"><button class="link-btn" type="button" id="ds">Bỏ gợi ý</button></div><p class="tiny muted">AI không xuất bản, không tạo danh mục và không tự gán thẻ chưa được chấp nhận.</p>`;
      el.querySelectorAll("[data-pk]").forEach(
        (b) =>
          (b.onclick = () => {
            const k = b.dataset.pk;
            picked = picked.includes(k)
              ? picked.filter((x) => x !== k)
              : picked.concat(k);
            show();
          }),
      );
      const m = el.querySelector("#mt");
      if (m)
        m.onchange = () => {
          if (m.value) {
            const t = CT.tag(m.value);
            res.suggestions.push({
              tagId: t.id,
              name: t.name,
              reason: "Gán thủ công bởi biên tập viên.",
            });
            picked.push(t.id);
            show();
          }
        };
      el.querySelector("#ds").onclick = idle;
      el.querySelector("#re").onclick = async () => {
        if (picked.length !== res.suggestions.length) {
          const c = await CT.ui.confirm({
            title: "Tạo lại gợi ý?",
            text: "Lựa chọn thẻ hiện tại chưa áp dụng sẽ bị thay thế. Thẻ đã gán không bị ghi đè.",
            confirm: "Tạo lại",
          });
          if (!c) return;
        }
        run();
      };
      el.querySelector("#ap").onclick = () => {
        applied = [...new Set(applied.concat(picked))];
        CT.db.update("stories", id, { tags: applied });
        el.innerHTML =
          head +
          `<div class="notice notice--ok" role="status"><strong>Chấp nhận & lưu thành công</strong><p>Chỉ ${picked.length} thẻ được người duyệt chấp nhận đã được áp dụng. Gán thẻ không tự duyệt nội dung.</p></div>${appliedHtml()}${manual()}<div class="actions"><button class="btn btn-ghost btn-sm" type="button" id="sk">Tiếp tục duyệt</button></div>`;
        bindCommon();
        el.querySelector("#sk").onclick = idle;
        CT.ui.toast("Đã áp dụng " + picked.length + " thẻ.");
      };
    };
    idle();
  };
  /* ---------- Quyết định biên tập ---------- */
  const decision = () => {
    const el = CT.$("#dec"),
      act = canAct();
    el.innerHTML = `<h2 class="panel-title">Quyết định biên tập</h2><form id="df" novalidate class="form-stack"><label class="check"><input type="checkbox" name="c1" ${act ? "" : "disabled"}> Đã đọc nội dung và nguồn</label><label class="check"><input type="checkbox" name="c2" ${act ? "" : "disabled"}> Địa danh phù hợp</label><label class="check"><input type="checkbox" name="c3" ${act ? "" : "disabled"}> Đã xác minh quyền dùng ảnh thực tế</label>
      <div class="field"><label for="rs">Lý do trả bài / yêu cầu sửa *</label><textarea id="rs" name="rs" rows="3" ${act ? "" : "disabled"} placeholder="Ví dụ: Bổ sung ảnh có quyền sử dụng và xác nhận của tác giả ảnh."></textarea><span class="hint">Bắt buộc nếu từ chối hoặc yêu cầu chỉnh sửa. Phản hồi sẽ gửi đến tác giả.</span><span class="msg"></span></div>
      <div class="actions"><button class="btn" type="button" id="ok" ${act ? "" : "disabled"}>Duyệt & xuất bản</button></div><div class="actions pg-11"><button class="link-btn" type="button" id="rv" ${act ? "" : "disabled"}>Yêu cầu chỉnh sửa</button><button class="link-btn danger" type="button" id="rj" ${act ? "" : "disabled"}>Từ chối nội dung</button></div></form>`;
    if (!act) return;
    const f = CT.$("#df");
    let busy = false,
      leaving = false;
    const setBusy = (value) => {
      f.querySelectorAll("button, input, textarea").forEach((control) => {
        control.disabled = value;
      });
    };
    const unlock = () => {
      if (!leaving) {
        busy = false;
        setBusy(false);
      }
    };
    const back = async (kind) => {
      if (
        busy ||
        !CT.ui.validate(f, {
          rs: (v) =>
            v.trim()
              ? ""
              : "Bắt buộc nhập lý do khi " +
                (kind === "revise"
                  ? "yêu cầu chỉnh sửa."
                  : "từ chối nội dung."),
        })
      )
        return;
      busy = true;
      setBusy(true);
      try {
        const confirmed = await CT.ui.confirm({
          title:
            kind === "revise" ? "Gửi yêu cầu chỉnh sửa?" : "Từ chối nội dung?",
          text: "Phản hồi của bạn sẽ được gửi tới tác giả và lưu trong lịch sử.",
          confirm: kind === "revise" ? "Gửi yêu cầu" : "Từ chối",
          danger: kind === "reject",
        });
        if (!confirmed) return;
        const now = new Date().toISOString();
        await CT.api.run(() => {
          CT.db.update("stories", id, (x) => {
            x.status = "rejected";
            x.assignee = null;
            x.feedback = (x.feedback || []).concat({
              at: now,
              by: me.name,
              kind,
              text: f.rs.value.trim(),
            });
            x.history = (x.history || []).concat({
              at: now,
              text: `${me.name} ${kind === "revise" ? "yêu cầu chỉnh sửa" : "từ chối nội dung"}`,
            });
          });
          CT.notify(s.creatorId, {
            type: "content",
            title: `Câu chuyện “${s.title}” ${kind === "revise" ? "cần chỉnh sửa" : "chưa được duyệt"}`,
            body: f.rs.value.trim(),
            link: "creator-story-editor.html?id=" + s.id,
            linkLabel: "Mở phản hồi",
          });
        });
        CT.ui.toast(
          kind === "revise"
            ? "Đã gửi yêu cầu chỉnh sửa cho tác giả."
            : "Đã từ chối nội dung và gửi phản hồi.",
        );
        leaving = true;
        setTimeout(() => (location.href = "curator-content-review.html"), 700);
      } catch (e) {
        CT.ui.toast(
          "Không thể xử lý lúc này. Dữ liệu bạn đã nhập được giữ lại.",
          "err",
        );
      } finally {
        unlock();
      }
    };
    CT.$("#rv").onclick = () => back("revise");
    CT.$("#rj").onclick = () => back("reject");
    CT.$("#ok").onclick = async () => {
      if (busy) return;
      const miss = [];
      if (!f.c1.checked) miss.push("đọc nội dung và nguồn");
      if (!f.c2.checked) miss.push("xác nhận địa danh phù hợp");
      if (!f.c3.checked) miss.push("xác minh quyền dùng ảnh");
      if (!(s.imageSource || "").trim()) {
        CT.ui.toast(
          "Chưa có nguồn ảnh. Hãy yêu cầu chỉnh sửa thay vì duyệt.",
          "err",
        );
        CT.ui.setErr(
          f.rs,
          "Thiếu nguồn ảnh: nhập lý do và chọn “Yêu cầu chỉnh sửa”.",
        );
        return;
      }
      if (!s.placeId) {
        CT.ui.toast(
          "Địa danh chưa được liên kết. Liên kết trong Bản đồ nội dung trước khi duyệt.",
          "err",
        );
        return;
      }
      if (miss.length) {
        CT.ui.toast(
          "Hoàn thành kiểm tra trước khi duyệt: " + miss.join(", ") + ".",
          "err",
        );
        return;
      }
      busy = true;
      setBusy(true);
      try {
        const confirmed = await CT.ui.dialog({
          title: "Xác nhận duyệt?",
          html: `<p class="muted">Nội dung phiên bản ${s.version} và các thẻ đã chọn (${applied.length}) sẽ công khai. Chỉ xác nhận sau khi hoàn thành kiểm tra nguồn.</p>`,
          actions: [
            { label: "Quay lại", value: null, cls: "btn-ghost" },
            { label: "Xác nhận xuất bản", value: "ok" },
          ],
        });
        if (!confirmed) return;
        const now = new Date().toISOString();
        await CT.api.run(() => {
          CT.db.update("stories", id, (x) => {
            x.status = "approved";
            x.live = true;
            x.assignee = null;
            delete x.liveSnapshot;
            x.approvedAt = now;
            x.updatedAt = now;
            x.history = (x.history || []).concat({
              at: now,
              text: `${me.name} duyệt & xuất bản phiên bản ${x.version}`,
            });
          });
          CT.notify(s.creatorId, {
            type: "content",
            title: `“${s.title}” đã được duyệt`,
            body: "Câu chuyện của bạn đã xuất bản và có thể được tìm thấy trong Khám phá.",
            link: "explorer-story-detail.html?id=" + s.id,
            linkLabel: "Xem câu chuyện",
          });
        });
        CT.ui.toast("Đã duyệt & xuất bản.");
        leaving = true;
        setTimeout(() => (location.href = "curator-content-review.html"), 700);
      } catch (e) {
        CT.ui.toast("Không thể xuất bản lúc này. Hãy thử lại.", "err");
      } finally {
        unlock();
      }
    };
  };
  load();
});
