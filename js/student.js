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
  const p=profile(),c=content(),prog=courseProgress(p),left=Math.max(0,100-prog),today=(c.words||[]).filter(w=>w.categoryId==="morning").slice(0,10);
  shell(
    '<div class="topbar"><div class="welcome"><span class="eyebrow">✨ '+ordinalDay(dayNumber(p))+'</span><h1>أهلاً وسهلاً بك يا '+esc(p.name)+'</h1><p>كل يوم 10 كلمات عملية من حياتك اليومية، بصور ونطق وجملة واضحة.</p></div>'+topSummary(p)+'</div>'+
    '<div class="layout"><section class="hero card"><div class="hero-content"><span class="eyebrow">☀️ درس اليوم • عائلة الصباح</span><h2>10 كلمات جديدة</h2><p>نبدأ بالكلمات اللي تستخدمينها من أول ما تصحين: الاستيقاظ، السرير، الحمّام، الفطور، الماء والاستعداد.</p><div class="hero-actions"><button class="primary" onclick="startStudy(0)">ابدئي كلمات اليوم ▶</button><button class="ghost" onclick="wordsPage()">شوفي الكلمات كلها</button></div><div class="progress-block"><div class="progress-label"><span>التقدم الكلي</span><b>'+prog+'% • المتبقي '+left+'%</b></div><div class="progress-track"><i style="width:'+prog+'%"></i></div></div></div></section>'+
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

function startStudy(index=0){
  applyPrefs();
  if(window.ReemAudio)ReemAudio.stop();
  if(window.ReemRecorder&&ReemRecorder.isRecording())ReemRecorder.cancel();

  const words=(content().words||[]).filter(w=>w.categoryId==="morning").slice(0,10);
  if(!words.length)return wordsPage();
  const i=Math.max(0,Math.min(words.length-1,index)),w=words[i],p=profile();

  APP.innerHTML='<main class="student-app"><div class="study-shell">'+
    '<div class="study-top"><button class="back" onclick="home()">←</button><div><b>عائلة الصباح</b><div class="word-count">'+(i+1)+' / '+words.length+'</div></div><span class="eyebrow">'+courseProgress(p)+'% إجمالي</span></div>'+
    '<section class="study-card card"><div class="progress-track"><i style="width:'+((i+1)/words.length*100)+'%"></i></div>'+
    '<div class="word-layout"><img class="word-image" src="'+esc(w.image)+'" alt="'+esc(w.en)+'">'+
    '<div class="word-copy"><div class="word-count">كلمة اليوم</div><h2 dir="ltr">'+esc(w.en)+'</h2><div class="arabic">'+esc(w.ar)+'</div><div class="pron">'+esc(w.pronunciation)+'</div>'+
    '<div class="audio-actions"><button class="normal" onclick="playWord(\''+esc(w.en)+'\',false)">🔊 عادي</button><button class="slow" onclick="playWord(\''+esc(w.en)+'\',true)">🐢 بطيء</button></div>'+
    '<div class="record-panel"><button id="recordBtn" class="record-main" onclick="toggleRecording(\''+esc(w.en)+'\')">🎙️ سجلي نطقك</button><div id="recordStatus" class="record-status">اسمعي الكلمة أول، ثم سجلي صوتك وقارنيه بالنطق الصحيح.</div><div id="recordPlayback"></div></div>'+
    '<div class="example-card"><b>'+esc(w.exampleEn)+'</b><small>'+esc(w.exampleAr)+'</small></div>'+
    '<div class="word-actions"><button class="learned" onclick="markLearned(\''+w.id+'\','+i+')">✓ حفظتها</button><button class="review" onclick="markReview(\''+w.id+'\','+i+')">↻ راجعها</button><button onclick="nextWord('+i+')">'+(i===words.length-1?"إنهاء اليوم":"التالي →")+'</button></div>'+
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

function markLearned(id,i){ReemStore.addLearned(id);startStudy(i)}
function markReview(id,i){ReemStore.addReview(id);startStudy(i)}
function nextWord(i){
  const words=(content().words||[]).filter(w=>w.categoryId==="morning").slice(0,10);
  if(i<words.length-1)startStudy(i+1);else home();
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