const VERSION='0.7.2';
const CACHE_NAME=`4divari-app-shell-v${VERSION}`;
const APP_SHELL=['./','./index.html','./assets/css/styles.css','./assets/js/app.js','./manifest.json','./version.json','./assets/icons/icon-192.png','./assets/icons/icon-512.png','./assets/icons/logo.svg'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE_NAME).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
  const req=event.request;
  if(req.method!=='GET') return;
  const url=new URL(req.url);
  if(url.origin!==self.location.origin) return;
  const isAppShell=req.mode==='navigate'||['script','style','manifest'].includes(req.destination)||url.pathname.endsWith('/version.json');
  if(isAppShell){
    event.respondWith(fetch(req,{cache:'no-store'}).then(res=>{
      if(res.ok){const copy=res.clone();caches.open(CACHE_NAME).then(cache=>cache.put(req,copy));}
      return res;
    }).catch(()=>caches.match(req).then(cached=>cached||caches.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(req).then(cached=>cached||fetch(req).then(res=>{
    if(res.ok){const copy=res.clone();caches.open(CACHE_NAME).then(cache=>cache.put(req,copy));}
    return res;
  })));
});
