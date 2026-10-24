CT.ready(() => {
  const f = CT.$('#f'); CT.ui.bindPwToggle(f);
  if(new URLSearchParams(location.search).get('role') === 'creator') f.role.value = 'creator';
  const L = ['', 'yếu', 'khá', 'tốt'];
  f.password.addEventListener('input', () => { const l = CT.ui.pwStrength(f.password.value); CT.$('#meter').dataset.l = l; CT.$('#meter i').style.width = (l * 33.3) + '%'; CT.$('#pwhint').textContent = 'Từ 8 ký tự, gồm chữ và số' + (l ? ' · Độ mạnh: ' + L[l] : ''); });
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const ok = CT.ui.validate(f, {
      name:CT.ui.val.req('Nhập họ và tên.'), email:CT.ui.val.email, password:CT.ui.val.pw,
      confirm:v => v === f.password.value && v ? '' : 'Mật khẩu xác nhận chưa khớp.',
      terms:v => v ? '' : 'Bạn cần đồng ý điều khoản để tiếp tục.'});
    if(!ok) return;
    const btn = CT.$('#go'); btn.disabled = true; btn.textContent = 'Đang tạo tài khoản…';
    try{
      const res = await CT.api.run(() => {
        const email = f.email.value.trim().toLowerCase();
        if(CT.db.all('users').some(u => u.email.toLowerCase() === email)) return {dup:true};
        const u = CT.db.insert('users', {id:CT.uid('u'), name:f.name.value.trim(), email, password:f.password.value, roles:[], status:'active', city:'', bio:'', joined:new Date().toISOString().slice(0, 10), saved:[], savedEvents:[], prefs:{review:true, events:true, weekly:true, publicProfile:false}, summaries:{}, emailVerified:false, creatorRequest:f.role.value === 'creator'});
        if(f.role.value === 'creator'){ CT.notify('u5', {type:'system', title:'Yêu cầu quyền nhà sáng tạo mới', body:u.name + ' xin quyền đăng bài sau khi hoàn thiện hồ sơ.', link:'admin-user-management.html', linkLabel:'Xem người dùng'}); }
        CT.notify(u.id, {type:'system', title:'Chào mừng đến CultureTrail', body:'Bắt đầu bằng việc tìm một câu chuyện bạn muốn hiểu thêm.', link:'explorer-story-discovery.html', linkLabel:'Khám phá'});
        return {u};
      });
      if(res.dup){ CT.ui.setErr(f.email, 'Email này đã được đăng ký. Hãy đăng nhập hoặc dùng “Quên mật khẩu”.'); btn.disabled = false; btn.textContent = '→ Tạo tài khoản'; return; }
      CT.auth.login(res.u, true, 'explorer'); CT.ui.toast('Tạo tài khoản thành công.');
      setTimeout(() => location.href = f.role.value === 'creator' ? 'personal-profile.html' : 'explorer-story-discovery.html', 600);
    }catch(err){ CT.$('#alert').innerHTML = CT.ui.notice('Không thể xử lý yêu cầu lúc này', 'Thông tin bạn đã nhập vẫn được giữ. Hãy thử lại.', 'err'); btn.disabled = false; btn.textContent = '→ Tạo tài khoản'; }
  });
});
