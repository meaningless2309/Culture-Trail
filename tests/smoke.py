import json,sys
from playwright.sync_api import sync_playwright
BASE='http://localhost:8765/'
U={'u1':('u1','explorer'),'u2':('u2','curator'),'u5':('u5','admin')}
pages=[('index','u1'),('login',None),('register',None),('forgot-password',None),('403',None),('404',None),
('personal-profile','u1'),('account-settings','u1'),('notifications','u1'),
('explorer-story-discovery','u1'),('explorer-story-detail?id=s1','u1'),('explorer-place-detail?id=p-bat-trang','u1'),('explorer-my-trail','u1'),('explorer-ai-trail-generator','u1'),
('creator-profile','u1'),('creator-story-management','u1'),('creator-story-editor?id=s7','u1'),('creator-event-management','u1'),('creator-event-editor?id=e1','u1'),
('curator-content-review','u2'),('curator-review-detail?id=s6','u2'),('curator-collection-management','u2'),('curator-collection-editor?id=c1','u2'),('curator-content-map','u2'),
('admin-tag-management','u5'),('admin-user-management','u5'),('admin-culture-dashboard','u5')]
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
