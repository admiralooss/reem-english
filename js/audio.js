window.ReemAudio=(function(){
  let voices=[];
  let currentAudio=null;

  const wordMap={
    "wake up":"wake-up",
    "bed":"bed",
    "bathroom":"bathroom",
    "shower":"shower",
    "wash":"wash",
    "toothbrush":"toothbrush",
    "clothes":"clothes",
    "breakfast":"breakfast",
    "water":"water",
    "ready":"ready",
    "alarm":"alarm",
    "face":"face",
    "toothpaste":"toothpaste",
    "towel":"towel",
    "mirror":"mirror",
    "hair":"hair",
    "brush":"brush",
    "get dressed":"get-dressed",
    "coffee":"coffee",
    "shoes":"shoes",
    "appointment":"appointment",
    "available":"available",
    "receipt":"receipt",
    "change":"change",
    "queue":"queue",
    "cashier":"cashier",
    "entrance":"entrance",
    "exit":"exit",
    "elevator":"elevator",
    "intersection":"intersection",
    "traffic":"traffic",
    "shortcut":"shortcut",
    "pharmacy":"pharmacy",
    "grocery":"grocery",
    "aisle":"aisle",
    "wallet":"wallet",
    "reservation":"reservation",
    "delivery":"delivery",
    "refund":"refund",
    "crowded":"crowded",
    "schedule":"schedule",
    "counter":"counter",
    "package":"package",
    "parking":"parking",
    "address":"address",
    "nearby":"nearby",
    "delayed":"delayed",
    "pickup":"pickup",
    "exchange":"exchange",
    "confirm":"confirm",
    "cancel":"cancel",
    "reschedule":"reschedule",
    "location":"location",
    "directions":"directions",
    "upstairs":"upstairs",
    "downstairs":"downstairs",
    "checkout":"checkout",
    "contactless":"contactless",
    "out of stock":"out-of-stock",
    "return":"return",
    "actually":"actually",
    "probably":"probably",
    "anyway":"anyway",
    "exactly":"exactly",
    "seriously":"seriously",
    "by the way":"by-the-way",
    "no worries":"no-worries",
    "hang on":"hang-on",
    "sounds good":"sounds-good",
    "i guess":"i-guess"
  };

  function clean(text){
    return String(text||"").trim().toLowerCase().replace(/[.!?,]/g,"").replace(/\s+/g," ");
  }
  function refresh(){
    try{voices=window.speechSynthesis?window.speechSynthesis.getVoices()||[]:[]}catch(e){voices=[]}
  }
  if("speechSynthesis" in window){
    refresh();
    try{window.speechSynthesis.onvoiceschanged=refresh}catch(e){}
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
      return s;
    }
    return voices.filter(v=>/^en/i.test(String(v.lang||""))).sort((a,b)=>score(b)-score(a))[0]||null;
  }
  function nativeSpeak(text,slow){
    if(!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance==="undefined")return false;
    try{
      speechSynthesis.cancel();
      const u=new SpeechSynthesisUtterance(String(text||""));
      u.lang="en-US";u.rate=slow?0.62:0.9;u.pitch=1.02;u.volume=1;
      const v=bestVoice();if(v)u.voice=v;
      speechSynthesis.speak(u);
      return true;
    }catch(e){return false}
  }
  function stop(){
    try{if(currentAudio){currentAudio.pause();currentAudio.currentTime=0}}catch(e){}
    currentAudio=null;
    try{if(window.speechSynthesis)speechSynthesis.cancel()}catch(e){}
  }
  function speak(text,slow=false){
    stop();
    const key=wordMap[clean(text)];
    if(!key)return nativeSpeak(text,slow);

    const src=new URL("./audio/words/"+key+(slow?"-slow":"")+".mp3?v=voice-dailytalk1-1",document.baseURI).href;
    try{
      const a=new Audio();
      currentAudio=a;
      a.preload="auto";
      a.src=src;
      a.volume=1;
      a.playsInline=true;
      let fellBack=false;
      const fallback=()=>{
        if(fellBack)return;fellBack=true;
        nativeSpeak(text,slow);
      };
      a.onerror=fallback;
      const p=a.play();
      if(p&&typeof p.catch==="function")p.catch(fallback);
      return true;
    }catch(e){
      return nativeSpeak(text,slow);
    }
  }
  return {speak,stop,bestVoice};
})();