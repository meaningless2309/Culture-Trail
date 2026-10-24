from playwright.sync_api import sync_playwright
BASE='http://localhost:8765/'
U={'':None,'creator-':('u1','creator'),'curator-':('u2','curator'),'admin-':('u5','admin')}
pages=['index','login','register','forgot-password','403','404','personal-profile','account-settings','notifications','explorer-story-discovery','explorer-story-detail?id=s1','explorer-place-detail?id=p-bat-trang','explorer-my-trail','explorer-ai-trail-generator','creator-profile','creator-story-management','creator-story-editor?id=s7','creator-event-management','creator-event-editor?id=e1','curator-content-review','curator-review-detail?id=s6','curator-collection-management','curator-collection-editor?id=c1','curator-content-map','admin-tag-management','admin-user-management','admin-culture-dashboard']
JS="""()=>{const out=[];
document.querySelectorAll('img').forEach(i=>{if(!i.hasAttribute('alt'))out.push('img thiếu alt: '+i.src.split('/').pop())});
document.querySelectorAll('input:not([type=hidden]):not([type=file]),select,textarea').forEach(e=>{const has=e.id&&document.querySelector('label[for="'+e.id+'"]')||e.closest('label')||e.getAttribute('aria-label')||e.getAttribute('aria-labelledby');if(!has)out.push('control thiếu nhãn: '+(e.id||e.name||e.type))});
document.querySelectorAll('button,a').forEach(e=>{if(e.offsetParent!==null&&!(e.innerText||'').trim()&&!e.getAttribute('aria-label')&&!e.querySelector('img'))out.push('nút/liên kết rỗng: '+(e.id||e.className||e.tagName))});
if(document.querySelectorAll('h1').length!==1)out.push('số h1 = '+document.querySelectorAll('h1').length);
const ids={};document.querySelectorAll('[id]').forEach(e=>{ids[e.id]=(ids[e.id]||0)+1});Object.keys(ids).filter(k=>ids[k]>1).forEach(k=>out.push('id trùng: '+k));
if(!document.documentElement.lang)out.push('thiếu lang');
return out}"""
with sync_playwright() as p:
    b=p.chromium.launch(); tot=0
    for w in (390,1440):
        for pg in pages:
            sp=pg.split('?')[0]; u=next((v for k,v in U.items() if k and sp.startswith(k)),('u1','explorer') if sp not in('index','login','register','forgot-password','403','404') else None)
            c=b.new_context(viewport={'width':w,'height':800})
            if u: c.add_init_script(f"localStorage.setItem('ct_s', JSON.stringify({{userId:'{u[0]}',role:'{u[1]}'}}))")
            page=c.new_page(); page.goto(BASE+(pg.replace('?','.html?',1) if '?' in pg else pg+'.html')); page.wait_for_timeout(1700)
            ov=page.evaluate("()=>document.documentElement.scrollWidth-document.documentElement.clientWidth")
            issues=page.evaluate(JS) if w==1440 else []
            if ov>2: issues.append(f'TRÀN NGANG {ov}px ở {w}px')
            if issues: tot+=len(issues); print(pg,w,issues[:5])
            c.close()
    print('issues',tot); b.close()
