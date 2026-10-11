window.ReemAudio=(function(){
  let voices=[];
  function refresh(){
    try{voices=window.speechSynthesis?window.speechSynthesis.getVoices()||[]:[]}catch(e){voices=[]}
  }
  if("speechSynthesis" in window){
    refresh();
    window.speechSynthesis.onvoiceschanged=refresh;
  }
  function bestVoice(){
    refresh();
    const female=["Ava","Samantha","Allison","Susan","Zoe","Joelle","Noelle","Aria","Jenny","Emma","Michelle","Sara","Siri"];
    const male=["Alex","Fred","Tom","Aaron","Daniel","Guy","Davis","Eric","Christopher","Roger"];
    function score(v){
      let s=0,n=String(v.name||""),lang=String(v.lang||"");
      if(/^en[-_]US$/i.test(lang))s+=100;
      if(/enhanced|premium|natural|neural|siri/i.test(n))s+=30;
      female.forEach((x,i)=>{if(new RegExp(x,"i").test(n))s+=60-i});
      male.forEach(x=>{if(new RegExp(x,"i").test(n))s-=80});
      if(/google us english/i.test(n))s+=20;
      return s;
    }
    return voices.filter(v=>/^en/i.test(String(v.lang||""))).sort((a,b)=>score(b)-score(a))[0]||null;
  }
  function speak(text,slow=false){
    if(!("speechSynthesis" in window))return false;
    try{
      speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(String(text||""));
      u.lang="en-US";
      u.rate=slow?0.62:0.9;
      u.pitch=1.02;
      u.volume=1;
      const v=bestVoice();if(v)u.voice=v;
      speechSynthesis.speak(u);
      return true;
    }catch(e){return false;}
  }
  return {speak,bestVoice};
})();