import json, re
from playwright.sync_api import sync_playwright
BASE='http://localhost:8765/'
res=[]
def check(name,cond,extra=''):
    res.append((cond,name)); print(('PASS ' if cond else 'FAIL ')+name+(' | '+str(extra) if (extra and not cond) else ''))
with sync_playwright() as p:
    b=p.chromium.launch()
    def ctx(user=None,role='explorer'):
        c=b.new_context(viewport={'width':1440,'height':900})
        if user: c.add_init_script(f"if(!localStorage.getItem('ct_s')) localStorage.setItem('ct_s', JSON.stringify({{userId:'{user}',role:'{role}'}}))")
        return c
    def pg(c,url,wait=1200):
        page=c.new_page(); errs=[]
        page.on('pageerror',lambda e:errs.append(str(e)[:160])); page._errs=errs
        page.goto(BASE+url); page.wait_for_timeout(wait); return page
    def db(page,name): return page.evaluate(f"JSON.parse(localStorage.getItem('ct2_{name}'))")
    def dlg(page,label):
        page.locator('dialog button',has_text=label).first.click(); page.wait_for_timeout(500)

    # 1. Phân quyền
    c=ctx('u1','creator'); page=pg(c,'admin-user-management.html'); check('creator vào trang Quản trị → 403','403.html' in page.url,page.url)
    c=ctx(); page=pg(c,'explorer-my-trail.html'); check('chưa đăng nhập vào Hành trình → login?next','login.html?next=explorer-my-trail.html' in page.url,page.url)
    c=ctx(); page=pg(c,'login.html'); page.evaluate("localStorage.setItem('ct_s', JSON.stringify({userId:'u4',role:'explorer'}))"); page.goto(BASE+'explorer-my-trail.html'); page.wait_for_timeout(1500)
    check('phiên của tài khoản bị vô hiệu hóa bị đăng xuất','login.html' in page.url and page.evaluate("localStorage.getItem('ct_s')") is None,page.url)
    # 2. Đăng nhập
    c=ctx(); page=pg(c,'login.html'); page.fill('#email','ha.nguyen@example.com'); page.fill('#password','sai'); page.click('#go'); page.wait_for_timeout(900)
    check('đăng nhập sai mật khẩu → thông báo lỗi',page.locator('.notice--err').count()==1)
    page.fill('#password','CultureTrail1'); page.click('#go'); page.wait_for_timeout(1200); check('đăng nhập đúng → Khám phá','explorer-story-discovery' in page.url,page.url)
    page.click('#roleMenu summary'); page.click('[data-role="creator"]'); page.wait_for_timeout(900); check('chuyển vai trò → không gian nghệ nhân','creator-profile' in page.url,page.url)
    page=pg(c,'login.html'); check('đã đăng nhập mở login → chuyển hướng','login.html' not in page.url)
    c=ctx(); page=pg(c,'login.html'); page.fill('#email','linh@example.com'); page.fill('#password','CultureTrail1'); page.click('#go'); page.wait_for_timeout(900)
    check('tài khoản bị vô hiệu hóa không đăng nhập được',page.locator('.notice--err').count()==1 and 'login.html' in page.url)
    # 3. Đăng ký
    c=ctx(); page=pg(c,'register.html'); page.click('#go'); page.wait_for_timeout(300); check('đăng ký trống → báo lỗi nhiều trường',page.locator('.field.invalid').count()>=4)
    page.fill('#name','Test User'); page.fill('#email','ha.nguyen@example.com'); page.fill('#password','abc12345'); page.fill('#confirm','abc12345'); page.check('input[name=terms]'); page.click('#go'); page.wait_for_timeout(900)
    check('đăng ký email trùng bị chặn',page.locator('.field.invalid').count()==1)
    page.fill('#email','moi@example.com'); page.click('#go'); page.wait_for_timeout(1500); check('đăng ký thành công → vào Khám phá','explorer-story-discovery' in page.url,page.url)
    # 4. Khám phá
    c=ctx('u1','explorer'); page=pg(c,'explorer-story-discovery.html'); page.fill('#q','đèn lồng'); page.click('#sf button'); page.wait_for_timeout(400)
    check('tìm "đèn lồng" ra kết quả liên quan',page.locator('.story-card').count()>=1 and 'Ánh đèn' in page.locator('.story-card').first.inner_text())
    page.fill('#q','zzzz'); page.click('#sf button'); page.wait_for_timeout(300); check('không có kết quả → trạng thái trống',page.locator('.state-box').count()==1)
    page.click('#clr3'); page.wait_for_timeout(300); page.check('#topics input[value=food]'); page.click('#ff button[type=submit]'); page.wait_for_timeout(300)
    check('lọc chủ đề Ẩm thực',all('Ẩm thực' in t for t in page.locator('.story-card .kicker').all_inner_texts()) and page.locator('.story-card').count()==2)
    page=pg(c,'explorer-story-discovery.html'); n0=len(db(page,'users')[0]['saved']); page.locator('[data-save="s3"]').first.click(); page.wait_for_timeout(300)
    check('lưu câu chuyện',len(db(page,'users')[0]['saved'])==n0+1)
    # 5. Luồng gửi duyệt -> duyệt
    c=ctx('u1','creator'); page=pg(c,'creator-story-editor.html?id=s7')
    check('s7 có >300 từ trong seed',int(page.locator('#wc').inner_text())>=300,page.locator('#wc').inner_text())
    check('nút Gửi duyệt khóa khi thiếu nguồn ảnh',page.locator('#send').is_disabled() and 'thiếu nguồn ảnh' in page.locator('#why').inner_text())
    page.fill('#imageSource','Ảnh do tác giả chụp, có quyền sử dụng'); page.check('input[name=own]'); page.wait_for_timeout(200); check('đủ điều kiện → mở khóa Gửi duyệt',page.locator('#send').is_enabled())
    page.click('#send'); page.wait_for_timeout(1500); s7=[s for s in db(page,'stories') if s['id']=='s7'][0]
    check('gửi duyệt → trạng thái pending + thông báo cho biên tập',s7['status']=='pending' and any(n['userId']=='u2' and 's7' not in n['id'] and 'Màu men' in n['body'] for n in db(page,'notifications')))
    page2=c.new_page(); page2.goto(BASE+'creator-story-editor.html?id=s7'); page2.wait_for_timeout(800); check('bài đang chờ duyệt không cho sửa','Bài đang chờ duyệt' in page2.content())
    # curator
    cs=db(page,'stories'); 
    c2=b.new_context(viewport={'width':1440,'height':900}); c2.add_init_script("localStorage.setItem('ct_s', JSON.stringify({userId:'u2',role:'curator'}))")
    # nhớ dữ liệu của c sang c2
    snap={k:page.evaluate(f"localStorage.getItem('ct2_{k}')") for k in ['stories','notifications','users','tags','places','creators','events','collections','trails','logs','taglogs']}
    c2.add_init_script("const S=%s; for(const k in S){ if(S[k]&&!localStorage.getItem('ct2_'+k)) localStorage.setItem('ct2_'+k,S[k]); }"%json.dumps(snap))
    pr=pg(c2,'curator-content-review.html'); check('hàng đợi hiển thị s7 chờ duyệt','Màu men từ sân nhà' in pr.content())
    pr=pg(c2,'curator-review-detail.html?id=s7'); check('chưa nhận bài → quyết định bị khóa',pr.locator('#ok').is_disabled())
    pr.click('#claim'); check('nhận bài khóa thao tác lặp',pr.locator('#claim').is_disabled())
    pr.wait_for_timeout(1000); check('nhận bài → mở khóa',pr.locator('#ok').is_enabled())
    pr.click('#rv'); pr.wait_for_timeout(300); check('yêu cầu sửa không lý do → báo lỗi',pr.locator('#rs').get_attribute('aria-invalid')=='true')
    pr.fill('#rs','Bổ sung nguồn ảnh đã xác minh.')
    pr.click('#rv'); check('yêu cầu sửa khóa thao tác khi chờ xác nhận',pr.locator('#rv').is_disabled() and pr.locator('dialog').count()==1)
    dlg(pr,'Quay lại'); check('hủy xác nhận khôi phục thao tác',pr.locator('#rv').is_enabled())
    pr.click('#ok'); pr.wait_for_timeout(300); check('duyệt khi chưa tick kiểm tra bị chặn',db(pr,'stories') and [s for s in db(pr,'stories') if s['id']=='s7'][0]['status']=='processing')
    pr.check('input[name=c1]'); pr.check('input[name=c2]'); pr.check('input[name=c3]')
    # AI gợi ý thẻ
    pr.click('#go'); pr.wait_for_timeout(2200); check('AI gợi ý thẻ trả kết quả có lý do',pr.locator('[data-pk]').count()>=2 and 'Nghề gốm' in pr.locator('#ai').inner_text())
    pr.click('#ap'); pr.wait_for_timeout(500); tg=[s for s in db(pr,'stories') if s['id']=='s7'][0]['tags']; check('chấp nhận thẻ → gán vào bài (không tự duyệt)','t-gom' in tg and [s for s in db(pr,'stories') if s['id']=='s7'][0]['status']=='processing',tg)
    pr.click('#ok'); check('duyệt khóa thao tác lặp khi chờ xác nhận',pr.locator('#ok').is_disabled() and pr.locator('dialog').count()==1)
    pr.wait_for_timeout(300); dlg(pr,'Xác nhận xuất bản'); pr.wait_for_timeout(1500)
    s7=[s for s in db(pr,'stories') if s['id']=='s7'][0]; check('duyệt & xuất bản → approved + live',s7['status']=='approved' and s7['live'],s7['status'])
    check('thông báo gửi tới tác giả',any(n['userId']=='u1' and 'đã được duyệt' in n['title'] and 'Màu men' in n['title'] for n in db(pr,'notifications')))
    # 6. Bản công khai không bị ghi đè khi sửa bài đã duyệt
    c3=ctx('u1','creator'); pe=pg(c3,'creator-story-editor.html?id=s1'); old=pe.locator('#title').input_value(); pe.fill('#title','Tiêu đề mới chưa duyệt'); pe.click('#draft'); pe.wait_for_timeout(1500)
    s1=[s for s in db(pe,'stories') if s['id']=='s1'][0]; check('sửa bài đã duyệt → tạo bản nháp v2, giữ snapshot công khai',s1['status']=='draft' and s1['live'] and s1['liveSnapshot']['title']==old and s1['version']==2,s1['status'])
    pd=pg(c3,'explorer-story-detail.html?id=s1'); check('người đọc vẫn thấy tiêu đề cũ',old in pd.locator('h1').first.inner_text())
    # 7. Sự kiện
    c4=ctx('u1','creator'); pe=pg(c4,'creator-event-editor.html?id=e1'); pe.fill('#endTime','08:00'); pe.click('#pub'); pe.wait_for_timeout(500)
    check('giờ kết thúc trước giờ bắt đầu → báo lỗi',pe.locator('#endTime').get_attribute('aria-invalid')=='true' and 'sau 09:00' in pe.locator('#endTime').evaluate("e=>e.closest('.field').innerText"))
    pe.fill('#endTime','11:00'); pe.fill('#capacity','5'); pe.click('#save'); pe.wait_for_timeout(500); check('sức chứa < đã đăng ký bị chặn',pe.locator('#capacity').get_attribute('aria-invalid')=='true')
    pm=pg(c4,'creator-event-management.html'); pm.locator('[data-a=cancel]').first.click(); pm.wait_for_timeout(400); dlg(pm,'Hủy & thông báo'); pm.wait_for_timeout(300)
    check('hủy sự kiện không lý do bị chặn',[e for e in db(pm,'events') if e['id']=='e1'][0]['status']=='upcoming')
    pm.fill('#dlg-reason','Mưa bão'); dlg(pm,'Hủy & thông báo'); pm.wait_for_timeout(900); e1=[e for e in db(pm,'events') if e['id']=='e1'][0]; check('hủy có lý do → cancelled',e1['status']=='cancelled' and e1['cancelReason']=='Mưa bão')
    # 8. Hành trình
    c5=ctx('u1','explorer'); pt=pg(c5,'explorer-my-trail.html'); check('hành trình đầu tiên mở sẵn',pt.locator('.stop').count()==3)
    pt.locator('.stop [data-act=down]').first.click(); pt.wait_for_timeout(300); check('đổi thứ tự → báo thay đổi chưa lưu','chưa lưu' in pt.locator('#dirt').inner_text())
    pt.click('#save'); pt.wait_for_timeout(1000); t1=[t for t in db(pt,'trails') if t['id']=='t1'][0]; check('lưu hành trình giữ thứ tự mới',t1['stops'][0]['placeId']=='p-xuong-thu-ha',t1['stops'][0]['placeId'])
    pt.click('#del'); pt.wait_for_timeout(300); dlg(pt,'Quay lại'); check('xóa cần xác nhận (quay lại không xóa)',len([t for t in db(pt,'trails') if t['id']=='t1'])==1)
    # 9. AI hành trình
    c6=ctx('u1','explorer'); pa=pg(c6,'explorer-ai-trail-generator.html'); pa.click('#gen'); pa.wait_for_timeout(300); check('thiếu thành phố/chủ đề → lỗi, chưa gọi AI',pa.locator('.field.invalid').count()==2)
    pa.select_option('#city','Hà Nội'); pa.select_option('#topic','craft'); pa.click('#gen'); pa.wait_for_timeout(2300); check('AI tạo 3 điểm dừng + cảnh báo chưa xác minh',pa.locator('.stop').count()==3 and 'chưa xác minh' in pa.content())
    check('AI giữ thứ tự Cổng làng → Xưởng → Trưng bày',pa.locator('.stop h3').all_inner_texts()[0].endswith('Cổng làng Bát Tràng') and '09:45' in pa.locator('.stop .time').all_inner_texts()[1],pa.locator('.stop h3').all_inner_texts())
    pa.click('#acc'); pa.wait_for_timeout(1500); check('chấp nhận & lưu → hành trình mới trong DB',len(db(pa,'trails'))==5 and 'explorer-my-trail' in pa.url,pa.url)
    pa=pg(c6,'explorer-ai-trail-generator.html'); pa.select_option('#city','Hà Nội'); pa.select_option('#topic','food'); pa.click('#gen'); pa.wait_for_timeout(2300); check('Hà Nội + Ẩm thực → không đủ dữ liệu','Không đủ dữ liệu' in pa.content())
    pa.evaluate("localStorage.setItem('ct_sim','ai-error')"); pa.select_option('#topic','craft'); pa.click('#gen'); pa.wait_for_timeout(2300); check('lỗi AI → thông báo, giữ dữ liệu, có Thử lại','Không thể xử lý yêu cầu' in pa.content() and pa.locator('#retry').count()==1 and pa.locator('#city').input_value()=='Hà Nội')
    # 10. Lỗi mạng
    c7=ctx('u1','explorer'); c7.add_init_script("localStorage.setItem('ct_sim','error')"); pl=pg(c7,'explorer-story-discovery.html',1800); check('lỗi kết nối → trạng thái lỗi + Thử lại',pl.locator('[data-retry]').count()==1)
    # 11. Quản trị
    c8=ctx('u5','admin'); pt=pg(c8,'admin-tag-management.html'); pt.click('[data-id=t-gomtt][data-a=merge]') if False else None
    tab=pt.locator('#tabs button',has_text='Chờ rà soát'); tab.click(); pt.wait_for_timeout(300); pt.locator('[data-a=merge][data-id=t-gomtt]').click(); pt.wait_for_timeout(300); pt.select_option('#tg','t-gom'); dlg(pt,'Xác nhận gộp'); pt.wait_for_timeout(900)
    tg=[t for t in db(pt,'tags') if t['id']=='t-gomtt'][0]; check('gộp thẻ → thẻ nguồn lưu trữ',tg['status']=='archived')
    pt.fill('#name','nghề gốm'); pt.select_option('#parentId','cat-craft'); pt.locator('#f button[type=submit]').click(); pt.wait_for_timeout(400); check('tạo thẻ trùng tên bị chặn',pt.locator('#name').get_attribute('aria-invalid')=='true')
    pu=pg(c8,'admin-user-management.html'); pu.fill('#q','Hoàng Nam'); pu.wait_for_timeout(500); pu.locator('[data-a=edit][data-id=u5]').click(); pu.wait_for_timeout(300); pu.uncheck('input[name=r_admin]'); pu.fill('#reason','test'); pu.click('#save'); pu.wait_for_timeout(500)
    check('không thể gỡ quyền quản trị viên cuối cùng',[u for u in db(pu,'users') if u['id']=='u5'][0]['roles']==['admin'])
    pu.fill('#q','Minh An'); pu.wait_for_timeout(500); pu.locator('[data-a=off][data-id=u3]').click(); pu.wait_for_timeout(300); dlg(pu,'Vô hiệu hóa'); pu.wait_for_timeout(300); check('vô hiệu hóa không lý do bị chặn',[u for u in db(pu,'users') if u['id']=='u3'][0]['status']=='active')
    pu.fill('#dlg-reason','Vi phạm quy định'); dlg(pu,'Vô hiệu hóa'); pu.wait_for_timeout(900); check('vô hiệu hóa có lý do + thông báo chủ tài khoản',[u for u in db(pu,'users') if u['id']=='u3'][0]['status']=='disabled' and any(n['userId']=='u3' for n in db(pu,'notifications')))
    # 12. Thông báo
    c9=ctx('u1','explorer'); pn=pg(c9,'notifications.html'); check('thông báo: 5 mục đầu + nút xem cũ hơn',pn.locator('article.card').count()==5 and pn.locator('#older').is_visible())
    pn.click('#older'); pn.wait_for_timeout(200); check('xem cũ hơn → đủ 8',pn.locator('article.card').count()==8)
    pn.click('#readAll'); pn.wait_for_timeout(200); check('đánh dấu đã đọc',all(n['read'] for n in db(pn,'notifications') if n['userId']=='u1'))
    # 13. Bản đồ nội dung
    c10=ctx('u2','curator'); pm=pg(c10,'curator-content-map.html'); n_un=pm.locator('#unl [data-link]').count(); pm.locator('#unl [data-link]').first.click(); pm.select_option('#pl','p-bat-trang'); pm.click('#lf button[type=submit]'); pm.wait_for_timeout(900)
    check('liên kết địa danh cho bài chưa có',pm.locator('#unl [data-link]').count()==n_un-1)
    pm.locator('[data-unl]').first.click(); pm.wait_for_timeout(300); dlg(pm,'Gỡ liên kết'); pm.wait_for_timeout(700); check('gỡ liên kết → quay lại danh sách chưa có địa danh',pm.locator('#unl [data-link]').count()==n_un)
    # 14. Bộ sưu tập
    c11=ctx('u2','curator'); pc=pg(c11,'curator-collection-editor.html?id=c1'); pc.locator('[data-m=rm]').first.click(); pc.click('#draft'); pc.wait_for_timeout(900)
    cc=[c for c in db(pc,'collections') if c['id']=='c1'][0]; check('lưu nháp bộ sưu tập đã xuất bản không đổi bản công khai',len(cc['storyIds'])==6 and cc['draft'] and len(cc['draft']['storyIds'])==5,cc['draft'])
    pc.click('#pub'); pc.wait_for_timeout(300); dlg(pc,'Xuất bản'); pc.wait_for_timeout(1500); cc=[c for c in db(pc,'collections') if c['id']=='c1'][0]; check('xuất bản phiên bản mới → v2, 5 bài',cc['version']==2 and len(cc['storyIds'])==5 and cc['draft'] is None,cc['version'])
    # JS errors tổng
    allerr=[]; 
    print('---'); f=[n for ok,n in res if not ok]; print('TOTAL',len(res),'FAILED',len(f)); [print(' -',x) for x in f]
    b.close()
