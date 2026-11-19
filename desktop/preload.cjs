const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('desktop',{
  listSaves:id=>ipcRenderer.invoke('saves-list',id),bindSaves:id=>ipcRenderer.invoke('saves-bind',id),backupSaves:id=>ipcRenderer.invoke('saves-snapshot',id),restoreSaves:(id,backup)=>ipcRenderer.invoke('saves-restore',id,backup),
  feedFile:()=>ipcRenderer.invoke('feed-file'),gameFolder:id=>ipcRenderer.invoke('game-folder',id),feed:(url,seconds)=>ipcRenderer.invoke('feed',url,seconds),get:url=>ipcRenderer.invoke('get',url),pick:id=>ipcRenderer.invoke('pick',id),play:(id,args)=>ipcRenderer.invoke('play',id,args),downloads:()=>ipcRenderer.invoke('downloads-list'),downloadAction:(id,op)=>ipcRenderer.invoke('downloads-action',id,op),onDownloads:callback=>ipcRenderer.on('downloads',(_e,data)=>callback(data))
});
