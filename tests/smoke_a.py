import json,sys
from playwright.sync_api import sync_playwright
BASE='http://localhost:8765/'
U={'u1':('u1','explorer'),'u2':('u2','curator'),'u5':('u5','admin')}
pages=[('creator-event-editor?id=e1','u1'),
('creator-event-management','u1'),
('creator-profile','u1'),
('creator-story-editor?id=s7','u1'),
('creator-story-management','u1'),
('forgot-password',None),
('index',None),
('login',None),
('register',None),
('403',None),
('404',None)]
bad=0
with sync_playwright() as p:
    b=p.chromium.launch()
    for pg,u in pages:
        ctx=b.new_context(viewport={'width':1440,'height':900})
        if u:
            uid,role=U[u]; sp=pg.split('?')[0]
            role={'creator-':'creator','curator-':'curator','admin-':'admin'}.get(next((k for k in ['creator-','curator-','admin-'] if sp.startswith(k)),''),'explorer')
            ctx.add_init_script(f"localStorage.setItem('ct_s', JSON.stringify({{userId:'{uid}',role:'{role}'}}))")
        page=ctx.new_page(); errs=[]
        page.on('pageerror',lambda e:errs.append('PAGEERR '+str(e)[:200]))
        page.on('console',lambda m:errs.append('CONSOLE '+m.text[:200]) if m.type=='error' and 'Failed to load resource' not in m.text and 'ERR_' not in m.text else None)
        page.goto(BASE+pg+('.html' if '?' not in pg else ''.join('')) if '?' not in pg else BASE+pg.replace('?', '.html?',1))
        page.wait_for_timeout(2300)
        h1=page.locator('h1').first.inner_text() if page.locator('h1').count() else '(no h1)'
        url=page.url.split('/')[-1]
        st='OK ' if not errs else 'ERR'
        if errs: bad+=1
        print(st,pg,'→',url[:40],'|',h1[:50].replace('\n',' '))
        for e in errs[:3]: print('    ',e)
        ctx.close()
    b.close()
print('pages with errors:',bad)
