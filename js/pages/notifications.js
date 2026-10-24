CT.ready(() => {
  const u = CT.auth.user(); let tab = 'all', q = '', desc = true, limit = 5, all = [];
  const KIND = {content:'Nội dung', event:'Sự kiện', trail:'Hành trình', system:'Hệ thống'};
  const load = () => {
    CT.$('#list').innerHTML = CT.ui.skeleton(2, 'g1');
    CT.api.list('notifications', n => n.userId === u.id && !n.hidden).then(d => { all = d; draw(); }).catch(() => CT.ui.showError(CT.$('#list'), load));
  };
  const filtered = () => {
    let l = all.slice().sort((a, b) => desc ? new Date(b.at) - new Date(a.at) : new Date(a.at) - new Date(b.at));
    if(tab === 'unread') l = l.filter(n => !n.read); else if(tab !== 'all') l = l.filter(n => n.type === tab);
    if(q) l = l.filter(n => CT.norm(n.title + ' ' + n.body).includes(CT.norm(q)));
    return l;
  };
  const draw = () => {
    const un = all.filter(n => !n.read).length;
    const T = [['all', `Tất cả (${all.length})`], ['unread', `Chưa đọc (${un})`], ['content', 'Nội dung'], ['trail', 'Hành trình'], ['event', 'Sự kiện']];
    CT.$('#tabs').innerHTML = T.map(t => `<button role="tab" type="button" data-t="${t[0]}" aria-selected="${tab === t[0]}">${t[1]}</button>`).join('');
    const l = filtered(), shown = l.slice(0, limit);
    CT.$('#list').innerHTML = shown.length ? `<div class="stack-s">${shown.map(n => `<article class="card"><div class="row between"><span class="dot ${n.read ? 'grey' : 'clay'}">${n.read ? 'Đã đọc' : 'Mới'} · ${KIND[n.type]}</span><span class="small muted">${CT.fmt.ago(n.at)}</span></div><h2 class="pg-2">${CT.esc(n.title)}</h2><p class="muted">${CT.esc(n.body)}</p><div class="actions pg-3"><a href="${n.link}" data-open="${n.id}"><b>${CT.esc(n.linkLabel)} →</b></a><button class="link-btn muted pg-4" type="button" data-hide="${n.id}">Ẩn thông báo</button></div></article>`).join('')}</div>` : CT.ui.empty(q || tab !== 'all' ? 'Không có thông báo phù hợp' : 'Bạn chưa có thông báo', q || tab !== 'all' ? 'Thử đổi bộ lọc hoặc từ khóa.' : 'Thông báo mới sẽ xuất hiện tại đây.', q || tab !== 'all' ? '<button class="btn" type="button" id="clr">Xóa bộ lọc</button>' : '');
    CT.$('#older').hidden = shown.length >= l.length; CT.$('#readAll').disabled = !un;
    const c = CT.$('#clr'); if(c) c.onclick = () => { tab = 'all'; q = ''; CT.$('#q').value = ''; draw(); };
  };
  CT.$('#tabs').onclick = e => { const b = e.target.closest('[data-t]'); if(b){ tab = b.dataset.t; limit = 5; draw(); } };
  CT.$('#q').oninput = CT.debounce(e => { q = e.target.value; draw(); }, 200);
  CT.$('#sort').onclick = e => { desc = !desc; e.target.textContent = desc ? 'Mới cập nhật ↓' : 'Cũ nhất ↑'; draw(); };
  CT.$('#older').onclick = () => { limit += 5; draw(); };
  CT.$('#readAll').onclick = () => { all.forEach(n => { if(!n.read) CT.db.update('notifications', n.id, {read:true}); n.read = true; }); CT.ui.toast('Đã đánh dấu tất cả là đã đọc.'); draw(); };
  CT.$('#list').onclick = e => {
    const h = e.target.closest('[data-hide]'), o = e.target.closest('[data-open]');
    if(h){ CT.db.update('notifications', h.dataset.hide, {hidden:true}); all = all.filter(n => n.id !== h.dataset.hide); CT.ui.toast('Đã ẩn thông báo.'); draw(); }
    if(o) CT.db.update('notifications', o.dataset.open, {read:true});
  };
  load();
});
