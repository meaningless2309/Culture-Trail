CT.ready(() => {
  const me = CT.auth.user(), f = CT.$('#f'), id = CT.param('id'); let c, w, dirty = false;
  const COVERS = [['clay', 'Gốm'], ['lane', 'Ngõ làng'], ['lantern', 'Đèn lồng'], ['heritage', 'Di sản']];
  f.topic.innerHTML = Object.keys(CT.TOPICS).map(k => `<option value="${k}">${CT.TOPICS[k]}</option>`).join('');
  if(id){ c = CT.db.get('collections', id); if(!c){ CT.$('main').innerHTML = `<div class="state-box pg-5"><p class="eyebrow">404 · KHÔNG TÌM THẤY</p><h1>Không tìm thấy bộ sưu tập</h1><div class="actions"><a class="btn" href="curator-collection-management.html">Về danh sách</a></div></div>`; return; }
    if(c.status === 'archived'){ CT.$('main').innerHTML = `<div class="state-box pg-5"><h1 class="pg-6">Bộ sưu tập đã lưu trữ</h1><p>Khôi phục về nháp từ danh sách để tiếp tục chỉnh sửa.</p><div class="actions"><a class="btn" href="curator-collection-management.html">Về danh sách</a></div></div>`; return; } }
  else c = {id:null, name:'', desc:'', cover:'', topic:'craft', storyIds:[], status:'draft', version:0, editorId:me.id, draft:null};
  const base = c.draft || c; w = {name:base.name, desc:base.desc, cover:base.cover, topic:base.topic, storyIds:base.storyIds.slice()};
  CT.$('#h').textContent = w.name || 'Bộ sưu tập mới';
  CT.$('#eb').textContent = c.status === 'published' ? `BỘ SƯU TẬP / PHIÊN BẢN ${c.version + 1} · BẢN NHÁP` : 'BỘ SƯU TẬP / PHIÊN BẢN NHÁP';
  f.name.value = w.name; f.desc.value = w.desc; f.topic.value = w.topic;
  const stories = () => CT.db.all('stories');
  const cov = () => { CT.$('#covers').innerHTML = COVERS.map(x => `<button type="button" role="radio" aria-checked="${w.cover === x[0]}" data-c="${x[0]}" class="chip" style="cursor:pointer;border:2px solid ${w.cover === x[0] ? 'var(--forest)' : 'transparent'}"><span class="pg-7">${CT.ui.img(x[0], '')}</span> ${x[1]}</button>`).join(''); };
  const ok = id => { const s = CT.story(id); return s && s.live && ['approved', 'processing'].includes(s.status) && !s.archived; };
  const order = () => {
    CT.$('#order').innerHTML = w.storyIds.length ? w.storyIds.map((sid, i) => { const s = CT.story(sid); const good = ok(sid); return `<div class="pickrow" data-i="${i}"><span class="dot ${good ? '' : 'clay'}">${i + 1}</span><div class="grow"><b>${CT.esc(s ? CT.pub(s).title : '(đã xóa)')}</b> <span class="small muted">· ${CT.esc(s ? CT.storyPlaceName(s).replace(/^Làng gốm /, '') : '')}</span>${good ? '' : '<div class="small pg-8">Chưa còn đạt điều kiện (đã lưu trữ hoặc chưa duyệt). Gỡ khỏi bộ sưu tập.</div>'}</div><span class="cell-actions"><button type="button" class="link-btn" data-m="up" ${i === 0 ? 'disabled' : ''} aria-label="Đưa lên">↑</button><button type="button" class="link-btn" data-m="down" ${i === w.storyIds.length - 1 ? 'disabled' : ''} aria-label="Đưa xuống">↓</button><button type="button" class="link-btn danger" data-m="rm">Gỡ</button></span></div>`; }).join('') : CT.ui.empty('Chưa có câu chuyện', 'Tìm và thêm câu chuyện đã duyệt ở bên dưới.', '');
  };
  const pool = () => {
    const q = CT.norm(CT.$('#sq').value); const l = stories().filter(s => (s.status === 'approved' || s.status === 'pending' || s.status === 'processing') && (!q || CT.norm(s.title + ' ' + CT.storyPlaceName(s)).includes(q))).slice(0, 12);
    CT.$('#pool').innerHTML = l.length ? CT.ui.table([{h:'Câu chuyện', r:s => CT.esc(CT.pub(s).title)}, {h:'Trạng thái', r:s => ok(s.id) ? 'Đã duyệt' : CT.ui.statusText('story', s.status, s)}, {h:'Chọn', r:s => w.storyIds.includes(s.id) ? '<span class="small">Đã thêm</span>' : ok(s.id) ? `<button class="link-btn" type="button" data-add="${s.id}">☐ Thêm</button>` : '<span class="small muted">Chưa thể chọn</span>'}], l) : '<p class="muted small">Không tìm thấy câu chuyện phù hợp.</p>';
    CT.$('#diff').textContent = c.status === 'published' ? `Đang chỉnh phiên bản ${c.version + 1}: ${w.storyIds.length} / ${c.storyIds.length} câu chuyện được giữ lại; bản công khai vẫn có ${c.storyIds.length} câu chuyện đến khi bạn xuất bản phiên bản mới.` : '';
  };
  const problems = () => {
    const p = {}; if(!w.name.trim()) p.name = 'Vui lòng nhập tên bộ sưu tập.'; if(!w.desc.trim()) p.desc = 'Vui lòng nhập mô tả.'; if(!w.cover) p.cover = 'Chọn ảnh bìa.';
    if(!w.storyIds.length) p.stories = 'Cần ít nhất một câu chuyện.'; else if(w.storyIds.some(i => !ok(i))) p.approved = 'Có bài chưa đạt điều kiện.'; return p;
  };
  const checks = () => {
    const p = problems(), good = w.storyIds.filter(ok).length;
    CT.$('#valid').textContent = `${good} câu chuyện hợp lệ`;
    CT.$('#chk').innerHTML = [[!p.name && !p.desc, 'Có tiêu đề và mô tả', 'Thiếu tiêu đề hoặc mô tả'], [!p.cover, 'Có ảnh bìa', 'Chưa chọn ảnh bìa'], [!p.stories && !p.approved, 'Tất cả bài đã duyệt', p.stories || 'Có bài chưa duyệt / đã lưu trữ'], [true, 'Không có bài trùng lặp', '']].map(x => `<li class="${x[0] ? '' : 'no'}">${CT.esc(x[0] ? x[1] : x[2])}</li>`).join('');
  };
  const redraw = () => { cov(); order(); pool(); checks(); };
  f.addEventListener('input', () => { w.name = f.name.value; w.desc = f.desc.value; w.topic = f.topic.value; dirty = true; checks(); });
  CT.$('#covers').onclick = e => { const b = e.target.closest('[data-c]'); if(b){ w.cover = b.dataset.c; dirty = true; CT.$('#cmsg').style.display = 'none'; redraw(); } };
  CT.$('#order').onclick = e => { const b = e.target.closest('[data-m]'); if(!b) return; const i = +b.closest('[data-i]').dataset.i, a = w.storyIds; if(b.dataset.m === 'up' && i > 0) [a[i - 1], a[i]] = [a[i], a[i - 1]]; if(b.dataset.m === 'down' && i < a.length - 1) [a[i + 1], a[i]] = [a[i], a[i + 1]]; if(b.dataset.m === 'rm') a.splice(i, 1); dirty = true; redraw(); };
  CT.$('#pool').onclick = e => { const b = e.target.closest('[data-add]'); if(b){ if(w.storyIds.includes(b.dataset.add)){ CT.ui.toast('Bài này đã có trong bộ sưu tập.'); return; } w.storyIds.push(b.dataset.add); dirty = true; redraw(); } };
  CT.$('#sq').oninput = CT.debounce(pool, 200);
  const rules = () => ({name:v => v.trim() ? '' : 'Vui lòng nhập tên bộ sưu tập.', desc:v => v.trim() ? '' : 'Vui lòng nhập mô tả.'});
  const save = async (asDraft) => {
    const now = new Date().toISOString();
    return CT.api.run(() => {
      if(!c.id){ c = CT.db.insert('collections', {id:CT.uid('c'), name:w.name.trim(), desc:w.desc.trim(), cover:w.cover, topic:w.topic, storyIds:w.storyIds.slice(), status:'draft', version:0, editorId:me.id, updatedAt:now, draft:null}); history.replaceState(null, '', 'curator-collection-editor.html?id=' + c.id); }
      else if(c.status === 'published' && asDraft) c = CT.db.update('collections', c.id, {draft:Object.assign({}, w, {name:w.name.trim(), desc:w.desc.trim()}), updatedAt:now});
      else c = CT.db.update('collections', c.id, x => { Object.assign(x, {name:w.name.trim(), desc:w.desc.trim(), cover:w.cover, topic:w.topic, storyIds:w.storyIds.slice(), updatedAt:now}); });
      dirty = false; CT.$('#h').textContent = w.name;
    });
  };
  CT.$('#draft').onclick = async () => {
    if(!CT.ui.validate(f, {name:v => v.trim() ? '' : 'Vui lòng nhập tên bộ sưu tập để lưu nháp.'})) return;
    try{ await save(true); CT.ui.toast(c.status === 'published' ? 'Đã lưu bản nháp. Bản công khai không thay đổi.' : 'Đã lưu bản nháp.'); }catch(e){ CT.ui.toast('Không thể lưu lúc này. Dữ liệu được giữ lại.', 'err'); }
  };
  CT.$('#prev').onclick = () => CT.ui.dialog({title:'Xem trước: ' + (w.name || '(chưa đặt tên)'), wide:true, html:`<div class="row pg-9"><div class="pg-10">${w.cover ? CT.ui.media(w.cover, {alt:''}) : ''}</div><div class="pg-11"><p class="muted">${CT.esc(w.desc)}</p><ol>${w.storyIds.map(i => `<li>${CT.esc((CT.story(i) ? CT.pub(CT.story(i)).title : '?'))}</li>`).join('')}</ol></div></div>`});
  CT.$('#pub').onclick = async () => {
    const p = problems();
    if(!CT.ui.validate(f, rules()) || Object.keys(p).length){ if(p.cover) CT.$('#cmsg').style.display = 'block'; CT.ui.toast('Chưa thể xuất bản: ' + Object.values(p).join(' '), 'err'); return; }
    const r = await CT.ui.confirm({title:'Xuất bản phiên bản mới?', text:c.status === 'published' ? `Bộ sưu tập công khai sẽ được thay bằng phiên bản ${c.version + 1} (${w.storyIds.length} câu chuyện).` : `Bộ sưu tập sẽ hiển thị công khai với ${w.storyIds.length} câu chuyện.`, confirm:'Xuất bản'});
    if(!r) return;
    try{ await save(false); await CT.api.run(() => { c = CT.db.update('collections', c.id, x => { x.status = 'published'; x.version = (x.version || 0) + 1; x.draft = null; x.updatedAt = new Date().toISOString(); }); }); CT.ui.toast('Đã xuất bản bộ sưu tập.'); setTimeout(() => location.href = 'curator-collection-management.html', 700); }
    catch(e){ CT.ui.toast('Không thể xuất bản lúc này. Hãy thử lại.', 'err'); }
  };
  window.addEventListener('beforeunload', e => { if(dirty){ e.preventDefault(); e.returnValue = ''; } });
  redraw();
});
