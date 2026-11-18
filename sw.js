const C="kronos-v4",A=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./sync.js","./firebase-config.js"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(A)));self.skipWaiting()});
self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x))))));
self.addEventListener("fetch",e=>{if(e.request.method!=="GET"||new URL(e.request.url).origin!==location.origin)return;
 e.respondWith(fetch(e.request).then(r=>{const c=r.clone();caches.open(C).then(ch=>ch.put(e.request,c));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match("./index.html"))))});
