CT.ready(() => {
  const $f = CT.$("#featured");
  const render = () => {
    $f.innerHTML = CT.ui.skeleton(3, "g3");
    CT.api
      .list("stories", (s) => s.live && ["s1", "s2", "s3"].includes(s.id))
      .then((list) => {
        list.sort((a, b) => a.id.localeCompare(b.id));
        $f.innerHTML = list.length
          ? `<div class="grid g3">${list.map((s) => CT.ui.storyCard(s)).join("")}</div>`
          : CT.ui.empty(
              "Chưa có câu chuyện nổi bật",
              "Quay lại sau nhé.",
              '<a class="btn" href="explorer-story-discovery.html">Khám phá</a>',
            );
      })
      .catch(() => CT.ui.showError($f, render));
  };
  render();
  const col =
    CT.db
      .all("collections")
      .find((c) => c.id === "c1" && c.status === "published") ||
    CT.db.all("collections").find((c) => c.status === "published");
  const el = CT.$("#collection");
  if (col) {
    const ed = CT.user(col.editorId) || {};
    el.innerHTML = `<div class="media pg-6">${CT.ui.img(col.cover || "clay", "Ảnh minh họa bộ sưu tập")}</div><div><span class="dot">Bộ sưu tập · ${col.storyIds.length} câu chuyện</span><h2 class="pg-7" id="h-col">${CT.esc(col.name)}</h2><p class="muted">${CT.esc(col.desc)}</p><p class="small muted">Biên tập bởi ${CT.esc(ed.name || "")} · Nội dung mẫu</p><a class="btn" href="explorer-story-discovery.html?collection=${col.id}#collections">→ Mở bộ sưu tập</a></div>`;
  } else el.hidden = true;
});
