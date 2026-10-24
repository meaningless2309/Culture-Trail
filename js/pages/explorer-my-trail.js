CT.ready(() => {
  const u = CT.auth.user(); let trails = [], sel = CT.param('id'), cur = null, dirty = false, showArch = false, q = '';
  const ed = CT.$('#editor'), hours = t => { const m = t.stops.reduce((a, s) => a + (s.end > s.start ? (+s.end.slice(0, 2) * 60 + +s.end.slice(3)) - (+s.start.slice(0, 2) * 60 + +s.start.slice(3)) : 0), 0); return m ? 'Khoảng ' + (Math.round(m / 6) / 10) + ' giờ' : ''; };
  const load = () => {
    ed.innerHTML = CT.ui.skeletonRows(5); CT.$('#tlist').innerHTML = CT.ui.skeletonRows(3);
    CT.api.list('trails', t => t.userId === u.id).then(d => { trails = d; pick(); }).catch(() => { CT.ui.showError(ed, load); CT.$('#tlist').innerHTML = ''; });
  };
  const visible = () => trails.filter(t => (t.status === 'archived') === showArch && (!q || CT.norm(t.name + ' ' + t.city).includes(CT.norm(q))));
  const pick = id => {
    if(id) sel = id; const t = trails.find(x => x.id === sel) || visible()[0]; sel = t ? t.id : null;
    cur = t ? JSON.parse(JSON.stringify(t)) : null; dirty = false; list(); draw();
  };
  const list = () => {
    const v = visible(); CT.$('#lt').textContent = showArch ? `Kho lưu trữ (${v.length})` : `${trails.filter(t => t.status === 'active').length} hành trình`;
    CT.$('#arch').textContent = showArch ? '← Quay lại hành trình đang dùng' : `Xem kho lưu trữ (${trails.filter(t => t.status === 'archived').length}) →`;
    CT.$('#tlist').innerHTML = v.length ? v.map(t => `<button type="button" class="card" data-id="${t.id}" style="text-align:left;cursor:pointer;width:100%;${t.id === sel ? 'border-color:var(--forest);box-shadow:0 0 0 1px var(--forest)' : ''}" ${t.id === sel ? 'aria-current="true"' : ''}><span class="pg-3">${CT.esc(t.name)}</span><span class="small muted">${t.stops.length} điểm · ${CT.esc(t.city)} · ${t.status === 'archived' ? 'Đã lưu trữ' : 'Đã lưu'}</span>${t.id === sel ? '<br><span class="dot">Đang mở</span>' : ''}</button>`).join('') : `<p class="muted small">${q ? 'Không tìm thấy hành trình phù hợp.' : 'Chưa có hành trình nào.'}</p>`;
  };
  const draw = () => {
    if(!cur){ ed.innerHTML = CT.ui.empty(showArch ? 'Kho lưu trữ trống' : 'Hành trình trống', showArch ? 'Hành trình đã lưu trữ sẽ xuất hiện tại đây.' : 'Chưa có điểm dừng. Bắt đầu từ địa danh hoặc câu chuyện yêu thích.', '<a class="btn" href="explorer-story-discovery.html">Khám phá địa danh</a><a class="btn btn-outline" href="explorer-ai-trail-generator.html">Tạo cùng AI</a>'); return; }
    const arch = cur.status === 'archived';
    ed.innerHTML = `<div class="row between"><div><h2 class="pg-4">${CT.esc(cur.name || 'Hành trình chưa đặt tên')}</h2><p class="muted small">${cur.stops.length} điểm · ${hours(cur)} · Cập nhật ${CT.fmt.date(cur.updatedAt)}</p></div><span class="dot clay" id="dirt">${dirty ? 'Có thay đổi chưa lưu' : ''}</span></div>
      <form id="tf" novalidate class="form-stack"><div class="form-grid"><div class="field"><label for="tn">Tên hành trình *</label><input id="tn" name="tn" value="${CT.esc(cur.name)}" ${arch ? 'disabled' : ''}><span class="msg"></span></div><div class="field"><label for="td">Ngày dự kiến</label><input id="td" name="td" type="date" value="${cur.date || ''}" ${arch ? 'disabled' : ''}></div></div>
      <div class="notice"><strong>Bạn là người quyết định lộ trình</strong><p>Thời gian và sơ đồ chỉ minh họa. Hãy xác nhận khoảng cách, lịch mở cửa và tình trạng tiếp đón trước khi đi.</p></div>
      <div class="split pg-5"><div><div id="stops">${cur.stops.length ? cur.stops.map((s, i) => CT.ui.stopCard(s, i, cur.stops.length)).join('') : CT.ui.empty('Hành trình trống', 'Chưa có điểm dừng. Bắt đầu từ địa danh hoặc câu chuyện yêu thích.', '<a class="btn" href="explorer-story-discovery.html">Khám phá địa danh</a>')}</div>${arch ? '' : `<div class="actions"><button class="link-btn" type="button" id="addS">Thêm địa danh</button><span class="small muted">Đổi thứ tự bằng nút ↑ ↓ trên từng điểm.</span></div>`}</div>
        <div class="stack-s">${cur.stops.length ? CT.ui.schematic(CT.ui.stopsPoints(cur.stops)) : ''}<div class="field"><label for="nt">Ghi chú cho chuyến đi</label><textarea id="nt" name="nt" rows="4" ${arch ? 'disabled' : ''}>${CT.esc(cur.notes || '')}</textarea></div></div></div>
      <div class="actions">${arch ? '<button class="btn" type="button" id="restore">Khôi phục hành trình</button><button class="btn btn-ghost pg-6" type="button" id="del">Xóa vĩnh viễn</button>' : '<button class="btn" type="submit" id="save">Lưu hành trình</button><button class="btn btn-ghost" type="button" id="undo">Hủy thay đổi</button><button class="btn btn-ghost" type="button" id="toArch">Lưu trữ</button><button class="btn btn-ghost pg-6" type="button" id="del">Xóa</button>'}</div></form>`;
    const f = CT.$('#tf'); if(arch){ CT.$('#restore').onclick = restore; CT.$('#del').onclick = del; return; }
    f.tn.oninput = () => { cur.name = f.tn.value; mark(); }; f.td.onchange = () => { cur.date = f.td.value; mark(); }; f.nt.oninput = () => { cur.notes = f.nt.value; mark(); };
    CT.ui.bindStops(CT.$('#stops'), () => cur.stops, () => { dirty = true; draw(); });
    CT.$('#addS') && (CT.$('#addS').onclick = async () => { const s = await CT.ui.addStop(cur.stops.map(x => x.placeId)); if(s){ cur.stops.push(s); dirty = true; draw(); } });
    f.addEventListener('submit', save); CT.$('#undo').onclick = () => { pick(sel); CT.ui.toast('Đã hủy thay đổi.'); };
    CT.$('#toArch').onclick = archive; CT.$('#del').onclick = del;
  };
  const mark = () => { dirty = true; const d = CT.$('#dirt'); if(d) d.textContent = 'Có thay đổi chưa lưu'; };
  const save = async e => {
    e.preventDefault(); const f = CT.$('#tf');
    if(!CT.ui.validate(f, {tn:CT.ui.val.req('Nhập tên hành trình.')})) return;
    const btn = CT.$('#save'); btn.disabled = true;
    try{
      const t = await CT.api.run(() => CT.db.update('trails', sel, x => { x.name = cur.name.trim(); x.date = cur.date; x.notes = cur.notes; x.stops = cur.stops; x.updatedAt = new Date().toISOString(); }));
      trails = CT.db.all('trails').filter(x => x.userId === u.id); dirty = false; cur = JSON.parse(JSON.stringify(t)); list(); draw();
      CT.$('#editor').insertAdjacentHTML('beforeend', CT.ui.notice('Đã lưu hành trình', `Trạng thái sau lưu: ${t.stops.length} điểm dừng và ghi chú đã được cập nhật.`, 'ok')); CT.ui.toast('Đã lưu hành trình.');
    }catch(err){ CT.ui.toast('Không thể lưu lúc này. Thay đổi của bạn vẫn được giữ trên trang.', 'err'); btn.disabled = false; }
  };
  const archive = async () => { const r = await CT.ui.confirm({title:'Lưu trữ hành trình?', text:`“${CT.esc(cur.name)}” sẽ chuyển vào kho lưu trữ. Bạn có thể khôi phục bất cứ lúc nào.`, confirm:'Lưu trữ'}); if(!r) return; CT.db.update('trails', sel, {status:'archived'}); trails = CT.db.all('trails').filter(x => x.userId === u.id); CT.ui.toast('Đã lưu trữ hành trình.'); sel = null; pick(); };
  const restore = () => { CT.db.update('trails', sel, {status:'active'}); trails = CT.db.all('trails').filter(x => x.userId === u.id); showArch = false; CT.ui.toast('Đã khôi phục hành trình.'); pick(); };
  const del = async () => { const r = await CT.ui.confirm({title:'Xóa hành trình?', text:`${cur.stops.length} điểm dừng và ghi chú của hành trình này sẽ bị xóa. Không thể hoàn tác. Chọn lưu trữ nếu chưa chắc.`, confirm:'Xóa hành trình', danger:true}); if(!r) return; CT.db.remove('trails', sel); trails = trails.filter(x => x.id !== sel); CT.ui.toast('Đã xóa hành trình.'); sel = null; pick(); };
  CT.$('#tlist').onclick = async e => { const b = e.target.closest('[data-id]'); if(!b || b.dataset.id === sel) return; if(dirty){ const r = await CT.ui.confirm({title:'Bỏ thay đổi chưa lưu?', text:'Hành trình đang mở có thay đổi chưa lưu.', confirm:'Bỏ thay đổi', danger:true}); if(!r) return; } pick(b.dataset.id); };
  CT.$('#tq').oninput = CT.debounce(e => { q = e.target.value; list(); }, 200);
  CT.$('#arch').onclick = () => { showArch = !showArch; sel = null; pick(); };
  CT.$('#newT').onclick = async () => {
    let name = '';
    const r = await CT.ui.dialog({title:'Tạo hành trình mới', html:'<div class="field"><label for="nn">Tên hành trình *</label><input id="nn" placeholder="Ví dụ: Một sáng ở Bát Tràng"><span class="msg"></span></div>', actions:[{label:'Quay lại', value:null, cls:'btn-ghost'}, {label:'Tạo hành trình', value:'ok', validate:d => { const i = d.querySelector('#nn'); if(!i.value.trim()){ CT.ui.setErr(i, 'Nhập tên hành trình.'); return false; } name = i.value.trim(); return true; }}], onOpen:d => d.querySelector('#nn').focus()});
    if(!r) return; const t = CT.db.insert('trails', {id:CT.uid('t'), userId:u.id, name, date:'', city:'', status:'active', notes:'', stops:[], updatedAt:new Date().toISOString()});
    trails.push(t); showArch = false; pick(t.id); CT.ui.toast('Đã tạo hành trình mới. Thêm điểm dừng rồi lưu.');
  };
  window.addEventListener('beforeunload', e => { if(dirty){ e.preventDefault(); e.returnValue = ''; } });
  load();
  if(CT.param('new')) setTimeout(() => CT.$('#newT').click(), 400);
});
