import {withDpi} from './png-dpi.mjs';
const $=id=>document.getElementById(id);
const card=$('card'), context=card.getContext('2d');
const inputs=['names','blessing','context','footer','layout','orientation'];
let images=[], example=null, renderOK=false, loading=false, generation=0;
const BG='#f6f1e8', INK='#51483e';
function notice(message,error=false){$('status').textContent=message;$('status').classList.toggle('error',error);}
function downloads(){for(const id of ['print','preview','wallpaper'])$(id).disabled=loading||!renderOK||!$('consent').checked;}
function wrap(ctx,text,width){
  const lines=[];
  for(const paragraph of text.split('\n')){
    let line='';
    for(const word of paragraph.split(/\s+/).filter(Boolean)){
      const next=(line+' '+word).trim();
      if(ctx.measureText(next).width>width){
        if(!line) return null;
        lines.push(line);line=word;
        if(ctx.measureText(line).width>width)return null;
      } else line=next;
    }lines.push(line);
  }return lines;
}
function textBox(text,x,y,w,h,max,min){
  if(!text.trim())return;
  for(let size=max;size>=min;size--){
    context.font=size+'px Georgia, serif';
    const lines=wrap(context,text,w), spacing=Math.ceil(size*1.38);
    if(lines&&lines.length*spacing<=h){
      context.fillStyle=INK;context.textAlign='center';context.textBaseline='top';
      lines.forEach((line,i)=>context.fillText(line,x+w/2,y+(h-lines.length*spacing)/2+i*spacing));
      return;
    }
  }throw new Error('Some text is too long to fit clearly. Please shorten it.');
}
function drawArt(im,x,y,w,h){
  const scale=Math.min(w/im.width,h/im.height);
  const dw=im.width*scale,dh=im.height*scale;
  context.drawImage(im,x+(w-dw)/2,y+(h-dh)/2,dw,dh);
  return scale>1.05;
}
function render(){
  renderOK=false;
  try{
    const landscape=$('orientation').value==='landscape';
    card.width=landscape?1772:1181;card.height=landscape?1181:1772;
    card.classList.toggle('landscape',landscape);
    const w=card.width,h=card.height,m=64,inner=w-2*m;
    $('sizeLabel').textContent='10 × 15 cm · '+(landscape?'landscape':'portrait');
    context.fillStyle=BG;context.fillRect(0,0,w,h);
    context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';
    for(const field of ['names','blessing','context'])if(!$(field).value.trim())throw new Error('Please add '+field+'.');
    textBox($('names').value,m,h*.045,inner,h*.085,46,26);
    const count=$('layout').value==='four'?4:1,cols=count===4?2:1,gap=24;
    const cw=(inner-gap*(cols-1))/cols,ch=(h*.51-gap*(cols-1))/cols;
    const art=images.length?images:(example?Array(count).fill(example):[]);
    let soft=false;
    art.slice(0,count).forEach((im,i)=>{soft=drawArt(im,m+(i%cols)*(cw+gap),h*.16+Math.floor(i/cols)*(ch+gap),cw,ch)||soft;});
    textBox($('blessing').value,m,h*.705,inner,h*.115,38,24);
    textBox($('context').value,m,h*.83,inner,h*.085,26,19);
    textBox($('footer').value,m,h*.93,inner,h*.035,20,16);
    if(images.length&&images.length!==count)throw new Error('Choose exactly '+count+' image'+(count>1?'s':'')+' for this layout.');
    renderOK=art.length===count;
    if(soft)notice('Ready. The source image is small, so check a test print for softness.');
    else notice(images.length?'Ready when you are. Check the details, then tick the permission box.':'Showing example artwork. Add your own illustration when ready.');
  }catch(error){notice(error.message,true);}
  downloads();
}
function canvasBlob(canvas,type='image/png'){return new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('Could not export this image.')),type,.94));}
function decode(file){return new Promise((resolve,reject)=>{
  const url=URL.createObjectURL(file),img=new Image();
  img.onload=()=>{URL.revokeObjectURL(url);resolve(img);};
  img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error('Could not read an image. Try a PNG or JPEG.'));};
  img.src=url;
});}
$('images').addEventListener('change',async()=>{
  const ticket=++generation,files=[...$('images').files];
  renderOK=false;downloads();
  $('consent').checked=false;
  const count=$('layout').value==='four'?4:1;
  if(files.length!==count){notice('Please select exactly '+count+' image'+(count>1?'s':'')+'.',true);return;}
  loading=true;downloads();notice('Opening your images locally…');
  try{
    for(const f of files){
      if(!['image/png','image/jpeg','image/webp'].includes(f.type))throw new Error('Use PNG, JPEG or WebP images.');
      if(f.size>20*1024*1024)throw new Error('Each image must be smaller than 20 MB.');
    }
    const decoded=[];
    for(const f of files){
      const im=await decode(f);
      if(im.width*im.height>40000000)throw new Error('An image is too large. Resize it below 40 megapixels.');
      decoded.push(im);
    }
    if(ticket!==generation)return;
    images=decoded;$('imageList').textContent=files.map((f,i)=>(i+1)+'. '+f.name).join(' · ');
    loading=false;render();
  }catch(error){if(ticket===generation){loading=false;notice(error.message,true);downloads();}}
});
for(const id of inputs)$(id).addEventListener('input',()=>{
  $('consent').checked=false;
  if(id==='layout')$('uploadHint').textContent='Choose '+($('layout').value==='four'?'4 images':'1 image')+' · PNG, JPEG or WebP';
  render();
});
$('consent').addEventListener('change',downloads);
$('copy').addEventListener('click',async()=>{
  try{await navigator.clipboard.writeText($('prompt').textContent);$('copy').textContent='Copied';}
  catch{notice('Select the illustration brief text and copy it manually.');}
});
async function save(target){
  if(!renderOK||loading||!$('consent').checked)return;
  try{
    let canvas=card,name='print-10x15.png',type='image/png';
    if(target==='preview'){
      canvas=document.createElement('canvas');
      const scale=900/Math.max(card.width,card.height);
      canvas.width=Math.round(card.width*scale);canvas.height=Math.round(card.height*scale);
      canvas.getContext('2d').drawImage(card,0,0,canvas.width,canvas.height);
      name='keepsake-preview.jpg';type='image/jpeg';
    }else if(target==='wallpaper'){
      canvas=document.createElement('canvas');canvas.width=1080;canvas.height=2400;
      const ctx=canvas.getContext('2d');ctx.fillStyle=BG;ctx.fillRect(0,0,1080,2400);
      const scale=Math.min(960/card.width,1680/card.height),w=card.width*scale,h=card.height*scale;
      ctx.drawImage(card,(1080-w)/2,430+(1680-h)/2,w,h);name='keepsake-wallpaper.png';
    }
    let blob=await canvasBlob(canvas,type);
    if(target==='print')blob=new Blob([withDpi(await blob.arrayBuffer(),300)],{type:'image/png'});
    const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;
    document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
    notice('Your '+target+' file is ready. Check your browser downloads.');
  }catch(error){notice(error.message,true);}
}
for(const id of ['print','preview','wallpaper'])$(id).addEventListener('click',()=>save(id));
$('reset').addEventListener('click',()=>{
  generation++;loading=false;images=[];$('images').value='';$('imageList').textContent='';
  for(const id of ['names','blessing','context','footer'])$(id).value='';
  $('consent').checked=false;render();notice('Your images and words have been cleared. Refresh to restore the example.');
});
example=new Image();example.onload=render;example.onerror=()=>{notice('Example artwork could not load. Add your own image.');downloads();};example.src='sample.svg';
downloads();
