// Add/replace a PNG pHYs chunk. 300 DPI = 11811 pixels per metre (rounded).
export function crc32(bytes) {
  let crc = 0xffffffff;
  for (const b of bytes) {
    crc ^= b;
    for (let i=0;i<8;i++) crc = (crc>>>1) ^ (crc&1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff)>>>0;
}
export function withDpi(input, dpi=300) {
  const bytes = new Uint8Array(input);
  if (bytes.length<20 || bytes[0]!==137 || bytes[1]!==80) throw new Error('Invalid PNG');
  const chunk = new Uint8Array(21), view = new DataView(chunk.buffer);
  view.setUint32(0,9);
  chunk.set([112,72,89,115],4);
  const ppm = Math.round(dpi/0.0254);
  view.setUint32(8,ppm); view.setUint32(12,ppm); chunk[16]=1;
  view.setUint32(17,crc32(chunk.slice(4,17)));
  const parts=[bytes.slice(0,8)]; let added=false;
  for(let at=8;at<bytes.length;) {
    if(at+12>bytes.length) throw new Error('Truncated PNG');
    const length=new DataView(bytes.buffer,bytes.byteOffset+at,4).getUint32(0);
    const end=at+length+12;
    if(end>bytes.length) throw new Error('Truncated PNG');
    const type=String.fromCharCode(...bytes.slice(at+4,at+8));
    if(type==='IDAT'&&!added){parts.push(chunk);added=true;}
    if(type!=='pHYs')parts.push(bytes.slice(at,end));
    at=end;
  }
  if(!added)throw new Error('PNG has no image data');
  const output = new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let at=0;
  for(const p of parts){output.set(p,at);at+=p.length;}
  return output;
}
