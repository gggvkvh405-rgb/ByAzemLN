const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const {join}=require('node:path');
const {tmpdir}=require('node:os');
const {snapshot,list,restore}=require('./saves.cjs');
async function sandbox(t){const root=await fs.mkdtemp(join(tmpdir(),'byazen-saves-'));t.after(()=>fs.rm(root,{recursive:true,force:true}));return root}
test('retains separate versions and restores into a new folder only',async t=>{
  const root=await sandbox(t),source=join(root,'saves'),backups=join(root,'backups');await fs.mkdir(source);await fs.writeFile(join(source,'game.sav'),'first');
  const first=await snapshot(source,backups);await fs.writeFile(join(source,'game.sav'),'second');await snapshot(source,backups);
  assert.equal((await list(backups)).length,2);const dest=await restore(backups,first.id,root);
  assert.equal(await fs.readFile(join(dest,'game.sav'),'utf8'),'first');assert.equal(await fs.readFile(join(source,'game.sav'),'utf8'),'second');
  await assert.rejects(restore(backups,first.id,root),{code:'EEXIST'});await assert.rejects(restore(backups,'../bad',root),/Invalid backup ID/);
});
test('failed backups are not published and nested destinations are rejected',async t=>{
  const root=await sandbox(t),source=join(root,'saves'),backups=join(root,'backups');await fs.mkdir(source);await fs.writeFile(join(source,'game.sav'),'data');
  await assert.rejects(snapshot(source,backups,{maxBytes:1}),/exceeds/);assert.deepEqual(await fs.readdir(backups),[]);
  await assert.rejects(snapshot(source,join(source,'backups')),/outside/);
});
