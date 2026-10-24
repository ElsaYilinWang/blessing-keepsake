import {test} from 'node:test';
import assert from 'node:assert/strict';
import {crc32,withDpi} from '../web/png-dpi.mjs';
function chunk(type,data){
  const b=new Uint8Array(12+data.length),v=new DataView(b.buffer);v.setUint32(0,data.length);
  b.set(new TextEncoder().encode(type),4);b.set(data,8);
  v.setUint32(8+data.length,crc32(b.slice(4,8+data.length)));return b;
}
test('print metadata is 300 DPI with valid CRC; replacing does not duplicate',()=>{
  const signature=Uint8Array.from([137,80,78,71,13,10,26,10]);
  const parts=[signature,chunk('IHDR',new Uint8Array(13)),chunk('IDAT',new Uint8Array([0])),chunk('IEND',new Uint8Array())];
  const bytes=new Uint8Array(parts.reduce((s,b)=>s+b.length,0));let at=0;for(const p of parts){bytes.set(p,at);at+=p.length;}
  const result=withDpi(withDpi(bytes.buffer).buffer);let count=0;
  for(let i=8;i<result.length;){
    const v=new DataView(result.buffer),len=v.getUint32(i),name=new TextDecoder().decode(result.slice(i+4,i+8));
    if(name==='pHYs'){
      count++;assert.equal(v.getUint32(i+8),11811);assert.equal(v.getUint32(i+12),11811);
      assert.equal(result[i+16],1);assert.equal(v.getUint32(i+17),crc32(result.slice(i+4,i+17)));
    }i+=len+12;
  }
  assert.equal(count,1);
});
test('invalid PNG fails',()=>assert.throws(()=>withDpi(new Uint8Array(20))));
