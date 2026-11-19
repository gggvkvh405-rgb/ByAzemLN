const fs=require('node:fs/promises');
const path=require('node:path');
const {randomUUID}=require('node:crypto');
async function snapshot(source,root,{maxBytes=1024**3,maxFiles=10000}={}){
  source=await fs.realpath(source);await fs.mkdir(root,{recursive:true});root=await fs.realpath(root);
  const inside=path.relative(source,root);if(!inside||(!inside.startsWith('..'+path.sep)&&inside!=='..'&&!path.isAbsolute(inside)))throw Error('Backup destination must be outside the saves folder.');
  const id=randomUUID(),stage=path.join(root,'.'+id),target=path.join(root,id);let files=0,bytes=0;
  await fs.mkdir(stage);
  async function walk(from,to){
    for(const entry of await fs.readdir(from,{withFileTypes:true})){
      const input=path.join(from,entry.name),output=path.join(to,entry.name);
      if(entry.isDirectory()){await fs.mkdir(output);await walk(input,output)}
      else if(entry.isFile()){
        const info=await fs.lstat(input);if(!info.isFile())continue;
        if(++files>maxFiles||(bytes+=info.size)>maxBytes)throw Error('Backup exceeds the file count or size limit.');
        await fs.copyFile(input,output);
      }
    }
  }
  try{const createdAt=new Date().toISOString();await fs.mkdir(path.join(stage,'files'));await walk(source,path.join(stage,'files'));const meta={id,createdAt,files,bytes};await fs.writeFile(path.join(stage,'manifest.json'),JSON.stringify(meta));await fs.rename(stage,target);return meta}
  catch(e){await fs.rm(stage,{recursive:true,force:true});throw e}
}
async function list(root){
  const entries=await fs.readdir(root,{withFileTypes:true}).catch(e=>{if(e.code==='ENOENT')return [];throw e});
  const items=[];for(const entry of entries)if(entry.isDirectory()&&validId(entry.name))try{items.push(JSON.parse(await fs.readFile(path.join(root,entry.name,'manifest.json'),'utf8')))}catch{}
  return items.sort((a,b)=>b.createdAt.localeCompare(a.createdAt));
}
const validId=id=>typeof id==='string'&&/^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/.test(id);
async function restore(root,id,destination){
  if(!validId(id))throw Error('Invalid backup ID');
  const source=path.join(root,id,'files'),target=path.join(destination,'ByAzen-restore-'+id);
  if(!(await fs.stat(source)).isDirectory())throw Error('Backup not found');
  await fs.mkdir(target);try{for(const name of await fs.readdir(source))await fs.cp(path.join(source,name),path.join(target,name),{recursive:true,force:false,errorOnExist:true,filter:async from=>!(await fs.lstat(from)).isSymbolicLink()});return target}catch(e){await fs.rm(target,{recursive:true,force:true});throw e}
}
module.exports={snapshot,list,restore};
