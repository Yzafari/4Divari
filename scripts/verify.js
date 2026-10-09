const fs=require('fs'),path=require('path'),{execFileSync}=require('child_process');
const root=path.join(__dirname,'..');
const version=JSON.parse(fs.readFileSync(path.join(root,'version.json'),'utf8')).version;
const required=['index.html','manifest.json','service-worker.js','version.json','assets/js/app.js','assets/css/styles.css','android/app/build.gradle','android/app/src/main/AndroidManifest.xml','android/app/src/main/java/ir/khanehbekhaneh/app/MainActivity.java','ios/KhanehBeKhaneh/www/index.html','backend/app/main.py'];
for(const f of required) if(!fs.existsSync(path.join(root,f))) throw new Error('Missing '+f);
if(version!=='0.7.2') throw new Error(`Unexpected version ${version}`);
const textFiles=['index.html','service-worker.js','assets/js/app.js','backend/app/main.py','android/app/build.gradle','ios/KhanehBeKhaneh/Info.plist'];
for(const f of textFiles){const s=fs.readFileSync(path.join(root,f),'utf8'); if(/0\.6\.[0-9]+/.test(s)) throw new Error(`Legacy 0.6.x reference in ${f}`);}
const android=fs.readFileSync(path.join(root,'android/app/src/main/java/ir/khanehbekhaneh/app/MainActivity.java'),'utf8');
if(android.includes('file:///android_asset/')) throw new Error('Unsafe file:// WebView loading remains');
if(android.includes('onBackPressed()') && !android.includes('Build.VERSION.SDK_INT < 33')) throw new Error('Legacy back handling not guarded');
if(!android.includes('WebViewAssetLoader')) throw new Error('WebViewAssetLoader missing');
const manifest=fs.readFileSync(path.join(root,'manifest.json'),'utf8');
if(manifest.includes('"start_url": "/')||manifest.includes('"scope": "/')) throw new Error('Manifest uses absolute root scope');
for(const [rel,cmd,arg] of [['assets/js/app.js','node','--check'],['service-worker.js','node','--check']]) execFileSync(cmd,[arg,path.join(root,rel)],{stdio:'ignore'});
execFileSync(process.execPath,['-e',`JSON.parse(require('fs').readFileSync(${JSON.stringify(path.join(root,'manifest.json'))},'utf8'))`],{stdio:'inherit'});
console.log(`VERIFY_OK ${version}`);
