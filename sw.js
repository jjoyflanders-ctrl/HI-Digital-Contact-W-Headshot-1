const CACHE="highlight-card-newdesign-v1";
const ASSETS=[
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./employees.csv",
  "./manifest.webmanifest",
  "./assets/header.png",
  "./assets/building.png",
  "./assets/jessica-flanders.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png"
];

self.addEventListener("install",(e)=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()));
});

self.addEventListener("activate",(e)=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE ? caches.delete(k):null)))
    .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",(e)=>{
  const req=e.request;
  if(req.method!=="GET") return;

  // Network-first for QR images (external), cache-first for local assets
  const url=new URL(req.url);
  if(url.origin!==location.origin){
    return; // let browser handle
  }

  e.respondWith(
    caches.match(req).then(cached=> cached || fetch(req).then(res=>{
      const copy=res.clone();
      caches.open(CACHE).then(cache=>cache.put(req, copy)).catch(()=>{});
      return res;
    }).catch(()=>cached))
  );
});
