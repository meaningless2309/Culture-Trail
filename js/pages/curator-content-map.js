CT.ready(() => {
  let stories = [], places = [], selId = null, F = {reg:'', top:'', ls:''}, pq = '';
  const $ = CT.$;
  const load = () => { $('#sel').innerHTML = CT.ui.skeletonRows(3); Promise.all([CT.api.list('stories', s => s.status !== 'draft' || true), CT.api.list('places', p => !p.parentId)]).then(([s, p]) => { stories = s; places = p; init(); }).catch(() => CT.ui.showError($('#sel'), load)); };
  const init = () => {
    $('#reg').innerHTML = '<option value="">Tất cả</option>' + CT.REGIONS.map(r => `<option>${r}</option>`).join('');
    $('#top').innerHTML = '<option value="">Tất cả</option>' + Object.keys(CT.TOPICS).map(k => `<option value="${k}">${CT.TOPICS[k]}</option>`).join('');
    if(!selId) selId = (places[0] || {}).id; draw();
  };
  const relevant = s => ['pending', 'processing', 'approved', 'rejected', 'draft'].includes(s.status) && (!F.top || s.topic === F.top);
  const linked = p => stories.filter(s => s.placeId === p.id && relevant(s));
  const unlinked = () => stories.filter(s => !s.placeId && relevant(s) && s.status !== 'archived');
  const draw = () => {
    const pls = places.filter(p => (!F.reg || p.region === F.reg) && F.ls !== 'unlinked');
    const un = unlinked();
    const pts = pls.map(p => ({label:`${p.name.replace(/^Làng gốm |^Làng nghề |^Phố cổ /, '')} · ${linked(p).length}`, x:p.x, y:p.y, id:p.id}));
    if(F.ls !== 'linked') un.forEach(s => { const hp = places.find(p => CT.norm(p.name).includes(CT.norm(s.placeHint || '###'))) || {x:50, y:50}; pts.push({label:`○ ${s.title.slice(0, 18)}…`, x:Math.min(95, hp.x + 8), y:Math.min(95, hp.y + 12), hollow:true}); });
    $('#map').innerHTML = pts.length ? CT.ui.schematic(pts, {sub:'Điểm là dữ liệu mẫu. Chọn một địa danh để xem nội dung đã liên kết.'}) : CT.ui.empty('Không có điểm phù hợp', 'Đổi bộ lọc khu vực hoặc trạng thái liên kết.', '');
    const nl = pls.reduce((a, p) => a + linked(p).length, 0);
    $('#legend').innerHTML = `<span class="dot">Đã liên kết (${nl})</span><span class="dot clay">○ Chưa có địa danh (${un.length})</span>`;
    const l = pls.filter(p => !pq || CT.norm(p.name).includes(CT.norm(pq)));
    $('#plist').innerHTML = l.length ? l.map(p => `<button type="button" data-p="${p.id}" class="pickrow" style="width:100%;background:none;border-left:0;border-right:0;border-bottom:0;cursor:pointer;text-align:left;font:15px var(--sans);${p.id === selId ? 'font-weight:600;color:var(--forest)' : ''}"><span class="grow">${CT.esc(p.name)} · ${linked(p).length} bài</span><span aria-hidden="true">→</span></button>`).join('') : '<p class="muted small">Không tìm thấy địa danh.</p>';
    $('#unl').innerHTML = `<h2 class="panel-title">Chưa có địa danh (${un.length})</h2>${un.length ? un.map(s => `<div class="pickrow pg-5"><b>${CT.esc(s.title)}</b><div class="tiny muted">${CT.esc((CT.user(s.creatorId) || {}).name)} · ${CT.ui.statusText('story', s.status, s)}${s.placeHint ? ' · gợi ý: ' + CT.esc(s.placeHint) : ''}</div><button class="link-btn" type="button" data-link="${s.id}">Liên kết địa danh</button></div>`).join('') : '<p class="muted small">Tất cả nội dung đã có địa danh.</p>'}`;
    const p = places.find(x => x.id === selId), ev = CT.db.all('events').filter(e => e.placeId === selId && e.status === 'upcoming').length;
    const ls = p ? linked(p) : [];
    $('#sel').innerHTML = p ? `<h2 class="panel-title pg-6">Địa danh đang chọn: ${CT.esc(p.name.replace(/^Làng gốm /, ''))}</h2><p class="small">${ls.length} câu chuyện đã liên kết · ${ev} sự kiện · Nội dung mẫu</p>${ls.length ? CT.ui.table([{h:'Nội dung', r:s => CT.esc(CT.pub(s).title)}, {h:'Trạng thái', r:s => CT.ui.statusText('story', s.status, s)}, {h:'Liên kết', r:s => `<span class="cell-actions"><button class="link-btn" type="button" data-edit="${s.id}">Cập nhật</button><button class="link-btn danger" type="button" data-unl="${s.id}">Gỡ</button></span>`}], ls) : CT.ui.empty('Chưa có nội dung liên kết', 'Liên kết một câu chuyện từ danh sách “Chưa có địa danh”.', '')}` : CT.ui.empty('Chọn một địa danh', 'Chọn điểm trên sơ đồ hoặc trong danh sách.', '');
    fillForm();
  };
  const fillForm = (sid) => {
    const un = unlinked(); const cur = sid ? stories.find(s => s.id === sid) : null;
    const opts = (cur && cur.placeId ? [cur] : []).concat(un.filter(s => !cur || s.id !== cur.id));
    $('#ls2').innerHTML = opts.length ? opts.map(s => `<option value="${s.id}" ${cur && cur.id === s.id ? 'selected' : ''}>${CT.esc(s.title)}</option>`).join('') : '<option value="">Không còn bài chưa liên kết</option>';
    $('#pl').innerHTML = '<option value="">Chọn địa danh</option>' + places.map(p => `<option value="${p.id}" ${(cur && cur.placeId === p.id) || (!cur && p.id === selId) ? 'selected' : ''}>${CT.esc(p.name)} · ${CT.esc(p.province)}</option>`).join('');
    const t = opts[0] || cur; $('#lfNote').textContent = t ? `Áp dụng cho “${t.title}”. Việc liên kết không đồng nghĩa xác minh tọa độ hay nội dung lịch sử.` : 'Không có bài nào cần liên kết.';
  };
  $('#ls2').onchange = e => { const s = stories.find(x => x.id === e.target.value); if(s) $('#lfNote').textContent = `Áp dụng cho “${s.title}”. Việc liên kết không đồng nghĩa xác minh tọa độ hay nội dung lịch sử.`; };
  $('#ff').onsubmit = e => { e.preventDefault(); F = {reg:$('#reg').value, top:$('#top').value, ls:$('#ls').value}; draw(); };
  $('#pq').oninput = CT.debounce(e => { pq = e.target.value; draw(); }, 200);
  const pick = e => { const b = e.target.closest('[data-p],[data-id]'); if(b){ selId = b.dataset.p || b.dataset.id; draw(); } };
  $('#plist').onclick = pick; $('#map').onclick = pick; $('#map').onkeydown = e => { if(e.key === 'Enter' || e.key === ' '){ pick(e); } };
  document.addEventListener('click', async e => {
    const lk = e.target.closest('[data-link]'), ed = e.target.closest('[data-edit]'), un = e.target.closest('[data-unl]');
    if(lk){ fillForm(lk.dataset.link); $('#formCard').scrollIntoView({behavior:'smooth'}); $('#pl').focus(); }
    if(ed){ fillForm(ed.dataset.edit); $('#formCard').scrollIntoView({behavior:'smooth'}); $('#pl').focus(); }
    if(un){ const s = stories.find(x => x.id === un.dataset.unl); const r = await CT.ui.confirm({title:'Gỡ liên kết địa danh?', text:'Câu chuyện vẫn giữ nội dung và trạng thái duyệt, nhưng sẽ vào danh sách chưa có địa danh.', confirm:'Gỡ liên kết', danger:true});
      if(!r) return; try{ await CT.api.run(() => CT.db.update('stories', s.id, x => { x.placeHint = (CT.place(x.placeId) || {}).name || x.placeHint; x.placeId = null; })); stories = CT.db.all('stories'); CT.ui.toast('Đã gỡ liên kết.'); draw(); }catch(err){ CT.ui.toast('Không thể gỡ lúc này.', 'err'); } }
  });
  $('#back').onclick = () => setTimeout(() => fillForm(), 0);
  $('#lf').addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target;
    if(!CT.ui.validate(f, {story:v => v ? '' : 'Chọn câu chuyện cần liên kết.', place:v => v ? '' : 'Chọn địa danh để lưu liên kết.'})) return;
    try{ await CT.api.run(() => { CT.db.update('stories', f.story.value, x => { x.placeId = f.place.value; x.placeHint = ''; x.history = (x.history || []).concat({at:new Date().toISOString(), text:`${CT.auth.user().name} liên kết địa danh ${(CT.place(f.place.value) || {}).name}${f.note.value.trim() ? ' (' + f.note.value.trim() + ')' : ''}`}); }); });
      stories = CT.db.all('stories'); selId = f.place.value; f.note.value = ''; CT.ui.toast('Đã lưu liên kết địa danh.'); draw(); }
    catch(err){ CT.ui.toast('Không thể lưu lúc này. Dữ liệu đã nhập được giữ lại.', 'err'); }
  });
  load();
});
