const {app,BrowserWindow,ipcMain,dialog,shell,net,session}=require('electron');
const {join,dirname,extname}=require('node:path');
const {pathToFileURL}=require('node:url');
const fs=require('node:fs/promises');
const {spawn}=require('node:child_process');
const {launchArgs}=require('./launch.cjs');
const {normalizeFeed}=require('./source.cjs');
const {createQueue}=require('./queue.cjs');
let win;
const queue=createQueue(url=>win.webContents.downloadURL(url),jobs=>{if(win&&!win.isDestroyed())win.webContents.send('downloads',jobs)});
const entry=join(__dirname,'..','index.html'), allowed=pathToFileURL(entry).href;
const invoke=(name,fn)=>ipcMain.handle(name,async(e,...args)=>{if(e.sender!==win?.webContents||e.senderFrame?.url!==allowed)throw Error('Invalid sender');return fn(...args)});
const http=value=>{const u=new URL(value);if(!['https:','http:'].includes(u.protocol)||u.username||u.password)throw Error('Expected an HTTP(S) URL');return u.href};
const executableFile=()=>join(app.getPath('userData'),'executables.json');
const executables=async()=>{try{return JSON.parse(await fs.readFile(executableFile(),'utf8'))}catch(e){if(e.code==='ENOENT')return {};throw e}};
const key=id=>{if(typeof id!=='string'||!/^[\w-]{1,100}$/.test(id)||['__proto__','constructor','prototype'].includes(id))throw Error('Invalid game ID');return id};
invoke('feed',async (raw,seconds=30)=>{const response=await net.fetch(http(raw),{signal:AbortSignal.timeout((Number.isInteger(seconds)&&seconds>=5&&seconds<=120?seconds:30)*1000),credentials:'omit'});if(!response.ok)throw Error(`Source returned HTTP ${response.status}`);const chunks=[];let size=0;for await(const chunk of response.body){size+=chunk.length;if(size>16*1024*1024)throw Error('Source exceeds 16 MB');chunks.push(Buffer.from(chunk))}return normalizeFeed(JSON.parse(Buffer.concat(chunks).toString('utf8')))});
invoke('feed-file',async()=>{
  const result=await dialog.showOpenDialog(win,{properties:['openFile'],filters:[{name:'Hydra JSON',extensions:['json']}]});
  if(result.canceled)return null;
  const [file]=result.filePaths;
  const handle=await fs.open(file,'r');
  try{
    const limit=16*1024*1024;
    if((await handle.stat()).size>limit)throw Error('Source exceeds 16 MB');
    const buffer=Buffer.alloc(limit+1);let total=0;
    while(total<buffer.length){const {bytesRead}=await handle.read(buffer,total,buffer.length-total,total);if(!bytesRead)break;total+=bytesRead}
    if(total>limit)throw Error('Source exceeds 16 MB');
    return {...normalizeFeed(JSON.parse(buffer.toString('utf8',0,total))),local:true};
  }finally{await handle.close()}
});
invoke('game-folder',async id=>{
  const file=(await executables())[key(id)];
  if(!file||!(await fs.stat(file).catch(()=>null))?.isFile())throw Error('Executable not found. Choose .exe again.');
  const error=await shell.openPath(dirname(file));if(error)throw Error(error);
});
invoke('get',raw=>{const u=new URL(raw);if(u.protocol==='magnet:'&&u.searchParams.has('xt'))return shell.openExternal(u.href);return queue.enqueue(http(raw))});
invoke('downloads-list',()=>queue.snapshot());
invoke('downloads-action',(id,op)=>queue.action(id,op));
invoke('pick',async id=>{key(id);const result=await dialog.showOpenDialog(win,{properties:['openFile'],filters:[{name:'Windows executable',extensions:['exe']}]});if(result.canceled)return false;const [file]=result.filePaths;if(extname(file).toLowerCase()!=='.exe')throw Error('Select an .exe file');const all=await executables();all[id]=file;await fs.writeFile(executableFile(),JSON.stringify(all));return true});
const saves=require('./saves.cjs');
const backupRoot=id=>join(app.getPath('userData'),'backups',key(id));
const saveBinding=id=>join(app.getPath('userData'),'save-folders',key(id)+'.txt');
const backupBusy=new Set();
invoke('saves-bind',async id=>{
  const binding=saveBinding(id),result=await dialog.showOpenDialog(win,{properties:['openDirectory']});
  if(result.canceled)return false;
  await fs.mkdir(dirname(binding),{recursive:true});await fs.writeFile(binding,result.filePaths[0]);return true;
});
invoke('saves-list',async id=>({folder:await fs.readFile(saveBinding(id),'utf8').catch(e=>{if(e.code==='ENOENT')return '';throw e}),items:await saves.list(backupRoot(id))}));
invoke('saves-snapshot',async id=>{
  const binding=saveBinding(id);if(backupBusy.has(id))throw Error('Backup already in progress');backupBusy.add(id);
  try{const folder=await fs.readFile(binding,'utf8').catch(e=>{if(e.code==='ENOENT')throw Error('Choose the saves folder first.');throw e});return await saves.snapshot(folder,backupRoot(id))}finally{backupBusy.delete(id)}
});
invoke('saves-restore',async (id,backup)=>{
  const root=backupRoot(id),result=await dialog.showOpenDialog(win,{properties:['openDirectory']});
  if(result.canceled)return null;
  return saves.restore(root,backup,result.filePaths[0]);
});
invoke('play',async (id,args)=>{const argv=launchArgs(args);const file=(await executables())[key(id)];if(!file)throw Error('Choose the game executable first.');if(!(await fs.stat(file).catch(()=>null))?.isFile())throw Error('Executable not found. Choose .exe again.');await new Promise((resolve,reject)=>{const child=spawn(file,argv,{cwd:dirname(file),detached:true,stdio:'ignore',shell:false});child.once('error',reject);child.once('spawn',()=>{child.unref();resolve()})})});
app.whenReady().then(()=>{
  win=new BrowserWindow({width:1120,height:780,minWidth:600,minHeight:480,titleBarStyle:'hidden',titleBarOverlay:{color:'#101112',symbolColor:'#eee',height:30},backgroundColor:'#101112',webPreferences:{preload:join(__dirname,'preload.cjs'),sandbox:true,contextIsolation:true,nodeIntegration:false}});
  // Start maximized while keeping the native window controls available.
  win.maximize();
  session.defaultSession.setPermissionRequestHandler((_wc,_permission,reply)=>reply(false));
  win.webContents.on('will-navigate',e=>e.preventDefault());win.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  session.defaultSession.on('will-download',(_event,item,contents)=>{if(contents!==win?.webContents){item.cancel();return}if(item.getURL().startsWith('blob:')&&item.getFilename()==='byazen-sources.txt')return;queue.attach(item)});
  win.loadFile(entry);
});
app.on('window-all-closed',()=>app.quit());
