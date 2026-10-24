CT.ready(() => {
  const $ = CT.$, A = CT.seed.analytics[0]; let cur = null;
  $('#reg').innerHTML += CT.REGIONS.map(r => `<option>${r}</option>`).join('');
  const calc = () => {
    const per = $('#per').value, reg = $('#reg').value, d = A[per];
    const tot = d.region.reduce((a, x) => a + x[1], 0), share = reg ? (d.region.find(x => x[0] === reg) || [0, 0])[1] / tot : 1;
    const sc = n => Math.round(n * share);
    const top = d.top.map(t => { const s = CT.story(t[0]), pl = s && CT.place(s.placeId); return {title:s ? CT.pub(s).title : '?', region:pl ? pl.region : '', place:pl ? pl.city : '', reads:t[1], saves:t[2]}; }).filter(t => !reg || t.region === reg);
    return {per, reg, d, share, reads:sc(d.reads), saves:sc(d.saves), trails:sc(d.trails), pub:sc(d.published), weekly:d.weekly.map(sc), region:d.region.filter(x => !reg || x[0] === reg), topic:d.topic.map(x => [x[0], sc(x[1])]), top};
  };
  const pct = (v, t) => Math.round(v / t * 100);
  const chart = w => {
    const W = 760, H = 240, mx = Math.max(...w, 1) * 1.15, pts = w.map((v, i) => [40 + i * (W - 80) / Math.max(w.length - 1, 1), H - 40 - (v / mx) * (H - 70)]);
    let path = `M${pts[0][0]},${pts[0][1]}`; for(let i = 1; i < pts.length; i++){ const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], cx = (x0 + x1) / 2; path += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`; }
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Biểu đồ đường lượt đọc theo tuần: ${w.map((v, i) => 'tuần ' + (i + 1) + ' ' + CT.fmt.num(v)).join(', ')}"><g stroke="#E2DDCF">${[0, 1, 2, 3].map(i => `<line x1="40" x2="${W - 40}" y1="${30 + i * (H - 70) / 3}" y2="${30 + i * (H - 70) / 3}"/>`).join('')}</g><path d="${path}" fill="none" stroke="#183F34" stroke-width="3"/>${pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#183F34"/>`).join('')}${pts.map((p, i) => `<text x="${p[0]}" y="${H - 10}" text-anchor="middle">Tuần ${i + 1} · ${CT.fmt.num(w[i])}</text>`).join('')}</svg>`;
  };
  const draw = () => {
    const r = cur = calc(), d = r.d, tr = r.region.reduce((a, x) => a + x[1], 0) || 1, tt = r.topic.reduce((a, x) => a + x[1], 0) || 1;
    const kp = [[r.reads, 'Lượt đọc câu chuyện', d.deltas[0]], [r.saves, 'Lượt lưu câu chuyện', d.deltas[1]], [r.trails, 'Hành trình được lưu', d.deltas[2]], [r.pub, 'Nội dung đã xuất bản', null]];
    $('#out').innerHTML = `<div class="stats mt">${kp.map(k => `<div class="stat"><b>${CT.fmt.num(k[0])}</b><span><b class="pg-2">${k[1]}</b></span><small>${k[2] != null ? '+' + String(k[2]).replace('.', ',') + '% so với tháng trước' : Math.round(d.newPub * r.share) + ' bài mới trong tháng'}</small></div>`).join('')}</div>
    <div class="grid g2"><section class="card chart"><h2 class="panel-title">Lượt đọc theo tuần</h2><p class="small muted">Số liệu mẫu · Tháng ${r.per.slice(5)}/${r.per.slice(0, 4)}${r.reg ? ' · ' + r.reg : ''}</p>${chart(r.weekly)}</section>
    <section class="card"><h2 class="panel-title">Mức độ tương tác</h2><p class="small muted">So sánh tuần · dữ liệu mẫu</p>${d.engage.map(x => `<div class="bar"><span>${x[0]}</span><b>${x[1]}%</b><div class="track" role="img" aria-label="${x[0]} ${x[1]}%"><i style="width:${x[1]}%"></i></div></div>`).join('')}<p class="tiny muted mb0">Các tỷ lệ là ví dụ độc lập, không phải phễu chuyển đổi thực tế.</p></section></div>
    <div class="grid g2 mt"><section class="card"><h2 class="panel-title">Phân bố vùng miền</h2>${CT.ui.table([{h:'Vùng', r:x => x[0]}, {h:'Bài viết', r:x => x[1]}, {h:'Tỷ lệ', r:x => pct(x[1], tr) + '%'}], r.region)}</section>
    <section class="card"><h2 class="panel-title">Phân bố chủ đề</h2>${CT.ui.table([{h:'Chủ đề', r:x => x[0]}, {h:'Bài viết', r:x => x[1]}, {h:'Tỷ lệ', r:x => pct(x[1], tt) + '%'}], r.topic)}</section></div>
    <section class="card mt"><h2 class="panel-title">Câu chuyện được đọc nhiều</h2>${r.top.length ? CT.ui.table([{h:'Câu chuyện', r:x => CT.esc(x.title)}, {h:'Địa phương', r:x => CT.esc(x.place)}, {h:'Lượt đọc', r:x => CT.fmt.num(x.reads)}, {h:'Lượt lưu', r:x => CT.fmt.num(x.saves)}], r.top) : CT.ui.empty('Không có dữ liệu cho bộ lọc này', 'Đổi khoảng thời gian hoặc vùng miền.', '')}<p class="small muted mb0 mt">Báo cáo mẫu · CSV / PDF · Xuất dữ liệu theo bộ lọc · Không bao gồm thông tin cá nhân</p></section>`;
  };
  const load = () => { $('#out').innerHTML = CT.ui.skeleton(4, 'g4'); CT.api.run(() => 1).then(draw).catch(() => CT.ui.showError($('#out'), load)); };
  $('#ff').onsubmit = e => { e.preventDefault(); load(); };
  $('#exp').onclick = async () => {
    if(!cur) return;
    const r = await CT.ui.dialog({title:'Xuất báo cáo mẫu', html:'<p class="muted">Báo cáo theo bộ lọc hiện tại. Dữ liệu giả lập và không bao gồm thông tin cá nhân.</p>', actions:[{label:'Quay lại', value:null, cls:'btn-ghost'}, {label:'Xuất PDF (in)', value:'pdf', cls:'btn-outline'}, {label:'Xuất CSV', value:'csv'}]});
    if(r === 'csv'){
      const rows = [['Báo cáo mẫu CultureTrail (dữ liệu giả lập)'], ['Khoảng thời gian', cur.per, 'Vùng miền', cur.reg || 'Tất cả'], [], ['Chỉ số', 'Giá trị'], ['Lượt đọc', cur.reads], ['Lượt lưu', cur.saves], ['Hành trình được lưu', cur.trails], ['Nội dung đã xuất bản', cur.pub], [], ['Tuần', 'Lượt đọc']].concat(cur.weekly.map((v, i) => ['Tuần ' + (i + 1), v])).concat([[], ['Câu chuyện', 'Lượt đọc', 'Lượt lưu']], cur.top.map(t => [t.title, t.reads, t.saves]));
      CT.ui.download('bao-cao-mau-culturetrail.csv', '\ufeff' + rows.map(x => x.map(c => '"' + String(c).replace(/"/g, '""') + '"').join(',')).join('\n'), 'text/csv;charset=utf-8'); CT.ui.toast('Đã xuất CSV mẫu.');
    }
    if(r === 'pdf'){ CT.ui.toast('Mở hộp thoại in: chọn “Lưu dưới dạng PDF”.'); setTimeout(() => window.print(), 500); }
  };
  load();
});
