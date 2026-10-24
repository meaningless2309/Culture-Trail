CT.ready(() => {
  const u = CT.auth.user(); let all = [], tab = 'all', q = '', desc = true;
  const TABS = [['all', 'Tất cả'], ['upcoming', 'Sắp diễn ra'], ['draft', 'Bản nháp'], ['completed', 'Hoàn thành'], ['cancelled', 'Đã hủy']];
  const load = () => { CT.$('#list').innerHTML = CT.ui.skeletonRows(4); CT.api.list('events', e => e.creatorId === u.id).then(d => { all = d; draw(); }).catch(() => CT.ui.showError(CT.$('#list'), load)); };
  const b = (a, l, id, cls) => `<button class="link-btn ${cls || ''}" type="button" data-a="${a}" data-id="${id}">${l}</button>`;
  const acts = e => ({upcoming:b('view', 'Xem', e.id) + `<a href="creator-event-editor.html?id=${e.id}">Sửa</a>` + b('cancel', 'Hủy', e.id, 'danger'), draft:`<a href="creator-event-editor.html?id=${e.id}">Sửa</a>` + b('publish', 'Xuất bản', e.id), completed:b('view', 'Xem', e.id) + b('dup', 'Tạo bản sao', e.id), cancelled:b('reason', 'Xem lý do', e.id) + b('dup', 'Sao chép', e.id)}[e.status]);
  const draw = () => {
    const c = k => all.filter(e => e.status === k).length;
    CT.$('#stats').innerHTML = [[c('upcoming'), 'Sắp diễn ra'], [c('draft'), 'Bản nháp'], [c('completed'), 'Hoàn thành'], [c('cancelled'), 'Đã hủy']].map(x => `<div class="stat"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('');
    CT.$('#tabs').innerHTML = TABS.map(t => `<button role="tab" type="button" data-t="${t[0]}" aria-selected="${tab === t[0]}">${t[1]} (${t[0] === 'all' ? all.length : c(t[0])})</button>`).join('');
    let l = all.filter(e => (tab === 'all' || e.status === tab) && (!q || CT.norm(e.title + ' ' + e.location).includes(CT.norm(q))));
    l.sort((a, z) => (desc ? -1 : 1) * (new Date(a.updatedAt) - new Date(z.updatedAt)));
    CT.$('#list').innerHTML = l.length ? CT.ui.table([{h:'Sự kiện', r:e => CT.esc(e.title)}, {h:'Thời gian', r:e => e.startDate ? `${CT.fmt.ymd(e.startDate).slice(0, 5)} · ${e.startTime}` : '—'}, {h:'Địa điểm', r:e => CT.esc(e.location)}, {h:'Sức chứa', r:e => `${e.registered} / ${e.capacity}`}, {h:'Trạng thái', r:e => CT.ui.chip('event', e.status)}, {h:'Thao tác', r:e => `<span class="cell-actions">${acts(e)}</span>`}], l) : CT.ui.empty(all.length ? 'Không có sự kiện phù hợp' : 'Bạn chưa có sự kiện nào', all.length ? 'Thử đổi từ khóa hoặc trạng thái.' : 'Tạo sự kiện đầu tiên để mời mọi người ghé thăm.', all.length ? '<button class="btn" id="clr" type="button">Xóa bộ lọc</button>' : '<a class="btn" href="creator-event-editor.html">Tạo sự kiện</a>');
    CT.$('#cnt').textContent = `Hiển thị ${l.length} / ${all.length} sự kiện · Dữ liệu mẫu, chưa phải lịch thực tế.`;
    const clr = CT.$('#clr'); if(clr) clr.onclick = () => { tab = 'all'; q = ''; CT.$('#q').value = ''; draw(); };
    const nx = all.filter(e => e.status === 'upcoming')[0];
    CT.$('#next').innerHTML = nx ? `<h2 class="panel-title">${CT.esc(nx.title)}</h2><p class="dot">Sắp diễn ra</p><p>${CT.fmt.ymd(nx.startDate)} · ${nx.startTime} – ${nx.endTime} · Tối đa ${nx.capacity} người</p><p class="muted">Người tham gia cần xác nhận lịch với xưởng. Trạng thái sức chứa chỉ minh họa.</p><a href="creator-event-editor.html?id=${nx.id}"><b>Mở chi tiết sự kiện</b></a>` : '<h2 class="panel-title">Chưa có sự kiện sắp diễn ra</h2><p class="muted">Xuất bản một bản nháp hoặc tạo sự kiện mới.</p>';
    const dn = all.filter(e => e.status === 'completed')[0];
    CT.$('#done').innerHTML = dn ? CT.ui.notice('Sự kiện đã hoàn thành', `“${CT.esc(dn.title)}” được giữ trong lịch sử. Bạn có thể sao chép để tổ chức một buổi mới.`, 'ok') : '';
  };
  const dup = e => { const n = CT.db.insert('events', Object.assign({}, e, {id:CT.uid('e'), title:e.title + ' (bản sao)', status:'draft', registered:0, cancelReason:'', startDate:'', endDate:'', updatedAt:new Date().toISOString()})); CT.ui.toast('Đã tạo bản sao. Hãy chọn ngày giờ mới.'); location.href = 'creator-event-editor.html?id=' + n.id; };
  CT.$('#list').onclick = async ev => {
    const x = ev.target.closest('[data-a]'); if(!x) return; const e = all.find(i => i.id === x.dataset.id), a = x.dataset.a;
    try{
      if(a === 'view') CT.ui.dialog({title:e.title, html:`<dl class="kv"><dt>Thời gian</dt><dd>${CT.fmt.ymd(e.startDate)} · ${e.startTime} – ${e.endTime}</dd><dt>Địa điểm</dt><dd>${CT.esc(e.location)}</dd><dt>Sức chứa</dt><dd>${e.registered} / ${e.capacity} người</dd><dt>Phí</dt><dd>${CT.esc(e.fee)}</dd></dl><p class="mt">${CT.esc(e.desc)}</p>`});
      if(a === 'reason') CT.ui.dialog({title:'Lý do hủy: ' + e.title, html:`<div class="notice notice--warn"><strong>Sự kiện đã hủy</strong><p>${CT.esc(e.cancelReason)}</p></div><p class="small muted">Người đã lưu sự kiện đã được thông báo.</p>`, actions:[{label:'Đóng', value:null, cls:'btn-outline'}, {label:'Sao chép', value:'dup'}]}).then(v => v === 'dup' && dup(e));
      if(a === 'dup') dup(e);
      if(a === 'cancel'){ if(await CT.eu.cancel(e)) load(); }
      if(a === 'publish'){
        const err = CT.eu.check(e); const k = Object.keys(err);
        if(k.length){ const r = await CT.ui.dialog({title:'Chưa thể xuất bản', html:`<p class="muted">Bản nháp vẫn được giữ. Hoàn thiện các mục sau:</p><ul class="check-list">${k.map(i => `<li class="no">${CT.esc(err[i])}</li>`).join('')}</ul>`, actions:[{label:'Đóng', value:null, cls:'btn-ghost'}, {label:'Sửa sự kiện', value:'go'}]}); if(r) location.href = 'creator-event-editor.html?id=' + e.id; return; }
        await CT.api.run(() => CT.db.update('events', e.id, {status:'upcoming', updatedAt:new Date().toISOString()})); CT.ui.toast('Đã xuất bản sự kiện.'); load();
      }
    }catch(err){ CT.ui.toast('Không thể xử lý yêu cầu lúc này. Hãy thử lại.', 'err'); }
  };
  CT.$('#tabs').onclick = e => { const b = e.target.closest('[data-t]'); if(b){ tab = b.dataset.t; draw(); } };
  CT.$('#q').oninput = CT.debounce(e => { q = e.target.value; draw(); }, 200);
  CT.$('#sort').onclick = e => { desc = !desc; e.target.textContent = desc ? 'Mới cập nhật ↓' : 'Cũ nhất ↑'; draw(); };
  load();
});
