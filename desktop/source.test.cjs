const {test}=require('node:test');
const assert=require('node:assert/strict');
const {normalizeFeed}=require('./source.cjs');
test('Hydra feed imports HTTP and magnet links, skips unsupported and duplicate URLs',()=>{
 const magnet='magnet:?xt=urn:btih:0123456789012345678901234567890123456789';
 assert.deepEqual(normalizeFeed({name:'Example',downloads:[null,{title:' Game ',uris:['file:///C:/bad.exe','https://user:pass@example.org','https://example.org/game.zip',magnet,magnet]}]}),{name:'Example',entries:[{title:'Game',urls:['https://example.org/game.zip',magnet]}]});
});
test('invalid schema and empty feeds fail clearly',()=>{
 assert.throws(()=>normalizeFeed({}),/downloads array/);
 assert.throws(()=>normalizeFeed({downloads:[{title:'Game',uris:['javascript:alert(1)']}]}),/No supported links/);
});
