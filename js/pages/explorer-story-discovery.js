CT.ready(() => {
  const qs = new URLSearchParams(location.search);
  const S = {
    q: qs.get("q") || "",
    topics: qs.get("topic") ? [qs.get("topic")] : [],
    region: "",
    prov: "",
    rt: "",
    sort: "rel",
    page: 1,
  };
  const colId = qs.get("collection");
  let stories = [];
  const places = CT.db.all("places").filter((p) => !p.parentId);
  const regions = [...new Set(places.map((p) => p.region))];
  const provs = [...new Set(places.map((p) => p.province))];
  CT.$("#region").innerHTML += regions
    .map((r) => `<option>${r}</option>`)
    .join("");
  CT.$("#prov").innerHTML += provs.map((r) => `<option>${r}</option>`).join("");
  CT.$("#q").value = S.q;
  const pl = (s) => CT.place(s.placeId) || {};
  const match = (s) => {
    const p = pl(s),
      cr = CT.user(s.creatorId) || {};
    if (S.topics.length && !S.topics.includes(s.topic)) return false;
    if (S.region && p.region !== S.region) return false;
    if (S.prov && p.province !== S.prov) return false;
    if (S.rt && s.readMin >= +S.rt) return false;
    if (colId) {
      const c = CT.db.get("collections", colId);
      if (!c || !c.storyIds.includes(s.id)) return false;
    }
    if (S.q) {
      const hay = CT.norm(
        [
          s.title,
          s.lead,
          p.name,
          p.province,
          cr.name,
          CT.TOPICS[s.topic],
          CT.storyText(s),
        ].join(" "),
      );
      if (
        !CT.norm(S.q)
          .split(/\s+/)
          .every((w) => hay.includes(w))
      )
        return false;
    }
    return true;
  };
  const score = (s) => {
    const q = CT.norm(S.q);
    if (!q) return 0;
    return (
      (CT.norm(s.title).includes(q) ? 3 : 0) +
      (CT.norm(CT.TOPICS[s.topic]).includes(q) ? 2 : 0) +
      (CT.norm(s.lead).includes(q) ? 1 : 0)
    );
  };
  const topicsUI = () => {
    const all = stories;
    CT.$("#topics").innerHTML = Object.keys(CT.TOPICS)
      .map(
        (k) =>
          `<label class="check"><input type="checkbox" value="${k}" ${S.topics.includes(k) ? "checked" : ""}> ${CT.TOPICS[k]} (${all.filter((s) => s.topic === k).length})</label>`,
      )
      .join("");
  };
  const chips = () => {
    const c = [];
    S.topics.forEach((t) => c.push(["topic", t, CT.TOPICS[t]]));
    if (S.region) c.push(["region", "", S.region]);
    if (S.prov) c.push(["prov", "", S.prov]);
    if (S.rt) c.push(["rt", "", "Dưới 10 phút"]);
    CT.$("#chips").innerHTML =
      c
        .map(
          (x) =>
            `<span class="chip">${CT.esc(x[2])}<button type="button" data-k="${x[0]}" data-v="${x[1]}" aria-label="Bỏ lọc ${CT.esc(x[2])}">×</button></span>`,
        )
        .join("") +
      (c.length
        ? '<button class="link-btn muted pg-6" type="button" id="clr2">Xóa tất cả</button>'
        : "");
    const b = CT.$("#clr2");
    if (b) b.onclick = reset;
  };
  const reset = () => {
    Object.assign(S, {
      q: "",
      topics: [],
      region: "",
      prov: "",
      rt: "",
      page: 1,
    });
    CT.$("#q").value = "";
    CT.$("#region").value = "";
    CT.$("#prov").value = "";
    CT.$("input[name=rt]").checked = true;
    draw();
  };
  const draw = () => {
    topicsUI();
    chips();
    let list = stories.filter(match);
    if (S.sort === "new")
      list.sort(
        (a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0),
      );
    else if (S.sort === "fast") list.sort((a, b) => a.readMin - b.readMin);
    else list.sort((a, b) => score(b) - score(a));
    const p = CT.ui.paginate(list, S.page, 4);
    CT.$("#count").textContent =
      `${list.length} câu chuyện${S.topics.length === 1 ? " về " + CT.TOPICS[S.topics[0]].toLowerCase() : ""}`;
    CT.$("#results").innerHTML = list.length
      ? `<div class="grid g2">${p.items.map((s) => CT.ui.storyCard(s)).join("")}</div>`
      : CT.ui.empty(
          "Không có kết quả",
          `“${S.q || "bộ lọc hiện tại"}” chưa có bài phù hợp. Đổi từ khóa hoặc bỏ bớt bộ lọc.`,
          '<button class="btn" type="button" id="clr3">Xóa bộ lọc / Tìm lại</button>',
        );
    const c3 = CT.$("#clr3");
    if (c3) c3.onclick = reset;
    CT.ui.pager(CT.$("#pager"), p, "câu chuyện", (n) => {
      S.page = n;
      draw();
      CT.$("#results").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    CT.$("#pager").hidden = !list.length;
  };
  const load = () => {
    CT.$("#results").innerHTML = CT.ui.skeleton(4);
    CT.api
      .list("stories", (s) => s.live)
      .then((d) => {
        stories = d.map(CT.pub);
        draw();
      })
      .catch(() => {
        CT.$("#count").textContent = "";
        CT.ui.showError(CT.$("#results"), load);
      });
  };
  CT.$("#sf").onsubmit = (e) => {
    e.preventDefault();
    S.q = CT.$("#q").value.trim();
    S.page = 1;
    draw();
  };
  CT.$("#ff").onsubmit = (e) => {
    e.preventDefault();
    S.topics = CT.$$("#topics input:checked").map((i) => i.value);
    S.region = CT.$("#region").value;
    S.prov = CT.$("#prov").value;
    S.rt = CT.$("input[name=rt]:checked").value;
    S.page = 1;
    draw();
  };
  CT.$("#clear").onclick = reset;
  CT.$("#sort").onchange = (e) => {
    S.sort = e.target.value;
    draw();
  };
  CT.$("#chips").onclick = (e) => {
    const b = e.target.closest("[data-k]");
    if (!b) return;
    const k = b.dataset.k;
    if (k === "topic") S.topics = S.topics.filter((t) => t !== b.dataset.v);
    else S[k] = "";
    if (k === "region") CT.$("#region").value = "";
    if (k === "prov") CT.$("#prov").value = "";
    if (k === "rt") CT.$("input[name=rt]").checked = true;
    S.page = 1;
    draw();
  };
  if (colId) {
    const c = CT.db.get("collections", colId);
    if (c)
      CT.$("#banner").innerHTML =
        `<div class="notice mt"><strong>Bộ sưu tập: ${CT.esc(c.name)}</strong><p>${CT.esc(c.desc)} <a href="explorer-story-discovery.html"><b>Xem tất cả câu chuyện</b></a></p></div>`;
  }
  // bộ sưu tập
  const drawCols = () => {
    const u = CT.auth.user();
    const cs = CT.db.all("collections").filter((c) => c.status === "published");
    CT.$("#cols").innerHTML = cs.length
      ? cs
          .map(
            (c) =>
              `<div class="pickrow"><div class="pg-7">${CT.ui.media(c.cover || "clay", { alt: "", cls: "" })}</div><div class="grow"><span class="dot clay">Biên tập tuyển chọn</span><h3 class="pg-8">${CT.esc(c.name)}</h3><p class="small muted mb0">${c.storyIds.length} câu chuyện · ${CT.esc((CT.user(c.editorId) || {}).name || "")}</p></div><div class="actions pg-9"><a class="btn btn-sm" href="explorer-story-discovery.html?collection=${c.id}#collections">Khám phá bộ sưu tập</a><button type="button" class="btn btn-outline btn-sm" data-follow="${c.id}" aria-pressed="${!!(u && (u.followed || []).includes(c.id))}">${u && (u.followed || []).includes(c.id) ? "Đang theo dõi" : "Theo dõi"}</button></div></div>`,
          )
          .join("")
      : '<p class="muted">Chưa có bộ sưu tập nào được xuất bản.</p>';
  };
  CT.$("#cols").onclick = (e) => {
    const b = e.target.closest("[data-follow]");
    if (!b) return;
    const u = CT.auth.user();
    if (!u) {
      CT.needLogin("Đăng nhập để theo dõi bộ sưu tập.");
      return;
    }
    CT.db.update("users", u.id, (x) => {
      x.followed = x.followed || [];
      const i = x.followed.indexOf(b.dataset.follow);
      i >= 0 ? x.followed.splice(i, 1) : x.followed.push(b.dataset.follow);
    });
    drawCols();
  };
  drawCols();
  load();
});
