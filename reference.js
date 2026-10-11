const A=window.REEM_ASSETS||{};
const app=document.getElementById("app");
const WORDS=[
 {id:"bed",en:"bed",ar:"سرير",ph:"بِد",example:"I sleep in my bed.",image:A.bed},
 {id:"water",en:"water",ar:"ماء",ph:"ووتر",example:"I drink water in the morning.",image:"https://loremflickr.com/720/520/glass,water?lock=21"},
 {id:"shower",en:"shower",ar:"دش",ph:"شاور",example:"I take a shower in the morning.",image:"https://loremflickr.com/720/520/shower,bathroom?lock=23"},
 {id:"wash",en:"wash",ar:"يغسل",ph:"واش",example:"I wash my face.",image:"https://loremflickr.com/720/520/washing,hands?lock=25"},
 {id:"breakfast",en:"breakfast",ar:"فطور",ph:"بريكفست",example:"I eat breakfast at home.",image:"https://loremflickr.com/720/520/breakfast?lock=27"},
 {id:"wake",en:"wake up",ar:"يستيقظ",ph:"ويك أب",example:"I wake up at six.",image:"https://loremflickr.com/720/520/alarm,clock?lock=29"}
];
const WORLDS=[
 {icon:"☀️",name:"My Day",ar:"حياتي اليومية",meta:"المستوى 1 • 50 كلمة",img:A.world1,open:true},
 {icon:"🌷",name:"My Life",ar:"حياتي والمدرسة",meta:"المستوى 2 • 50 كلمة",img:A.world2},
 {icon:"🌆",name:"Outside",ar:"خارج البيت",meta:"المستوى 3 • 50 كلمة",img:A.world3},
 {icon:"💬",name:"Talk to Me",ar:"المحادثة البسيطة",meta:"المستوى 4 • 50 كلمة",img:A.world4},
 {icon:"💼",name:"My Future",ar:"المستقبل والعمل",meta:"المستوى 5 • 50 كلمة",img:A.world5},
 {icon:"👑",name:"Confident English",ar:"الثقة في الكلام",meta:"المستوى 6 • 50 كلمة",img:A.world6}
];
const DEFAULT={xp:320,streak:12,worldProgress:17,lessonStep:1,wordIndex:0,lessonCompleted:false,readyForTeacher:false,weak:["shower"],saved:["bed"],arabicPhonetic:true,accent:"en-US"};
let state=Object.assign({},DEFAULT,JSON.parse(localStorage.getItem("reemStudentV5")||"{}"));
let recorder=null,chunks=[],recordUrl=null,gameIndex=0;
function save(){localStorage.setItem("reemStudentV5",JSON.stringify(state));}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function asset(v){return esc(v||"");}
function shell(inner,active="home",showNav=true){app.innerHTML='<main class="app"><div class="mobile-shell">'+inner+'</div>'+(showNav?nav(active):"")+'</main>';}
function topbar(title){
 return '<div class="topbar">'+
   (title?'<button class="back" onclick="historyBack()">‹</button><div class="brand-copy"><strong>'+esc(title)+'</strong></div>':'<div class="brand"><div class="brand-avatar" style="background-image:url(\''+asset(A.hero_clean)+'\')"></div><div class="brand-copy"><strong>Reem English 💗</strong><small>مغامرتك في عالم الإنجليزية</small></div></div>')+
   '<div class="top-actions">'+(!title?'<a class="round-btn" href="./teacher.html" aria-label="دخول عبدالعزيز">🔐</a>':'')+'</div></div>';
}
function nav(active){
 const items=[["home","🏠","الرئيسية","home()"],["levels","👥","مستوياتي","levels()"],["review","🧠","المراجعة","review()"],["account","👤","حسابي","account()"]];
 return '<nav class="bottom-nav">'+items.map(x=>'<button class="'+(active===x[0]?"active":"")+'" onclick="'+x[3]+'"><b>'+x[1]+'</b><small>'+x[2]+'</small></button>').join("")+'</nav>';
}
function historyBack(){if(window.__back)window.__back();else home();}
function assignedTest(){
 const id=localStorage.getItem("reemAssignedTest");
 if(!id)return null;
 const tests=JSON.parse(localStorage.getItem("reemTeacherTests")||"[]");
 return tests.find(t=>String(t.id)===String(id))||null;
}
function home(){
 window.__back=null;
 const t=assignedTest();
 shell(topbar()+
 '<div class="home-desktop"><section class="hero-card"><div class="hero-image" style="background-image:url(\''+asset(A.hero_clean)+'\')"></div><div class="home-overlay"><div class="hello-card"><h1>☀️ صباح الخير يا ريم!</h1><p>جاهزة تكملي درس اليوم؟<br>كل خطوة صغيرة تقربك من هدفك ✨</p></div><button class="cta" onclick="lesson()">▶ ابدئي درس اليوم</button></div></section>'+
 '<aside class="desktop-side">'+(t?'<div class="assigned-test"><div><b>📝 اختبار من عبدالعزيز</b><small>'+esc(t.title||"اختبار جديد")+' • '+(t.questions?.length||0)+' أسئلة</small></div><button onclick="runAssignedTest()">ابدئي</button></div>':'')+
 '<div class="stats"><div class="stat"><b>🔥 '+state.streak+'</b><small>سلسلة أيام</small></div><div class="stat"><b>⭐ '+state.xp+'</b><small>XP</small></div><div class="stat"><b>📊 '+state.worldProgress+'%</b><small>المستوى 1</small></div><div class="stat"><b>👑 '+(state.lessonCompleted?6:5)+'</b><small>إنجازات</small></div></div></aside></div>',"home");
}
function levels(){
 window.__back=home;
 shell(topbar("مستوياتي")+'<div class="score-pill" style="float:left;margin-top:-42px">⭐ '+state.xp+'</div><div class="world-list">'+WORLDS.map((w,i)=>'<button class="world-item '+(i===0?"current":"locked")+'" '+(i===0?'onclick="lesson()"':"disabled")+'><div class="world-thumb" style="background-image:url(\''+asset(w.img)+'\')"></div><div><span>'+w.icon+' '+w.name+'</span><h3>'+w.ar+'</h3><p>'+w.meta+'</p></div><div class="lock">'+(i===0?"→":"🔒")+'</div></button>').join("")+'</div>',"levels");
}
function lesson(){
 window.__back=home;
 const steps=[
  ["مراجعة سريعة","تذكّر ما تعلمته","quickReview"],
  ["كلمات جديدة","6 كلمات من صباحك","vocab"],
  ["سر النطق","صوت SH في الكلمات","phonics"],
  ["جملة / قاعدة اليوم","I + verb بطريقة بسيطة","grammar"],
  ["استخدامها","محادثة قصيرة","realUse"],
  ["لعبة تثبيت","مراجعة خفيفة بلا نجاح/رسوب","game"],
  ["مكافأة + إرسال للمدرّس","عبدالعزيز يتولى التقييم","reward"]
 ];
 shell(topbar("درس اليوم")+'<div class="lesson-layout"><section class="lesson-hero" style="--hero:url(\''+asset(A.hero_clean)+'\')"><div><small>درس اليوم</small><h1>My Morning</h1></div></section><div class="lesson-path">'+steps.map((s,i)=>{const n=i+1,done=n<state.lessonStep||state.lessonCompleted,open=n<=state.lessonStep||state.lessonCompleted;return '<button class="lesson-step '+(!open?"disabled":"")+'" '+(open?'onclick="'+s[2]+'()"':"disabled")+'><div class="step-num">'+(done?"✓":n)+'</div><div><h3>'+s[0]+'</h3><p>'+s[1]+'</p></div><div class="state">'+(done?"✅":open?"▶":"🔒")+'</div></button>';}).join("")+'</div></div>',"levels");
}
function setStep(n){state.lessonStep=Math.max(state.lessonStep,n);save();}
function quickReview(){
 window.__back=lesson;
 shell(topbar("مراجعة سريعة")+'<section class="review-page"><div class="progress"><i style="width:14%"></i></div><h2>دقيقة واحدة 🧠</h2><p style="font-size:11px;line-height:1.8;color:var(--muted)">هذا أول درس، لذلك ما عندنا مراجعة قديمة. من الدروس الجاية تظهر هنا كلمات تحتاج تثبيت فقط.</p><button class="cta" onclick="setStep(2);vocab()">ابدئي الكلمات الجديدة</button></section>',"review",false);
}
function currentWord(){return WORDS[Math.max(0,Math.min(WORDS.length-1,state.wordIndex||0))];}
function vocab(){
 window.__back=lesson; const w=currentWord();
 shell(topbar("الكلمات الجديدة")+'<section class="word-page"><div class="progress"><i style="width:'+(((state.wordIndex||0)+1)/WORDS.length*100)+'%"></i></div><div style="text-align:center;font-size:9px;margin-top:5px">'+((state.wordIndex||0)+1)+' / '+WORDS.length+'</div><div class="word-card"><div class="word-img" style="background-image:url(\''+asset(w.image)+'\')"></div><div><h2 dir="ltr">'+esc(w.en)+'</h2><div class="meaning">'+esc(w.ar)+'</div>'+(state.arabicPhonetic?'<div class="phonetic">'+esc(w.ph)+'</div>':'')+'<div class="audio-row"><button class="audio-normal" onclick="speak(\''+esc(w.en)+'\',.95)">🔊 عادي</button><button class="audio-slow" onclick="speak(\''+esc(w.en)+'\',.55)">🐢 بطيء</button></div><button class="record-btn" onclick="recordSelf(\''+esc(w.en)+'\')">🎙️ قوليها</button><div id="recordBox"></div><div class="example" dir="ltr">'+esc(w.example)+'</div><div class="example-ar">'+exampleAr(w.id)+'</div></div></div><div class="footer-nav"><button onclick="prevWord()">السابق</button><button class="next" onclick="nextWord()">التالي →</button></div></section>',"levels",false);
}
function exampleAr(id){return ({bed:"أنا أنام في سريري.",water:"أنا أشرب الماء في الصباح.",shower:"أنا أستحم في الصباح.",wash:"أنا أغسل وجهي.",breakfast:"أنا أتناول الفطور في البيت.",wake:"أنا أستيقظ الساعة السادسة."})[id]||"";}
function prevWord(){if(state.wordIndex>0){state.wordIndex--;save();vocab();}else lesson();}
function nextWord(){if(state.wordIndex<WORDS.length-1){state.wordIndex++;save();vocab();}else{state.wordIndex=0;setStep(3);phonics();}}
function phonics(){
 window.__back=lesson;
 shell(topbar("سر النطق")+'<section class="phonics-page"><div class="progress"><i style="width:42%"></i></div><h2 class="sound-title">الحرفان SH</h2><p class="sound-copy">في الإنجليزية أحيانًا حرفان يجتمعان ويعطون صوتًا واحدًا.<br><b>S + H = SH</b> وصوتهم هنا قريب من «ش».</p><div class="mouth-img" style="background-image:url(\''+asset(A.mouth)+'\')"></div><div class="sound-list"><div class="sound-row"><button class="round-btn" onclick="speak(\'shower\',.85)">🔊</button><div><b dir="ltr">SHOWER</b><small>SH في بداية الكلمة = ش</small></div><span>دش</span></div><div class="sound-row"><button class="round-btn" onclick="speak(\'wash\',.85)">🔊</button><div><b dir="ltr">WASH</b><small>SH في نهاية الكلمة = ش</small></div><span>يغسل</span></div></div><div class="tip">💡 ما نقرأ S ثم H كل واحد لحاله هنا؛ نقرأ SH كصوت واحد. لاحقًا نتعلم CH و TH بنفس الفكرة.</div><div class="footer-nav"><button onclick="lesson()">السابق</button><button class="next" onclick="setStep(4);grammar()">التالي →</button></div></section>',"levels",false);
}
function grammar(){
 window.__back=lesson;
 const av='style="background-image:url(\''+asset(A.hero_clean)+'\')"';
 shell(topbar("جملة / قاعدة اليوم")+'<section class="grammar-page"><div class="progress"><i style="width:57%"></i></div><h2>I + verb</h2><div class="rule-box">I + verb + object</div><div class="sentence-list"><div class="sentence"><div class="avatar" '+av+'></div><div><b dir="ltr">I wake up early.</b><small>أنا أستيقظ مبكرًا.</small></div><button class="round-btn" onclick="speak(\'I wake up early.\',.9)">🔊</button></div><div class="sentence"><div class="avatar" '+av+'></div><div><b dir="ltr">I drink water.</b><small>أنا أشرب الماء.</small></div><button class="round-btn" onclick="speak(\'I drink water.\',.9)">🔊</button></div><div class="sentence"><div class="avatar" '+av+'></div><div><b dir="ltr">I eat breakfast.</b><small>أنا أتناول الفطور.</small></div><button class="round-btn" onclick="speak(\'I eat breakfast.\',.9)">🔊</button></div></div><div class="tip">💡 نتعلم شكل الجملة واستخدامها أولًا، وبعدها اسم القاعدة. بدون شرح مدرسي طويل.</div><div class="footer-nav"><button onclick="phonics()">السابق</button><button class="next" onclick="setStep(5);realUse()">التالي →</button></div></section>',"levels",false);
}
function realUse(){
 window.__back=lesson;
 shell(topbar("استخدام حقيقي")+'<section class="use-page"><div class="progress"><i style="width:71%"></i></div><h2>ماذا تفعلين في الصباح؟</h2><div class="use-visual" style="background-image:url(\''+asset(A.conversation)+'\')"><div class="chat-bubble" dir="ltr">What time do you wake up?<br><small>في أي وقت تستيقظين؟</small></div><div class="chat-bubble answer" dir="ltr">I wake up at 6.</div></div><div class="mic-area"><button class="round-btn" onclick="speak(\'What time do you wake up?\',.9)">🔊</button><button class="mic" onclick="recordSelf(\'I wake up at six\')">🎙️</button></div><div id="recordBox" class="teacher-note">اسمعي السؤال، سجلي جوابك، ثم قارني صوتك بالصوت الصحيح.</div><div class="footer-nav"><button onclick="grammar()">السابق</button><button class="next" onclick="setStep(6);game()">التالي →</button></div></section>',"levels",false);
}
const GAME=[{q:"اسحبي المعنى للصورة المناسبة",ids:["bed","wake","breakfast"]},{q:"اختاري الكلمة للصورة",ids:["water","shower","wash"]}];
function game(){
 window.__back=lesson;const g=GAME[Math.min(gameIndex,GAME.length-1)];
 shell(topbar("لعبة التثبيت")+'<section class="game-page"><div class="progress"><i style="width:86%"></i></div><h2>'+g.q+'</h2><p style="font-size:9px;color:var(--muted)">مراجعة خفيفة فقط — ما فيها نجاح أو رسوب.</p><div class="game-grid">'+g.ids.map((id,i)=>{const w=WORDS.find(x=>x.id===id);return '<button class="game-choice" onclick="selectGame(this,\''+id+'\')"><img src="'+asset(w.image)+'" alt="'+esc(w.en)+'"></button>';}).join("")+'</div><div class="game-labels">'+g.ids.slice().sort(()=>Math.random()-.5).map(id=>{const w=WORDS.find(x=>x.id===id);return '<button onclick="speak(\''+esc(w.en)+'\',.85)">'+esc(w.en)+'</button>';}).join("")+'</div><div class="footer-nav"><button onclick="realUse()">السابق</button><button class="next" onclick="nextGame()">التالي →</button></div></section>',"levels",false);
}
function selectGame(el,id){document.querySelectorAll(".game-choice").forEach(x=>x.classList.remove("selected"));el.classList.add("selected");if(!state.saved.includes(id))state.saved.push(id);save();}
function nextGame(){if(gameIndex<GAME.length-1){gameIndex++;game();}else{gameIndex=0;setStep(7);reward();}}
function reward(){
 window.__back=lesson;
 if(!state.lessonCompleted){state.xp+=50;state.streak+=1;state.worldProgress=Math.max(state.worldProgress,25);state.lessonCompleted=true;state.readyForTeacher=true;save();}
 shell(topbar("أحسنتِ يا ريم")+'<section class="reward-page"><div class="trophy">🏆</div><h2>أكملتِ My Morning!</h2><p>الدرس خلص. التقييم الأساسي والاختبارات الكبيرة تكون من عبدالعزيز، مو من الموقع.</p><div class="reward-stats"><div><b>+50</b><small>XP</small></div><div><b>🔥 +1</b><small>سلسلة</small></div><div><b>6</b><small>كلمات راجعتيها</small></div></div><div class="teacher-note">🔐 تم إرسال الدرس إلى ملف عبدالعزيز كـ «جاهز للتقييم».</div><button class="cta" onclick="home()">العودة للرئيسية</button></section>',"home",false);
}
function review(){
 window.__back=home;
 const weak=state.weak||[];
 shell(topbar("المراجعة")+'<section class="review-page"><h2>كلماتي للمراجعة 🧠</h2><p style="font-size:10px;color:var(--muted)">الموقع يراجع فقط، ما يختبرك اختبارًا نهائيًا.</p><div class="sentence-list">'+WORDS.filter(w=>weak.includes(w.id)||state.saved.includes(w.id)).map(w=>'<div class="sentence"><div class="avatar" style="background-image:url(\''+asset(w.image)+'\')"></div><div><b dir="ltr">'+esc(w.en)+'</b><small>'+esc(w.ar)+'</small></div><button class="round-btn" onclick="speak(\''+esc(w.en)+'\',.8)">🔊</button></div>').join("")+'</div></section>',"review");
}
function account(){
 window.__back=home;
 shell(topbar("حسابي")+'<section class="review-page"><h2>إعدادات ريم</h2><div class="sentence"><div>النطق العربي المبسط</div><button class="round-btn" onclick="togglePhonetic()">'+(state.arabicPhonetic?"✓":"—")+'</button></div><div class="sentence"><div>الصوت</div><button class="round-btn" onclick="toggleAccent()">'+(state.accent==="en-US"?"🇺🇸":"🇬🇧")+'</button></div><div class="teacher-note">ملف عبدالعزيز منفصل ومحمي. زر 🔐 أعلى الصفحة يفتح ملف المدرّس.</div></section>',"account");
}
function togglePhonetic(){state.arabicPhonetic=!state.arabicPhonetic;save();account();}
function toggleAccent(){state.accent=state.accent==="en-US"?"en-GB":"en-US";save();account();}
let __reemAudio=null;
let __reemUtterance=null;
const __localAudio={
  "bed":"./audio/bed.mp3",
  "water":"./audio/water.mp3",
  "shower":"./audio/shower.mp3"
};
function normalizeAudioKey(text){return String(text||"").trim().toLowerCase().replace(/[.!?]/g,"");}
function speak(text,rate=.9){
  const key=normalizeAudioKey(text);
  try{
    if(__reemAudio){__reemAudio.pause();__reemAudio.currentTime=0;}
    if(window.speechSynthesis&&speechSynthesis.speaking)speechSynthesis.cancel();
  }catch(e){}
  if(__localAudio[key]){
    const a=new Audio(__localAudio[key]+"?v=audio-2");
    __reemAudio=a;
    a.preload="auto";
    a.playbackRate=rate<=.7?.68:1;
    a.defaultPlaybackRate=a.playbackRate;
    a.volume=1;
    const p=a.play();
    if(p&&p.catch)p.catch(()=>speakNative(text,rate));
    return;
  }
  speakNative(text,rate);
}
function speakNative(text,rate=.9){
  if(!("speechSynthesis" in window)){showAudioMessage("الصوت غير مدعوم في هذا المتصفح.");return;}
  try{
    if(speechSynthesis.paused)speechSynthesis.resume();
    const u=new SpeechSynthesisUtterance(String(text));
    __reemUtterance=u;
    u.lang=state.accent||"en-US";
    u.rate=rate<=.7?.62:.92;
    u.pitch=1;
    u.volume=1;
    const voices=speechSynthesis.getVoices()||[];
    const exact=voices.find(v=>v.lang===u.lang);
    const english=voices.find(v=>String(v.lang||"").toLowerCase().startsWith("en"));
    if(exact||english)u.voice=exact||english;
    u.onerror=()=>showAudioMessage("تعذر تشغيل الصوت. اضغط الزر مرة ثانية.");
    speechSynthesis.speak(u);
  }catch(e){showAudioMessage("تعذر تشغيل الصوت. جرّب الضغط مرة ثانية.");}
}
function showAudioMessage(msg){
  let box=document.getElementById("audioStatus");
  if(!box){
    box=document.createElement("div");
    box.id="audioStatus";
    box.className="teacher-note";
    const host=document.querySelector(".word-card > div:last-child")||document.querySelector(".phonics-page")||document.querySelector(".grammar-page");
    if(host)host.appendChild(box);
  }
  if(box)box.textContent=msg;
}
async function recordSelf(target){
  const box=document.getElementById("recordBox");
  const MR=window.MediaRecorder||window.webkitMediaRecorder;
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia||!MR){
    if(box)box.innerHTML='🎙️ التسجيل غير متاح من وضع المتصفح الحالي.<br><small>افتحي الرابط مباشرة في Safari واسمحي للميكروفون، ثم جرّبي مرة ثانية.</small>';
    return;
  }
  try{
    const stream=await navigator.mediaDevices.getUserMedia({audio:true});
    chunks=[];recorder=new MR(stream);
    recorder.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};
    recorder.onstop=()=>{
      const url=URL.createObjectURL(new Blob(chunks,{type:recorder.mimeType||"audio/webm"}));
      if(box)box.innerHTML='<audio controls playsinline style="width:100%;margin-top:8px" src="'+url+'"></audio><button class="record-btn" onclick="speak(\''+esc(target)+'\',.8)">🔊 اسمعي النموذج</button>';
      stream.getTracks().forEach(t=>t.stop());
    };
    recorder.start();
    if(box)box.innerHTML='🎙️ التسجيل الآن...<br><small>يتوقف تلقائيًا بعد 4 ثوانٍ.</small>';
    setTimeout(()=>{if(recorder&&recorder.state==="recording")recorder.stop()},4000);
  }catch(e){
    if(box)box.innerHTML='اسمحي للميكروفون من إعدادات Safari ثم حاولي مرة ثانية.';
  }
}
function runAssignedTest(){
 const t=assignedTest();if(!t)return home();localStorage.setItem("reemActiveTest",String(t.id));testQuestion(t,0,[]);
}
function testQuestion(t,index,answers){
 window.__back=home;const q=t.questions[index];if(!q)return finishAssignedTest(t,answers);
 let body='<div class="teacher-note">'+esc(q.prompt||"")+'</div>';
 if(q.type==="mcq"){body+='<div class="sentence-list">'+(q.options||[]).map(o=>'<button class="lesson-step" onclick="testQuestion(window.__test,'+(index+1)+',window.__answers.concat([{q:'+index+',a:\''+esc(o)+'\'}]))"><div>'+esc(o)+'</div></button>').join("")+'</div>'}
 else if(q.type==="listening"){body+='<button class="cta" onclick="speak(\''+esc(q.audio||q.prompt)+'\',.85)">🔊 استماع</button><textarea id="ans" style="width:100%;margin-top:10px;min-height:100px"></textarea><button class="cta" onclick="submitFreeAnswer('+index+')">التالي</button>'}
 else if(q.type==="oral"||q.type==="pronunciation"){body+='<button class="mic" onclick="recordSelf(\''+esc(q.answer||q.prompt)+'\')">🎙️</button><div id="recordBox"></div><button class="cta" onclick="testQuestion(window.__test,'+(index+1)+',window.__answers.concat([{q:'+index+',a:\'recorded\'}]))">تم</button>'}
 else{body+='<textarea id="ans" style="width:100%;margin-top:10px;min-height:120px"></textarea><button class="cta" onclick="submitFreeAnswer('+index+')">التالي</button>'}
 window.__test=t;window.__answers=answers;
 shell(topbar("اختبار عبدالعزيز")+'<section class="review-page"><div class="progress"><i style="width:'+((index+1)/t.questions.length*100)+'%"></i></div><h2>'+(index+1)+' / '+t.questions.length+'</h2>'+body+'</section>',"home",false);
}
function submitFreeAnswer(index){const a=document.getElementById("ans")?.value||"";testQuestion(window.__test,index+1,window.__answers.concat([{q:index,a}]));}
function finishAssignedTest(t,answers){const results=JSON.parse(localStorage.getItem("reemTestResults")||"[]");results.push({id:Date.now(),testId:t.id,answers,submittedAt:new Date().toISOString(),status:"awaiting_teacher"});localStorage.setItem("reemTestResults",JSON.stringify(results));localStorage.removeItem("reemAssignedTest");shell(topbar("تم الإرسال")+'<section class="reward-page"><div class="trophy">📨</div><h2>تم إرسال إجاباتك لعبدالعزيز</h2><p>هو اللي يراجع ويعتمد النتيجة.</p><button class="cta" onclick="home()">الرئيسية</button></section>',"home",false);}
home();