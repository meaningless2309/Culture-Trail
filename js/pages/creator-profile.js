CT.ready(() => {
  const u = CT.auth.user(); let c = CT.creator(u.id); const f = CT.$('#f');
  if(!c){ c = CT.db.insert('creators', {id:u.id, name:u.name, field:'', placeId:'', bio:'', publicEmail:'', website:'', showEmail:false, portrait:null, gallery:[]}); }
  const places = CT.db.all('places').filter(p => !p.parentId);
  f.placeId.innerHTML = '<option value="">Chưa liên kết</option>' + places.map(p => `<option value="${p.id}">${CT.esc(p.name)} · ${CT.esc(p.province)}</option>`).join('');
  const toast = CT.ui.toast;
  const fill = () => { f.name.value = c.name; f.field.value = c.field; f.placeId.value = c.placeId || ''; f.bio.value = c.bio; f.publicEmail.value = c.publicEmail; f.website.value = c.website; f.showEmail.checked = !!c.showEmail; };
  const head = () => {
    const p = CT.place(c.placeId); CT.$('#nm').textContent = c.name;
    CT.$('#sub').textContent = `${c.field ? 'Nghệ nhân ' + c.field.toLowerCase() : 'Nhà sáng tạo'}${p ? ' · ' + p.name.replace(/^Làng gốm |^Làng nghề /, '') + ', ' + p.province : ''} · Hồ sơ mẫu`;
    const ns = CT.db.all('stories').filter(s => s.creatorId === u.id && s.live).length, ne = CT.db.all('events').filter(e => e.creatorId === u.id && e.status === 'upcoming').length;
    CT.$('#side').innerHTML = `<div class="media pg-4">${c.portrait ? `<img src="${c.portrait}" alt="Ảnh chân dung ${CT.esc(c.name)}">` : CT.ui.img('clay', 'Ảnh chân dung minh họa')}</div><p class="dot mt">Nhà sáng tạo · Đã cấp quyền</p><p class="small muted">Tham gia ${u.joined.slice(5, 7)}/${u.joined.slice(0, 4)} · ${ns} câu chuyện · ${ne} sự kiện</p><button class="link-btn" type="button" id="portrait">Đổi ảnh chân dung</button>`;
    CT.$('#portrait').onclick = () => pick(d => { c = CT.db.update('creators', u.id, {portrait:d}); head(); toast('Đã đổi ảnh chân dung.'); });
  };
  const gal = () => {
    CT.$('#gal').innerHTML = c.gallery.length ? c.gallery.map(g => `<article class="card"><div class="media pg-5">${g.src ? `<img src="${g.src}" alt="${CT.esc(g.caption)}">` : CT.ui.img('clay', 'Ảnh minh họa tác phẩm')}</div><h3 class="pg-6">${CT.esc(g.caption.split('·')[0].trim())}</h3><p class="small muted">${CT.esc(g.caption.split('·').slice(1).join('·').trim() || 'Ảnh minh họa')}</p><div class="actions pg-7"><button class="link-btn" type="button" data-cap="${g.id}">Sửa chú thích</button><button class="link-btn danger" type="button" data-rm="${g.id}">Xóa ảnh</button></div></article>`).join('') : `<div class="pg-8">${CT.ui.empty('Chưa có ảnh tác phẩm', 'Thêm ảnh để người đọc hiểu hơn về công việc của bạn.', '')}</div>`;
  };
  const pick = cb => { const inp = CT.$('#file'); inp.value = ''; inp.onchange = () => { const fl = inp.files[0]; if(!fl) return; if(!/^image\/(jpeg|png)$/.test(fl.type)){ toast('Chỉ nhận ảnh JPG hoặc PNG.', 'err'); return; } if(fl.size > 1048576){ toast('Ảnh quá lớn (tối đa 1 MB trong bản demo).', 'err'); return; } const r = new FileReader(); r.onload = () => cb(r.result); r.readAsDataURL(fl); }; inp.click(); };
  const caption = async (g) => {
    let v = ''; const r = await CT.ui.dialog({title:g ? 'Sửa chú thích' : 'Chú thích ảnh tác phẩm', html:`<div class="field"><label for="cp">Chú thích *</label><input id="cp" value="${CT.esc(g ? g.caption : '')}" placeholder="Tên tác phẩm · Danh mục · Năm"><span class="msg"></span></div><p class="small muted">Ghi rõ nguồn nếu không phải ảnh do bạn chụp.</p>`, actions:[{label:'Quay lại', value:null, cls:'btn-ghost'}, {label:'Lưu', value:'ok', validate:d => { const i = d.querySelector('#cp'); if(!i.value.trim()){ CT.ui.setErr(i, 'Nhập chú thích.'); return false; } v = i.value.trim(); return true; }}], onOpen:d => d.querySelector('#cp').focus()});
    return r ? v : null;
  };
  CT.$('#gal').onclick = async e => {
    const cp = e.target.closest('[data-cap]'), rm = e.target.closest('[data-rm]');
    if(cp){ const g = c.gallery.find(x => x.id === cp.dataset.cap); const v = await caption(g); if(v){ g.caption = v; c = CT.db.update('creators', u.id, {gallery:c.gallery}); gal(); toast('Đã sửa chú thích.'); } }
    if(rm){ const r = await CT.ui.confirm({title:'Xóa ảnh tác phẩm?', text:'Ảnh sẽ bị xóa khỏi hồ sơ của bạn.', confirm:'Xóa ảnh', danger:true}); if(r){ c.gallery = c.gallery.filter(x => x.id !== rm.dataset.rm); c = CT.db.update('creators', u.id, {gallery:c.gallery}); gal(); toast('Đã xóa ảnh.'); } }
  };
  CT.$('#addImg').onclick = () => pick(async d => { const v = await caption(null); if(!v) return; c.gallery.push({id:CT.uid('g'), caption:v, src:d}); c = CT.db.update('creators', u.id, {gallery:c.gallery}); gal(); toast('Đã thêm ảnh tác phẩm.'); });
  const lists = () => {
    const st = CT.db.all('stories').filter(s => s.creatorId === u.id && s.live).map(CT.pub);
    CT.$('#sto').innerHTML = st.length ? st.map(s => CT.ui.storyCard(s)).join('') : CT.ui.empty('Chưa có câu chuyện xuất bản', 'Viết và gửi duyệt câu chuyện đầu tiên của bạn.', '<a class="btn" href="creator-story-editor.html">Viết câu chuyện</a>');
    const ev = CT.db.all('events').filter(e => e.creatorId === u.id && e.status === 'upcoming')[0];
    CT.$('#evs').innerHTML = `<section class="card"><h2 class="panel-title">Sự kiện sắp tới</h2>${ev ? `<span class="dot">Sắp diễn ra</span><h3 class="pg-9">${CT.esc(ev.title)}</h3><p>${CT.fmt.ymd(ev.startDate)} · ${ev.startTime} – ${ev.endTime}</p><p class="muted">${CT.esc(ev.location)} · ${ev.registered} / ${ev.capacity} người</p>` : '<p class="muted">Chưa có sự kiện sắp tới.</p>'}<a href="creator-event-management.html"><b>Quản lý sự kiện</b></a></section>`;
  };
  CT.$('#pub').onclick = () => { const p = CT.place(c.placeId); CT.ui.dialog({title:'Hồ sơ công khai (xem trước)', wide:true, html:`<div class="row pg-10"><div class="pg-11">${CT.ui.media('clay', {alt:''})}</div><div class="pg-12"><h3>${CT.esc(c.name)}</h3><p class="small muted">${CT.esc(c.field)}${p ? ' · ' + CT.esc(p.name) : ''}</p><p>${CT.esc(c.bio)}</p>${c.showEmail && c.publicEmail ? `<p class="small">Liên hệ: ${CT.esc(c.publicEmail)}</p>` : '<p class="small muted">Email liên hệ không hiển thị công khai.</p>'}${c.website ? `<p class="small">${CT.esc(c.website)}</p>` : ''}</div></div>`}); };
  CT.$('#cancel').onclick = () => { fill(); CT.$$('.field', f).forEach(x => x.classList.remove('invalid')); toast('Đã hủy thay đổi.'); };
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const ok = CT.ui.validate(f, {name:CT.ui.val.req('Nhập tên hiển thị.'), field:CT.ui.val.req('Chọn lĩnh vực.'), bio:CT.ui.val.req('Nhập phần giới thiệu.'), publicEmail:(v) => v && CT.ui.val.email(v) ? CT.ui.val.email(v) : (f.showEmail.checked && !v ? 'Nhập email hoặc bỏ chọn hiển thị công khai.' : ''), website:v => v && !/^https?:\/\/\S+\.\S+/.test(v) ? 'Nhập địa chỉ bắt đầu bằng http:// hoặc https://.' : ''});
    if(!ok) return;
    try{ c = await CT.api.run(() => CT.db.update('creators', u.id, {name:f.name.value.trim(), field:f.field.value, placeId:f.placeId.value, bio:f.bio.value.trim(), publicEmail:f.publicEmail.value.trim(), website:f.website.value.trim(), showEmail:f.showEmail.checked})); head(); toast('Đã lưu hồ sơ.'); }
    catch(err){ toast('Không thể lưu lúc này. Dữ liệu đã nhập được giữ lại.', 'err'); }
  });
  fill(); head(); gal(); lists();
});
