CT.ready(() => {
  let u = CT.auth.user(); const pf = CT.$('#pf'), nf = CT.$('#nf'); CT.ui.bindPwToggle(pf);
  CT.$('#mail').innerHTML = `${CT.esc(u.email)}<br><span class="dot">${u.emailVerified ? 'Đã xác nhận email' : 'Chưa xác nhận email'}</span>`;
  CT.$('#rl').textContent = CT.auth.roles(u).map(r => CT.ROLE_FULL[r]).join(' · ');
  const syncState = () => CT.$$('.switch', nf).forEach(l => { const i = l.querySelector('input'); l.querySelector('.state').textContent = i.checked ? 'Bật' : 'Tắt'; });
  Object.keys(u.prefs || {}).forEach(k => { if(nf.elements[k]) nf.elements[k].checked = !!u.prefs[k]; }); syncState();
  nf.addEventListener('change', syncState);
  nf.addEventListener('submit', async e => {
    e.preventDefault();
    try{
      await CT.api.run(() => CT.db.update('users', u.id, {prefs:{review:nf.review.checked, events:nf.events.checked, weekly:nf.weekly.checked, publicProfile:nf.publicProfile.checked}}));
      CT.$('#saved').classList.remove('hidden'); CT.ui.toast('Đã lưu cài đặt.');
    }catch(err){ CT.ui.toast('Không thể lưu lúc này. Hãy thử lại.', 'err'); }
  });
  pf.addEventListener('submit', async e => {
    e.preventDefault();
    const ok = CT.ui.validate(pf, {cur:v => !v ? 'Nhập mật khẩu hiện tại.' : (v !== u.password ? 'Mật khẩu hiện tại chưa đúng.' : ''), np:v => CT.ui.val.pw(v) || (v === pf.cur.value ? 'Mật khẩu mới cần khác mật khẩu hiện tại.' : ''), nc:v => v === pf.np.value && v ? '' : 'Mật khẩu xác nhận chưa khớp.'});
    if(!ok) return;
    try{ u = await CT.api.run(() => CT.db.update('users', u.id, {password:pf.np.value})); pf.reset(); CT.ui.toast('Đã đổi mật khẩu.'); }
    catch(err){ CT.ui.toast('Không thể đổi mật khẩu lúc này. Dữ liệu đã nhập được giữ lại.', 'err'); }
  });
  CT.$('#others').onclick = async () => { const r = await CT.ui.confirm({title:'Đăng xuất thiết bị khác?', text:'Các phiên đăng nhập khác sẽ bị kết thúc. Phiên hiện tại được giữ lại.', confirm:'Đăng xuất thiết bị khác'}); if(r) CT.ui.toast('Đã đăng xuất các thiết bị khác (mô phỏng).'); };
  CT.$('#exp').onclick = () => {
    const mine = {profile:{name:u.name, email:u.email, city:u.city, bio:u.bio, joined:u.joined}, savedStories:u.saved, trails:CT.db.all('trails').filter(t => t.userId === u.id), prefs:u.prefs};
    CT.ui.download('culturetrail-du-lieu-ca-nhan.json', JSON.stringify(mine, null, 2), 'application/json'); CT.ui.toast('Đã xuất dữ liệu cá nhân.');
  };
  CT.$('#deact').onclick = async () => {
    const r = await CT.ui.confirm({title:'Yêu cầu ngừng tài khoản?', text:'Hồ sơ cá nhân sẽ được ẩn sau khi quản trị viên xử lý. Nội dung đã duyệt không bị xóa tự động.', confirm:'Gửi yêu cầu', danger:true, reason:{label:'Lý do (tùy chọn giúp chúng tôi cải thiện)', required:true, placeholder:'Ví dụ: Tôi muốn tạm nghỉ.'}});
    if(!r) return;
    CT.db.update('users', u.id, {deactivationRequest:{reason:r.reason, at:new Date().toISOString()}});
    CT.notify('u5', {type:'system', title:'Yêu cầu ngừng tài khoản', body:u.name + ': ' + r.reason, link:'admin-user-management.html', linkLabel:'Xem người dùng'});
    CT.ui.toast('Đã gửi yêu cầu ngừng tài khoản.');
  };
});
