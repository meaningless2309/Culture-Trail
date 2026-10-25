CT.ready(() => {
  const me = CT.auth.user();
  let tags = [],
    tab = "active",
    q = "",
    cat = "",
    desc = true,
    editId = null;
  const f = CT.$("#f"),
    $ = CT.$;
  const load = () => {
    $("#list").innerHTML = CT.ui.skeletonRows(4);
    CT.api
      .list("tags")
      .then((d) => {
        tags = d;
        draw();
      })
      .catch(() => CT.ui.showError($("#list"), load));
  };
  const used = (id) =>
    CT.db.all("stories").filter((s) => (s.tags || []).includes(id)).length;
  const cats = () => tags.filter((t) => !t.parentId);
  const log = (t) => {
    CT.db.insert("taglogs", {
      id: CT.uid("tl"),
      at: new Date().toISOString(),
      text: `${me.name} ${t}`,
    });
  };
  const draw = () => {
    const kids = tags.filter((t) => t.parentId);
    const c = (k) => kids.filter((t) => t.status === k).length;
    $("#tabs").innerHTML = [
      ["active", "Đang dùng"],
      ["archived", "Lưu trữ"],
      ["review", "Chờ rà soát"],
    ]
      .map(
        (t) =>
          `<button role="tab" type="button" data-t="${t[0]}" aria-selected="${tab === t[0]}">${t[1]} (${c(t[0])})</button>`,
      )
      .join("");
    $("#tree").innerHTML = cats()
      .map(
        (ct) =>
          `<details class="tree" ${cat === ct.id || ct.id === "cat-craft" ? "open" : ""}><summary data-cat="${ct.id}">${CT.esc(ct.name)}</summary>${
            kids
              .filter((t) => t.parentId === ct.id && t.status !== "archived")
              .map(
                (t) =>
                  `<button type="button" class="leaf-btn" data-edit="${t.id}" aria-pressed="${editId === t.id}">${CT.esc(t.name)}</button>`,
              )
              .join("") || '<span class="small muted pg-2">Chưa có thẻ</span>'
          }</details>`,
      )
      .join("");
    $("#parentId").innerHTML =
      '<option value="">(Chọn danh mục)</option>' +
      cats()
        .map((x) => `<option value="${x.id}">${CT.esc(x.name)}</option>`)
        .join("");
    let l = kids.filter(
      (t) =>
        t.status === tab &&
        (!cat || t.parentId === cat) &&
        (!q || CT.norm(t.name + " " + t.synonyms).includes(CT.norm(q))),
    );
    l.sort((a, b) => (desc ? -1 : 1) * a.name.localeCompare(b.name, "vi"));
    $("#list").innerHTML = l.length
      ? (cat
          ? `<p class="small muted">Đang lọc theo danh mục “${CT.esc((tags.find((x) => x.id === cat) || {}).name)}” · <button class="link-btn" id="uncat" type="button">Bỏ lọc</button></p>`
          : "") +
        CT.ui.table(
          [
            { h: "Thẻ", r: (t) => CT.esc(t.name) },
            {
              h: "Danh mục cha",
              r: (t) =>
                CT.esc((tags.find((x) => x.id === t.parentId) || {}).name),
            },
            { h: "Bài liên quan", r: (t) => used(t.id) },
            { h: "Trạng thái", r: (t) => CT.ui.statusText("tag", t.status) },
            {
              h: "Thao tác",
              r: (t) =>
                `<span class="cell-actions">${t.status === "archived" ? `<button class="link-btn" data-a="restore" data-id="${t.id}" type="button">Khôi phục</button>` : `<button class="link-btn" data-a="edit" data-id="${t.id}" type="button">Sửa</button><button class="link-btn" data-a="merge" data-id="${t.id}" type="button">Gộp</button>${t.status === "review" ? `<button class="link-btn" data-a="ok" data-id="${t.id}" type="button">Duyệt dùng</button>` : ""}<button class="link-btn" data-a="arch" data-id="${t.id}" type="button">Lưu trữ</button>`}</span>`,
            },
          ],
          l,
        )
      : CT.ui.empty(
          "Không có thẻ phù hợp",
          q
            ? "Không tìm thấy từ khóa này. Thử tên khác hoặc từ đồng nghĩa."
            : "Chưa có thẻ ở trạng thái này.",
          '<button class="btn" id="clr" type="button">Xóa bộ lọc</button>',
        );
    const u = $("#uncat");
    if (u)
      u.onclick = () => {
        cat = "";
        draw();
      };
    const cl = $("#clr");
    if (cl)
      cl.onclick = () => {
        q = "";
        cat = "";
        $("#q").value = "";
        draw();
      };
    $("#log").innerHTML = CT.db
      .all("taglogs")
      .slice()
      .reverse()
      .slice(0, 6)
      .map(
        (x) => `<li><time>${CT.fmt.short(x.at)}</time>${CT.esc(x.text)}</li>`,
      )
      .join("");
  };
  const fill = (id) => {
    editId = id;
    const t = tags.find((x) => x.id === id);
    f.name.value = t ? t.name : "";
    f.parentId.value = t ? t.parentId : "";
    f.desc.value = t ? t.desc : "";
    f.syn.value = t ? t.synonyms : "";
    $("#ft").textContent = t ? "Chỉnh sửa thẻ: " + t.name : "Tạo thẻ mới";
    CT.$$(".field", f).forEach((x) => x.classList.remove("invalid"));
    draw();
  };
  $("#newTag").onclick = () => {
    fill(null);
    f.name.focus();
    f.scrollIntoView({ behavior: "smooth" });
  };
  $("#cancel").onclick = () => {
    fill(null);
    CT.ui.toast("Đã hủy thay đổi.");
  };
  f.addEventListener("submit", async (e) => {
    e.preventDefault();
    const ok = CT.ui.validate(f, {
      name: (v) =>
        !v.trim()
          ? "Nhập tên thẻ."
          : tags.some((t) => t.id !== editId && CT.norm(t.name) === CT.norm(v))
            ? "Tên thẻ đã tồn tại. Hãy gộp hoặc chọn tên khác."
            : "",
      parentId: (v) => (v ? "" : "Chọn danh mục cha."),
    });
    if (!ok) return;
    try {
      await CT.api.run(() => {
        const body = {
          name: f.name.value.trim(),
          parentId: f.parentId.value,
          desc: f.desc.value.trim(),
          synonyms: f.syn.value.trim(),
        };
        if (editId) {
          CT.db.update("tags", editId, body);
          log(`sửa thẻ “${body.name}”.`);
        } else {
          CT.db.insert(
            "tags",
            Object.assign({ id: CT.uid("t"), status: "active" }, body),
          );
          log(`tạo thẻ “${body.name}”.`);
        }
      });
      tags = CT.db.all("tags");
      CT.ui.toast("Đã lưu thẻ.");
      fill(null);
    } catch (err) {
      CT.ui.toast(
        "Không thể lưu lúc này. Dữ liệu đã nhập được giữ lại.",
        "err",
      );
    }
  });
  $("#list").onclick = async (e) => {
    const b = e.target.closest("[data-a]");
    if (!b) return;
    const t = tags.find((x) => x.id === b.dataset.id),
      a = b.dataset.a;
    try {
      if (a === "edit") {
        fill(t.id);
        f.scrollIntoView({ behavior: "smooth" });
        f.name.focus();
        return;
      }
      if (a === "ok") {
        await CT.api.run(() => {
          CT.db.update("tags", t.id, { status: "active" });
          log(`duyệt thẻ “${t.name}” đưa vào sử dụng.`);
        });
        CT.ui.toast("Thẻ đã được đưa vào sử dụng.");
      }
      if (a === "restore") {
        await CT.api.run(() => {
          CT.db.update("tags", t.id, { status: "active" });
          log(`khôi phục thẻ “${t.name}”.`);
        });
        CT.ui.toast("Đã khôi phục thẻ.");
      }
      if (a === "arch") {
        const r = await CT.ui.confirm({
          title: "Lưu trữ thẻ?",
          text: `“${CT.esc(t.name)}” vẫn xuất hiện trong lịch sử bài cũ (${used(t.id)} bài), nhưng không được gán mới. Bạn có thể khôi phục từ kho lưu trữ.`,
          confirm: "Lưu trữ thẻ",
          danger: true,
        });
        if (!r) return;
        await CT.api.run(() => {
          CT.db.update("tags", t.id, { status: "archived" });
          log(`lưu trữ thẻ “${t.name}”.`);
        });
        CT.ui.toast("Đã lưu trữ thẻ.");
      }
      if (a === "merge") {
        const targets = tags.filter(
          (x) => x.parentId && x.status === "active" && x.id !== t.id,
        );
        let tid = "";
        const n = used(t.id);
        const r = await CT.ui.dialog({
          title: "Gộp thẻ trùng nghĩa",
          html: `<p class="muted">${n} bài từ “${CT.esc(t.name)}” sẽ chuyển sang thẻ đích. Thẻ nguồn được lưu trữ; thao tác được ghi nhật ký.</p><div class="field"><label for="tg">Thẻ đích *</label><select id="tg"><option value="">Chọn thẻ đích</option>${targets.map((x) => `<option value="${x.id}">${CT.esc(x.name)}</option>`).join("")}</select><span class="msg"></span></div>`,
          actions: [
            { label: "Quay lại", value: null, cls: "btn-ghost" },
            {
              label: "Xác nhận gộp",
              value: "ok",
              validate: (d) => {
                const s = d.querySelector("#tg");
                if (!s.value) {
                  CT.ui.setErr(s, "Chọn thẻ đích để gộp.");
                  return false;
                }
                tid = s.value;
                return true;
              },
            },
          ],
        });
        if (!r) return;
        const tg = tags.find((x) => x.id === tid);
        await CT.api.run(() => {
          CT.db.all("stories").forEach((s) => {
            if ((s.tags || []).includes(t.id))
              CT.db.update("stories", s.id, (x) => {
                x.tags = [
                  ...new Set(x.tags.map((i) => (i === t.id ? tid : i))),
                ];
              });
          });
          CT.db.update("tags", t.id, { status: "archived" });
          log(`gộp thẻ “${t.name}” vào “${tg.name}” (${n} bài).`);
        });
        CT.ui.toast(`Đã gộp ${n} bài sang “${tg.name}”.`);
      }
      tags = CT.db.all("tags");
      draw();
    } catch (err) {
      CT.ui.toast("Không thể xử lý lúc này. Hãy thử lại.", "err");
    }
  };
  $("#tree").onclick = (e) => {
    const l = e.target.closest("[data-edit]"),
      s = e.target.closest("[data-cat]");
    if (l) {
      fill(l.dataset.edit);
    } else if (s) {
      cat = cat === s.dataset.cat ? "" : s.dataset.cat;
      setTimeout(draw, 0);
    }
  };
  $("#tabs").onclick = (e) => {
    const b = e.target.closest("[data-t]");
    if (b) {
      tab = b.dataset.t;
      draw();
    }
  };
  $("#q").oninput = CT.debounce((e) => {
    q = e.target.value;
    draw();
  }, 200);
  $("#sort").onclick = (e) => {
    desc = !desc;
    e.target.textContent = desc ? "Mới cập nhật ↓" : "A → Z";
    draw();
  };
  $("#addCat").onclick = async () => {
    let name = "";
    const r = await CT.ui.dialog({
      title: "Thêm danh mục",
      html: '<div class="field"><label for="cn">Tên danh mục *</label><input id="cn"><span class="msg"></span></div>',
      actions: [
        { label: "Quay lại", value: null, cls: "btn-ghost" },
        {
          label: "Thêm danh mục",
          value: "ok",
          validate: (d) => {
            const i = d.querySelector("#cn");
            if (!i.value.trim()) {
              CT.ui.setErr(i, "Nhập tên danh mục.");
              return false;
            }
            if (tags.some((t) => CT.norm(t.name) === CT.norm(i.value))) {
              CT.ui.setErr(i, "Tên đã tồn tại.");
              return false;
            }
            name = i.value.trim();
            return true;
          },
        },
      ],
      onOpen: (d) => d.querySelector("#cn").focus(),
    });
    if (r) {
      CT.db.insert("tags", {
        id: CT.uid("cat"),
        name,
        parentId: null,
        status: "active",
        desc: "",
        synonyms: "",
      });
      log(`thêm danh mục “${name}”.`);
      tags = CT.db.all("tags");
      CT.ui.toast("Đã thêm danh mục.");
      draw();
    }
  };
  load();
});
