const APP=document.getElementById("app");

function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function profile(){return ReemStore.getProfile();}
function content(){return ReemStore.getContent();}
function levels(){return (window.REEM_CONFIG&&window.REEM_CONFIG.levels)||[];}
function currentLevel(p=profile()){
  const list=levels().slice().sort((a,b)=>a.minPoints-b.minPoints);
  let found=list[0]||{id:"starter",nameAr:"البداية",nameEn:"Starter",minPoints:0};
  list.forEach(l=>{if((p.points||0)>=l.minPoints)found=l});
  if(p.currentLevelId!==found.id){p.currentLevelId=found.id;ReemStore.saveProfile(p)}
  return found;
}
function levelProgress(p=profile()){
  const list=levels().slice().sort((a,b)=>a.minPoints-b.minPoints);
  const idx=Math.max(0,list.findIndex(x=>x.id===currentLevel(p).id));
  const cur=list[idx],next=list[idx+1];
  if(!next)return 100;
  return Math.max(0,Math.min(100,Math.round(((p.points-cur.minPoints)/(next.minPoints-cur.minPoints))*100)));
}
function courseProgress(p=profile()){
  const words=content().words||[];
  return words.length?Math.round((p.learnedWordIds.length/words.length)*100):0;
}
function dayNumber(p=profile()){
  const start=new Date(p.startedAt||Date.now());const now=new Date();
  const d=Math.floor((now-start)/(24*60*60*1000))+1;
  return Math.max(1,d);
}
function ordinalDay(n){return "اليوم "+n;}
function morningLesson(p=profile()){
  const all=(content().words||[]).filter(w=>w.categoryId==="morning");
  const sets=[];
  for(let i=0;i<all.length;i+=10)sets.push(all.slice(i,i+10));
  if(!sets.length)return {words:[],number:1,total:0};
  let idx=sets.findIndex(set=>set.some(w=>!p.learnedWordIds.includes(w.id)));
  if(idx<0)idx=sets.length-1;
  return {words:sets[idx],number:idx+1,total:sets.length};
}
function lessonForCategory(categoryId,p=profile()){
  if(categoryId==="morning"){
    const m=morningLesson(p);
    return Object.assign({},m,{
      categoryId:"morning",categoryName:"عائلة الصباح",icon:"☀️",
      label:"الدرس "+m.number,
      intro:m.number===1
        ?"نبدأ بالكلمات اللي تستخدمينها من أول ما تصحين: الاستيقاظ، السرير، الحمّام، الفطور، الماء والاستعداد."
        :"نكمل نفس عائلة الصباح: المنبّه، الوجه، معجون الأسنان، المنشفة، المرآة، الشعر، اللبس، القهوة والحذاء."
    });
  }
  if(categoryId==="errands"){
    const all=(content().words||[]).filter(w=>w.categoryId==="errands");
    const sets=[];
    for(let i=0;i<all.length;i+=10)sets.push(all.slice(i,i+10));
    const idx=Math.max(0,sets.length-1);
    const words=sets[idx]||[];
    const intros=[
      "10 كلمات يومية أقوى شوي: الموعد، التوفر، الإيصال، الباقي، الطابور، الكاشير، المدخل، المخرج، المصعد والتقاطع.",
      "نكمل 10 كلمات من نفس العائلة: الزحمة، الطريق المختصر، الصيدلية، البقالة، ممر المتجر، المحفظة، الحجز، التوصيل، الاسترجاع ومزدحم.",
      "درس اليوم جديد بالكامل: الجدول، كاونتر الخدمة، الشحنة، المواقف، العنوان، قريب، متأخر، الاستلام، الاستبدال والتأكيد.",
      "درس جديد: الإلغاء، إعادة الجدولة، الموقع، الاتجاهات، الطابق العلوي والسفلي، الدفع، الدفع بدون تلامس، نفاد المخزون وإرجاع المنتج."
    ];
    return {
      words,number:idx+1,total:sets.length,categoryId:"errands",categoryName:"عائلة المشاوير اليومية",icon:"🛍️",
      label:"الدرس "+(idx+1),
      intro:intros[idx]||"10 كلمات جديدة من نفس عائلة المشاوير اليومية."
    };
  }
  if(categoryId==="daily-talk"){
    const words=(content().words||[]).filter(w=>w.categoryId==="daily-talk").slice(0,10);
    return {
      words,number:1,total:1,categoryId:"daily-talk",categoryName:"عائلة الكلام اليومي",icon:"💬",
      label:"الدرس 1",
      intro:"10 كلمات وعبارات من الكلام اليومي الحقيقي: في الحقيقة، غالبًا، المهم، بالضبط، بجد، على فكرة، ولا يهمك، انتظر شوي، تمام، وأعتقد."
    };
  }
  if(categoryId==="daily-life-2510"){ const words=(content().words||[]).filter(w=>w.categoryId==="daily-life-2510").slice(0,10); return {words,number:1,total:1,categoryId:"daily-life-2510",categoryName:"الحياة اليومية — 25/10",icon:"🌆",label:"درس 25/10",intro:"10 كلمات وعبارات يومية بمستوى متوسط إلى أصعب شوي."}; }
  if(categoryId==="daily-life-2610"){ const words=(content().words||[]).filter(w=>w.categoryId==="daily-life-2610").slice(0,10); return {words,number:1,total:1,categoryId:"daily-life-2610",categoryName:"درس 26/10",icon:"✨",label:"درس 26/10",intro:"10 كلمات يومية جديدة بمستوى فوق المتوسط بشكل خفيف."}; }
  return {words:[],number:1,total:0,categoryId:categoryId||"",categoryName:"الدرس",icon:"📚",label:"درس",intro:""};
}
const RECENT_TEST_ERRANDS_IDS=["cancel","reschedule","location","directions","upstairs","downstairs","checkout","contactless","out-of-stock","return"];
const RECENT_TEST_DAILY_TALK_IDS=["actually","probably","anyway","exactly","seriously","by-the-way","no-worries","hang-on","sounds-good","i-guess"];
const RECENT_TEST_IDS=[...RECENT_TEST_ERRANDS_IDS,...RECENT_TEST_DAILY_TALK_IDS];

function recentTestWords(){
  const byId=Object.fromEntries((content().words||[]).map(w=>[w.id,w]));
  return RECENT_TEST_IDS.map(id=>byId[id]).filter(Boolean);
}
function recentTestStatus(p=profile()){
  const words=recentTestWords();
  const done=words.filter(w=>p.learnedWordIds.includes(w.id)).length;
  return {words,done,total:words.length,ready:words.length===20&&done===20};
}
function latestErrandsLesson(p=profile()){
  const all=(content().words||[]).filter(w=>w.categoryId==="errands");
  const words=all.slice(-10);
  return {words,number:Math.ceil(all.length/10),total:Math.ceil(all.length/10),categoryId:"errands",categoryName:"عائلة المشاوير اليومية",icon:"🛍️",label:"الدرس "+Math.ceil(all.length/10),intro:"درس المشاوير الأخير: الإلغاء، إعادة الجدولة، الموقع، الاتجاهات، الطابق العلوي والسفلي، الدفع، الدفع بدون تلامس، نفاد المخزون وإرجاع المنتج."};
}

function activeLesson(p=profile()){
  const today2610=lessonForCategory("daily-life-2610",p); if(today2610.words.length)return today2610;
  const today2510=lessonForCategory("daily-life-2510",p); if(today2510.words.length)return today2510;
  const recent=recentTestStatus(p);
  const errands=latestErrandsLesson(p);
  if(errands.words.some(w=>!p.learnedWordIds.includes(w.id)))return errands;
  const dailyTalk=lessonForCategory("daily-talk",p);
  if(dailyTalk.words.some(w=>!p.learnedWordIds.includes(w.id)))return dailyTalk;
  if(recent.ready)return dailyTalk;
  const morning=(content().words||[]).filter(w=>w.categoryId==="morning").slice(0,20);
  const morningDone=morning.length>=20 && morning.every(w=>p.learnedWordIds.includes(w.id));
  if(!morningDone)return lessonForCategory("morning",p);
  return dailyTalk.words.length?dailyTalk:lessonForCategory("morning",p);
}
function applyPrefs(){
  const p=profile(),pref=p.preferences||{};
  document.body.classList.remove("theme-light","accent-pink","accent-purple","accent-blue");
  if(pref.theme==="light")document.body.classList.add("theme-light");
  document.body.classList.add("accent-"+(pref.accent||"pink"));
  document.documentElement.style.setProperty("--font-scale",String(pref.fontScale||1));
}
function nav(active){
  const items=[["home","🏠","الرئيسية","home()"],["words","📚","الكلمات","wordsPage()"],["cats","🗂️","الفئات","categoriesPage()"],["settings","⚙️","الإعدادات","settingsPage()"]];
  return '<nav class="bottom-nav">'+items.map(x=>'<button class="'+(active===x[0]?"active":"")+'" onclick="'+x[3]+'"><b>'+x[1]+'</b><small>'+x[2]+'</small></button>').join("")+'</nav>';
}
function shell(inner,active="home",withNav=true){
  APP.innerHTML='<main class="student-app"><div class="app-shell">'+inner+'</div>'+(withNav?nav(active):"")+'</main>';
}
function topSummary(p){
  const lvl=currentLevel(p),prog=courseProgress(p);
  return '<section class="student-menu"><div class="student-name"><div><strong>'+esc(p.name)+'</strong><span> • '+esc(lvl.nameEn)+'</span></div><span>'+prog+'% مكتمل</span></div><div class="student-meta"><div class="meta-box"><b>'+esc(lvl.nameAr)+'</b><small>المستوى</small></div><div class="meta-box"><b>⭐ '+(p.points||0)+'</b><small>النقاط</small></div><div class="meta-box"><b>📝 '+(p.completedTests||0)+'</b><small>اختبارات</small></div></div></section>';
}
function home(){
  applyPrefs();
  const p=profile(),c=content(),prog=courseProgress(p),left=Math.max(0,100-prog),lesson=activeLesson(p),today=lesson.words,recentTest=recentTestStatus(p);
  shell(
    '<div class="topbar"><div class="welcome"><span class="eyebrow">✨ '+ordinalDay(dayNumber(p))+'</span><h1>أهلاً وسهلاً بك يا '+esc(p.name)+'</h1><p>كل يوم كلمات عملية من الحياة اليومية، بصور ونطق وجملة واضحة.</p></div>'+topSummary(p)+'</div>'+
    '<div class="layout"><section class="hero card"><div class="hero-content"><span class="eyebrow">'+lesson.icon+' '+lesson.label+' • '+lesson.categoryName+'</span><h2>'+lesson.words.length+' كلمة جديدة</h2><p>'+lesson.intro+'</p><div class="hero-actions"><button class="primary" onclick="startStudy(0,\''+lesson.categoryId+'\')">ابدئي كلمات اليوم ▶</button>'+(recentTest.ready?'<button class="secondary" onclick="startRecentCombinedTest()">📝 اختبار آخر درسين — 20 كلمة</button>':'<button class="secondary" disabled>🔒 اختبار آخر درسين — '+recentTest.done+'/'+recentTest.total+' مكتملة</button>')+'<button class="ghost" onclick="wordsPage()">شوفي الكلمات كلها</button></div><div class="progress-block"><div class="progress-label"><span>التقدم الكلي</span><b>'+prog+'% • المتبقي '+left+'%</b></div><div class="progress-track"><i style="width:'+prog+'%"></i></div></div></div></section>'+
    '<aside class="side-stack"><section class="today card"><div class="section-head"><h3>كلمات اليوم</h3><small>'+today.length+' كلمات</small></div><div class="today-list">'+today.slice(0,6).map(w=>miniWord(w,p)).join("")+'</div></section><section class="today card"><div class="section-head"><h3>المستوى الحالي</h3><small>'+currentLevel(p).nameEn+'</small></div><div class="progress-block"><div class="progress-label"><span>'+currentLevel(p).nameAr+'</span><b>'+levelProgress(p)+'%</b></div><div class="progress-track"><i style="width:'+levelProgress(p)+'%"></i></div></div><p style="color:var(--muted);font-size:.78rem;line-height:1.7;margin:12px 0 0">الانتقال للمستوى التالي يعتمد على النقاط والاختبارات التي يحددها المعلم.</p></section></aside></div>'+
    '<section class="categories card"><div class="section-head"><h3>عائلات الكلمات</h3><small>يمكن للمعلم إضافة فئات جديدة</small></div><div class="category-grid">'+(c.categories||[]).map(cat=>categoryCard(cat,c.words)).join("")+'</div></section>'
  ,"home");
}
function miniWord(w,p){
  const learned=p.learnedWordIds.includes(w.id),review=p.reviewWordIds.includes(w.id);
  return '<div class="mini-word"><img src="'+esc(w.image)+'" alt="'+esc(w.en)+'"><div><b dir="ltr">'+esc(w.en)+'</b><small>'+esc(w.ar)+'</small></div><span class="mini-status">'+(learned?"✅":review?"↻":"•")+'</span></div>';
}
function categoryCard(cat,words){
  const n=(words||[]).filter(w=>w.categoryId===cat.id).length;
  return '<button class="category" onclick="wordsPage(\''+esc(cat.id)+'\')"><b>'+esc(cat.icon||"📁")+'</b><strong>'+esc(cat.nameAr)+'</strong><small>'+esc(cat.nameEn)+' • '+n+' كلمة</small></button>';
}
let __recordTimer=null;

function startStudy(index=0,categoryId){
  applyPrefs();
  if(window.ReemAudio)ReemAudio.stop();
  if(window.ReemRecorder&&ReemRecorder.isRecording())ReemRecorder.cancel();

  const p=profile(),lesson=categoryId==="errands"?latestErrandsLesson(p):(categoryId?lessonForCategory(categoryId,p):activeLesson(p)),words=lesson.words;
  if(!words.length)return wordsPage();
  const i=Math.max(0,Math.min(words.length-1,index)),w=words[i];

  APP.innerHTML='<main class="student-app"><div class="study-shell">'+
    '<div class="study-top"><button class="back" onclick="home()">←</button><div><b>'+lesson.categoryName+' • '+lesson.label+'</b><div class="word-count">'+(i+1)+' / '+words.length+'</div></div><span class="eyebrow">'+courseProgress(p)+'% إجمالي</span></div>'+
    '<section class="study-card card"><div class="progress-track"><i style="width:'+((i+1)/words.length*100)+'%"></i></div>'+
    '<div class="word-layout"><img class="word-image" src="'+esc(w.image)+'" alt="'+esc(w.en)+'">'+
    '<div class="word-copy"><div class="word-count">كلمة اليوم</div><h2 dir="ltr">'+esc(w.en)+'</h2><div class="arabic">'+esc(w.ar)+'</div><div class="pron">'+esc(w.pronunciation)+'</div>'+
    '<div class="audio-actions"><button class="normal" onclick="playWord(\''+esc(w.en)+'\',false)">🔊 عادي</button><button class="slow" onclick="playWord(\''+esc(w.en)+'\',true)">🐢 بطيء</button></div>'+
    '<div class="record-panel"><button id="recordBtn" class="record-main" onclick="toggleRecording(\''+esc(w.en)+'\')">🎙️ سجلي نطقك</button><div id="recordStatus" class="record-status">اسمعي الكلمة أول، ثم سجلي صوتك وقارنيه بالنطق الصحيح.</div><div id="recordPlayback"></div></div>'+
    '<div class="example-card"><b>'+esc(w.exampleEn)+'</b><small>'+esc(w.exampleAr)+'</small></div>'+
    '<div class="word-actions"><button class="learned" onclick="markLearned(\''+w.id+'\','+i+',\''+lesson.categoryId+'\')">✓ حفظتها</button><button class="review" onclick="markReview(\''+w.id+'\','+i+',\''+lesson.categoryId+'\')">↻ راجعها</button><button onclick="nextWord('+i+',\''+lesson.categoryId+'\')">'+(i===words.length-1?((lesson.categoryId==="errands"&&lesson.number>=4)||lesson.categoryId==="daily-talk"?"إنهاء الدرس →":"إنهاء اليوم"):"التالي →")+'</button></div>'+
    '</div></div></section></div></main>';
}

function playWord(text,slow){
  const ok=window.ReemAudio&&ReemAudio.speak(text,slow);
  const status=document.getElementById("recordStatus");
  if(status)status.textContent=ok?(slow?"🐢 تشغيل النطق الأمريكي البطيء...":"🔊 تشغيل النطق الأمريكي..."):"تعذر تشغيل الصوت.";
}

async function toggleRecording(target){
  const btn=document.getElementById("recordBtn");
  const status=document.getElementById("recordStatus");
  const playback=document.getElementById("recordPlayback");
  if(!window.ReemRecorder){
    if(status)status.textContent="ميزة التسجيل لم تُحمّل. حدّثي الصفحة وحاولي مرة ثانية.";
    return;
  }
  if(ReemRecorder.isRecording()){
    return finishRecording(target);
  }
  try{
    if(window.ReemAudio)ReemAudio.stop();
    if(playback)playback.innerHTML="";
    if(status)status.textContent="اسمحي للميكروفون إذا ظهر طلب الإذن...";
    await ReemRecorder.start();
    if(btn){btn.textContent="⏹️ أوقفي التسجيل";btn.classList.add("recording");}
    if(status)status.textContent="🎙️ أسجّل الآن... قولي الكلمة بوضوح.";
    if(__recordTimer)clearTimeout(__recordTimer);
    __recordTimer=setTimeout(()=>finishRecording(target),8000);
  }catch(e){
    const name=String(e&&e.name||e&&e.message||"");
    if(status){
      if(/NotAllowed|Permission|MIC_UNSUPPORTED/i.test(name))status.textContent="الميكروفون غير مسموح. اسمحي للموقع باستخدام الميكروفون ثم جرّبي مرة ثانية.";
      else if(/NotFound/i.test(name))status.textContent="ما لقيت ميكروفون متاح على الجهاز.";
      else status.textContent="تعذر بدء التسجيل. افتحي الموقع مباشرة في Safari وجرّبي مرة ثانية.";
    }
  }
}

async function finishRecording(target){
  const btn=document.getElementById("recordBtn");
  const status=document.getElementById("recordStatus");
  const playback=document.getElementById("recordPlayback");
  if(__recordTimer){clearTimeout(__recordTimer);__recordTimer=null;}
  if(!window.ReemRecorder||!ReemRecorder.isRecording())return;
  try{
    const result=await ReemRecorder.stop();
    if(btn){btn.textContent="🎙️ سجلي مرة ثانية";btn.classList.remove("recording");}
    if(status)status.textContent="✅ هذا تسجيلك. اسمعيه، ثم قارنيه بالنطق الأمريكي.";
    if(playback)playback.innerHTML='<audio class="recorded-audio" controls playsinline src="'+result.url+'"></audio><button class="compare-btn" onclick="playWord(\''+esc(target)+'\',false)">🔊 اسمعي النطق الصحيح</button>';
  }catch(e){
    if(btn){btn.textContent="🎙️ سجلي نطقك";btn.classList.remove("recording");}
    if(status)status.textContent="تعذر حفظ التسجيل. جرّبي مرة ثانية.";
  }
}

function markLearned(id,i,categoryId){
  ReemStore.addLearned(id);
  const lesson=categoryId==="errands"?latestErrandsLesson(profile()):lessonForCategory(categoryId,profile());
  const status=recentTestStatus(profile());
  if(status.ready && (categoryId==="errands"||categoryId==="daily-talk") && i>=lesson.words.length-1){
    return startRecentCombinedTest();
  }
  startStudy(i,categoryId);
}
function markReview(id,i,categoryId){ReemStore.addReview(id);startStudy(i,categoryId)}
function nextWord(i,categoryId){
  const lesson=categoryId==="errands"?latestErrandsLesson(profile()):lessonForCategory(categoryId,profile()),words=lesson.words;
  if(i<words.length-1)return startStudy(i+1,categoryId);
  const status=recentTestStatus(profile());
  if(status.ready && (categoryId==="errands"||categoryId==="daily-talk"))return startRecentCombinedTest();
  home();
}

let __recentCombinedTest=null;
function recentTestShuffle(list){
  const a=list.slice();
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
  return a;
}
function startRecentCombinedTest(){
  applyPrefs();
  if(window.ReemAudio)ReemAudio.stop();
  const status=recentTestStatus(profile());
  if(!status.ready){
    return shell('<section class="test-card card"><span class="eyebrow">🔒 اختبار آخر درسين</span><h1>الاختبار مقفول</h1><p>لازم تكمّلين كل كلمات الدرسين أول. المكتمل الآن: '+status.done+' من '+status.total+'.</p><button class="primary" onclick="home()">العودة للدروس</button></section>',"home",false);
  }
  const words=status.words;
  const questions=recentTestShuffle(words).map((target,index)=>{
    const distractors=recentTestShuffle(words.filter(w=>w.id!==target.id)).slice(0,3);
    const modes=["listen","en-to-ar","ar-to-en"];
    return {target,mode:modes[index%3],options:recentTestShuffle([target,...distractors])};
  });
  __recentCombinedTest={questions,index:0,score:0,answers:[],locked:false};
  renderRecentCombinedTest();
}
function renderRecentCombinedTest(){
  if(!__recentCombinedTest)return startRecentCombinedTest();
  const t=__recentCombinedTest,q=t.questions[t.index],num=t.index+1,total=t.questions.length;
  let prompt="",audio="";
  if(q.mode==="listen"){
    prompt='<h1>اسمعي واختاري الكلمة الصحيحة</h1><p>السؤال من كلمات آخر درسين.</p>';
    audio='<div class="test-audio"><button class="listen-main" onclick="playRecentTestWord(false)">🔊 اسمعي</button><button class="listen-slow" onclick="playRecentTestWord(true)">🐢 أبطأ</button></div>';
  }else if(q.mode==="en-to-ar"){
    prompt='<h1>ما معنى <span dir="ltr">'+esc(q.target.en)+'</span>؟</h1><p>اختاري المعنى العربي الصحيح.</p>';
  }else{
    prompt='<h1>'+esc(q.target.ar)+'</h1><p>اختاري الكلمة الإنجليزية الصحيحة.</p>';
  }
  const options=q.options.map((w,i)=>{
    const label=q.mode==="en-to-ar"?esc(w.ar):'<span dir="ltr">'+esc(w.en)+'</span>';
    return '<button id="recentTestOpt'+i+'" onclick="answerRecentCombinedTest(\''+w.id+'\','+i+')"><b>'+label+'</b></button>';
  }).join("");
  APP.innerHTML='<main class="student-app"><div class="test-shell">'+
    '<div class="test-top"><button class="back" onclick="home()">←</button><div><b>اختبار آخر درسين</b><small>20 كلمة • مشاوير + كلام يومي</small></div><span class="eyebrow">'+num+' / '+total+'</span></div>'+
    '<section class="test-card card"><div class="progress-track"><i style="width:'+(num/total*100)+'%"></i></div>'+
    '<div class="test-question"><span class="test-icon">'+(q.mode==="listen"?"🎧":"📝")+'</span>'+prompt+audio+
    '<div class="test-options">'+options+'</div>'+
    '<div id="recentTestFeedback" class="test-feedback"></div>'+
    '<button id="recentTestNext" class="primary test-next" onclick="nextRecentCombinedTest()" disabled>'+(num===total?"عرض النتيجة":"التالي →")+'</button>'+
    '</div></section></div></main>';
}
function playRecentTestWord(slow){
  if(!__recentCombinedTest)return;
  const q=__recentCombinedTest.questions[__recentCombinedTest.index];
  if(window.ReemAudio)ReemAudio.speak(q.target.en,!!slow);
}
function answerRecentCombinedTest(id,optionIndex){
  if(!__recentCombinedTest||__recentCombinedTest.locked)return;
  __recentCombinedTest.locked=true;
  const q=__recentCombinedTest.questions[__recentCombinedTest.index];
  const correct=id===q.target.id;
  if(correct)__recentCombinedTest.score++;
  __recentCombinedTest.answers.push({wordId:q.target.id,selectedId:id,correct,mode:q.mode});
  q.options.forEach((w,i)=>{
    const b=document.getElementById("recentTestOpt"+i);
    if(!b)return;
    b.disabled=true;
    if(w.id===q.target.id)b.classList.add("correct");
    else if(i===optionIndex&&!correct)b.classList.add("wrong");
  });
  const f=document.getElementById("recentTestFeedback");
  if(f)f.innerHTML=correct?'✅ <b>إجابة صحيحة</b>':'❌ الصحيح: <b dir="ltr">'+esc(q.target.en)+'</b> — '+esc(q.target.ar);
  const n=document.getElementById("recentTestNext");if(n)n.disabled=false;
}
function nextRecentCombinedTest(){
  if(!__recentCombinedTest||!__recentCombinedTest.locked)return;
  if(__recentCombinedTest.index<__recentCombinedTest.questions.length-1){
    __recentCombinedTest.index++;__recentCombinedTest.locked=false;renderRecentCombinedTest();
  }else finishRecentCombinedTest();
}
function finishRecentCombinedTest(){
  if(!__recentCombinedTest)return;
  if(window.ReemAudio)ReemAudio.stop();
  const t=__recentCombinedTest,total=t.questions.length,score=t.score,pct=Math.round(score/total*100);
  const wrong=t.answers.filter(a=>!a.correct);
  const p=profile();
  p.completedTests=(p.completedTests||0)+1;
  p.points=(p.points||0)+score*2;
  ReemStore.saveProfile(p);
  const subs=ReemStore.getSubmissions();
  subs.push({id:"recent-two-lessons-"+Date.now(),type:"mixed-two-lesson-test",title:"اختبار آخر درسين — 20 كلمة",score,total,percent:pct,answers:t.answers,submittedAt:new Date().toISOString()});
  ReemStore.saveSubmissions(subs);
  const words=recentTestWords();
  APP.innerHTML='<main class="student-app"><div class="test-shell"><section class="test-card result-card card">'+
    '<div class="result-ring"><strong>'+pct+'%</strong><span>'+score+' / '+total+'</span></div>'+
    '<span class="eyebrow">📝 نتيجة اختبار آخر درسين</span><h1>'+(pct>=80?"ممتاز 👏":"كويس، نراجع الكلمات اللي تحتاج تثبيت")+'</h1>'+
    '<p>الاختبار غطّى جميع كلمات الدرسين: 10 من المشاوير و10 من الكلام اليومي.</p>'+
    (wrong.length?'<div class="wrong-review"><b>الكلمات التي تحتاج مراجعة</b><div>'+wrong.map(a=>{const w=words.find(x=>x.id===a.wordId);return '<span dir="ltr">'+esc(w?w.en:a.wordId)+'</span>'}).join("")+'</div></div>':'<div class="test-feedback success">🏆 كل الإجابات صحيحة!</div>')+
    '<div class="result-actions"><button class="primary" onclick="startRecentCombinedTest()">إعادة الاختبار</button><button class="ghost" onclick="home()">الرئيسية</button></div>'+
    '</section></div></main>';
}

let __lessonQuiz=null;
function lessonQuizShuffle(list){
  const a=list.slice();
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
  return a;
}
function startLessonQuiz(categoryId="errands"){
  applyPrefs();
  if(window.ReemAudio)ReemAudio.stop();
  const lesson=lessonForCategory(categoryId,profile());
  const words=lesson.words.slice(0,10);
  if(!words.length)return home();
  const questions=lessonQuizShuffle(words).map((target,index)=>{
    const distractors=lessonQuizShuffle(words.filter(w=>w.id!==target.id)).slice(0,3);
    return {target,mode:index%2===0?"en-to-ar":"ar-to-en",options:lessonQuizShuffle([target,...distractors])};
  });
  __lessonQuiz={categoryId,lessonNumber:lesson.number,questions,index:0,score:0,answers:[],locked:false};
  renderLessonQuiz();
}
function renderLessonQuiz(){
  if(!__lessonQuiz)return startLessonQuiz();
  const t=__lessonQuiz,q=t.questions[t.index],num=t.index+1,total=t.questions.length;
  const prompt=q.mode==="en-to-ar"
    ?'<h1>ما معنى <span dir="ltr">'+esc(q.target.en)+'</span>؟</h1><p>اختاري المعنى العربي الصحيح.</p>'
    :'<h1>'+esc(q.target.ar)+'</h1><p>اختاري الكلمة الإنجليزية الصحيحة.</p>';
  const options=q.options.map((w,i)=>{
    const label=q.mode==="en-to-ar"?esc(w.ar):'<span dir="ltr">'+esc(w.en)+'</span>';
    return '<button id="lessonQuizOpt'+i+'" onclick="answerLessonQuiz(\''+w.id+'\','+i+')"><b>'+label+'</b></button>';
  }).join("");
  APP.innerHTML='<main class="student-app"><div class="test-shell">'+
    '<div class="test-top"><button class="back" onclick="home()">←</button><div><b>مراجعة خفيفة • الدرس '+t.lessonNumber+'</b><small>10 أسئلة بسيطة على كلمات اليوم</small></div><span class="eyebrow">'+num+' / '+total+'</span></div>'+
    '<section class="test-card card"><div class="progress-track"><i style="width:'+(num/total*100)+'%"></i></div>'+
    '<div class="test-question"><span class="test-icon">✨</span>'+prompt+
    '<div class="test-options">'+options+'</div>'+
    '<div id="lessonQuizFeedback" class="test-feedback"></div>'+
    '<button id="lessonQuizNext" class="primary test-next" onclick="nextLessonQuiz()" disabled>'+(num===total?"النتيجة":"التالي →")+'</button>'+
    '</div></section></div></main>';
}
function answerLessonQuiz(id,optionIndex){
  if(!__lessonQuiz||__lessonQuiz.locked)return;
  __lessonQuiz.locked=true;
  const q=__lessonQuiz.questions[__lessonQuiz.index];
  const correct=id===q.target.id;
  if(correct)__lessonQuiz.score++;
  __lessonQuiz.answers.push({wordId:q.target.id,selectedId:id,correct});
  q.options.forEach((w,i)=>{
    const b=document.getElementById("lessonQuizOpt"+i);
    if(!b)return;
    b.disabled=true;
    if(w.id===q.target.id)b.classList.add("correct");
    else if(i===optionIndex&&!correct)b.classList.add("wrong");
  });
  const f=document.getElementById("lessonQuizFeedback");
  if(f)f.innerHTML=correct?'✅ <b>صحيحة</b>':'❌ الصحيح: <b dir="ltr">'+esc(q.target.en)+'</b> — '+esc(q.target.ar);
  const n=document.getElementById("lessonQuizNext");if(n)n.disabled=false;
}
function nextLessonQuiz(){
  if(!__lessonQuiz||!__lessonQuiz.locked)return;
  if(__lessonQuiz.index<__lessonQuiz.questions.length-1){
    __lessonQuiz.index++;__lessonQuiz.locked=false;renderLessonQuiz();
  }else finishLessonQuiz();
}
function finishLessonQuiz(){
  if(!__lessonQuiz)return;
  const t=__lessonQuiz,total=t.questions.length,score=t.score,pct=Math.round(score/total*100);
  const wrong=t.answers.filter(a=>!a.correct);
  const subs=ReemStore.getSubmissions();
  subs.push({
    id:"lesson-practice-"+Date.now(),
    type:"light-lesson-review",
    title:"مراجعة خفيفة — "+lessonForCategory(t.categoryId,profile()).categoryName+" — الدرس "+t.lessonNumber,
    score,total,percent:pct,answers:t.answers,submittedAt:new Date().toISOString()
  });
  ReemStore.saveSubmissions(subs);
  const lesson=lessonForCategory(t.categoryId,profile());
  APP.innerHTML='<main class="student-app"><div class="test-shell"><section class="test-card result-card card">'+
    '<div class="result-ring"><strong>'+pct+'%</strong><span>'+score+' / '+total+'</span></div>'+
    '<span class="eyebrow">✨ مراجعة خفيفة</span><h1>'+(pct>=80?"ممتاز، الكلمات ثابتة 👏":"جيد، نراجع كم كلمة ونثبتها")+'</h1>'+
    '<p>هذه مراجعة بسيطة على كلمات درس اليوم، وليست اختبار المعلم الرسمي.</p>'+
    (wrong.length?'<div class="wrong-review"><b>راجعي هذه الكلمات</b><div>'+wrong.map(a=>{const w=lesson.words.find(x=>x.id===a.wordId);return '<span dir="ltr">'+esc(w?w.en:a.wordId)+'</span>'}).join("")+'</div></div>':'<div class="test-feedback success">🏆 كل كلمات الدرس صحيحة!</div>')+
    '<div class="result-actions"><button class="primary" onclick="startLessonQuiz(\''+t.categoryId+'\')">إعادة المراجعة</button><button class="ghost" onclick="home()">إنهاء الدرس</button></div>'+
    '</section></div></main>';
}

let __morningTest=null;
function morningTestWords(){
  return (content().words||[]).filter(w=>w.categoryId==="morning").slice(0,20);
}
function shuffled(list){
  const a=list.slice();
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
  return a;
}
function buildMorningTest(){
  const words=morningTestWords();
  const order=shuffled(words.map(w=>w.id));
  const questions=order.map(id=>{
    const target=words.find(w=>w.id===id);
    const distractors=shuffled(words.filter(w=>w.id!==id)).slice(0,3);
    return {target,options:shuffled([target,...distractors])};
  });
  return {questions,index:0,score:0,answers:[],locked:false};
}
function startMorningTest(){
  applyPrefs();
  if(window.ReemAudio)ReemAudio.stop();
  const words=morningTestWords();
  if(words.length<20){
    return shell('<section class="test-card card"><span class="eyebrow">🎧 اختبار الاستماع</span><h1>الاختبار يحتاج 20 كلمة</h1><p>حالياً الكلمات المتاحة أقل من 20.</p><button class="primary" onclick="home()">العودة</button></section>',"home",false);
  }
  __morningTest=buildMorningTest();
  renderMorningTest();
}
function renderMorningTest(){
  if(!__morningTest)return startMorningTest();
  const t=__morningTest,q=t.questions[t.index],num=t.index+1,total=t.questions.length;
  APP.innerHTML='<main class="student-app"><div class="test-shell">'+
   '<div class="test-top"><button class="back" onclick="home()">←</button><div><b>اختبار الدرسين • عائلة الصباح</b><small>استماع وتحديد الكلمة</small></div><span class="eyebrow">'+num+' / '+total+'</span></div>'+
   '<section class="test-card card"><div class="progress-track"><i style="width:'+(num/total*100)+'%"></i></div>'+
   '<div class="test-question"><span class="test-icon">🎧</span><h1>اسمعي واختاري الكلمة الصحيحة</h1><p>اضغطي على الصوت، ثم اختاري الكلمة الإنجليزية التي سمعتيها.</p>'+
   '<div class="test-audio"><button class="listen-main" onclick="playTestWord(false)">🔊 اسمعي الكلمة</button><button class="listen-slow" onclick="playTestWord(true)">🐢 أبطأ</button></div>'+
   '<div class="test-options">'+q.options.map((w,i)=>'<button id="testOpt'+i+'" onclick="answerMorningTest(\''+w.id+'\','+i+')"><b dir="ltr">'+esc(w.en)+'</b></button>').join("")+'</div>'+
   '<div id="testFeedback" class="test-feedback"></div>'+
   '<button id="testNext" class="primary test-next" onclick="nextMorningTest()" disabled>'+(num===total?"عرض النتيجة":"السؤال التالي →")+'</button>'+
   '</div></section></div></main>';
  setTimeout(()=>playTestWord(false),350);
}
function playTestWord(slow){
  if(!__morningTest)return;
  const q=__morningTest.questions[__morningTest.index];
  if(window.ReemAudio)ReemAudio.speak(q.target.en,!!slow);
}
function answerMorningTest(id,optionIndex){
  if(!__morningTest||__morningTest.locked)return;
  __morningTest.locked=true;
  const q=__morningTest.questions[__morningTest.index];
  const correct=id===q.target.id;
  if(correct)__morningTest.score++;
  __morningTest.answers.push({wordId:q.target.id,selectedId:id,correct});
  q.options.forEach((w,i)=>{
    const b=document.getElementById("testOpt"+i);
    if(!b)return;
    b.disabled=true;
    if(w.id===q.target.id)b.classList.add("correct");
    else if(i===optionIndex&&!correct)b.classList.add("wrong");
  });
  const f=document.getElementById("testFeedback");
  if(f)f.innerHTML=correct?'✅ <b>إجابة صحيحة</b>':'❌ الإجابة الصحيحة: <b dir="ltr">'+esc(q.target.en)+'</b>';
  const n=document.getElementById("testNext");if(n)n.disabled=false;
}
function nextMorningTest(){
  if(!__morningTest||!__morningTest.locked)return;
  if(__morningTest.index<__morningTest.questions.length-1){
    __morningTest.index++;__morningTest.locked=false;renderMorningTest();
  }else finishMorningTest();
}
function finishMorningTest(){
  if(!__morningTest)return;
  if(window.ReemAudio)ReemAudio.stop();
  const t=__morningTest,total=t.questions.length,score=t.score,pct=Math.round(score/total*100);
  const wrong=t.answers.filter(a=>!a.correct);
  const p=profile();
  p.completedTests=(p.completedTests||0)+1;
  p.points=(p.points||0)+score*2;
  ReemStore.saveProfile(p);
  const subs=ReemStore.getSubmissions();
  subs.push({id:"morning-listening-"+Date.now(),type:"listening-word-choice",title:"اختبار الدرسين — عائلة الصباح",score,total,percent:pct,answers:t.answers,submittedAt:new Date().toISOString()});
  ReemStore.saveSubmissions(subs);
  APP.innerHTML='<main class="student-app"><div class="test-shell"><section class="test-card result-card card">'+
   '<div class="result-ring"><strong>'+pct+'%</strong><span>'+score+' / '+total+'</span></div>'+
   '<span class="eyebrow">🎧 نتيجة اختبار الاستماع</span><h1>'+(pct>=80?"ممتاز!":"نراجع الكلمات اللي تحتاج تثبيت")+'</h1>'+
   '<p>الاختبار كان من جميع كلمات الدرس الأول والثاني، 20 سؤال استماع واختيار.</p>'+
   (wrong.length?'<div class="wrong-review"><b>الكلمات التي تحتاج مراجعة</b><div>'+wrong.map(a=>{const w=morningTestWords().find(x=>x.id===a.wordId);return '<span dir="ltr">'+esc(w?w.en:a.wordId)+'</span>'}).join("")+'</div></div>':'<div class="test-feedback success">🏆 كل الإجابات صحيحة!</div>')+
   '<div class="result-actions"><button class="primary" onclick="startMorningTest()">إعادة الاختبار</button><button class="ghost" onclick="home()">الرئيسية</button></div>'+
   '</section></div></main>';
}

function wordsPage(categoryId){
  applyPrefs();
  const c=content(),p=profile();let words=c.words||[];
  if(categoryId)words=words.filter(w=>w.categoryId===categoryId);
  shell('<div class="page-title"><div><span class="eyebrow">📚 الكلمات</span><h1>'+(categoryId?esc((c.categories||[]).find(x=>x.id===categoryId)?.nameAr||"الفئة"):"كل الكلمات")+'</h1></div><span class="eyebrow">'+p.learnedWordIds.length+' محفوظة</span></div>'+(words.length?'<div class="word-grid">'+words.map(w=>'<article class="word-tile"><img src="'+esc(w.image)+'" alt="'+esc(w.en)+'"><div class="body"><h3>'+esc(w.en)+'</h3><p>'+esc(w.ar)+' • '+esc(w.pronunciation)+'</p><button class="ghost" onclick="playWord(\''+esc(w.en)+'\',false)">🔊 اسمع</button></div></article>').join("")+'</div>':'<div class="empty">ما فيه كلمات في هذه الفئة حتى الآن.</div>'),"words");
}
function categoriesPage(){
  applyPrefs();const c=content();
  shell('<div class="page-title"><div><span class="eyebrow">🗂️ الفئات</span><h1>عائلات الكلمات</h1></div><span class="eyebrow">'+(c.categories||[]).length+' فئات</span></div><section class="card categories" style="margin-top:0"><div class="category-grid">'+(c.categories||[]).map(cat=>categoryCard(cat,c.words)).join("")+'</div></section>',"cats");
}
function settingsPage(){
  applyPrefs();const p=profile(),pref=p.preferences||{};
  shell('<div class="page-title"><div><span class="eyebrow">⚙️ واجهتك</span><h1>الإعدادات</h1></div></div><div class="settings"><div class="setting-row"><div><label>حجم الخط</label><small>صغير، عادي، كبير</small></div><div class="seg"><button class="'+((pref.fontScale||1)<1?"active":"")+'" onclick="setPref(\'fontScale\',.9)">صغير</button><button class="'+((pref.fontScale||1)===1?"active":"")+'" onclick="setPref(\'fontScale\',1)">عادي</button><button class="'+((pref.fontScale||1)>1?"active":"")+'" onclick="setPref(\'fontScale\',1.12)">كبير</button></div></div><div class="setting-row"><div><label>الوضع</label><small>ليلي أو فاتح</small></div><div class="seg"><button class="'+((pref.theme||"dark")==="dark"?"active":"")+'" onclick="setPref(\'theme\',\'dark\')">🌙 ليلي</button><button class="'+(pref.theme==="light"?"active":"")+'" onclick="setPref(\'theme\',\'light\')">☀️ فاتح</button></div></div><div class="setting-row"><div><label>لون الواجهة</label><small>اختاري اللون اللي يريحك</small></div><div class="seg"><button class="'+((pref.accent||"pink")==="pink"?"active":"")+'" onclick="setPref(\'accent\',\'pink\')">وردي</button><button class="'+(pref.accent==="purple"?"active":"")+'" onclick="setPref(\'accent\',\'purple\')">بنفسجي</button><button class="'+(pref.accent==="blue"?"active":"")+'" onclick="setPref(\'accent\',\'blue\')">أزرق</button></div></div></div>',"settings");
}
function setPref(key,value){const p=profile();p.preferences=p.preferences||{};p.preferences[key]=value;ReemStore.saveProfile(p);settingsPage();}
applyPrefs();home();
if(window.ReemCloud){
  ReemCloud.mergeAndSync().then(()=>{applyPrefs();home();}).catch(()=>{});
}