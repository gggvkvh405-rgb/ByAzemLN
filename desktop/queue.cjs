const {randomUUID}=require('node:crypto');
function createQueue(start,publish,{timeout=30000}={}){
  const jobs=[];let active=null;
  const snapshot=()=>jobs.map(({item,timer,...job})=>({...job}));
  const update=()=>publish(snapshot());
  function finish(job,state){clearTimeout(job.timer);delete job.timer;delete job.item;job.state=state;active=null;update();pump()}
  function pump(){
    if(active)return;
    const job=jobs.find(j=>j.state==='queued');if(!job)return;
    active=job;job.state='starting';update();
    job.timer=setTimeout(()=>finish(job,'failed'),timeout);
    try{start(job.url)}catch{finish(job,'failed')}
  }
  function enqueue(url){const job={id:randomUUID(),url,name:'',state:'queued',received:0,total:0,resumable:false};jobs.push(job);update();pump();return job.id}
  function attach(item){
    const job=active;
    if(!job||job.state!=='starting'||!item.getURLChain().includes(job.url)){item.cancel();return}
    clearTimeout(job.timer);job.item=item;
    function read(state){job.name=item.getFilename();job.received=item.getReceivedBytes();job.total=item.getTotalBytes();job.resumable=item.canResume();job.state=state}
    read('downloading');update();
    item.on('updated',(_e,state)=>{read(state==='interrupted'?'interrupted':item.isPaused()?'paused':'downloading');update()});
    item.once('done',(_e,state)=>{read(state);finish(job,state==='completed'?'completed':state==='cancelled'?'cancelled':'failed')});
  }
  function action(id,op){
    const job=jobs.find(j=>j.id===id);if(!job)throw Error('Download not found');
    if(op==='pause'&&job.item&&job.state==='downloading'){job.item.pause();job.resumable=job.item.canResume();job.state='paused'}
    else if(op==='resume'&&job.item&&['paused','interrupted'].includes(job.state)&&job.item.canResume())job.item.resume();
    else if(op==='cancel'&&job.item)job.item.cancel();
    else if(op==='cancel'&&job.state==='queued')job.state='cancelled';
    else if(op==='retry'&&['failed','cancelled'].includes(job.state)){Object.assign(job,{state:'queued',received:0,total:0,resumable:false});pump()}
    else if(op==='remove'&&['failed','cancelled','completed'].includes(job.state))jobs.splice(jobs.indexOf(job),1);
    else throw Error('This action is unavailable for the current download');
    update();
  }
  return {enqueue,attach,action,snapshot};
}
module.exports={createQueue};
