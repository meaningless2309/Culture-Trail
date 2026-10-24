CT.ready(() => {
  const me = CT.auth.user(); let all = [], tab = 'pending', q = '', desc = true, page = 1;
  const inQueue = s => ['pending', 'processing', 'approved', 'rejected'].includes(s.status) && (s.submittedAt || s.history.length);
  const regions = CT.REGIONS; CT.$('#freg').innerHTML += regions.map(r => `<option>${r}</option>`).join('');
  const load = () => { CT.$('#list').innerHTML = CT.ui.skeletonRows(4); CT.api.list('stories', inQueue).then(d => { all = d; draw(); }).catch(() => CT.ui.showError(CT.$('#list'), load)); };
  const cnt = k => all.filter(s => s.status === k).length;
  const draw = () => {
    const approvedBase = 18;
    CT.$('#stats').innerHTML = [[cnt('pending'), 'Chờ duyệt'], [cnt('processing'), 'Đang xử lý'], [cnt('rejected'), 'Cần chỉnh sửa'], [approvedBase + all.filter(s => s.approvedAt).length, 'Đã duyệt tháng này · Mẫu']].map(x => `<div class="stat"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('');
    const T = [['pending', `Chờ duyệt (${cnt('pending')})`], ['processing', `Đang xử lý (${cnt('processing')})`], ['approved', `Đã duyệt (${cnt('approved')})`], ['rejected', `Bị từ chối (${cnt('rejected')})`], ['all', 'Tất cả']];
    CT.$('#tabs').innerHTML = T.map(t => `<button role="tab" type="button" data-t="${t[0]}" aria-selected="${tab === t[0]}">${t[1]}</button>`).join('');
    const reg = CT.$('#freg').value, as = CT.$('#fas').value;
    let l = all.filter(s => (tab === 'all' || s.status === tab) && (!q || CT.norm([s.title, (CT.user(s.creatorId) || {}).name, CT.storyPlaceName(s)].join(' ')).includes(CT.norm(q))) && (!reg || (CT.place(s.placeId) || {}).region === reg) && (!as || (as === 'me' ? s.assignee === me.id : !s.assignee)));
    l.sort((a, b) => (desc ? -1 : 1) * (new Date(a.submittedAt || 0) - new Date(b.submittedAt || 0)));
    const p = CT.ui.paginate(l, page, 5);
    CT.$('#list').innerHTML = l.length ? CT.ui.table([{h:'Nội dung', r:s => `<a href="curator-review-detail.html?id=${s.id}">${CT.esc(s.title)}</a>`}, {h:'Người gửi', r:s => CT.esc((CT.user(s.creatorId) || {}).name)}, {h:'Địa danh', r:s => CT.esc(CT.storyPlaceName(s).replace(/^Làng gốm |^Làng nghề /, ''))}, {h:'Gửi lúc', r:s => s.submittedAt ? CT.fmt.short(s.submittedAt) : '—'}, {h:'Trạng thái', r:s => CT.ui.statusText('story', s.status, s) + (s.status === 'processing' && s.assignee ? '<div class="tiny muted">' + CT.esc((CT.user(s.assignee) || {}).name) + '</div>' : '')}, {h:'Thao tác', r:s => s.status === 'pending' ? `<button class="link-btn" type="button" data-claim="${s.id}">Nhận & xem</button>` : s.status === 'processing' && s.assignee === me.id ? `<a href="curator-review-detail.html?id=${s.id}">Tiếp tục duyệt</a>` : `<a href="curator-review-detail.html?id=${s.id}">Xem</a>`}], p.items) : CT.ui.empty('Không có nội dung phù hợp', tab === 'pending' && !q ? 'Hàng đợi đang trống. Cảm ơn bạn!' : 'Thử đổi từ khóa hoặc bộ lọc.', '<button class="btn" type="button" id="clr">Xóa bộ lọc</button>');
    CT.ui.pager(CT.$('#pager'), p, 'nội dung', n => { page = n; draw(); });
    CT.$('#pager').insertAdjacentHTML('afterbegin', '');
    const clr = CT.$('#clr'); if(clr) clr.onclick = () => { tab = 'all'; q = ''; CT.$('#q').value = ''; CT.$('#freg').value = ''; CT.$('#fas').value = ''; draw(); };
    const mine = all.find(s => s.status === 'processing' && s.assignee === me.id);
    CT.$('#cont').innerHTML = `<h2 class="panel-title">Tiếp tục công việc</h2>${mine ? `<h3 class="pg-2">${CT.esc(mine.title)}</h3><p class="muted small">${CT.esc(me.name)} đang phụ trách${CT.su ? '' : ''} · ${(mine.imageSource || '').trim() ? 'Nguồn ảnh đã có.' : 'Còn cần xác nhận nguồn ảnh.'}</p><a href="curator-review-detail.html?id=${mine.id}"><b>Mở nội dung đang duyệt</b></a>` : '<p class="muted">Bạn chưa nhận bài nào. Chọn “Nhận & xem” trong hàng đợi.</p>'}`;
  };
  CT.$('#list').onclick = async e => {
    const b = e.target.closest('[data-claim]'); if(!b) return;
    try{ await CT.api.run(() => CT.db.update('stories', b.dataset.claim, x => { if(x.assignee && x.assignee !== me.id) throw new Error('taken'); x.status = 'processing'; x.assignee = me.id; x.history = (x.history || []).concat({at:new Date().toISOString(), text:me.name + ' nhận duyệt'}); })); location.href = 'curator-review-detail.html?id=' + b.dataset.claim; }
    catch(err){ CT.ui.toast(err.message === 'taken' ? 'Bài này đã có người nhận.' : 'Không thể nhận bài lúc này. Hãy thử lại.', 'err'); load(); }
  };
  CT.$('#tabs').onclick = e => { const b = e.target.closest('[data-t]'); if(b){ tab = b.dataset.t; page = 1; draw(); } };
  CT.$('#q').oninput = CT.debounce(e => { q = e.target.value; page = 1; draw(); }, 200);
  ['freg', 'fas'].forEach(i => CT.$('#' + i).onchange = () => { page = 1; draw(); });
  CT.$('#sort').onclick = e => { desc = !desc; e.target.textContent = desc ? 'Mới cập nhật ↓' : 'Cũ nhất ↑'; draw(); };
  load();
});
