const {parseDocument,DomUtils}=require('htmlparser2');
const PAGE_SIZE=25;
const allowed={type:['games','dlc','software','demos','soundtracks'],os:['','win','mac','linux'],tag:['','19','21','122','9','599','701','597','492','3859','4182','1667'],price:['','free','specials'],sort:['','Released_DESC','Name_ASC','Price_ASC','Price_DESC','Reviews_DESC'],country:['de','us','gb','ru','ua','pl','fr']};
const categories={games:'998',dlc:'21',software:'994',demos:'10',soundtracks:'990'};
function steamSearchUrl(input={}){
  if(!input||typeof input!=='object'||Array.isArray(input))throw Error('Invalid Steam search');
  const values={type:input.type??'games',os:input.os??'',tag:input.tag??'',price:input.price??'',sort:input.sort??'',country:input.country??'de'};
  for(const [k,v] of Object.entries(values))if(!allowed[k].includes(v))throw Error('Invalid Steam filter');
  const page=input.page??0;if(!Number.isSafeInteger(page)||page<0||page>100000)throw Error('Invalid Steam page');
  if(typeof (input.term??'')!=='string'||(input.term??'').length>200)throw Error('Invalid Steam search term');
  const u=new URL('https://store.steampowered.com/search/results/');
  const p=u.searchParams;p.set('query','');p.set('json','1');p.set('infinite','1');p.set('start',String(page*PAGE_SIZE));p.set('count',String(PAGE_SIZE));p.set('category1',categories[values.type]);p.set('cc',values.country);p.set('l','russian');p.set('ignore_preferences','1');
  if(input.term?.trim())p.set('term',input.term.trim());if(values.os)p.set('os',values.os);if(values.tag)p.set('tags',values.tag);if(values.sort)p.set('sort_by',values.sort);if(values.price==='free')p.set('maxprice','free');if(values.price==='specials')p.set('specials','1');
  return u.href;
}
const hasClass=(node,c)=>node.type==='tag'&&(` ${node.attribs?.class||''} `).includes(` ${c} `);
function parseSteamResponse(body){
  if(!body||typeof body.results_html!=='string'||body.results_html.length>2_000_000||!Number.isFinite(Number(body.total_count))||Number(body.total_count)<0)throw Error('Steam returned an unexpected response');
  const doc=parseDocument(body.results_html);const rows=DomUtils.findAll(n=>hasClass(n,'search_result_row'),doc.children);
  const text=node=>node?DomUtils.textContent(node).replace(/\s+/g,' ').trim().slice(0,200):'';
  const find=(row,c)=>DomUtils.findOne(n=>hasClass(n,c),row.children||[],true);
  const items=[];
  for(const row of rows){
    const href=row.attribs?.href||'';let id='';try{const u=new URL(href);if(u.hostname==='store.steampowered.com')id=u.pathname.match(/^\/app\/(\d+)(?:\/|$)/)?.[1]||''}catch{}
    const title=text(find(row,'title'));if(!id||!title)continue;
    const price=text(find(row,'discount_final_price')||find(row,'search_price'));
    items.push({id,title,price,date:text(find(row,'search_released'))});
  }
  return {total:Math.min(Number(body.total_count),Number.MAX_SAFE_INTEGER),items};
}
module.exports={steamSearchUrl,parseSteamResponse,PAGE_SIZE};
