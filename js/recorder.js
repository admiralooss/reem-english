window.ReemRecorder=(function(){
  let stream=null, mediaRecorder=null, chunks=[], mode=null;
  let audioContext=null, source=null, processor=null, gain=null, pcmChunks=[], sampleRate=44100;
  let autoTimer=null;

  function supported(){
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
  function stopTracks(){
    if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}
  }
  function pickMime(){
    if(!window.MediaRecorder)return "";
    const types=["audio/mp4","audio/webm;codecs=opus","audio/webm","audio/ogg;codecs=opus"];
    return types.find(t=>MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t))||"";
  }
  async function start(){
    if(!supported())throw new Error("MIC_UNSUPPORTED");
    if(!window.isSecureContext)throw new Error("NOT_SECURE");
    stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
    chunks=[];pcmChunks=[];
    if(window.MediaRecorder){
      try{
        const mime=pickMime();
        mediaRecorder=mime?new MediaRecorder(stream,{mimeType:mime}):new MediaRecorder(stream);
        mode="media";
        mediaRecorder.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data);};
        mediaRecorder.start(250);
        autoTimer=setTimeout(()=>{if(isRecording())stop().then(()=>{}).catch(()=>{})},10000);
        return true;
      }catch(e){}
    }

    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC){stopTracks();throw new Error("RECORDER_UNSUPPORTED");}
    audioContext=new AC();
    await audioContext.resume();
    sampleRate=audioContext.sampleRate;
    source=audioContext.createMediaStreamSource(stream);
    processor=audioContext.createScriptProcessor(4096,1,1);
    gain=audioContext.createGain();
    gain.gain.value=0;
    processor.onaudioprocess=e=>{
      const input=e.inputBuffer.getChannelData(0);
      pcmChunks.push(new Float32Array(input));
    };
    source.connect(processor);
    processor.connect(gain);
    gain.connect(audioContext.destination);
    mode="wav";
    autoTimer=setTimeout(()=>{if(isRecording())stop().then(()=>{}).catch(()=>{})},10000);
    return true;
  }
  function isRecording(){
    if(mode==="media")return !!mediaRecorder && mediaRecorder.state==="recording";
    return mode==="wav";
  }
  function mergeFloat32(list){
    let len=0;list.forEach(a=>len+=a.length);
    const out=new Float32Array(len);let off=0;
    list.forEach(a=>{out.set(a,off);off+=a.length;});return out;
  }
  function wavBlob(samples,rate){
    const buffer=new ArrayBuffer(44+samples.length*2),view=new DataView(buffer);
    const write=(off,s)=>{for(let i=0;i<s.length;i++)view.setUint8(off+i,s.charCodeAt(i));};
    write(0,"RIFF");view.setUint32(4,36+samples.length*2,true);write(8,"WAVE");
    write(12,"fmt ");view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,1,true);
    view.setUint32(24,rate,true);view.setUint32(28,rate*2,true);view.setUint16(32,2,true);view.setUint16(34,16,true);
    write(36,"data");view.setUint32(40,samples.length*2,true);
    let o=44;for(let i=0;i<samples.length;i++){const s=Math.max(-1,Math.min(1,samples[i]));view.setInt16(o,s<0?s*0x8000:s*0x7fff,true);o+=2;}
    return new Blob([view],{type:"audio/wav"});
  }
  async function stop(){
    if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}
    if(mode==="media" && mediaRecorder){
      const rec=mediaRecorder;
      const result=await new Promise((resolve,reject)=>{
        rec.onstop=()=>{
          try{
            const type=rec.mimeType||"audio/mp4";
            resolve(new Blob(chunks,{type}));
          }catch(e){reject(e);}
        };
        try{rec.stop();}catch(e){reject(e);}
      });
      mediaRecorder=null;mode=null;stopTracks();
      return {blob:result,url:URL.createObjectURL(result)};
    }
    if(mode==="wav"){
      mode=null;
      try{processor&&processor.disconnect();}catch(e){}
      try{source&&source.disconnect();}catch(e){}
      try{gain&&gain.disconnect();}catch(e){}
      const samples=mergeFloat32(pcmChunks);
      const blob=wavBlob(samples,sampleRate);
      try{audioContext&&await audioContext.close();}catch(e){}
      processor=source=gain=audioContext=null;stopTracks();
      return {blob,url:URL.createObjectURL(blob)};
    }
    throw new Error("NOT_RECORDING");
  }
  function cancel(){
    if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}
    try{if(mediaRecorder&&mediaRecorder.state==="recording")mediaRecorder.stop();}catch(e){}
    try{processor&&processor.disconnect();}catch(e){}
    try{audioContext&&audioContext.close();}catch(e){}
    mediaRecorder=processor=source=gain=audioContext=null;mode=null;chunks=[];pcmChunks=[];stopTracks();
  }
  return {supported,start,stop,cancel,isRecording};
})();