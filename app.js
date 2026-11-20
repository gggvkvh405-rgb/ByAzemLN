const paths={home:'M3 10l9-7 9 7v10h-6v-6H9v6H3z',catalogue:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',library:'M7 6h10c3 0 5 5 5 9s-2 5-5 2l-2-2H9l-2 2c-3 3-5 2-5-2s2-9 5-9z M7 9v5m-2-2.5h4m7-1h.1m3 2h.1',download:'M12 3v13m-5-5 5 5 5-5M4 16v5h16v-5',sources:'M4 6a8 3 0 1 0 16 0a8 3 0 1 0-16 0v12a8 3 0 0 0 16 0V6M4 12a8 3 0 0 0 16 0',settings:'M12 2l2 3 4-1 2 3-1 4 3 2-1 4-4 1-1 4h-4l-2-3-4 1-2-3 1-4-3-2 1-4 4-1 1-4z M15 12a3 3 0 1 0-6 0 3 3 0 0 0 6 0',search:'M16 10a6 6 0 1 0-12 0 6 6 0 0 0 12 0zm-1 5 5 5',chevron:'m9 5 7 7-7 7',back:'m11 6-6 6 6 6M5 12h15',calendar:'M4 5h16v16H4z M8 3v5m8-5v5M4 10h16',bolt:'m13 2-8 12h6l-1 8 9-12h-6z',spark:'M10 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z M19 3v5m-2-2h5',fire:'M12 2c1 6-4 6-3 11-2-1-3-3-3-4-7 8 1 14 6 13 8 0 11-8 5-14 0 3-2 4-2 4 1-5-2-8-3-10z'};
const icon=n=>`<svg viewBox="0 0 24 24" fill="${['home','fire','bolt'].includes(n)?'currentColor':'none'}" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[n]}"/></svg>`;
const $=s=>document.querySelector(s), ico=n=>`<i>${icon(n)}</i>`;
const games=[['dead','Dead Space',58.4,1420],['elden','Elden Ring',48.2,1800],['red','Red Dead Redemption 2',67.5,1640],['ghost','Ghost of Tsushima',55.6,1520],['cyber','Cyberpunk 2077',82.1,1100],['baldur',"Baldur's Gate 3",99.3,1240]].map(([id,title,size,seeds])=>({id,title,size,seeds}));
const themeWorlds=[['Nebula','hero',220],['Nightfall','dead',270],['Wildlands','elden',145],['Frontier','red',15],['Ronin','ghost',195],['Neon City','cyber',320],['Arcana','baldur',285],['Aurora','hero',170],['Ember','red',32],['Deep Space','dead',205]];
const themeMoods=['Midnight','Dawn','Twilight','Eclipse','Dream','Pulse','Horizon','Afterglow','Noir','Spectrum'];
const defaults={library:['cyber','elden','ghost','baldur','red'],sources:{},queue:[],name:'Azen',feeds:[],customGames:[],favorites:[],recent:[],libraryView:'grid',collections:[],launchProfiles:{},feedTimeout:30,appearance:{theme:"dark",accent:"mint",zoom:"normal",motion:"system",start:"Home"}}; let state={...defaults};try{state={...defaults,...JSON.parse(localStorage.getItem('byazen'))}}catch{};
state.appearance={...defaults.appearance,...state.appearance};
const save=()=>localStorage.setItem('byazen',JSON.stringify(state));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let page=validStart(state.appearance.start),tab=0,downloads=[],libraryFilter='all',cataloguePage=0;const pages=['Home','Catalogue','Library','Downloads','Sources','Settings'], tabs=['Hot now','Top games of the week','Fast repacks'];
const game=id=>[...games,...state.customGames].find(g=>g.id===id),img=g=>g.custom?'assets/local.svg':`assets/${g.id}.webp`;
const card=g=>`<button class="card ${['elden','red','ghost'].includes(g.id)?'art':''}" data-game="${g.id}" aria-label="${esc(g.title)}"><img src="${img(g)}" alt=""><span>${esc(g.title)}</span></button>`;
const grid=items=>items.length?`<div class="grid">${items.map(card).join('')}</div>`:'<p class="muted">No games found.</p>';
function sidebar(){const q=$('#filter').value.trim().toLowerCase();$('#sidebar-games').innerHTML=state.library.map(game).filter(g=>g&&g.title.toLowerCase().includes(q)).map(g=>`<button class="side-game" data-game="${g.id}"><img src="${img(g)}" alt="">${esc(g.title)}</button>`).join('');}
function render(){const q=$('#search').value.trim().toLowerCase();$('#page-name').textContent=q?'Search':page;$('.profile span').textContent=state.name;$('#nav').innerHTML=pages.map(p=>`<button aria-label="${p}" data-page="${p}" class="${page===p&&!q?'active':''}">${ico(p.toLowerCase())}<span>${p}</span>${p==='Downloads'&&state.queue.length?`<b>${state.queue.length}</b>`:''}</button>`).join('');sidebar();const main=$('#main');
if(q){main.innerHTML=catalogueView(q);return}
if(page==='Home'){const lists=[['elden','red','ghost'],['red','baldur','elden'],['elden','ghost','dead']];main.innerHTML=`<h1>Featured</h1><section class="hero"><div class="hero-copy"><h2>DEAD<br>SPACE</h2><p>Engineering fear in the silence of space.<br>A classic reborn, deadlier than ever.</p><div class="badges" title="Reference mockup data"><span class="badge">Repack · 58.4 GB</span><span class="badge">Seeds: 1420</span></div><button class="primary" data-get="dead">${ico('download')}Download</button></div></section><div class="tabs">${tabs.map((t,i)=>`<button class="pill ${i===tab?'active':''}" data-tab="${i}" aria-pressed="${i===tab}">${ico(['fire','calendar','bolt'][i])}${t}</button>`).join('')}<button class="pill surprise" id="surprise">${ico('spark')}Surprise me</button></div><div class="section-head"><h2><i style="color:#ff673e;margin-right:7px">${icon(['fire','calendar','bolt'][tab])}</i>${tabs[tab]}</h2><button data-page="Catalogue" aria-label="View catalogue">${ico('chevron')}</button></div>${grid(lists[tab].map(game))}`}
if(page==='Catalogue')main.innerHTML=catalogueView('');
if(page==='Library')main.innerHTML=libraryPage();
if(page==='Downloads'&&window.desktop)main.innerHTML='<h1>Downloads</h1><p class="muted">Direct downloads run one at a time. Magnet links open in your torrent client.</p><div id="desktop-downloads"></div>',renderDownloads();
if(page==='Downloads'&&!window.desktop)main.innerHTML='<h1>Downloads</h1><p class="muted">Download history. The status bar shows the latest desktop transfer; magnet links open in your torrent client.</p>'+ (state.queue.map(id=>`<div class="panel row"><strong>${esc(game(id).title)}</strong><button class="pill" data-get="${id}">Open link again</button><button class="pill" data-remove="${id}">Remove</button></div>`).join('')||'<div class="panel">No downloads yet.</div>');
if(page==='Sources')main.innerHTML=`<h1>Sources</h1>${feedPanel()}<div class="panel"><p>Add a direct HTTP(S) download link for a game. No links are bundled.</p><form id="source-form" class="row"><select name="game" aria-label="Game">${[...games,...state.customGames].map(g=>`<option value="${g.id}">${esc(g.title)}</option>`).join('')}</select><input name="url" type="url" placeholder="https://…" aria-label="Download link" required><button class="primary">Save source</button></form></div>${Object.keys(state.sources).map(id=>`<div class="panel row"><strong>${esc(game(id).title)}</strong><span class="muted">${esc(new URL(state.sources[id]).hostname)}</span><button class="pill" data-delete-source="${id}">Remove</button></div>`).join('')}`;
if(page==='Settings')main.innerHTML=`<h1>Settings</h1>${appearanceForm()}<form id="settings-form" class="panel row"><label for="name">Profile name</label><input id="name" name="name" maxlength="30" required value="${esc(state.name)}"><button class="primary">Save</button></form>`;
}
function go(p){page=p;cataloguePage=0;$('#search').value='';render();$('#main').scrollTop=0}
function modal(content){$('#modal-content').innerHTML=content;if(!$('#modal').open)$('#modal').showModal()}
function details(id){const g=game(id);modal(`<h2>${esc(g.title)}</h2><img src="${img(g)}" alt="" style="width:100%;max-height:190px;object-fit:cover;border-radius:8px;margin:8px 0"><div class="row">${localButtons(id)}<button class="primary" data-get="${id}">${ico('download')}Download</button><button class="pill" data-favorite="${id}">${state.favorites.includes(id)?'Remove favorite':'Add favorite'}</button>${state.library.includes(id)?`<button class="pill" data-collect-game="${id}">Collections</button>`:''}${g.custom?`<button class="pill" data-edit-game="${id}">Rename</button>`:''}<button class="pill" data-toggle="${id}">${state.library.includes(id)?'Remove from library':'Add to library'}</button></div>`)}
async function download(id){const g=game(id),url=state.sources[id];if(!url){modal(`<h2>${esc(g.title)}</h2><p>No download link is configured. Add one in Sources to continue.</p><button class="primary" data-page="Sources">Open Sources</button>`);return}try{await openDownload(url)}catch(e){status(e.message);return}if(!state.queue.includes(id))state.queue.unshift(id);save();$('#status-text').textContent=`Download link opened · ${g.title}`;$('#modal').close();render()}
document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=icon(el.dataset.icon));$('#search').addEventListener('input',()=>{cataloguePage=0;render()});$('#filter').addEventListener('input',sidebar);$('#back').onclick=()=>go('Home');
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const d=b.dataset;if(d.page){$('#modal').close();go(d.page)}if(d.tab!==undefined){tab=Number(d.tab);render()}if(d.game)details(d.game);if(d.get)download(d.get);if(d.toggle){state.library=state.library.includes(d.toggle)?state.library.filter(id=>id!==d.toggle):[...state.library,d.toggle];save();render();details(d.toggle)}if(d.remove){state.queue=state.queue.filter(id=>id!==d.remove);save();render()}if(d.deleteSource){delete state.sources[d.deleteSource];save();render()}if(b.id==='surprise')details(games[Math.floor(Math.random()*games.length)].id)});
document.addEventListener('submit',e=>{if(e.target.id==='source-form'){e.preventDefault();const f=new FormData(e.target);let url;try{url=new URL(f.get('url'));if(!['https:','http:'].includes(url.protocol))throw Error()}catch{$('#status-text').textContent='Enter a valid HTTP(S) link';return}state.sources[f.get('game')]=url.href;save();$('#status-text').textContent='Download source saved';render()}if(e.target.id==='settings-form'){e.preventDefault();state.name=new FormData(e.target).get('name').trim()||'Azen';save();$('#status-text').textContent='Profile saved';render()}});render();

function status(text){$('#status-text').textContent=text;$('#progress').style.width='0%'}
async function openDownload(url){if(window.desktop)return desktop.get(url);const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.click()}
let pendingFeed=null, sourceBusy=false;
function feedPanel(){
  const importer=window.desktop?`<p>Preview a Hydra JSON source before adding it to the catalogue.</p><form id="feed-form" class="row"><input type="url" name="url" placeholder="https://…/source.json" required aria-label="Hydra source URL"><button class="primary">Preview URL</button></form><form id="feed-batch" class="source-actions"><label for="feed-urls">Import multiple URLs (one per line)</label><textarea id="feed-urls" name="urls" rows="3" required maxlength="20000"></textarea><button class="pill">Preview list</button></form><form id="feed-timeout" class="row source-actions"><label for="timeout">Timeout (seconds)</label><input id="timeout" name="seconds" type="number" min="5" max="120" required value="${state.feedTimeout}"><button class="pill">Save</button></form><div class="row source-actions"><button class="pill" data-feed-file>Open JSON file</button>${state.feeds.some(f=>!f.local)?'<button class="pill" data-feed-refresh-all>Refresh all URLs</button>':''}</div>`:'<p>JSON feed import requires the Windows app.</p>';
  return `<div class="panel"><h2>Hydra sources</h2>${importer}<p id="feed-error" role="status"></p></div><div class="row source-actions"><label for="source-search">Find sources</label><input id="source-search" placeholder="Name, domain or tag"><button class="pill" data-feed-export>Export URLs</button></div><p class="muted">${state.feeds.length} sources · ${state.feeds.reduce((n,f)=>n+f.entries.length,0)} total entries</p>`+state.feeds.map((f,i)=>`<div class="panel source-entry" data-source-text="${esc([f.label||f.name,f.url,...(f.tags||[])].join(' ').toLowerCase())}"><div class="row"><strong>${esc(f.label||f.name)}</strong>${(f.tags||[]).map(t=>`<span class="badge">${esc(t)}</span>`).join('')}<span class="muted">${f.entries.length} entries · ${f.disabled?'Disabled':'Enabled'}</span></div><p>${f.local?'Local JSON':esc(new URL(f.url).hostname)}${f.updatedAt?' · '+esc(new Date(f.updatedAt).toLocaleString()):''}</p><div class="row">${!f.local&&window.desktop?`<button class="pill" data-feed-refresh="${i}">Refresh</button>`:''}<button class="pill" data-feed-toggle="${i}">${f.disabled?'Enable':'Disable'}</button>${i?`<button class="pill" data-feed-up="${i}">Move up</button>`:''}<button class="pill" data-feed-meta="${i}">Edit label and tags</button>${!f.local?`<button class="pill" data-feed-copy="${i}">Copy URL</button>`:''}<button class="pill" data-feed-remove="${i}">Remove</button></div></div>`).join('');
}
function setFeeds(feeds){localStorage.setItem('byazen',JSON.stringify({...state,feeds}));state.feeds=feeds;render()}
function feedMessage(message){status(message);const field=$('#feed-error');if(field)field.textContent=message}
function previewFeed(feed,url){
  pendingFeed=[{...feed,url,updatedAt:Date.now()}];
  const links=feed.entries.reduce((sum,entry)=>sum+entry.urls.length,0);
  modal(`<h2>${esc(feed.name)}</h2><p>${feed.entries.length} entries · ${links} links</p><ul>${feed.entries.slice(0,12).map(g=>`<li>${esc(g.title)}</li>`).join('')}</ul>${feed.entries.length>12?'<p>Showing the first 12 entries.</p>':''}<button class="primary" data-feed-confirm>Import source</button>`);
}
async function sourceAction(work){
  if(sourceBusy)return;
  sourceBusy=true;feedMessage('Reading Hydra source…');
  try{await work()}catch(err){feedMessage(err.name==='QuotaExceededError'?'Storage is full. Remove another source before importing.':err.message)}finally{sourceBusy=false}
}
async function refreshFeeds(urls){
  let count=0;const errors=[];
  for(const url of urls){try{const feed=await desktop.feed(url,state.feedTimeout);setFeeds(state.feeds.map(f=>f.url===url?{...f,...feed,updatedAt:Date.now()}:f));count++}catch(e){errors.push(e.message)}}
  feedMessage(`Refreshed ${count}/${urls.length}.`+(errors.length?' Previous snapshots were kept for failed sources. '+errors[0]:''));
}
function catalogueView(q){
  const items=[...games,...state.customGames].filter(g=>g.title.toLowerCase().includes(q)).map(g=>({kind:'game',g}));
  for(const [i,f] of state.feeds.entries())if(!f.disabled)for(const [j,g] of f.entries.entries())if(g.title.toLowerCase().includes(q))items.push({kind:'feed',i,j,g,f});
  const size=24,total=Math.max(1,Math.ceil(items.length/size));cataloguePage=Math.max(0,Math.min(cataloguePage,total-1));
  const visible=items.slice(cataloguePage*size,(cataloguePage+1)*size);
  const cards=visible.map(item=>item.kind==='game'?card(item.g):`<button class="catalogue-feed-card" data-feed-game="${item.i}:${item.j}"><span class="feed-card-icon">${ico('spark')}</span><strong>${esc(item.g.title)}</strong><span>${esc(item.f.label||item.f.name)}</span><small>View details →</small></button>`).join('');
  return `<div class="catalogue-heading"><div><span class="eyebrow">YOUR DISCOVERY SPACE</span><h1>${q?'Search results':'Catalogue'}</h1><p class="muted">${items.length} games available${q?' matching your search':''} · includes enabled sources</p></div><button class="pill" data-page="Sources">${ico('sources')} Manage sources</button></div>${cards?`<div class="grid catalogue-grid">${cards}</div>`:'<div class="panel muted">No games found. Add a source or try another search.</div>'}<div class="pagination" aria-label="Catalogue pages"><button class="pill" data-catalogue-page="${cataloguePage-1}" ${cataloguePage===0?'disabled':''}>← Previous</button><span>Page <strong>${cataloguePage+1}</strong> of ${total}</span><button class="pill" data-catalogue-page="${cataloguePage+1}" ${cataloguePage>=total-1?'disabled':''}>Next →</button></div>`;
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-catalogue-page]');if(!b||b.disabled)return;cataloguePage=Number(b.dataset.cataloguePage);render();$('#main').scrollTo({top:0,behavior:document.documentElement.dataset.motion==='reduced'||matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})});
function localButtons(id){return window.desktop?`<button class="primary" data-play="${id}">Play</button><button class="pill" data-pick="${id}">Choose .exe</button><button class="pill" data-folder="${id}">Open folder</button><button class="pill" data-profiles="${id}">Launch profiles</button><button class="pill" data-saves="${id}">Save backups</button>`:''}
function feedId(url,title){let n=2166136261;for(const c of `${url}\0${title}`)n=Math.imul(n^c.charCodeAt(0),16777619);return `feed-${n>>>0}`}
document.addEventListener('submit',e=>{if(e.target.id!=='feed-form')return;e.preventDefault();const raw=new FormData(e.target).get('url');sourceAction(async()=>{const parsed=new URL(raw);parsed.hash='';const url=parsed.href;previewFeed(await desktop.feed(url,state.feedTimeout),url);feedMessage('Preview ready')})});
document.addEventListener('click',async e=>{const d=e.target.closest('button')?.dataset;if(!d)return;try{
if(d.feedRemove!==undefined)setFeeds(state.feeds.filter((_,i)=>i!==Number(d.feedRemove)));
if(d.feedToggle!==undefined)setFeeds(state.feeds.map((f,i)=>i===Number(d.feedToggle)?{...f,disabled:!f.disabled}:f));
if(d.feedUp!==undefined){const i=Number(d.feedUp),next=[...state.feeds];[next[i-1],next[i]]=[next[i],next[i-1]];setFeeds(next)}
if(d.feedFile!==undefined)await sourceAction(async()=>{const feed=await desktop.feedFile();if(!feed){feedMessage('Import cancelled');return}previewFeed(feed,'local:'+crypto.randomUUID());feedMessage('Preview ready')});
if(d.feedRefresh!==undefined){const f=state.feeds[Number(d.feedRefresh)];await sourceAction(()=>refreshFeeds([f.url]))}
if(d.feedRefreshAll!==undefined)await sourceAction(()=>refreshFeeds(state.feeds.filter(f=>!f.local).map(f=>f.url)));
if(d.feedConfirm!==undefined&&pendingFeed){const feeds=pendingFeed,next=[...state.feeds];for(const feed of feeds){const i=next.findIndex(f=>f.url===feed.url);if(i<0)next.push(feed);else next[i]={...next[i],...feed}}setFeeds(next);pendingFeed=null;$('#modal').close();feedMessage(`Imported ${feeds.length} source(s)`)}
if(d.folder)await desktop.gameFolder(d.folder);
if(d.feedGame){const [i,j]=d.feedGame.split(':').map(Number),f=state.feeds[i],g=f.entries[j];modal(`<h2>${esc(g.title)}</h2><p>${esc(f.label||f.name)} · Choose a download link</p><div class="row">${g.urls.map((url,k)=>`<button class="pill" data-link="${i}:${j}:${k}">${new URL(url).protocol==='magnet:'?'Magnet':esc(new URL(url).hostname)} · ${k+1}</button>`).join('')}${localButtons(feedId(f.url,g.title))}</div>`)}
if(d.link){const [i,j,k]=d.link.split(':').map(Number),url=state.feeds[i].entries[j].urls[k];await openDownload(url);$('#modal').close();status(new URL(url).protocol==='magnet:'?'Magnet link sent to your torrent client':'Download requested')}
if(d.pick&&await desktop.pick(d.pick))status('Executable saved');
if(d.play)await playGame(d.play,state.launchProfiles[d.play]?.find(p=>p.primary)?.args||[])
}catch(err){status(err.message);if($('#modal').open){let p=$('#launch-error');if(!p){p=document.createElement('p');p.id='launch-error';p.setAttribute('role','alert');$('#modal-content').append(p)}p.textContent=err.message}}});
function renderDownloads(){
  const host=$('#desktop-downloads');if(!host)return;
  host.innerHTML=downloads.map(j=>{
    const actions={queued:['cancel'],downloading:['pause','cancel'],paused:[...(j.resumable?['resume']:[]),'cancel'],interrupted:[...(j.resumable?['resume']:[]),'cancel'],failed:['retry','remove'],cancelled:['retry','remove'],completed:['remove']}[j.state]||[];
    const pct=j.total?Math.min(100,Math.round(j.received/j.total*100)):0;
    return `<div class="panel"><div class="row"><strong>${esc(j.name||new URL(j.url).hostname)}</strong><span class="muted">${esc(j.state)}${j.total?' · '+pct+'%':''}</span></div>${j.total?`<progress value="${pct}" max="100" aria-label="Download progress"></progress>`:''}<div class="row source-actions">${actions.map(op=>`<button class="pill" data-download-id="${j.id}" data-download-op="${op}">${op}</button>`).join('')}</div></div>`;
  }).join('')||'<div class="panel">No downloads in this session.</div>';
}
function applyDownloads(jobs){downloads=jobs;renderDownloads();const j=jobs.find(x=>['starting','downloading','paused','interrupted'].includes(x.state));if(j){const pct=j.total?Math.min(100,Math.round(j.received/j.total*100)):0;$('#status-text').textContent=`${j.name||'Download'} · ${j.state}${j.total?' · '+pct+'%':''}`;$('#progress').style.width=`${pct}%`}else if(jobs.length){const last=jobs.at(-1);status(`${last.name||'Download'} · ${last.state}`)}}
document.addEventListener('click',async e=>{const b=e.target.closest('[data-download-id]');if(!b)return;try{await desktop.downloadAction(b.dataset.downloadId,b.dataset.downloadOp)}catch(err){status(err.message)}});
if(window.desktop){document.body.classList.add('desktop');desktop.onDownloads(applyDownloads);desktop.downloads().then(applyDownloads).catch(e=>status(e.message));}
render();

function libraryPage(){
  let items=state.library.map(game).filter(Boolean);
  if(libraryFilter==='favorites')items=items.filter(g=>state.favorites.includes(g.id));
  if(libraryFilter==='recent'){const ids=new Set(state.library);items=state.recent.filter(id=>ids.has(id)).map(game).filter(Boolean)}
  const selected=state.collections.find(c=>c.id===libraryFilter);if(selected)items=items.filter(g=>selected.games.includes(g.id));
  const content=state.libraryView==='list'&&items.length?`<div class="panel"><table class="library-table"><thead><tr><th scope="col">Title</th><th scope="col">Favorite</th><th scope="col">Type</th></tr></thead><tbody>${items.map(g=>`<tr><td><button class="pill" data-game="${g.id}">${esc(g.title)}</button></td><td>${state.favorites.includes(g.id)?'Yes':'No'}</td><td>${g.custom?'Local':'Catalogue'}</td></tr>`).join('')}</tbody></table></div>`:grid(items);
  return `<h1>Library</h1><div class="tabs" aria-label="Library filters">${[['all','All games'],['favorites','Favorites'],['recent','Recently played'],...state.collections.map(c=>[c.id,c.name])].map(([key,label])=>`<button class="pill ${libraryFilter===key?'active':''}" aria-pressed="${libraryFilter===key}" data-library-filter="${key}">${esc(label)}</button>`).join('')}<button class="pill" data-library-view>${state.libraryView==='list'?'Grid view':'List view'}</button><button class="primary surprise" data-add-game>Add game</button><button class="pill" data-new-collection>New collection</button>${selected?`<button class="pill" data-delete-collection="${selected.id}">Delete collection</button>`:''}</div>${content}`;
}
function gameForm(id){const g=id?game(id):null;modal(`<h2>${g?'Rename game':'Add a game'}</h2><p>${g?'Change the display name without changing the executable binding.':'Add a local game to your library. In the Windows app you can then choose its executable.'}</p><form id="game-form" class="row" data-id="${g?.id||''}"><label for="game-title">Game title</label><input id="game-title" name="title" required maxlength="120" value="${esc(g?.title||'')}"><button class="primary">Save game</button><p id="game-error" role="alert"></p></form>`);$('#game-title').focus()}
document.addEventListener('click',e=>{const d=e.target.closest('button')?.dataset;if(!d)return;
  if(d.libraryFilter){libraryFilter=d.libraryFilter;render()}
  if(d.libraryView!==undefined){state.libraryView=state.libraryView==='list'?'grid':'list';save();render()}
  if(d.addGame!==undefined)gameForm();
  if(d.editGame)gameForm(d.editGame);
  if(d.favorite){const id=d.favorite;state.favorites=state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id];if(state.favorites.includes(id)&&!state.library.includes(id))state.library.push(id);save();render();details(id)}
});
document.addEventListener('submit',e=>{if(e.target.id!=='game-form')return;e.preventDefault();const title=String(new FormData(e.target).get('title')).trim(),id=e.target.dataset.id;
  if(!title){$('#game-error').textContent='Enter a game title.';return}
  if(id){const g=game(id);if(g?.custom)g.title=title;save();render();details(id);return}
  const newId='custom-'+crypto.randomUUID();state.customGames.push({id:newId,title,custom:true});state.library.push(newId);save();libraryFilter='all';go('Library');details(newId);
});

async function playGame(id,args){
  await desktop.play(id,args);
  if(game(id)){state.recent=[id,...state.recent.filter(x=>x!==id)].slice(0,20);save();render()}
  status('Game started');$('#modal').close();
}
function collectionForm(){modal(`<h2>New collection</h2><form id="collection-form" class="row"><label for="collection-name">Name</label><input id="collection-name" name="name" maxlength="60" required><button class="primary">Create</button><p role="alert" id="collection-error"></p></form>`)}
function collectionMembership(id){modal(`<h2>Collections · ${esc(game(id).title)}</h2>${state.collections.length?state.collections.map(c=>`<label class="panel row"><input type="checkbox" data-collection="${c.id}" data-member="${id}" ${c.games.includes(id)?'checked':''}>${esc(c.name)}</label>`).join(''):'<p>Create a collection in Library first.</p>'}`)}
function profileSettings(id){
  const entries=state.launchProfiles[id]||[];
  modal(`<h2>Launch profiles</h2><p>Each line is one argument. Profiles use the selected game executable.</p>${entries.map((p,i)=>`<div class="panel row"><strong>${esc(p.name)}</strong><button class="primary" data-profile-action="run" data-profile-game="${id}" data-profile-index="${i}">Run</button><button class="pill" data-profile-action="default" data-profile-game="${id}" data-profile-index="${i}">${p.primary?'Clear default':'Make default'}</button><button class="pill" data-profile-action="delete" data-profile-game="${id}" data-profile-index="${i}">Delete</button></div>`).join('')}<form id="profile-form" data-game="${id}"><label for="profile-name">Profile name</label><input id="profile-name" name="name" maxlength="60" required><label for="profile-args">Arguments</label><textarea id="profile-args" name="args" rows="4" maxlength="16000"></textarea><button class="primary">Add profile</button><p role="alert" id="profile-error"></p></form>`);
}
document.addEventListener('click',async e=>{const d=e.target.closest('button')?.dataset;if(!d)return;
  if(d.newCollection!==undefined)collectionForm();
  if(d.deleteCollection&&confirm('Delete this collection? No games or files will be removed.')){state.collections=state.collections.filter(c=>c.id!==d.deleteCollection);libraryFilter='all';save();render()}
  if(d.collectGame)collectionMembership(d.collectGame);
  if(d.profiles)profileSettings(d.profiles);
  if(d.profileAction){const id=d.profileGame,list=state.launchProfiles[id],i=Number(d.profileIndex),p=list?.[i];if(!p)return;
    if(d.profileAction==='run'){try{await playGame(id,p.args)}catch(err){status(err.message);if($('#profile-error'))$('#profile-error').textContent=err.message}return}
    if(d.profileAction==='delete')list.splice(i,1);
    if(d.profileAction==='default'){const enabled=!p.primary;list.forEach((entry,j)=>entry.primary=enabled&&j===i)}
    save();profileSettings(id);
  }
});
document.addEventListener('change',e=>{const {collection,member}=e.target.dataset;if(!collection||!member)return;const c=state.collections.find(item=>item.id===collection);if(!c)return;c.games=c.games.filter(id=>id!==member);if(e.target.checked)c.games.push(member);save();render()});
document.addEventListener('submit',e=>{
  const form=e.target;if(!['collection-form','profile-form'].includes(form.id))return;e.preventDefault();const data=new FormData(form),name=String(data.get('name')).trim();
  if(form.id==='collection-form'){
    if(!name||state.collections.some(c=>c.name.toLowerCase()===name.toLowerCase())){$('#collection-error').textContent='Enter a unique collection name.';return}
    const id='collection-'+crypto.randomUUID();state.collections.push({id,name,games:[]});save();libraryFilter=id;$('#modal').close();go('Library');return;
  }
  const id=form.dataset.game,args=String(data.get('args')).split(/\r?\n/).filter(arg=>arg.length>0),list=state.launchProfiles[id]||[];
  if(!name||list.some(p=>p.name.toLowerCase()===name.toLowerCase())||args.length>64||args.some(arg=>arg.length>2048||/[\0\r\n]/.test(arg))){$('#profile-error').textContent='Use a unique name and up to 64 valid argument lines.';return}
  state.launchProfiles[id]=[...list,{name,args,primary:false}];save();profileSettings(id);
});

document.addEventListener('input',e=>{if(e.target.id!=='source-search')return;const q=e.target.value.trim().toLowerCase();document.querySelectorAll('.source-entry').forEach(el=>el.hidden=!el.dataset.sourceText.includes(q))});
document.addEventListener('submit',e=>{
  const form=e.target;if(!['feed-batch','feed-timeout','feed-meta'].includes(form.id))return;e.preventDefault();const input=new FormData(form);
  if(form.id==='feed-timeout'){const seconds=Number(input.get('seconds'));if(Number.isInteger(seconds)&&seconds>=5&&seconds<=120){state.feedTimeout=seconds;save();feedMessage('Timeout saved')}return}
  if(form.id==='feed-meta'){const index=Number(form.dataset.index);try{setFeeds(state.feeds.map((f,i)=>i===index?{...f,label:String(input.get('label')).trim(),tags:[...new Set(String(input.get('tags')).split(',').map(x=>x.trim()).filter(Boolean))].slice(0,12)}:f));$('#modal').close()}catch(err){feedMessage(err.message)}return}
  sourceAction(async()=>{
    const raw=String(input.get('urls')).split(/\r?\n/).map(url=>url.trim()).filter(Boolean);if(raw.length>20)throw Error('Import at most 20 URLs at a time.');
    const unique=new Set(),errors=[];for(const value of raw){try{const url=new URL(value);if(!['https:','http:'].includes(url.protocol)||url.username||url.password)throw Error();url.hash='';unique.add(url.href)}catch{errors.push('Invalid URL: '+value.slice(0,120))}}
    const results=[];
    for(const url of unique){try{results.push({...await desktop.feed(url,state.feedTimeout),url,updatedAt:Date.now()})}catch(err){errors.push(`${new URL(url).hostname}: ${err.message}`)}}
    if(!results.length)throw Error(errors[0]||'No URLs provided.');
    pendingFeed=results;modal(`<h2>Batch source preview</h2><ul>${results.map(f=>`<li>${esc(f.name)} · ${f.entries.length} entries</li>`).join('')}</ul>${errors.length?`<p>${errors.length} failed:</p><ul>${errors.slice(0,5).map(error=>`<li>${esc(error)}</li>`).join('')}</ul>`:''}<button class="primary" data-feed-confirm>Import successful sources</button>`);feedMessage(`${results.length} source(s) ready`);
  });
});
document.addEventListener('click',async e=>{const d=e.target.closest('button')?.dataset;if(!d)return;try{
  if(d.feedMeta!==undefined){const f=state.feeds[Number(d.feedMeta)];modal(`<h2>Edit source</h2><form id="feed-meta" class="row" data-index="${d.feedMeta}"><label for="source-label">Display name</label><input id="source-label" name="label" maxlength="100" value="${esc(f.label||'')}" placeholder="${esc(f.name)}"><label for="source-tags">Tags (comma separated)</label><input id="source-tags" name="tags" maxlength="240" value="${esc((f.tags||[]).join(', '))}"><button class="primary">Save</button></form>`)}
  if(d.feedCopy!==undefined){await navigator.clipboard.writeText(state.feeds[Number(d.feedCopy)].url);feedMessage('URL copied')}
  if(d.feedExport!==undefined){const urls=state.feeds.filter(f=>!f.local).map(f=>f.url);if(!urls.length){feedMessage('No URLs to export');return}const object=URL.createObjectURL(new Blob([urls.join('\n')+'\n'],{type:'text/plain'}));const a=document.createElement('a');a.href=object;a.download='byazen-sources.txt';a.click();setTimeout(()=>URL.revokeObjectURL(object),1000);feedMessage('URL list exported')}
}catch(err){feedMessage(err.message)}});

function validStart(start){return ['Home','Catalogue','Library','Downloads','Sources','Settings'].includes(start)?start:'Home'}
function themes(){return themeWorlds.flatMap(([world,image,hue],i)=>themeMoods.map((mood,j)=>({id:`scene-${i}-${j}`,name:`${world} · ${mood}`,image,hue:(hue+j*13)%360,lightness:8+(j%3)*2})));}
function applyAppearance(appearance=state.appearance){
  const root=document.documentElement;for(const key of ['theme','accent','zoom','motion'])root.dataset[key]=appearance[key];
  const scene=themes().find(t=>t.id===appearance.theme);
  if(scene){root.style.setProperty('--scene-image',`url("assets/${scene.image}.webp")`);root.style.setProperty('--scene-hue',scene.hue);root.style.setProperty('--scene-lightness',`${scene.lightness}%`);root.dataset.scene='true'}
  else{root.style.removeProperty('--scene-image');root.style.removeProperty('--scene-hue');root.style.removeProperty('--scene-lightness');delete root.dataset.scene}
}
function appearanceForm(){
  const options={accent:{mint:'Mint',blue:'Blue',rose:'Rose',amber:'Amber'},zoom:{normal:'Normal',large:'Large',largest:'Extra large'},motion:{system:'Follow system',reduced:'Reduce motion'},start:{Home:'Home',Catalogue:'Catalogue',Library:'Library',Downloads:'Downloads',Sources:'Sources',Settings:'Settings'}};
  const labels={accent:'Accent color',zoom:'Text size',motion:'Animations',start:'Startup page'};
  const basic=[['dark','Dark'],['light','Light'],['oled','OLED'],['system','Follow system']];
  const tile=(value,label,scene)=>`<label class="theme-tile ${scene?'scene-tile':''}" ${scene?`style="--tile-image:url('assets/${scene.image}.webp');--tile-hue:${scene.hue}"`:''}><input type="radio" name="theme" value="${value}" ${state.appearance.theme===value?'checked':''}><span class="theme-preview ${scene?'':'preview-'+value}"><span class="preview-window"><i></i><i></i><i></i></span></span><span class="theme-name">${esc(label)}</span><span class="theme-check" aria-hidden="true">✓</span></label>`;
  return `<form id="appearance-form" class="panel appearance-panel"><div class="appearance-intro"><div><span class="eyebrow">MAKE IT YOURS</span><h2>Appearance</h2><p>Choose a world and make your launcher feel like home.</p></div><span class="theme-count">100 SCENE THEMES</span></div><h3>Classic themes</h3><div class="theme-grid classic-themes">${basic.map(([value,label])=>tile(value,label)).join('')}</div><div class="theme-section-head"><div><h3>Explore worlds</h3><p class="muted">100 atmospheres, artwork and ambient effects</p></div></div><div class="theme-gallery">${themes().map(t=>tile(t.id,t.name,t)).join('')}</div><div class="appearance-controls">${Object.entries(options).map(([key,values])=>`<fieldset class="appearance-choice"><legend>${labels[key]}</legend><div class="choice-options">${Object.entries(values).map(([value,label])=>`<label><input type="radio" name="${key}" value="${value}" ${state.appearance[key]===value?'checked':''}><span>${esc(label)}</span></label>`).join('')}</div></fieldset>`).join('')}</div><div class="row appearance-actions"><button class="primary">Save appearance</button><button class="pill" type="button" id="reset-appearance">Reset</button></div></form>`;
}
document.addEventListener('change',e=>{if(e.target.matches('#appearance-form input[name="theme"]'))applyAppearance({...state.appearance,theme:e.target.value})});
document.addEventListener('submit',e=>{if(e.target.id!=='appearance-form')return;e.preventDefault();state.appearance=Object.fromEntries(new FormData(e.target));save();applyAppearance();status('Appearance saved');render()});
document.addEventListener('click',e=>{if(!e.target.closest('#reset-appearance'))return;state.appearance={...defaults.appearance};save();applyAppearance();render();status('Appearance reset')});
function updateOnline(){const badge=$('#offline');badge.hidden=navigator.onLine}
window.addEventListener('offline',updateOnline);window.addEventListener('online',updateOnline);applyAppearance();updateOnline();

async function showSaves(id){
  const {folder,items}=await desktop.listSaves(id);
  modal(`<h2>Save backups</h2><p>${folder?esc(folder):'No saves folder selected.'}</p><div class="row"><button class="pill" data-saves-bind="${id}">Choose folder</button>${folder?`<button class="primary" data-saves-create="${id}">Create backup</button>`:''}</div><p id="backup-status" role="status"></p>${items.map(b=>`<div class="panel row"><strong>${esc(new Date(b.createdAt).toLocaleString())}</strong><span class="muted">${b.files} files · ${Math.round(b.bytes/1024)} KB</span><button class="pill" data-saves-restore="${id}" data-backup="${esc(b.id)}">Restore to new folder</button></div>`).join('')||'<p>No backups yet.</p>'}`);
}
document.addEventListener('click',async e=>{const button=e.target.closest('button'),d=button?.dataset;if(!d||!(d.saves||d.savesBind||d.savesCreate||d.savesRestore))return;button.disabled=true;
  try{
    if(d.saves)await showSaves(d.saves);
    if(d.savesBind&&await desktop.bindSaves(d.savesBind))await showSaves(d.savesBind);
    if(d.savesCreate){$('#backup-status').textContent='Creating backup…';await desktop.backupSaves(d.savesCreate);await showSaves(d.savesCreate);$('#backup-status').textContent='Backup created.'}
    if(d.savesRestore){const restored=await desktop.restoreSaves(d.savesRestore,d.backup);if(restored&&$('#backup-status'))$('#backup-status').textContent='Restored to '+restored}
  }catch(err){status(err.message);if($('#backup-status'))$('#backup-status').textContent=err.message}finally{button.disabled=false}
});
