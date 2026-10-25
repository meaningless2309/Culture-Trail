CT.ready(() => {
  let all = [],
    tab = "all",
    q = "",
    desc = true;
  const TABS = [
    ["all", "Tất cả"],
    ["published", "Đã xuất bản"],
    ["draft", "Bản nháp"],
    ["archived", "Lưu trữ"],
  ];
  const load = () => {
    CT.$("#list").innerHTML = CT.ui.skeleton(2);
    CT.api
      .list("collections")
      .then((d) => {
        all = d;
        draw();
      })
      .catch(() => CT.ui.showError(CT.$("#list"), load));
  };
  const card = (c) => {
    const places = [
      ...new Set(
        c.storyIds
          .map((i) => (CT.place((CT.story(i) || {}).placeId) || {}).province)
          .filter(Boolean),
      ),
    ];
    const ed = (CT.user(c.editorId) || {}).name || "";
    const meta = `${c.storyIds.length} câu chuyện · ${places.length > 1 ? places.length + " địa phương" : places[0] || "—"} · ${CT.esc(ed)}`;
    const dateTxt =
      c.status === "archived"
        ? "Lưu trữ " + CT.fmt.date(c.archivedAt)
        : CT.fmt.date(c.updatedAt);
    const dot = {
      published: '<span class="dot">Đã xuất bản</span>',
      draft: '<span class="dot clay">Bản nháp</span>',
      archived: '<span class="dot grey">Đã lưu trữ</span>',
    }[c.status];
    const acts = {
      published: `<a href="curator-collection-editor.html?id=${c.id}"><b>Chỉnh sửa</b></a><a href="explorer-story-discovery.html?collection=${c.id}#collections"><b>Xem công khai</b></a><button class="link-btn muted" data-a="archive" data-id="${c.id}" type="button">Lưu trữ</button><button class="link-btn muted" data-a="dup" data-id="${c.id}" type="button">Tạo bản sao</button>`,
      draft: `<a href="curator-collection-editor.html?id=${c.id}"><b>Tiếp tục biên tập</b></a><button class="link-btn danger" data-a="del" data-id="${c.id}" type="button">Xóa nháp</button>`,
      archived: `<button class="link-btn" data-a="restore" data-id="${c.id}" type="button">Khôi phục về nháp</button>`,
    }[c.status];
    const hint =
      c.status === "draft"
        ? `<p class="small">${!c.desc || !c.cover ? "Cần thêm mô tả và chọn ảnh bìa trước khi công khai." : "Sẵn sàng kiểm tra và xuất bản."}</p>`
        : c.status === "archived"
          ? '<p class="small">Không còn hiển thị trên trang Khám phá.</p>'
          : "";
    return `<article class="story-card">${c.cover && c.status !== "draft" ? CT.ui.media(c.cover, { alt: "Ảnh bìa bộ sưu tập" }) : ""}<div class="body"><div class="row between">${dot}<span class="small muted">${dateTxt}</span></div><h3>${CT.esc(c.name)}</h3><p class="meta">${meta}${c.draft ? ' · <b class="pg-1">Có bản nháp phiên bản ' + (c.version + 1) + "</b>" : ""}</p>${hint}<div class="links pg-2">${acts}</div></div></article>`;
  };
  const draw = () => {
    const c = (k) => all.filter((x) => x.status === k).length;
    CT.$("#tabs").innerHTML = TABS.map(
      (t) =>
        `<button role="tab" type="button" data-t="${t[0]}" aria-selected="${tab === t[0]}">${t[1]} (${t[0] === "all" ? all.length : c(t[0])})</button>`,
    ).join("");
    let l = all.filter(
      (x) =>
        (tab === "all" || x.status === tab) &&
        (!q || CT.norm(x.name).includes(CT.norm(q))),
    );
    l.sort(
      (a, b) =>
        (desc ? -1 : 1) * (new Date(a.updatedAt) - new Date(b.updatedAt)),
    );
    CT.$("#list").innerHTML = l.length
      ? `<div class="grid g2">${l.map(card).join("")}</div>`
      : CT.ui.empty(
          all.length ? "Không có bộ sưu tập phù hợp" : "Chưa có bộ sưu tập",
          all.length
            ? "Thử đổi từ khóa hoặc trạng thái."
            : "Tạo bộ sưu tập đầu tiên từ các câu chuyện đã duyệt.",
          all.length
            ? '<button class="btn" id="clr" type="button">Xóa bộ lọc</button>'
            : '<a class="btn" href="curator-collection-editor.html">Tạo bộ sưu tập</a>',
        );
    const clr = CT.$("#clr");
    if (clr)
      clr.onclick = () => {
        tab = "all";
        q = "";
        CT.$("#q").value = "";
        draw();
      };
  };
  CT.$("#list").onclick = async (e) => {
    const b = e.target.closest("[data-a]");
    if (!b) return;
    const c = all.find((x) => x.id === b.dataset.id),
      now = new Date().toISOString();
    try {
      if (b.dataset.a === "archive") {
        const r = await CT.ui.confirm({
          title: "Lưu trữ bộ sưu tập?",
          text: `“${CT.esc(c.name)}” sẽ ẩn khỏi Khám phá. Các câu chuyện gốc vẫn giữ trạng thái xuất bản.`,
          confirm: "Lưu trữ",
        });
        if (!r) return;
        await CT.api.run(() =>
          CT.db.update("collections", c.id, {
            status: "archived",
            archivedAt: now.slice(0, 10),
            updatedAt: now,
          }),
        );
        CT.ui.toast("Đã lưu trữ bộ sưu tập.");
      }
      if (b.dataset.a === "restore") {
        await CT.api.run(() =>
          CT.db.update("collections", c.id, {
            status: "draft",
            updatedAt: now,
          }),
        );
        CT.ui.toast(
          "Đã khôi phục về bản nháp. Kiểm tra lại các bài trước khi xuất bản.",
        );
      }
      if (b.dataset.a === "dup") {
        await CT.api.run(() =>
          CT.db.insert(
            "collections",
            Object.assign({}, c, {
              id: CT.uid("c"),
              name: c.name + " (bản sao)",
              status: "draft",
              version: 0,
              draft: null,
              updatedAt: now,
            }),
          ),
        );
        CT.ui.toast("Đã tạo bản sao ở trạng thái nháp.");
      }
      if (b.dataset.a === "del") {
        const r = await CT.ui.confirm({
          title: "Xóa bản nháp?",
          text: "Bản nháp bộ sưu tập sẽ bị xóa vĩnh viễn. Các câu chuyện không bị ảnh hưởng.",
          confirm: "Xóa bản nháp",
          danger: true,
        });
        if (!r) return;
        await CT.api.run(() => CT.db.remove("collections", c.id));
        CT.ui.toast("Đã xóa bản nháp.");
      }
      load();
    } catch (err) {
      CT.ui.toast("Không thể xử lý lúc này. Hãy thử lại.", "err");
    }
  };
  CT.$("#tabs").onclick = (e) => {
    const b = e.target.closest("[data-t]");
    if (b) {
      tab = b.dataset.t;
      draw();
    }
  };
  CT.$("#q").oninput = CT.debounce((e) => {
    q = e.target.value;
    draw();
  }, 200);
  CT.$("#sort").onclick = (e) => {
    desc = !desc;
    e.target.textContent = desc ? "Mới cập nhật ↓" : "Cũ nhất ↑";
    draw();
  };
  load();
});
