CT.ready(() => {
  const root = CT.$('#root'); let id = CT.param('id'); const u = CT.auth.user();
  const notFound = () => { root.innerHTML = `<div class="state-box pg-3"><p class="eyebrow">404 · KHÔNG TÌM THẤY</p><h1 class="pg-4">Địa danh không tồn tại</h1><p>Liên kết cũ hoặc địa danh đã được ẩn.</p><div class="actions"><a class="btn" href="explorer-story-discovery.html">Tìm lại</a><a class="btn btn-outline" href="index.html">Về trang chủ</a></div></div>`; };
  const load = () => CT.api.get('places', id).then(p => {
    if(!p) return notFound(); if(p.parentId){ id = p.parentId; return CT.api.get('places', id).then(q => q ? draw(q) : notFound()); } draw(p);
  }).catch(() => CT.ui.showError(root, load));
  const draw = p => {
    document.title = p.name + ' · CultureTrail';
    const stories = CT.db.all('stories').filter(s => s.live && s.placeId === p.id);
    const events = CT.db.all('events').filter(e => e.status === 'upcoming' && e.placeId === p.id);
    const kids = CT.db.all('places').filter(x => x.parentId === p.id);
    const me = CT.auth.user();
    root.innerHTML = `
      <p class="crumbs"><a href="explorer-story-discovery.html">Khám phá</a> / ${CT.esc(p.city)} / ${CT.esc(p.name)}</p>
      <p class="eyebrow">${CT.esc(p.city.toUpperCase())} · ${CT.esc((CT.TOPICS[p.topic] || '').toUpperCase())}</p>
      <h1>${CT.esc(p.name)}</h1><p class="lede">${CT.esc(p.lead)}</p>
      <div class="mt">${CT.ui.media(p.img, {cls:'hero', alt:'Ảnh minh họa ' + p.name, caption:'Ảnh minh họa'})}</div>
      <div class="chips mt"><span class="dot">${CT.esc(p.kind)}</span><span class="dot grey">${stories.length} câu chuyện</span><span class="dot grey">${events.length} sự kiện sắp tới</span></div>
      <div class="split wide-side mt pg-5">
        <div class="stack">
          <div><h2 class="pg-6">${CT.esc(p.title2 || p.name)}</h2>${(p.desc || [p.lead]).map(t => `<p class="pg-7">${CT.esc(t)}</p>`).join('')}</div>
          <div class="notice"><strong>Thông tin tham khảo</strong><p>Giờ hoạt động, phí và điểm ghé dưới đây là dữ liệu mẫu phục vụ thiết kế. Hãy liên hệ địa điểm để xác nhận trước chuyến đi.</p></div>
          <section aria-labelledby="hs"><h2 class="pg-6" id="hs">Câu chuyện gắn với địa danh</h2>${stories.length ? `<div class="grid g2">${stories.map(s => CT.ui.storyCard(s)).join('')}</div>` : CT.ui.empty('Chưa có câu chuyện', 'Địa danh này chưa có bài đã duyệt.', '')}</section>
          <section class="card" id="events" aria-labelledby="he"><h2 id="he" class="panel-title">Sự kiện sắp tới</h2>${events.length ? events.map(e => { const left = e.capacity - e.registered, sv = me && (me.savedEvents || []).includes(e.id); return `<div class="pickrow"><div class="grow"><span class="dot clay">${CT.fmt.ymd(e.startDate).slice(0, 5)}</span> <span class="dot pg-8">Còn ${left} / ${e.capacity} chỗ</span><h3 class="pg-9">${CT.esc(e.title)}</h3><p class="small muted mb0">${CT.fmt.ymd(e.startDate)} · ${e.startTime} – ${e.endTime} · ${CT.esc(e.location)}</p><p class="small">${CT.esc(e.desc)} Lịch và sức chứa minh họa.</p></div><div class="actions pg-10"><button class="link-btn" type="button" data-ev="${e.id}">Xem chi tiết sự kiện</button><button class="link-btn" type="button" data-evsave="${e.id}" aria-pressed="${!!sv}">${sv ? 'Đã lưu sự kiện ♥' : 'Lưu sự kiện'}</button></div></div>`; }).join('') : '<p class="muted">Chưa có sự kiện sắp tới tại địa danh này.</p>'}</section>
        </div>
        <aside class="stack">
          <section class="card"><h2 class="panel-title">Chuẩn bị chuyến thăm</h2>
            <dl class="kv pg-11"><dt>Khu vực</dt><dd>${CT.esc(p.province)}, ${CT.esc(p.region)}</dd><dt>Giờ tham khảo</dt><dd>${CT.esc(p.hours || '—')}</dd><dt>Thời lượng</dt><dd>${CT.esc(p.duration || '—')}</dd><dt>Phí trải nghiệm</dt><dd>${CT.esc(p.fee || '—')}</dd><dt>Liên hệ mẫu</dt><dd>${CT.esc(p.contact || '—')}</dd></dl>
            <div class="actions"><button class="btn" type="button" id="add">＋ Thêm vào hành trình</button><a class="small" data-trail-link hidden href="#"><b>Mở hành trình →</b></a></div>
            <p class="small muted mt mb0">Điểm sẽ được thêm cuối danh sách. Bạn có thể đổi thứ tự và thời gian.</p></section>
          ${kids.length ? CT.ui.schematic(CT.ui.stopsPoints(kids.map(k => ({placeId:k.id})))) : ''}
          <section class="card"><h2 class="panel-title">Đi nhẹ, hiểu sâu</h2><ul class="bullets"><li>Xin phép trước khi vào xưởng.</li><li>Không chạm sản phẩm đang phơi.</li><li>Mua hàng và chụp ảnh có trách nhiệm.</li></ul></section>
        </aside>
      </div>`;
    CT.$('#add').onclick = () => CT.trail.addPlace(p.id);
    const ev = CT.$('#events'); if(ev) ev.onclick = async e => {
      const d = e.target.closest('[data-ev]'), s = e.target.closest('[data-evsave]');
      if(d){ const x = CT.db.get('events', d.dataset.ev); CT.ui.dialog({title:x.title, html:`<p class="muted">${CT.fmt.ymd(x.startDate)} · ${x.startTime} – ${x.endTime}</p><dl class="kv"><dt>Địa điểm</dt><dd>${CT.esc(x.location)}</dd><dt>Địa chỉ</dt><dd>${CT.esc(x.address)}</dd><dt>Sức chứa</dt><dd>${x.registered} / ${x.capacity} người</dd><dt>Phí</dt><dd>${CT.esc(x.fee)}</dd><dt>Liên hệ</dt><dd>${CT.esc(x.contact)}</dd></dl><p class="mt">${CT.esc(x.desc)}</p><p class="small muted">Người tham gia cần xác nhận lịch với xưởng. Trạng thái sức chứa chỉ minh họa.</p>`}); }
      if(s){ const cu = CT.auth.user(); if(!cu){ CT.needLogin('Đăng nhập để lưu sự kiện.'); return; }
        CT.db.update('users', cu.id, x => { x.savedEvents = x.savedEvents || []; const i = x.savedEvents.indexOf(s.dataset.evsave); i >= 0 ? x.savedEvents.splice(i, 1) : x.savedEvents.push(s.dataset.evsave); });
        const on = CT.auth.user().savedEvents.includes(s.dataset.evsave); s.textContent = on ? 'Đã lưu sự kiện ♥' : 'Lưu sự kiện'; CT.ui.toast(on ? 'Đã lưu sự kiện. Bạn sẽ nhận thông báo khi lịch thay đổi.' : 'Đã bỏ lưu sự kiện.'); }
    };
  };
  load();
});
