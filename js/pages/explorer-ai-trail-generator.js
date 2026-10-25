CT.ready(() => {
  const u = CT.auth.user(),
    f = CT.$("#gf"),
    out = CT.$("#out");
  let res = null,
    job = null,
    dirty = false,
    name = "";
  const step = (n) =>
    CT.$$("#stepper span").forEach((s, i) => s.classList.toggle("on", i < n));
  const input = () => ({
    city: f.city.value,
    topic: f.topic.value,
    hours: +f.hours.value,
    period: f.period.value,
    slow: f.slow.checked,
    workshop: f.workshop.checked,
    freeOnly: f.free.checked,
  });
  const processing = () => {
    step(1);
    CT.$("#why").classList.add("hidden");
    out.innerHTML = `<div class="card" role="status" aria-busy="true"><h2 class="panel-title">Đang xử lý…</h2><p>Giữ đầu vào. Đang phân tích và đối chiếu dữ liệu mẫu. Không gửi yêu cầu trùng; bạn có thể dừng và làm thủ công.</p><div class="skeleton pg-3"></div><div class="skeleton pg-4"></div><div class="actions"><button class="btn btn-ghost" type="button" id="stop">Dừng / Bỏ qua AI</button></div></div>`;
    CT.$("#stop").onclick = () => {
      job.cancel();
      CT.$("#gen").disabled = false;
      out.innerHTML = CT.ui.empty(
        "Đã dừng",
        "Bạn có thể đổi sở thích rồi tạo lại, hoặc tự thêm địa danh.",
        '<a class="btn" href="explorer-my-trail.html?new=1">Tự tạo hành trình</a>',
      );
    };
  };
  const run = async () => {
    if (
      !CT.ui.validate(f, {
        city: CT.ui.val.req("Chọn thành phố để tiếp tục."),
        topic: CT.ui.val.req("Chọn chủ đề để tiếp tục."),
      })
    )
      return;
    if (res && dirty) {
      const c = await CT.ui.confirm({
        title: "Tạo lại gợi ý?",
        text: "Gợi ý hiện tại có chỉnh sửa chưa lưu và sẽ bị thay thế. Hành trình đã lưu không bị ghi đè.",
        confirm: "Tạo lại",
      });
      if (!c) return;
    }
    const btn = CT.$("#gen");
    btn.disabled = true;
    processing();
    job = CT.ai.generateTrail(input());
    try {
      const r = await job.promise;
      btn.disabled = false;
      btn.textContent = "✦ Tạo lại gợi ý";
      if (r.status === "insufficient") {
        res = null;
        step(1);
        out.innerHTML = `<div class="notice notice--warn" role="status"><strong>Không đủ dữ liệu để đưa ra đề xuất</strong><p>${CT.esc(r.message)}</p></div><div class="actions"><button class="btn btn-outline" type="button" onclick="document.getElementById('topic').focus()">Bổ sung / đổi sở thích</button><a class="btn btn-ghost" href="explorer-my-trail.html?new=1">Làm thủ công</a></div>`;
        return;
      }
      res = r;
      name = r.name;
      dirty = false;
      show();
    } catch (err) {
      btn.disabled = false;
      if (err && err.cancelled) return;
      step(1);
      out.innerHTML = `<div class="notice notice--err" role="alert"><strong>Không thể xử lý yêu cầu lúc này</strong><p>Giữ nguyên dữ liệu đã nhập. Không tự lưu kết quả dở dang. Thử lại hoặc bỏ qua để tiếp tục thủ công.</p></div><div class="actions"><button class="btn" type="button" id="retry">Thử lại</button><a class="btn btn-ghost" href="explorer-my-trail.html?new=1">Bỏ qua</a></div>`;
      CT.$("#retry").onclick = run;
    }
  };
  const show = () => {
    step(3);
    const r = res;
    out.innerHTML = `<div class="row between"><div><h2 class="pg-5">${CT.esc(name)}</h2><p class="muted small">Gợi ý mẫu · ${r.stops[0].start} – ${r.stops[r.stops.length - 1].end} · ${r.stops.length} điểm</p></div><span class="dot clay">Chưa lưu</span></div>
      <div class="notice notice--warn mt"><strong>AI chưa xác minh lịch mở cửa và khoảng cách</strong><p>Đây là gợi ý minh họa, không phải hướng dẫn địa lý thực tế. Kiểm tra thông tin với cơ sở và chỉnh lại thời gian trước khi đi.</p></div>
      ${r.status === "uncertain" ? '<div class="notice notice--warn mt"><strong>AI chưa chắc chắn về kết quả này</strong><p>Chỉ tìm được ít điểm phù hợp. Kiểm tra hoặc bổ sung điểm thủ công.</p></div>' : ""}
      <div class="mt">${CT.ui.schematic(CT.ui.stopsPoints(r.stops))}</div>
      <div class="mt" id="stops">${r.stops.map((s, i) => CT.ui.stopCard(s, i, r.stops.length)).join("")}</div>
      <div class="actions"><button class="link-btn" type="button" id="addS">Thêm / đổi điểm dừng</button></div>
      <form id="sf" class="mt" novalidate><div class="field"><label for="nm">Tên hành trình sau khi lưu *</label><input id="nm" name="nm" value="${CT.esc(name)}"><span class="msg"></span></div>
      <div class="actions"><button class="btn" type="submit" id="acc">Chấp nhận & lưu hành trình</button><a class="btn btn-ghost" href="explorer-my-trail.html?new=1" id="skip">Không dùng gợi ý</a></div></form>
      <p class="small muted">Bạn có thể từ chối gợi ý và tự tạo hành trình thủ công. Chỉ lưu sau khi bạn xác nhận.</p>`;
    const w = CT.$("#why");
    w.classList.remove("hidden");
    w.innerHTML = `<h2 class="panel-title">Vì sao có ${r.stops.length} điểm này?</h2><p>${CT.esc(r.explain)}</p><p>${CT.esc(r.breakNote)}</p><span class="dot clay">Giải thích từ dữ liệu mẫu</span>`;
    CT.ui.bindStops(
      CT.$("#stops"),
      () => res.stops,
      () => {
        dirty = true;
        show();
      },
    );
    CT.$("#addS").onclick = async () => {
      const s = await CT.ui.addStop(
        res.stops.map((x) => x.placeId),
        res.parent && res.parent.id,
      );
      if (s) {
        res.stops.push(s);
        dirty = true;
        show();
      }
    };
    const sf = CT.$("#sf");
    sf.nm.oninput = () => {
      name = sf.nm.value;
      dirty = true;
    };
    sf.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!CT.ui.validate(sf, { nm: CT.ui.val.req("Nhập tên hành trình.") }))
        return;
      if (!res.stops.length) {
        CT.ui.toast("Cần ít nhất một điểm dừng để lưu.", "err");
        return;
      }
      CT.$("#acc").disabled = true;
      try {
        const t = await CT.api.run(() =>
          CT.db.insert("trails", {
            id: CT.uid("t"),
            userId: u.id,
            name: name.trim(),
            date: "",
            city: res.parent.province,
            status: "active",
            notes: "",
            stops: res.stops,
            updatedAt: new Date().toISOString(),
          }),
        );
        CT.notify(u.id, {
          type: "trail",
          title: `Đã lưu “${t.name}”`,
          body: `${t.stops.length} điểm dừng đã được lưu vào hành trình cá nhân. Bạn có thể tiếp tục chỉnh sửa.`,
          link: "explorer-my-trail.html?id=" + t.id,
          linkLabel: "Mở hành trình",
        });
        CT.ui.toast("Đã lưu hành trình. Đang mở…");
        dirty = false;
        setTimeout(
          () => (location.href = "explorer-my-trail.html?id=" + t.id),
          700,
        );
      } catch (err) {
        CT.ui.toast(
          "Không thể lưu lúc này. Gợi ý và chỉnh sửa của bạn vẫn được giữ.",
          "err",
        );
        CT.$("#acc").disabled = false;
      }
    });
  };
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    run();
  });
  window.addEventListener("beforeunload", (e) => {
    if (dirty) {
      e.preventDefault();
      e.returnValue = "";
    }
  });
});
