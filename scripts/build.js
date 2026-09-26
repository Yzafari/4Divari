const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const VERSION = JSON.parse(fs.readFileSync(path.join(ROOT, 'version.json'), 'utf8')).version;
const DIST = path.join(ROOT, 'dist');
const WEB_ITEMS = ['index.html','manifest.json','service-worker.js','version.json','assets'];
function copyRecursive(src,dst){const st=fs.statSync(src); if(st.isDirectory()){fs.mkdirSync(dst,{recursive:true}); for(const n of fs.readdirSync(src)) copyRecursive(path.join(src,n),path.join(dst,n));} else {fs.mkdirSync(path.dirname(dst),{recursive:true}); fs.copyFileSync(src,dst);}}
function syncTree(dst){ if(fs.existsSync(dst)) fs.rmSync(dst,{recursive:true,force:true}); fs.mkdirSync(dst,{recursive:true}); for(const item of WEB_ITEMS) copyRecursive(path.join(ROOT,item),path.join(dst,item)); }
syncTree(DIST);
syncTree(path.join(ROOT,'android/app/src/main/assets/www'));
syncTree(path.join(ROOT,'ios/KhanehBeKhaneh/www'));
console.log(`BUILD_SYNC_OK ${VERSION}`);
