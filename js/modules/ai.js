/* CultureTrail — AI giả lập (rule-based). Không gọi dịch vụ ngoài, không gửi dữ liệu cá nhân.
   Mọi kết quả trả về {status:'ok'|'insufficient'|'uncertain', ...}; lỗi → ném Error. Có thể huỷ (cancel). */
(function(){
  const CT = window.CT = window.CT || {};
  const AI = CT.ai = {};

  /* chạy với độ trễ, có thể huỷ */
  AI.job = (fn, ms) => {
    let timer, rej;
    const promise = new Promise((res, reject) => {
      rej = reject;
      timer = setTimeout(() => {
        try{
          if(CT.sim.get() === 'ai-error') throw new Error('AI không phản hồi');
          res(fn());
        }catch(e){ reject(e); }
      }, ms || 1300);
    });
    return {promise, cancel(){ clearTimeout(timer); rej({cancelled:true}); }};
  };

  /* ---------- 1. Gợi ý thẻ (Biên tập viên) ---------- */
  const RULES = [
    {re:/gốm|men|bàn xoay|lò nung|xưởng gốm/, tag:'t-gom', why:'bài nhắc bàn xoay, xưởng và men nhiều lần.'},
    {re:/tre|đan|nan |rổ|nón/, tag:'t-danlat', why:'bài mô tả công việc đan, chẻ nan.'},
    {re:/đèn lồng|khung đèn/, tag:'t-denlong', why:'bài kể về làm đèn lồng.'},
    {re:/lụa|dệt|thoi/, tag:'t-det', why:'bài kể về khung dệt và lụa.'},
    {re:/nhà vườn|hiên/, tag:'t-nhavuon', why:'bài nhắc kiến trúc nhà vườn và hiên nhà.'},
    {re:/ngói|kiến trúc|đại nội/, tag:'t-kientruc', why:'bài nhắc ngói, kiến trúc cũ.'},
    {re:/xôi|bánh|bếp/, tag:'t-banh', why:'bài kể về món ăn truyền thống.'},
    {re:/mì |chợ|quán/, tag:'t-bunbo', why:'bài kể về món ăn đường phố.'},
    {re:/rằm|trung thu/, tag:'t-trungthu', why:'bài nhắc đêm rằm.'}
  ];
  AI.recommendTags = story => AI.job(() => {
    const text = CT.norm0((story.title || '') + ' ' + (story.lead || '') + ' ' + CT.storyText(story));
    if(CT.words(text) < 40) return {status:'insufficient', message:'Nguồn quá ngắn hoặc thiếu ngữ cảnh. Bổ sung nguồn trước khi thử lại.'};
    const tags = CT.db.all('tags'); const out = []; const seen = {};
    const add = (id, why, low) => { const t = tags.find(x => x.id === id && x.status !== 'archived'); if(t && !seen[id]){ seen[id] = 1; out.push({tagId:id, name:t.name, reason:why, low:!!low}); } };
    RULES.forEach(r => { if(r.re.test(text)) add(r.tag, r.why); });
    const pl = story.placeId && CT.place(story.placeId);
    if(pl){
      const loc = {'p-bat-trang':'t-hn-bt','p-hoi-an':'t-hoian','p-hue':'t-hue'}[pl.parentId || pl.id];
      if(loc) add(loc, 'lấy từ địa danh mà tác giả liên kết, không suy ra từ lịch sử.');
    }
    if(/trải nghiệm|buổi gặp|khách/.test(text)) add('t-traingh', 'có mô tả buổi gặp gỡ khách; cần bạn xác nhận mức phù hợp.', true);
    if(!out.length) return {status:'insufficient', message:'Không đủ dữ liệu để đưa ra đề xuất thẻ từ danh mục hiện có.'};
    return {status: out.some(x => x.low) ? 'uncertain' : 'ok', suggestions: out, tagsUsed: 'Dùng danh mục hiện có; không tự tạo thẻ mới.'};
  }, 1300);
  CT.norm0 = s => String(s || '').toLowerCase();

  /* ---------- 2. Tạo hành trình (Người khám phá) ---------- */
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const toHM = m => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
  AI.generateTrail = inp => AI.job(() => {
    const places = CT.db.all('places');
    let cand = places.filter(p => p.parentId && p.city === inp.city && p.topic === inp.topic);
    if(inp.freeOnly){ const par = id => places.find(x => x.id === id); cand = cand.filter(p => /Miễn phí/.test((par(p.parentId) || {}).fee || '')); }
    if(!cand.length) return {status:'insufficient', message:'Kho nội dung chưa có điểm phù hợp. Đổi chủ đề / thành phố hoặc tự thêm địa danh.'};
    // chọn địa danh cha có nhiều điểm nhất
    const cnt = {}; cand.forEach(p => cnt[p.parentId] = (cnt[p.parentId] || 0) + 1);
    const pid = Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a])[0];
    cand = cand.filter(p => p.parentId === pid);
    const budget = inp.hours * 60; const start = {morning:9 * 60, afternoon:14 * 60, evening:18 * 60}[inp.period] || 9 * 60;
    let t = start; const stops = [];
    // giữ thứ tự gốc (cổng → xưởng → trưng bày) nếu không ưu tiên xưởng
    for(const p of cand){
      const mins = inp.slow || (inp.workshop && p.mins >= 60) ? p.mins : Math.min(p.mins, 60);
      if(stops.length && (t + mins - start) > budget) break;
      stops.push({id:CT.uid('st'), placeId:p.id, start:toHM(t), end:toHM(t + mins)});
      t += mins + 15;
    }
    const par = places.find(p => p.id === pid);
    const short = par.name.replace(/^(Làng gốm|Làng nghề|Phố cổ|Nhà vườn)\s*/, '');
    const per = {morning:'sáng', afternoon:'chiều', evening:'tối'}[inp.period] || 'ngày';
    const longest = stops.map(s => places.find(p => p.id === s.placeId)).sort((a, b) => b.mins - a.mins)[0];
    return {
      status: stops.length < 2 ? 'uncertain' : 'ok',
      name: `Một ${per} ở ${short}`, stops, parent: par,
      explain: `Cả ${stops.length} điểm đều liên quan đến ${CT.TOPICS[inp.topic].toLowerCase()}, phù hợp chủ đề bạn chọn. ${longest.name} dành nhiều thời gian hơn ${inp.workshop ? 'vì bạn muốn trải nghiệm' : 'vì là điểm có nhiều hoạt động'}.`,
      breakNote: stops.length > 1 ? `Các khoảng 15 phút được chừa giữa các điểm để nghỉ. Đây là thời gian giả định, không phải tính toán chỉ đường.` : 'Chỉ có một điểm phù hợp trong kho nội dung hiện tại.'
    };
  }, 1500);

  /* ---------- 3. Tóm tắt (Người đọc / Nhà sáng tạo) ---------- */
  const firstSentence = p => { const m = String(p).match(/^[^.!?]+[.!?]/); let s = (m ? m[0] : p).trim(); if(s.length > 120) s = s.slice(0, 117).replace(/\s+\S*$/, '') + '…'; return s; };
  AI.summarize = story => AI.job(() => {
    const paras = (story.sections || []).flatMap(s => s.p);
    if(CT.words(paras.join(' ')) < 80) return {status:'insufficient', message:'Nguồn quá ngắn hoặc thiếu ngữ cảnh. Bổ sung nguồn trước khi thử lại.'};
    const pick = [];
    const idx = paras.length >= 3 ? [0, Math.floor(paras.length / 2), paras.length - 1] : paras.map((_, i) => i);
    idx.forEach(i => { const s = firstSentence(paras[i]); if(s && !pick.includes(s)) pick.push(s); });
    const author = (CT.user(story.creatorId) || {}).name || '';
    return {
      status: pick.length < 3 ? 'uncertain' : 'ok', bullets: pick,
      note: pick.length < 3 ? 'Bài còn ngắn nên chỉ rút được ' + pick.length + ' ý. Đối chiếu bài gốc; không coi tóm tắt là nguồn độc lập.' : '',
      editable: story.lead || pick[0],
      source: `Nguồn: “${story.title}” · ${author} · Bản mẫu ${CT.fmt.date(story.updatedAt || story.submittedAt || new Date().toISOString())}`,
      why: 'Rút từ ' + Math.min(3, paras.length) + ' đoạn trong bài của ' + author + '. AI không xác minh lịch sử, không thêm niên đại hay thông tin ngoài nguồn.'
    };
  }, 1200);

  /* ---------- Bảng "Đọc nhanh cùng AI" dùng chung (người đọc & nhà sáng tạo) ----------
     opt: {saved, saveLabel, canSave(), onSave(text), onViewSource()} */
  AI.summaryPanel = (el, story, opt) => {
    opt = opt || {}; const esc = CT.esc; let job = null, saved = opt.saved || '';
    const cur = () => typeof story === 'function' ? story() : story;
    const head = `<h2 class="panel-title">Đọc nhanh cùng AI</h2><p class="small muted">3 ý chính · Bản tóm tắt mẫu · Giữ nguồn</p>`;
    const set = h => { el.innerHTML = head + h; };
    const idle = () => {
      set(`${saved ? `<div class="field u-7"><span class="lbl">Bản tóm tắt đã lưu của bạn</span><p class="mb0">${esc(saved)}</p></div>` : ''}<p class="small muted">AI chỉ rút ý từ bài, không xác minh lịch sử. Bạn quyết định dùng hay không.</p><button class="btn btn-sm" type="button" data-go>Tóm tắt bài</button>`);
      el.querySelector('[data-go]').onclick = run;
    };
    const run = () => {
      set(`<div role="status" aria-busy="true"><p><b>Đang xử lý…</b> Giữ đầu vào. Đang phân tích và đối chiếu dữ liệu mẫu. Không gửi yêu cầu trùng.</p><div class="skeleton u-8"></div><div class="skeleton u-9"></div><div class="skeleton u-10"></div><button class="btn btn-ghost btn-sm" type="button" data-stop>Dừng / Bỏ qua AI</button></div>`);
      job = AI.summarize(cur());
      el.querySelector('[data-stop]').onclick = () => { job.cancel(); idle(); };
      job.promise.then(show).catch(err => { if(err && err.cancelled) return; fail(); });
    };
    const fail = () => {
      set(`<div class="notice notice--err" role="alert"><strong>Không thể xử lý yêu cầu lúc này</strong><p>Giữ nguyên dữ liệu đã nhập. Không tự lưu kết quả dở dang. Thử lại hoặc bỏ qua để tiếp tục thủ công.</p></div><div class="actions"><button class="btn btn-sm" type="button" data-retry>Thử lại</button><button class="btn btn-ghost btn-sm" type="button" data-skip>Bỏ qua</button></div>`);
      el.querySelector('[data-retry]').onclick = run; el.querySelector('[data-skip]').onclick = idle;
    };
    const show = r => {
      if(r.status === 'insufficient'){
        set(`<div class="notice notice--warn" role="status"><strong>Không đủ dữ liệu để đưa ra đề xuất</strong><p>${esc(r.message)}</p></div><div class="actions"><button class="btn btn-sm" type="button" data-manual>Làm thủ công</button><button class="btn btn-ghost btn-sm" type="button" data-skip>Đóng</button></div>`);
        el.querySelector('[data-skip]').onclick = idle; el.querySelector('[data-manual]').onclick = () => show({status:'manual', bullets:[], editable:saved || '', why:'', source:`Nguồn: “${cur().title}”`});
        return;
      }
      set(`${r.status === 'uncertain' ? `<div class="notice notice--warn u-7" role="status"><strong>AI chưa chắc chắn về kết quả này</strong><p>${esc(r.note)}</p></div>` : ''}${r.bullets.length ? `<ul class="bullets">${r.bullets.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}${r.why ? `<div class="notice u-7"><strong>Vì sao có bản tóm tắt này?</strong><p>${esc(r.why)}</p></div>` : ''}<div class="field"><label for="sumEdit">Chỉnh sửa bản tóm tắt</label><textarea id="sumEdit" rows="3">${esc(r.editable)}</textarea><span class="msg"></span></div><p class="tiny muted">${esc(r.source)}</p><div class="actions"><button class="btn btn-sm" type="button" data-save>${esc(opt.saveLabel || 'Lưu bản chỉnh sửa')}</button><button class="btn btn-ghost btn-sm" type="button" data-src>Xem bài gốc</button></div><div class="actions u-11"><button class="link-btn" type="button" data-again>Tạo lại</button><button class="link-btn" type="button" data-skip>Không sử dụng</button></div>`);
      el.querySelector('[data-skip]').onclick = idle;
      el.querySelector('[data-again]').onclick = async () => { const ta = el.querySelector('#sumEdit'); if(ta.value.trim() && ta.value.trim() !== r.editable){ const c = await CT.ui.confirm({title:'Tạo lại bản tóm tắt?', text:'Bản chỉnh sửa hiện tại chưa lưu sẽ bị thay thế. Bản đã lưu trước đó không bị ghi đè.', confirm:'Tạo lại'}); if(!c) return; } run(); };
      el.querySelector('[data-src]').onclick = () => opt.onViewSource && opt.onViewSource();
      el.querySelector('[data-save]').onclick = () => {
        const ta = el.querySelector('#sumEdit');
        if(!ta.value.trim()){ CT.ui.setErr(ta, 'Nhập nội dung tóm tắt trước khi lưu.'); return; }
        if(opt.canSave && !opt.canSave()) return;
        saved = ta.value.trim(); opt.onSave && opt.onSave(saved);
        set(`<div class="notice notice--ok" role="status"><strong>Đã lưu bản tóm tắt</strong><p>Bản chỉnh sửa vẫn ghi nguồn và liên kết bài gốc. Bạn có thể đối chiếu bản gốc bất cứ lúc nào.</p></div><p class="mt"><b>Bản của bạn:</b> ${esc(saved)}</p><div class="actions"><button class="btn btn-ghost btn-sm" type="button" data-src>Đọc bài gốc →</button><button class="link-btn" type="button" data-skip>Đóng</button></div>`);
        el.querySelector('[data-src]').onclick = () => opt.onViewSource && opt.onViewSource(); el.querySelector('[data-skip]').onclick = idle;
      };
    };
    idle();
  };
})();
