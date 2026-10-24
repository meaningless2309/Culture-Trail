/* CultureTrail — khung trang dùng chung (header / sidebar / footer / phân quyền) */
(function(){
  const CT = window.CT = window.CT || {};
  const esc = CT.esc;
  const body = document.body;
  const page = location.pathname.split('/').pop() || 'index.html';
  const space = body.dataset.space || '';
  const needAuth = body.dataset.auth === 'required' || !!space;
  CT.blocked = false;

  CT.ready = fn => {
    if(CT.blocked) return;
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => { if(!CT.blocked) fn(); });
    else fn();
  };
  CT.needLogin = msg => {
    CT.ui.toast(msg || 'Đăng nhập để tiếp tục.');
    setTimeout(() => location.href = 'login.html?next=' + encodeURIComponent(page + location.search), 800);
  };

  /* ---------- Bảo vệ truy cập: 401 → đăng nhập, sai vai trò → 403 ---------- */
  let user = CT.auth.user();
  if(user && user.status === 'disabled'){ CT.auth.logout(); location.replace('login.html?error=disabled'); CT.blocked = true; }
  else if(needAuth && !user){ location.replace('login.html?next=' + encodeURIComponent(page + location.search)); CT.blocked = true; }
  else if(space && !CT.auth.has(user, space)){ location.replace('403.html?need=' + space); CT.blocked = true; }
  else if(space) CT.auth.setRole(space);
  if(CT.blocked) return;

  const SIDE = {
    curator:{title:'KHÔNG GIAN BIÊN TẬP', items:[['review','Duyệt nội dung','curator-content-review.html'], ['collections','Bộ sưu tập','curator-collection-management.html'], ['map','Bản đồ nội dung','curator-content-map.html']]},
    creator:{title:'KHÔNG GIAN NGHỆ NHÂN', items:[['profile','Hồ sơ nghệ nhân','creator-profile.html'], ['stories','Câu chuyện','creator-story-management.html'], ['events','Sự kiện','creator-event-management.html']]},
    admin:{title:'KHÔNG GIAN QUẢN TRỊ', items:[['tags','Danh mục & thẻ','admin-tag-management.html'], ['users','Người dùng','admin-user-management.html'], ['stats','Thống kê văn hóa','admin-culture-dashboard.html']]}
  };

  function activeMain(){
    if(/^explorer-(story|place)/.test(page) || page === 'index.html' && false) return 'discover';
    if(/^explorer-(my-trail|ai-trail)/.test(page)) return 'trail';
    return '';
  }

  function header(){
    const act = activeMain(); const u = CT.auth.user(); const role = CT.auth.role() || 'explorer';
    const nav = `<nav class="main-nav" aria-label="Điều hướng chính"><a href="explorer-story-discovery.html" ${act === 'discover' ? 'aria-current="page"' : ''}>Khám phá</a><a href="explorer-story-discovery.html#collections">Bộ sưu tập</a><a href="explorer-my-trail.html" ${act === 'trail' ? 'aria-current="page"' : ''}>Hành trình của tôi</a></nav>`;
    let acct;
    if(u){
      const n = CT.unread(u.id); const first = u.name.split(' ').pop();
      acct = `<div class="account-nav"><a href="notifications.html" ${page === 'notifications.html' ? 'aria-current="page"' : ''}>Thông báo${n ? ` (${n})` : ''}</a><details id="roleMenu"><summary aria-label="Chuyển không gian làm việc">${esc(CT.ROLE_LABEL[role] || 'Người khám phá')}</summary><div class="role-menu"><div class="group">Chuyển không gian (theo quyền được cấp)</div>${CT.auth.roles(u).map(r => `<button type="button" data-role="${r}" ${r === role ? 'aria-current="true"' : ''}>${r === role ? '● ' : ''}${esc(CT.ROLE_FULL[r])}</button>`).join('')}<hr><a href="personal-profile.html">Hồ sơ cá nhân</a><a href="account-settings.html">Cài đặt tài khoản</a><button type="button" data-logout>Đăng xuất</button></div></details><a href="personal-profile.html">${esc(first)}</a></div>`;
    } else acct = `<div class="account-nav"><a href="login.html">Đăng nhập</a><span aria-hidden="true">·</span><a href="register.html">Đăng ký</a></div>`;
    const h = document.createElement('header'); h.className = 'site-header';
    h.innerHTML = `<a class="brand" href="index.html">CultureTrail</a>${nav}${acct}<button class="menu-btn" type="button" aria-label="Mở menu" aria-expanded="false">☰</button>`;
    return h;
  }

  function sidebar(){
    const c = SIDE[space]; const cur = body.dataset.nav;
    const a = document.createElement('aside'); a.className = 'sidebar'; a.setAttribute('aria-label', c.title);
    a.innerHTML = `<div class="ws-title">${c.title}</div><nav>${c.items.map(i => `<a href="${i[2]}" ${i[0] === cur ? 'aria-current="page"' : ''}>${i[1]}</a>`).join('')}</nav><nav class="sep"><a href="explorer-story-discovery.html">← Về trang khám phá</a><a href="#" data-help>Trợ giúp & hướng dẫn</a></nav><div class="switch-card"><strong>Chuyển vai trò</strong><a href="#" data-role-link="explorer">Người khám phá ↗</a> · <span class="small muted">Được cấp quyền</span></div>`;
    return a;
  }

  function footer(){
    const f = document.createElement('footer'); f.className = 'site-footer';
    const sim = CT.sim.get();
    f.innerHTML = `<span>CultureTrail — Mỗi nơi, một câu chuyện.</span><span>Bản thiết kế · Nội dung mẫu · 2026</span><div class="demo"><label for="simSel" class="sr-only">Chế độ demo</label><select id="simSel" aria-label="Chế độ demo"><option value="">Demo: bình thường</option><option value="slow" ${sim === 'slow' ? 'selected' : ''}>Demo: mạng chậm</option><option value="error" ${sim === 'error' ? 'selected' : ''}>Demo: lỗi kết nối</option><option value="ai-error" ${sim === 'ai-error' ? 'selected' : ''}>Demo: lỗi AI</option></select><button type="button" data-reset>Đặt lại dữ liệu mẫu</button></div>`;
    return f;
  }

  function bottomNav(){
    const u = CT.auth.user(); const n = document.createElement('nav'); n.className = 'bottom-nav'; n.setAttribute('aria-label', 'Điều hướng di động');
    const cur = p => (page === p || (p === 'explorer-story-discovery.html' && /^explorer-(story|place)/.test(page)) ? 'aria-current="page"' : '');
    n.innerHTML = u
      ? `<a href="explorer-story-discovery.html" ${cur('explorer-story-discovery.html')}>Khám phá</a><a href="explorer-my-trail.html" ${cur('explorer-my-trail.html')}>Hành trình</a><a href="notifications.html" ${cur('notifications.html')}>Thông báo</a><a href="personal-profile.html" ${cur('personal-profile.html')}>Tài khoản</a>`
      : `<a href="explorer-story-discovery.html" ${cur('explorer-story-discovery.html')}>Khám phá</a><a href="explorer-my-trail.html">Hành trình</a><a href="login.html" ${cur('login.html')}>Đăng nhập</a><a href="register.html" ${cur('register.html')}>Đăng ký</a>`;
    return n;
  }

  function help(){
    CT.ui.dialog({title:'Trợ giúp & hướng dẫn', html:`<p class="muted">CultureTrail là nguyên mẫu Frontend: dữ liệu lưu trong trình duyệt, AI và sơ đồ đều là mô phỏng.</p><ul class="bullets"><li><b>Người khám phá:</b> tìm câu chuyện, lưu bài, tạo hành trình (có thể dùng gợi ý AI).</li><li><b>Nghệ nhân:</b> viết bài, gửi duyệt, quản lý sự kiện.</li><li><b>Biên tập:</b> duyệt bài, gán thẻ (AI chỉ gợi ý), quản lý bộ sưu tập.</li><li><b>Quản trị:</b> thẻ, người dùng, thống kê (dữ liệu giả lập).</li></ul><p class="small muted">Tài khoản mẫu (mật khẩu CultureTrail1): ha.nguyen@ · phuong@ · an@ · nam@example.com. Dùng chân trang để giả lập lỗi mạng hoặc lỗi AI.</p>`});
  }

  function build(){
    const main = document.querySelector('main'); main.id = 'main'; main.classList.add('page');
    const skip = document.createElement('a'); skip.className = 'skip'; skip.href = '#main'; skip.textContent = 'Bỏ qua đến nội dung chính';
    body.prepend(skip);
    const h = header(); skip.after(h);
    if(space){
      const w = document.createElement('div'); w.className = 'workspace'; main.before(w); w.append(sidebar(), main);
    }
    body.append(footer(), bottomNav());

    h.querySelector('.menu-btn').onclick = e => { const o = h.classList.toggle('open'); e.currentTarget.setAttribute('aria-expanded', o); };
    document.addEventListener('click', e => {
      const rb = e.target.closest('[data-role]'); const rl = e.target.closest('[data-role-link]');
      if(rb || rl){ e.preventDefault(); const r = rb ? rb.dataset.role : rl.dataset.roleLink; CT.auth.setRole(r); location.href = CT.ROLE_HOME[r]; return; }
      if(e.target.closest('[data-logout]')){ CT.auth.logout(); location.href = 'index.html'; return; }
      if(e.target.closest('[data-help]')){ e.preventDefault(); help(); return; }
      if(e.target.closest('[data-reset]')){ CT.ui.confirm({title:'Đặt lại dữ liệu mẫu?', text:'Mọi thay đổi bạn đã thực hiện trong trình duyệt này sẽ bị xóa và bạn sẽ được đăng xuất.', confirm:'Đặt lại', danger:true}).then(r => { if(r){ CT.db.reset(); location.href = 'index.html'; } }); return; }
      const d = document.getElementById('roleMenu'); if(d && d.open && !d.contains(e.target)) d.open = false;
    });
    document.getElementById('simSel').onchange = e => { CT.sim.set(e.target.value); CT.ui.toast(e.target.value ? 'Đã bật chế độ giả lập lỗi/chậm. Tải lại trang để thấy hiệu ứng.' : 'Đã tắt giả lập.'); setTimeout(() => location.reload(), 600); };
    CT.ui.bindSave(document);
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
