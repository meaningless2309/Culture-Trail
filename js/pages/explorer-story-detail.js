CT.ready(() => {
  const id = CT.param('id'); const root = CT.$('#root'); const u = CT.auth.user();
  const notFound = () => { root.innerHTML = `<div class="state-box pg-3"><p class="eyebrow">404 · KHÔNG TÌM THẤY</p><h1 class="pg-4">Câu chuyện không còn hiển thị</h1><p>Liên kết cũ hoặc câu chuyện đã được ẩn. Thông tin cá nhân của bạn vẫn được giữ.</p><div class="actions"><a class="btn" href="explorer-story-discovery.html">Tìm lại</a><a class="btn btn-outline" href="index.html">Về trang chủ</a></div></div>`; };
  const load = () => CT.api.get('stories', id).then(s => {
    const staff = u && (CT.auth.has(u, 'curator') || CT.auth.has(u, 'admin') || s && s.creatorId === u.id);
    if(!s || (!s.live && !staff)) return notFound();
    draw(s.live ? CT.pub(s) : s, !s.live);
  }).catch(() => CT.ui.showError(root, load));
  const draw = (s, preview) => {
    const p = CT.place(s.placeId); const cr = CT.user(s.creatorId) || {}; const crp = CT.creator(s.creatorId) || {};
    const saved = u && (u.saved || []).includes(s.id);
    const more = CT.db.all('stories').filter(x => x.live && x.id !== s.id).sort((a, b) => (b.topic === s.topic) - (a.topic === s.topic)).slice(0, 2);
    const nPlaceStories = p ? CT.db.all('stories').filter(x => x.live && x.placeId === p.id).length : 0;
    document.title = s.title + ' · CultureTrail';
    root.innerHTML = `
      <p class="crumbs"><a href="explorer-story-discovery.html">Khám phá</a> / <a href="explorer-story-discovery.html?topic=${s.topic}">${CT.esc(CT.TOPICS[s.topic])}</a>${p ? ' / ' + CT.esc(p.name) : ''}</p>
      ${preview ? CT.ui.notice('Xem trước — chưa công khai', 'Bài đang ở trạng thái “' + CT.ui.statusText('story', s.status, s) + '”. Người đọc chưa thấy phiên bản này.', 'warn') + '<br>' : ''}
      <div class="page-head"><div><span class="dot">${CT.esc(CT.TOPICS[s.topic])} · ${s.live ? 'Đã xuất bản' : CT.ui.statusText('story', s.status, s)}</span><h1 class="pg-5">${CT.esc(s.title)}</h1><p class="lede">${CT.esc(s.lead)}</p><p class="small"><b>${CT.esc(cr.name || '')}</b> · ${CT.fmt.date(s.updatedAt || s.submittedAt)} · ${s.readMin} phút đọc</p></div>
        <div class="stack-s"><button class="btn save-btn-lg pg-6" type="button" data-save="${s.id}" aria-pressed="${!!saved}">${saved ? 'Đã lưu câu chuyện ♥' : 'Lưu câu chuyện ♡'}</button><div><button class="link-btn" id="share" type="button">Chia sẻ</button></div></div></div>
      ${CT.ui.media(s.img || 'clay', {cls:'hero', alt:'Ảnh minh họa cho câu chuyện ' + s.title, caption:'Ảnh minh họa'})}
      <p class="tiny muted pg-7">Ảnh minh họa thiết kế, không phải ảnh tư liệu xác minh.</p>
      <div class="split mt">
        <article class="article" id="article">${s.sections.map((x, i) => `<h2 id="sec${i + 1}">${CT.esc(x.h)}</h2>${x.p.map(t => `<p>${CT.esc(t)}</p>`).join('')}`).join('')}
          <section class="card pg-3"><h2 class="panel-title pg-8">Người kể chuyện</h2><h3 class="pg-9">${CT.esc(cr.name || '')}</h3><p class="small muted">${CT.esc(crp.field ? 'Nghệ nhân ' + crp.field.toLowerCase() : 'Nhà sáng tạo')}${p ? ' · ' + CT.esc(p.name.replace(/^Làng gốm /, '')) + ', ' + CT.esc(p.province) : ''}. Nhân vật và nội dung được dựng mẫu cho thiết kế.</p>${crp.bio ? `<p class="small">${CT.esc(crp.bio)}</p>` : ''}</section>
          <div class="notice mt"><strong>Về nội dung này</strong><p>Câu chuyện do người kể đóng góp; AI không xác minh các nhận định lịch sử. Nếu phát hiện thông tin chưa phù hợp, gửi phản hồi cho biên tập viên.</p></div>
          <p class="mt"><button class="link-btn pg-10" id="fb" type="button">Gửi phản hồi về câu chuyện →</button></p></article>
        <aside class="stack"><section class="card" id="aiBox" aria-live="polite"></section>
          ${p ? `<section class="card"><h2 class="panel-title">Địa danh trong câu chuyện</h2><div class="pg-4">${CT.ui.media(p.img, {alt:'Ảnh minh họa ' + p.name})}</div><h3 class="pg-11">${CT.esc(p.name)}</h3><p class="small muted">${CT.esc(p.province)} · ${CT.esc(CT.TOPICS[p.topic])} · ${nPlaceStories} câu chuyện liên quan</p><div class="actions"><a href="explorer-place-detail.html?id=${p.id}"><b>Khám phá địa danh</b></a><button class="btn btn-sm" type="button" id="addP">Thêm vào hành trình</button><a class="small" data-trail-link hidden href="#">Mở hành trình →</a></div></section>` : ''}
          <nav class="card toc" aria-label="Mục lục"><h2 class="panel-title">Mục lục</h2><ol>${s.sections.map((x, i) => `<li><a href="#sec${i + 1}"><b>${String(i + 1).padStart(2, '0')}</b>${CT.esc(x.h)}</a></li>`).join('')}</ol></nav></aside>
      </div>
      <section class="section" aria-labelledby="hm"><h2 class="pg-12" id="hm">Tiếp tục lắng nghe</h2><div class="grid g2">${more.map(x => CT.ui.storyCard(x)).join('')}</div></section>`;
    CT.$('#share').onclick = async () => { const ok = await CT.ui.copy(location.href); CT.ui.toast(ok ? 'Đã sao chép liên kết.' : 'Không sao chép được, hãy copy từ thanh địa chỉ.'); };
    const ap = CT.$('#addP'); if(ap) ap.onclick = () => CT.trail.addPlace(p.id);
    CT.$('#fb').onclick = async () => {
      if(!u){ CT.needLogin('Đăng nhập để gửi phản hồi.'); return; }
      const r = await CT.ui.confirm({title:'Gửi phản hồi về câu chuyện', text:'Phản hồi được gửi tới biên tập viên để xem xét.', confirm:'Gửi phản hồi', reason:{label:'Nội dung phản hồi', required:true, placeholder:'Ví dụ: Một chi tiết trong bài chưa phù hợp.'}});
      if(!r) return; CT.notify('u2', {type:'content', title:'Phản hồi về “' + s.title + '”', body:u.name + ': ' + r.reason, link:'explorer-story-detail.html?id=' + s.id, linkLabel:'Xem câu chuyện'}); CT.ui.toast('Đã gửi phản hồi. Cảm ơn bạn.');
    };
    CT.ai.summaryPanel(CT.$('#aiBox'), s, {saved:u && (u.summaries || {})[s.id], onViewSource:() => CT.$('#article').scrollIntoView({behavior:'smooth'}),
      canSave:() => { if(!u){ CT.needLogin('Đăng nhập để lưu bản tóm tắt.'); return false; } return true; },
      onSave:t => CT.db.update('users', u.id, x => { x.summaries = x.summaries || {}; x.summaries[s.id] = t; })});
    document.addEventListener('click', e => { const b = e.target.closest('.save-btn-lg'); if(b) setTimeout(() => { b.textContent = b.getAttribute('aria-pressed') === 'true' ? 'Đã lưu câu chuyện ♥' : 'Lưu câu chuyện ♡'; }, 0); });
  };
  load();
});
