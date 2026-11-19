function normalizeFeed(feed){
  if(!Array.isArray(feed?.downloads))throw new Error('Expected a Hydra JSON source with a downloads array.');
  const entries=[];
  for(const item of feed.downloads.slice(0,50000)){
    if(typeof item?.title!=='string'||!item.title.trim()||!Array.isArray(item.uris))continue;
    const urls=[...new Set(item.uris.slice(0,20).filter(url=>typeof url==='string'&&url.length<=8192&&(/^(https?:\/\/|magnet:\?xt=)/i.test(url))).filter(url=>{try{return !new URL(url).username&&!new URL(url).password}catch{return false}}))];
    if(urls.length)entries.push({title:item.title.trim().slice(0,250),urls});
  }
  if(!entries.length)throw new Error('No supported links found in this source.');
  return {name:typeof feed.name==='string'?feed.name.slice(0,100):'Hydra source',entries};
}
module.exports={normalizeFeed};
