const {test}=require('node:test');
const assert=require('node:assert/strict');
const {launchArgs}=require('./launch.cjs');
test('launch argument boundaries are preserved',()=>{
  const args=['--profile','Name with spaces','a&b'];assert.deepEqual(launchArgs(args),args);assert.notEqual(launchArgs(args),args);assert.deepEqual(launchArgs(),[]);
});
test('launch rejects non-arrays, invalid values and overlong arguments',()=>{
  for(const args of ['--flag',[123],['a\0b'],['a\nb'],['x'.repeat(2049)],Array(65).fill('x')])assert.throws(()=>launchArgs(args),/Invalid launch arguments/);
});
