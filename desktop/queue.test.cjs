const {EventEmitter}=require('node:events');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createQueue}=require('./queue.cjs');
const item=url=>Object.assign(new EventEmitter(),{
  getURLChain:()=>[url],getFilename:()=> 'game.zip',getReceivedBytes:()=>5,getTotalBytes:()=>10,canResume:()=>true,isPaused:()=>false,
  pause(){this.paused=true},resume(){this.paused=false},cancel(){this.emit('done',null,'cancelled')}
});
test('HTTP jobs are sequential, can pause and resume, and advance after completion',()=>{
  const started=[],q=createQueue(url=>started.push(url),()=>{});
  const first=q.enqueue('https://example.org/first'),second=q.enqueue('https://example.org/second');
  assert.deepEqual(started,['https://example.org/first']);
  const transfer=item(started[0]);q.attach(transfer);q.action(first,'pause');
  assert.equal(q.snapshot()[0].state,'paused');assert.ok(transfer.paused);
  q.action(first,'resume');assert.equal(transfer.paused,false);
  transfer.emit('done',null,'completed');assert.equal(q.snapshot()[0].state,'completed');
  assert.equal(started[1],'https://example.org/second');
  q.attach(item(started[1]));q.action(second,'cancel');assert.equal(q.snapshot()[1].state,'cancelled');
});
test('queued job can be cancelled and retried without starting early',()=>{
  const started=[],q=createQueue(url=>started.push(url),()=>{});
  q.enqueue('https://example.org/a');const id=q.enqueue('https://example.org/b');
  q.action(id,'cancel');q.action(id,'retry');assert.equal(q.snapshot()[1].state,'queued');
  const first=item(started[0]);q.attach(first);first.emit('done',null,'interrupted');
  assert.equal(q.snapshot()[0].state,'failed');assert.equal(started.length,2);
  const second=item(started[1]);q.attach(second);second.cancel();q.action(id,'remove');assert.equal(q.snapshot().length,1);
});
