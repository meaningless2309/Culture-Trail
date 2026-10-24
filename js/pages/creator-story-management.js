CT.ready(() => {
  const u = CT.auth.user(); let all = [], tab = 'all', q = '', desc = true, page = 1;
  const TABS = [['all', 'Tất cả'], ['draft', 'Bản nháp'], ['pending', 'Chờ duyệt'], ['approved', 'Đã duyệt'], ['rejected', 'Bị từ chối'], ['archived', 'Lưu trữ']];
  const grp = s => s.status === 'processing' ? 'pending' : s.status;
  const load = () => { CT.$('#list').innerHTML = CT.ui.skeletonRows(4); CT.api.list('stories', s => s.creatorId === u.id).then(d => { all = d; draw(); }).catch(() => CT.ui.showError(CT.$('#list'), load)); };
  const acts = s => {
    const b = (a, l, cls) => `<button class="link-btn ${cls || ''}" type="button" data-a="${a}" data-id="${s.id}">${l}</button>`;
    const edit = `<a href="creator-story-editor.html?id=${s.id}">Sửa</a>`;
    return {draft:edit + b('submit', 'Gửi duyệt') + b('del', 'Xóa', 'danger'), pending:b('view', 'Xem') + b('withdraw', 'Rút về nháp'), processing:b('view', 'Xem') + '<span class="small muted">Đang được biên tập viên xử lý</span>', approved:b('view', 'Xem') + edit + b('archive', 'Lưu trữ'), rejected:b('fb', 'Phản hồi') + edit, archived:b('view', 'Xem') + b('restore', 'Khôi phục về nháp')}[s.status] || '';
  };
  const draw = () => {
    const c = k => all.filter(s => grp(s) === k).length;
    CT.$('#stats').innerHTML = [[c('draft'), 'Bản nháp'], [c('pending'), 'Chờ duyệt'], [c('approved'), 'Đã xuất bản'], [c('rejected'), 'Cần chỉnh sửa']].map(x => `<div class="stat"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('');
    CT.$('#tabs').innerHTML = TABS.map(t => `<button role="tab" type="button" data-t="${t[0]}" aria-selected="${tab === t[0]}">${t[1]} (${t[0] === 'all' ? all.length : c(t[0])})</button>`).join('');
    let l = all.filter(s => (tab === 'all' || grp(s) === tab) && (!q || CT.norm(s.title + ' ' + CT.storyPlaceName(s)).includes(CT.norm(q))));
    l.sort((a, b) => (desc ? -1 : 1) * (new Date(a.updatedAt || a.submittedAt || 0) - new Date(b.updatedAt || b.submittedAt || 0)));
    const p = CT.ui.paginate(l, page, 5);
    CT.$('#list').innerHTML = l.length ? CT.ui.table([{h:'Câu chuyện', r:s => CT.esc(s.title)}, {h:'Địa danh', r:s => CT.esc(CT.storyPlaceName(s))}, {h:'Trạng thái', r:s => CT.ui.chip('story', s.status, s) + (s.live && s.status !== 'approved' ? '<div class="tiny muted">Bản công khai vẫn hiển thị</div>' : '')}, {h:'Cập nhật', r:s => CT.fmt.date(s.updatedAt || s.submittedAt)}, {h:'Thao tác', r:s => `<span class="cell-actions">${acts(s)}</span>`}], p.items) : CT.ui.empty(all.length ? 'Không có câu chuyện phù hợp' : 'Bạn chưa có câu chuyện nào', all.length ? 'Thử đổi từ khóa hoặc trạng thái.' : 'Viết câu chuyện đầu tiên của bạn.', all.length ? '<button class="btn" type="button" id="clr">Xóa bộ lọc</button>' : '<a class="btn" href="creator-story-editor.html">Viết câu chuyện</a>');
    CT.ui.pager(CT.$('#pager'), p, 'câu chuyện', n => { page = n; draw(); });
    const clr = CT.$('#clr'); if(clr) clr.onclick = () => { tab = 'all'; q = ''; CT.$('#q').value = ''; draw(); };
    const rj = all.filter(s => s.status === 'rejected')[0], fb = rj && rj.feedback.slice(-1)[0];
    CT.$('#alert').innerHTML = rj && fb ? `<div class="notice notice--warn pg-2"><strong>“${CT.esc(rj.title)}” ${fb.kind === 'revise' ? 'cần chỉnh sửa' : 'bị từ chối'}</strong><p>${CT.esc(fb.by)}: ${CT.esc(fb.text)} Chỉnh sửa bài rồi gửi duyệt lại; phản hồi cũ được giữ trong lịch sử.</p></div>` : '';
  };
  const act = async (a, id) => {
    const s = all.find(x => x.id === id); const now = new Date().toISOString();
    try{
      if(a === 'view') return CT.su.preview(CT.pub(s));
      if(a === 'fb'){ const h = (s.feedback || []).slice().reverse(); return CT.ui.dialog({title:'Phản hồi từ biên tập viên', html:h.map(f => `<div class="notice notice--warn pg-3"><strong>${f.kind === 'revise' ? 'Yêu cầu chỉnh sửa' : 'Từ chối nội dung'} · ${CT.esc(f.by)} · ${CT.fmt.date(f.at)}</strong><p>${CT.esc(f.text)}</p></div>`).join(''), actions:[{label:'Đóng', value:null, cls:'btn-outline'}, {label:'Chỉnh sửa & gửi lại', value:'go'}]}).then(v => { if(v === 'go') location.href = 'creator-story-editor.html?id=' + id; }); }
      if(a === 'submit'){
        const miss = CT.su.check(s).filter(x => !x.ok);
        if(miss.length){ const r = await CT.ui.dialog({title:'Chưa thể gửi duyệt', html:`<p class="muted">Bản nháp vẫn được giữ. Hoàn thiện các mục sau rồi gửi lại:</p><ul class="check-list">${miss.map(m => `<li class="no">${CT.esc(m.bad)}</li>`).join('')}</ul>`, actions:[{label:'Đóng', value:null, cls:'btn-ghost'}, {label:'Sửa bài', value:'go'}]}); if(r) location.href = 'creator-story-editor.html?id=' + id; return; }
        await CT.api.run(() => { CT.db.update('stories', id, x => { x.status = 'pending'; x.submittedAt = now; x.updatedAt = now; x.history = (x.history || []).concat({at:now, text:`${u.name} gửi phiên bản ${x.version}`}); }); CT.notify('u2', {type:'content', title:'Có bài mới chờ duyệt', body:`“${s.title}” từ ${u.name}.`, link:'curator-content-review.html', linkLabel:'Mở hàng đợi'}); });
        CT.ui.toast('Đã gửi duyệt. Bạn sẽ nhận thông báo khi có kết quả.');
      }
      if(a === 'withdraw'){ const r = await CT.ui.confirm({title:'Rút bài về nháp?', text:'Bài sẽ rời hàng đợi duyệt và trở về bản nháp để bạn chỉnh sửa. Bạn có thể gửi lại bất cứ lúc nào.', confirm:'Rút về nháp'}); if(!r) return; await CT.api.run(() => CT.db.update('stories', id, x => { x.status = 'draft'; x.updatedAt = now; x.history = (x.history || []).concat({at:now, text:u.name + ' rút bài về nháp'}); })); CT.ui.toast('Đã rút bài về nháp.'); }
      if(a === 'del'){ const r = await CT.ui.confirm({title:'Xóa bản nháp?', text:`“${CT.esc(s.title)}” sẽ bị xóa vĩnh viễn và không thể hoàn tác.`, confirm:'Xóa bản nháp', danger:true}); if(!r) return; await CT.api.run(() => CT.db.remove('stories', id)); CT.ui.toast('Đã xóa bản nháp.'); }
      if(a === 'archive'){ const r = await CT.ui.confirm({title:'Lưu trữ câu chuyện?', text:`“${CT.esc(s.title)}” sẽ được ẩn khỏi Khám phá. Nội dung và lịch sử duyệt vẫn được giữ, có thể khôi phục.`, confirm:'Lưu trữ câu chuyện'}); if(!r) return; await CT.api.run(() => CT.db.update('stories', id, x => { x.status = 'archived'; x.live = false; x.updatedAt = now; x.history = (x.history || []).concat({at:now, text:'Lưu trữ bài'}); })); CT.ui.toast('Đã lưu trữ câu chuyện.'); }
      if(a === 'restore'){ await CT.api.run(() => CT.db.update('stories', id, x => { x.status = 'draft'; x.updatedAt = now; x.history = (x.history || []).concat({at:now, text:'Khôi phục về nháp'}); })); CT.ui.toast('Đã khôi phục về bản nháp.'); }
      load();
    }catch(err){ CT.ui.toast('Không thể xử lý yêu cầu lúc này. Hãy thử lại.', 'err'); }
  };
  CT.$('#list').onclick = e => { const b = e.target.closest('[data-a]'); if(b) act(b.dataset.a, b.dataset.id); };
  CT.$('#tabs').onclick = e => { const b = e.target.closest('[data-t]'); if(b){ tab = b.dataset.t; page = 1; draw(); } };
  CT.$('#q').oninput = CT.debounce(e => { q = e.target.value; page = 1; draw(); }, 200);
  CT.$('#sort').onclick = e => { desc = !desc; e.target.textContent = desc ? 'Mới cập nhật ↓' : 'Cũ nhất ↑'; draw(); };
  load();
});
