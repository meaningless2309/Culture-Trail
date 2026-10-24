CT.ready(() => {
  const u = CT.auth.user(), f = CT.$('#f'), id = CT.param('id'); let e, dirty = false;
  const places = CT.db.all('places').filter(p => !p.parentId);
  f.placeId.innerHTML = '<option value="">Chọn địa danh</option>' + places.map(p => `<option value="${p.id}">${CT.esc(p.name)} · ${CT.esc(p.province)}</option>`).join('');
  if(id){ e = CT.db.get('events', id); if(!e || e.creatorId !== u.id){ CT.$('main').innerHTML = `<div class="state-box pg-3"><p class="eyebrow">404 · KHÔNG TÌM THẤY</p><h1>Không tìm thấy sự kiện</h1><div class="actions"><a class="btn" href="creator-event-management.html">Về danh sách sự kiện</a></div></div>`; return; } }
  else e = {id:null, creatorId:u.id, title:'', placeId:'', location:'', address:'', startDate:'', endDate:'', startTime:'', endTime:'', capacity:'', fee:'', desc:'', contact:'', imageSource:'', status:'draft', registered:0, cancelReason:''};
  const orig = JSON.stringify(e); const readonly = ['completed', 'cancelled'].includes(e.status);
  const K = ['title', 'placeId', 'location', 'address', 'startDate', 'endDate', 'startTime', 'endTime', 'capacity', 'fee', 'desc', 'contact', 'imageSource'];
  K.forEach(k => f[k].value = e[k] == null ? '' : e[k]);
  if(id) CT.$('#h').textContent = e.title || 'Sự kiện'; 
  CT.$('#eb').textContent = id ? 'SỰ KIỆN / CHỈNH SỬA' : 'SỰ KIỆN / TẠO MỚI';
  const read = () => { const o = Object.assign({}, e); K.forEach(k => o[k] = f[k].value.trim ? f[k].value.trim() : f[k].value); o.capacity = f.capacity.value === '' ? '' : Number(f.capacity.value); return o; };
  const status = () => { CT.$('#st').innerHTML = CT.ui.chip('event', e.status) + (e.status === 'upcoming' ? ' <span class="small">Đã xuất bản</span>' : ''); CT.$('#cap').textContent = `${e.registered} / ${f.capacity.value || '—'} chỗ · Dữ liệu mẫu`; CT.$('#cancel').hidden = e.status !== 'upcoming'; };
  const checks = () => {
    const o = read(), err = CT.eu.check(o);
    const items = [[!err.endTime && !err.endDate && o.startTime && o.endTime, 'Thời gian kết thúc sau bắt đầu', err.endTime || err.endDate || 'Chọn ngày giờ hợp lệ'], [!err.location && !err.contact, 'Có địa điểm và liên hệ', 'Bổ sung địa điểm và liên hệ'], [!err.capacity, 'Sức chứa hợp lệ', err.capacity || 'Nhập sức chứa']];
    CT.$('#chk').innerHTML = items.map(i => `<li class="${i[0] ? '' : 'no'}">${CT.esc(i[0] ? i[1] : i[2])}</li>`).join(''); status();
  };
  const showErrors = err => { const rules = {}; K.forEach(k => { rules[k] = () => err[k] || ''; }); CT.ui.validate(f, rules); };
  if(readonly){ K.forEach(k => f[k].disabled = true); CT.$('#save').disabled = true; CT.$('#pub').disabled = true; CT.$('.actions').insertAdjacentHTML('beforeend', `<span class="small muted">Sự kiện ${e.status === 'completed' ? 'đã hoàn thành' : 'đã hủy'} chỉ xem. Dùng “Tạo bản sao” trong danh sách để tổ chức buổi mới.</span>`); }
  f.addEventListener('input', () => { dirty = true; checks(); }); f.addEventListener('change', () => { dirty = true; checks(); });
  const persist = async (status) => {
    const o = read(), now = new Date().toISOString();
    const changedSchedule = e.id && e.status === 'upcoming' && (o.startDate !== e.startDate || o.startTime !== e.startTime || o.endTime !== e.endTime || o.location !== e.location);
    const body = Object.assign({}, o, {status, updatedAt:now});
    e = e.id ? CT.db.update('events', e.id, body) : CT.db.insert('events', Object.assign(body, {id:CT.uid('e')}));
    if(changedSchedule) CT.eu.notifyChange(e, `Lịch hoặc địa điểm mới: ${CT.fmt.ymd(e.startDate)} · ${e.startTime} – ${e.endTime} · ${e.location}.`);
    dirty = false; history.replaceState(null, '', 'creator-event-editor.html?id=' + e.id); CT.$('#h').textContent = e.title; checks();
    return changedSchedule;
  };
  f.addEventListener('submit', async ev => {
    ev.preventDefault(); const o = read();
    if(!o.title){ showErrors({title:'Nhập tên sự kiện.'}); return; }
    const err = CT.eu.check(o); if(e.status === 'upcoming' && Object.keys(err).length){ showErrors(err); return; }
    if(Object.keys(err).length) { const live = {}; ['startDate', 'endDate', 'startTime', 'endTime', 'capacity'].forEach(k => { if(err[k] && o[k] !== '' ) live[k] = err[k]; }); if(Object.keys(live).length){ showErrors(live); return; } }
    try{ const ch = await CT.api.run(() => persist(e.status)); CT.ui.toast(ch ? 'Đã lưu. Người đã lưu sự kiện được thông báo về thay đổi lịch.' : 'Đã lưu thay đổi.'); }catch(err2){ CT.ui.toast('Không thể lưu lúc này. Dữ liệu đã nhập được giữ lại.', 'err'); }
  });
  CT.$('#pub').onclick = async () => {
    const o = read(), err = CT.eu.check(o);
    if(Object.keys(err).length){ showErrors(err); CT.ui.toast('Chưa thể xuất bản. Sửa dữ liệu hoặc lưu bản nháp để hoàn thiện sau.', 'err'); return; }
    try{ await CT.api.run(() => persist('upcoming')); CT.ui.toast('Đã xuất bản sự kiện.'); }catch(err2){ CT.ui.toast('Không thể xuất bản lúc này. Hãy thử lại.', 'err'); }
  };
  CT.$('#prev').onclick = () => { const o = read(); CT.ui.dialog({title:'Xem trước: ' + (o.title || '(chưa đặt tên)'), html:`<p class="muted">${o.startDate ? CT.fmt.ymd(o.startDate) : '—'} · ${o.startTime || '—'} – ${o.endTime || '—'}</p><dl class="kv"><dt>Địa điểm</dt><dd>${CT.esc(o.location)}</dd><dt>Địa chỉ</dt><dd>${CT.esc(o.address)}</dd><dt>Sức chứa</dt><dd>${o.capacity || '—'} người</dd><dt>Phí</dt><dd>${CT.esc(o.fee || 'Liên hệ')}</dd><dt>Liên hệ</dt><dd>${CT.esc(o.contact)}</dd></dl><p class="mt">${CT.esc(o.desc)}</p>`}); };
  CT.$('#cancel').onclick = async () => { if(await CT.eu.cancel(e)){ location.href = 'creator-event-management.html'; } };
  window.addEventListener('beforeunload', ev => { if(dirty){ ev.preventDefault(); ev.returnValue = ''; } });
  checks();
});
