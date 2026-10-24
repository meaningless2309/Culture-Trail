CT.ready(() => {
  const u = CT.auth.user(), f = CT.$('#f'); const id = CT.param('id'); let s, dirty = false, timer, summary = '';
  const places = CT.db.all('places').filter(p => !p.parentId);
  f.placeId.innerHTML = '<option value="">Chọn địa danh</option>' + places.map(p => `<option value="${p.id}">${CT.esc(p.name)} · ${CT.esc(p.province)}</option>`).join('');
  f.topic.innerHTML = Object.keys(CT.TOPICS).map(k => `<option value="${k}">${CT.TOPICS[k]}</option>`).join('');
  if(id){ s = CT.story(id); if(!s || s.creatorId !== u.id){ CT.$('main').innerHTML = `<div class="state-box pg-8"><p class="eyebrow">404 · KHÔNG TÌM THẤY</p><h1>Không tìm thấy bài của bạn</h1><div class="actions"><a class="btn" href="creator-story-management.html">Về danh sách câu chuyện</a></div></div>`; return; }
    if(s.status === 'pending' || s.status === 'processing'){ CT.$('main').innerHTML = `<div class="state-box pg-8"><h1 class="pg-9">Bài đang chờ duyệt</h1><p>Không sửa phiên bản đang chờ. Hãy rút bài về nháp rồi chỉnh sửa.</p><div class="actions"><a class="btn" href="creator-story-management.html">Về danh sách</a></div></div>`; return; }
  } else s = {id:null, creatorId:u.id, title:'', lead:'', placeId:'', topic:'craft', sections:[], status:'draft', live:false, version:1, imageSource:'', note:'', feedback:[], history:[], tags:[], img:'clay', readMin:1};
  const live = s.live && s.status === 'approved';
  CT.$('#bc').textContent = s.title || 'Mới'; CT.$('#ver').textContent = `PHIÊN BẢN ${live ? s.version + 1 : s.version} · ${s.status === 'rejected' ? 'CHỈNH SỬA SAU PHẢN HỒI' : 'BẢN NHÁP'}`;
  const fb = (s.feedback || []).slice(-1)[0];
  CT.$('#banner').innerHTML = (fb && s.status === 'rejected' ? `<div class="notice notice--warn"><strong>Phản hồi từ biên tập viên · ${fb.kind === 'revise' ? 'Cần chỉnh sửa' : 'Bài bị từ chối'}</strong><p>${CT.esc(fb.by)} · ${CT.fmt.date(fb.at).slice(0, 5)}: ${CT.esc(fb.text)} Hãy sửa rồi gửi duyệt lại.</p></div>` : '') + (live ? CT.ui.notice('Bạn đang sửa phiên bản mới', 'Bản công khai giữ nguyên cho tới khi biên tập viên chấp nhận phiên bản này.', 'ok') : '');
  f.title.value = s.title; f.placeId.value = s.placeId || ''; f.lead.value = s.lead; f.topic.value = s.topic; f.body.value = CT.su.toText(s.sections); f.imageSource.value = s.imageSource || ''; f.note.value = s.note || '';
  summary = s.summaryNote || '';
  const cur = () => Object.assign({}, s, {title:f.title.value.trim(), placeId:f.placeId.value, lead:f.lead.value.trim(), topic:f.topic.value, sections:CT.su.fromText(f.body.value), imageSource:f.imageSource.value.trim(), note:f.note.value.trim()});
  const cover = () => { CT.$('#cover').innerHTML = s.cover ? `<img src="${s.cover}" alt="Ảnh bìa bài viết">` : CT.ui.img(s.img || 'clay', 'Ảnh minh họa mặc định'); };
  const checks = () => {
    const c = cur(), list = CT.su.check(c); CT.$('#tc').textContent = c.title.length; CT.$('#wc').textContent = CT.storyWords(c);
    const own = f.own.checked; const ok = list.every(x => x.ok) && own;
    CT.$('#chk').innerHTML = list.map(x => `<li class="${x.ok ? '' : 'no'}">${CT.esc(x.ok ? x.label : x.bad)}</li>`).join('');
    CT.$('#send').disabled = !ok; CT.$('#send').textContent = s.status === 'rejected' ? 'Gửi duyệt lại' : 'Gửi duyệt';
    const miss = list.filter(x => !x.ok).map(x => x.key === 'img' ? 'thiếu nguồn ảnh' : x.key === 'words' ? 'nội dung chưa đủ 300 từ' : x.key === 'title' ? 'tiêu đề chưa hợp lệ' : 'chưa chọn địa danh'); if(!own) miss.push('chưa xác nhận chịu trách nhiệm');
    CT.$('#why').textContent = miss.length ? `Chưa thể gửi: ${miss.join(', ')}. Bản nháp vẫn có thể được lưu.` : '';
  };
  const persist = (silent) => {
    const c = cur(), now = new Date().toISOString();
    const body = {title:c.title, lead:c.lead, placeId:c.placeId || null, topic:c.topic, sections:c.sections, imageSource:c.imageSource, note:c.note, cover:s.cover, summaryNote:summary, updatedAt:now, readMin:Math.max(1, Math.round(CT.storyWords(c) / 200))};
    if(!s.id){ s = CT.db.insert('stories', Object.assign({}, s, body, {id:CT.uid('s'), history:[{at:now, text:u.name + ' tạo bản nháp'}]})); history.replaceState(null, '', 'creator-story-editor.html?id=' + s.id); }
    else s = CT.db.update('stories', s.id, x => {
      if(x.live && x.status === 'approved' && !x.liveSnapshot){ x.liveSnapshot = {title:x.title, lead:x.lead, sections:x.sections, imageSource:x.imageSource}; x.version += 1; x.status = 'draft'; }
      Object.assign(x, body);
    });
    dirty = false; CT.$('#auto').textContent = 'Lưu gần nhất lúc ' + new Date().toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'}) + '. Bạn vẫn có thể lưu thủ công.';
    if(!silent) CT.ui.toast('Đã lưu bản nháp.'); CT.$('#bc').textContent = s.title;
  };
  const mark = () => { dirty = true; CT.$('#auto').textContent = 'Có thay đổi chưa lưu…'; checks(); clearTimeout(timer); timer = setTimeout(() => { if(dirty && f.title.value.trim()) persist(true); }, 4000); };
  f.addEventListener('input', mark); f.addEventListener('change', mark);
  CT.$$('[data-fmt]').forEach(b => b.onclick = () => {
    const t = f.body, a = t.selectionStart, z = t.selectionEnd, sel = t.value.slice(a, z), k = b.dataset.fmt;
    const ins = {h2:'\n\n## ' + (sel || 'Tiêu đề mục') + '\n\n', b:'**' + (sel || 'chữ đậm') + '**', i:'*' + (sel || 'chữ nghiêng') + '*', list:'\n- ' + (sel || 'Ý thứ nhất') + '\n- ', img:'\n[Ảnh: mô tả · Nguồn: tên tác giả]\n'}[k];
    t.setRangeText(ins, a, z, 'end'); t.focus(); mark();
  });
  CT.$('#up').onclick = () => { const i = CT.$('#file'); i.value = ''; i.onchange = () => { const fl = i.files[0]; if(!fl) return; if(!/^image\/(jpeg|png)$/.test(fl.type)){ CT.ui.toast('Chỉ nhận ảnh JPG hoặc PNG.', 'err'); return; } if(fl.size > 1048576){ CT.ui.toast('Ảnh quá lớn (tối đa 1 MB trong bản demo).', 'err'); return; } const r = new FileReader(); r.onload = () => { s.cover = r.result; cover(); mark(); }; r.readAsDataURL(fl); }; i.click(); };
  CT.$('#draft').onclick = async () => {
    if(!CT.ui.validate(f, {title:CT.ui.val.req('Vui lòng nhập tiêu đề.')})) return;
    try{ await CT.api.run(() => persist(false)); }catch(e){ CT.ui.toast('Không thể lưu lúc này. Nội dung của bạn vẫn được giữ trên trang.', 'err'); }
  };
  CT.$('#prev').onclick = () => CT.su.preview(cur());
  f.addEventListener('submit', async e => {
    e.preventDefault(); const c = cur();
    const ok = CT.ui.validate(f, {title:v => !v.trim() ? 'Vui lòng nhập tiêu đề.' : (v.length > 100 ? 'Tiêu đề tối đa 100 ký tự.' : ''), placeId:v => v ? '' : 'Chọn địa danh liên kết.', lead:CT.ui.val.req('Nhập mô tả ngắn.'), body:() => CT.storyWords(c) >= CT.su.MIN_WORDS ? '' : `Nội dung cần trên 300 từ (hiện ${CT.storyWords(c)} từ).`, imageSource:v => v.trim() ? '' : 'Vui lòng ghi tác giả ảnh hoặc xác nhận bạn có quyền sử dụng trước khi gửi duyệt.', own:v => v ? '' : 'Cần xác nhận chịu trách nhiệm.'});
    if(!ok) return; CT.$('#send').disabled = true;
    try{
      await CT.api.run(() => {
        persist(true); const now = new Date().toISOString();
        s = CT.db.update('stories', s.id, x => { x.status = 'pending'; x.submittedAt = now; x.history = (x.history || []).concat({at:now, text:`${u.name} gửi phiên bản ${x.version}`}); });
        CT.notify('u2', {type:'content', title:'Có bài mới chờ duyệt', body:`“${s.title}” từ ${u.name}.`, link:'curator-content-review.html', linkLabel:'Mở hàng đợi'});
      });
      CT.ui.toast('Đã gửi duyệt. Bạn sẽ nhận thông báo khi có kết quả.'); setTimeout(() => location.href = 'creator-story-management.html', 700);
    }catch(err){ CT.ui.toast('Không thể gửi lúc này. Bản nháp và nội dung vẫn được giữ.', 'err'); CT.$('#send').disabled = false; }
  });
  CT.ai.summaryPanel(CT.$('#aiBox'), cur, {saved:summary, saveLabel:'Lưu bản chỉnh sửa', onViewSource:() => f.body.scrollIntoView({behavior:'smooth'}), onSave:t => { summary = t; mark(); }});
  window.addEventListener('beforeunload', e => { if(dirty){ e.preventDefault(); e.returnValue = ''; } });
  cover(); checks();
});
