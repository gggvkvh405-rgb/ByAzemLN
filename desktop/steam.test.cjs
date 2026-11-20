const {test}=require('node:test');const assert=require('node:assert/strict');
const {steamSearchUrl,parseSteamResponse}=require('./steam.cjs');
test('Steam filters construct a fixed origin and paginated query',()=>{
 const u=new URL(steamSearchUrl({term:'Portal 2',page:2,type:'games',os:'linux',tag:'19',price:'free',country:'de',sort:'Name_ASC'}));
 assert.equal(u.origin,'https://store.steampowered.com');assert.equal(u.searchParams.get('start'),'50');assert.equal(u.searchParams.get('category1'),'998');assert.equal(u.searchParams.get('maxprice'),'free');assert.equal(u.searchParams.get('os'),'linux');assert.equal(u.searchParams.get('term'),'Portal 2');
 assert.throws(()=>steamSearchUrl({os:'win&evil=1'}));assert.throws(()=>steamSearchUrl({page:-1}));assert.throws(()=>steamSearchUrl({country:'http://bad'}));
});
test('Steam results only extract safe app links and text',()=>{
 const result=parseSteamResponse({total_count:2,results_html:`<a class="search_result_row" href="https://store.steampowered.com/app/620/Portal_2/"><span class="title">Portal &amp; 2</span><div class="search_released">19 Apr, 2011</div><div class="discount_final_price">9,99 €</div></a><a class="search_result_row" href="https://evil.test/app/2/"><span class="title">bad</span></a>`});
 assert.deepEqual(result,{total:2,items:[{id:'620',title:'Portal & 2',date:'19 Apr, 2011',price:'9,99 €'}]});assert.throws(()=>parseSteamResponse({results_html:'',total_count:'NaN'}));
});
