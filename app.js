var A=document.getElementById("app"),LEVELS=window.ENGLISH_DAILY_LEVELS;
var state=JSON.parse(localStorage.getItem("englishDailyV1")||"{}");
if(!state.name)state.name="ريم";
if(!state.unlockedLevel)state.unlockedLevel=1;
if(!state.currentLevel)state.currentLevel=1;
if(!state.xp)state.xp=0;
if(!state.saved)state.saved=[];
if(!state.speechRate)state.speechRate=.7;
if(!state.voiceLang)state.voiceLang="en-US";
if(!state.progress)state.progress={};
for(var z=1;z<=6;z++){if(!state.progress[z])state.progress[z]={completedSteps:0,score:0,status:z===1?"in_progress":"locked"};}
function save(){localStorage.setItem("englishDailyV1",JSON.stringify(state));}
function esc(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function speak(text,rate){speechSynthesis.cancel();var u=new SpeechSynthesisUtterance(text);u.lang=state.voiceLang;u.rate=rate||state.speechRate;speechSynthesis.speak(u);}
function shell(inner){A.innerHTML='<main class="scene"><div class="wrap">'+inner+'</div></main>';}
function bottomNav(active){
var items=[["home","🏠","الرئيسية"],["levels","🗺️","مستوياتي"],["savedWords","🔖","المحفوظة"],["account","👤","حسابي"]];
return '<nav class="bottom-nav">'+items.map(function(x){return '<button class="'+(active===x[0]?"active":"")+'" onclick="'+x[0]+'()"><b>'+x[1]+'</b><small>'+x[2]+'</small></button>';}).join("")+'</nav>';
}
function brand(){return '<div class="brand">English <span>Daily ♥</span><small>تعلّم الإنجليزية من حياتك اليومية</small></div>';}
function levelState(i){
var n=i+1,p=state.progress[n];
if(n>state.unlockedLevel)return "locked";
if(p.status==="completed")return "completed";
return "in_progress";
}
function home(){
var l=LEVELS[state.currentLevel-1],p=state.progress[state.currentLevel];
shell('<header>'+brand()+'<div class="profile-chip">🌷 '+esc(state.name)+' <b>⭐ '+state.xp+'</b></div></header>'+
'<section class="hero"><div><span class="eyebrow">المستوى الحالي • '+l.cefr+'</span><h1>الإنجليزي من الحياة 🤍</h1><p>كلمات حقيقية من يومك، ثم نطقها وقاعدتها وقراءتها، وبعدها اختبار يفتح لك المرحلة التالية.</p><div class="hero-actions"><button class="primary" onclick="openLevel('+l.id+')">كمّلي المسار ▶</button><button class="ghost" onclick="savedWords()">🔖 كلماتي</button></div></div><div class="hero-visual"><div>'+l.scene+'</div><small>'+progressText(l.id)+'</small></div></section>'+
'<section class="stats"><div><b>🔥</b><span>المسار</span><strong>'+l.id+' / 6</strong></div><div><b>⭐</b><span>النقاط</span><strong>'+state.xp+'</strong></div><div><b>🎯</b><span>آخر نتيجة</span><strong>'+p.score+'%</strong></div></section>'+
'<div class="section-title"><div><span>مسارك المقفل</span><h2>المستويات الستة</h2></div><button onclick="levels()">عرض الكل ←</button></div>'+
'<div class="level-grid">'+LEVELS.map(levelCard).join("")+'</div>'+bottomNav("home"));
}
function progressText(id){
var p=state.progress[id];
if(p.status==="completed")return "مكتمل ✓";
return "الخطوة "+Math.min(p.completedSteps+1,5)+" من 5";
}
function levelCard(l,i){
var st=levelState(i),label=st==="locked"?"🔒 مقفل":st==="completed"?"✓ مكتمل":"● قيد التعلم";
return '<button class="level-card '+st+'" '+(st==="locked"?'disabled':'onclick="openLevel('+l.id+')"')+'><div class="level-scene lv'+l.id+'"><em>'+l.scene+'</em><span>'+label+'</span></div><div class="level-copy"><small>'+l.cefr+'</small><h3>'+l.title+'</h3><p>50 كلمة • 5 خطوات</p></div></button>';
}
function levels(){
shell('<header>'+brand()+'<button class="ghost small" onclick="home()">رجوع</button></header>'+
'<section class="page-head"><span class="eyebrow">Strict Progression</span><h1>مستوياتي 🗺️</h1><p>ابدئي من المستوى الأول. كل مستوى يفتح فقط بعد إكمال الخطوات الخمس والحصول على 80% أو أكثر.</p></section>'+
'<div class="timeline">'+LEVELS.map(function(l,i){var st=levelState(i);return '<button class="timeline-item '+st+'" '+(st==="locked"?'disabled':'onclick="openLevel('+l.id+')"')+'><div class="timeline-icon">'+(st==="locked"?"🔒":st==="completed"?"🏅":l.scene)+'</div><div><span>'+l.cefr+' • المستوى '+l.id+'</span><h3>'+l.title+'</h3><p>50 كلمة • صوتيات • قواعد • قراءة • اختبار</p></div><strong>'+progressText(l.id)+'</strong></button>';}).join("")+'</div>'+bottomNav("levels"));
}
function openLevel(id){
if(id>state.unlockedLevel)return;
state.currentLevel=id;save();
var l=LEVELS[id-1],p=state.progress[id];
var steps=[["📚","الكلمات العملية","50 كلمة • 5 مجموعات"],["🔤","النطق والصوتيات","Phonics من نفس كلمات المستوى"],["🧩","القواعد الأساسية",l.grammar.title],["📖","قراءة المقال",l.article.title],["🏆","المراجعة والاختبار","النجاح من 80%"]];
shell('<header><button class="ghost small" onclick="levels()">رجوع</button><div class="level-title"><span>'+l.cefr+'</span><b>المستوى '+id+' • '+l.title+'</b></div></header>'+
'<section class="level-hero lvbg'+id+'"><div><span class="eyebrow">'+(p.status==="completed"?"مكتمل ✓":"قيد التعلم")+'</span><h1>'+l.scene+' '+l.title+'</h1><p>التسلسل إجباري: كلمات ← صوتيات ← قواعد ← قراءة ← اختبار.</p><div class="meter"><i style="width:'+Math.min(p.completedSteps/5*100,100)+'%"></i></div></div><strong>'+p.completedSteps+'/5</strong></section>'+
'<div class="step-list">'+steps.map(function(x,i){return stepCard(id,i,x,p);}).join("")+'</div>'+bottomNav("levels"));
}
function stepCard(levelId,index,data,p){
var unlocked=index<=p.completedSteps,done=index<p.completedSteps||p.status==="completed",cls=!unlocked?"locked":done?"completed":"current";
var action=["vocabulary","phonics","grammar","reading","quiz"][index];
return '<button class="step-card '+cls+'" '+(!unlocked?'disabled':'onclick="'+action+'('+levelId+')"')+'><div class="step-no">'+(done?"✓":!unlocked?"🔒":index+1)+'</div><div><span>الخطوة '+(index+1)+'</span><h3>'+data[0]+' '+data[1]+'</h3><p>'+data[2]+'</p></div><i>←</i></button>';
}
var vLevel=1,vIndex=0;
function vocabulary(levelId,index){
vLevel=levelId;vIndex=typeof index==="number"?index:0;renderWord();
}
function renderWord(){
var l=LEVELS[vLevel-1],w=l.words[vIndex],group=Math.floor(vIndex/10)+1,saved=state.saved.indexOf(vLevel+":"+vIndex)>=0;
shell('<header><button class="ghost small" onclick="openLevel('+vLevel+')">رجوع</button><div class="lesson-count">📚 الكلمات • '+(vIndex+1)+'/50</div></header>'+
'<div class="group-tabs">'+l.groups.map(function(g,i){return '<button class="'+(group===i+1?"active":"")+'" onclick="vIndex='+(i*10)+';renderWord()"> '+(i+1)+'. '+g+'</button>';}).join("")+'</div>'+
'<section class="word-card"><div class="photo-wrap"><img src="'+w.image+'" alt="'+esc(w.en)+'" loading="lazy" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'grid\'"><div class="fallback">'+w.icon+'</div><button class="bookmark '+(saved?"saved":"")+'" onclick="toggleSave('+vLevel+','+vIndex+')">'+(saved?"★":"☆")+'</button></div><div class="word-body"><span class="eyebrow">المجموعة '+group+' • '+l.groups[group-1]+'</span><h1 dir="ltr">'+esc(w.en)+'</h1><h2>'+esc(w.ar)+'</h2><p class="phonetic">'+esc(w.phonetic)+'</p><div class="example" dir="ltr">'+esc(w.example)+'</div><div class="audio-row"><button class="primary" onclick="speak(\''+escJs(w.en)+'\',1)">🔊 عادي</button><button class="ghost" onclick="speak(\''+escJs(w.en)+'\',.7)">🐢 بطيء</button><button class="ghost" onclick="practiceVoice(\''+escJs(w.en)+'\')">🎙️ جرّبي</button></div><div id="voiceResult" class="voice-result"></div></div></section>'+
pager(vIndex,50,"word")+(vIndex===49?'<button class="finish-btn" onclick="completeStep('+vLevel+',1)">أنهيت الكلمات الـ 50 ✓</button>':'')+bottomNav());
}
function escJs(t){return String(t).replace(/\\/g,"\\\\").replace(/'/g,"\\'");}
function toggleSave(l,i){var key=l+":"+i,pos=state.saved.indexOf(key);if(pos>=0)state.saved.splice(pos,1);else state.saved.push(key);save();renderWord();}
function pager(i,total,type){
var prev=type==="word"?"prevWord()":"prevPhonic()",next=type==="word"?"nextWord()":"nextPhonic()";
return '<div class="pager"><button '+(i===0?"disabled":"")+' onclick="'+prev+'">→ السابق</button><div><b>'+(i+1)+' / '+total+'</b><span><i style="width:'+((i+1)/total*100)+'%"></i></span></div><button class="primary" '+(i===total-1?"disabled":"")+' onclick="'+next+'">التالي ←</button></div>';
}
function prevWord(){if(vIndex>0){vIndex--;renderWord();}}
function nextWord(){if(vIndex<49){vIndex++;renderWord();}}
var pLevel=1,pIndex=0;
function phonics(levelId,index){pLevel=levelId;pIndex=typeof index==="number"?index:0;renderPhonic();}
function renderPhonic(){
var l=LEVELS[pLevel-1],x=l.phonics[pIndex];
shell('<header><button class="ghost small" onclick="openLevel('+pLevel+')">رجوع</button><div class="lesson-count">🔤 الصوتيات • '+(pIndex+1)+'/'+l.phonics.length+'</div></header>'+
'<section class="sound-card lvbg'+pLevel+'"><span class="eyebrow">Phonics & Pronunciation</span><h1>'+esc(x[0])+'</h1><div class="sound-symbol">'+esc(x[2])+'</div><p dir="ltr">'+esc(x[1])+'</p><div class="audio-row"><button class="primary" onclick="speak(\''+escJs(x[1].split(" • ")[0])+'\',1)">🔊 عادي</button><button class="ghost" onclick="speak(\''+escJs(x[1].split(" • ")[0])+'\',.7)">🐢 بطيء</button><button class="ghost" onclick="practiceVoice(\''+escJs(x[1].split(" • ")[0])+'\')">🎙️ جرّبي</button></div><div id="voiceResult" class="voice-result"></div></section>'+
pager(pIndex,l.phonics.length,"phonic")+(pIndex===l.phonics.length-1?'<button class="finish-btn" onclick="completeStep('+pLevel+',2)">أنهيت درس الصوتيات ✓</button>':'')+bottomNav());
}
function prevPhonic(){if(pIndex>0){pIndex--;renderPhonic();}}
function nextPhonic(){if(pIndex<LEVELS[pLevel-1].phonics.length-1){pIndex++;renderPhonic();}}
function grammar(levelId){
var l=LEVELS[levelId-1],g=l.grammar;
shell('<header><button class="ghost small" onclick="openLevel('+levelId+')">رجوع</button><div class="lesson-count">🧩 القواعد</div></header>'+
'<section class="grammar-card"><span class="eyebrow">'+l.cefr+' • Basic Grammar</span><h1>'+esc(g.title)+'</h1><div class="rule-box">'+esc(g.rule)+'</div><h3>أمثلة من الحياة</h3>'+g.examples.map(function(e){return '<div class="grammar-example"><span dir="ltr">'+esc(e)+'</span><button onclick="speak(\''+escJs(e)+'\')">🔊</button></div>';}).join("")+'<div class="tip">💡 افهمي شكل الجملة أولاً، ثم اسمعيها وكرريها بصوتك. ما نحتاج حفظ تعريفات طويلة.</div></section>'+
'<button class="finish-btn" onclick="completeStep('+levelId+',3)">فهمت القاعدة، التالي ✓</button>'+bottomNav());
}
function reading(levelId){
var l=LEVELS[levelId-1],r=l.article;
shell('<header><button class="ghost small" onclick="openLevel('+levelId+')">رجوع</button><div class="lesson-count">📖 القراءة</div></header>'+
'<section class="reading-card"><span class="eyebrow">'+l.cefr+' • Reading</span><h1 dir="ltr">'+esc(r.title)+'</h1><p dir="ltr">'+esc(r.text)+'</p><div class="audio-row"><button class="primary" onclick="speak(\''+escJs(r.text)+'\',1)">🔊 استماع عادي</button><button class="ghost" onclick="speak(\''+escJs(r.text)+'\',.7)">🐢 بطيء</button></div></section>'+
'<button class="finish-btn" onclick="completeStep('+levelId+',4)">أنهيت القراءة ✓</button>'+bottomNav());
}
function completeStep(levelId,stepNumber){
var p=state.progress[levelId];
if(stepNumber>p.completedSteps)p.completedSteps=stepNumber;
p.status="in_progress";state.xp+=20;save();
openLevel(levelId);
}
var quizState=null;
var grammarQuiz=[
[["اختر الجملة الصحيحة","I drink water.","I water drink.","Drink I water.","I drink water."],["أكمل: I ___ my family.","help","helps","helped","help"],["أي صيغة تناسب I؟","I clean my room.","I cleans my room.","I cleaning room.","I clean my room."]],
[["حوّل للنفي: I like cold weather.","I don't like cold weather.","I not like cold weather.","I doesn't like cold weather.","I don't like cold weather."],["أكمل: I ___ go to school today.","don't","doesn't","not","don't"],["بعد don't نستخدم","الفعل الأساسي","الفعل + s","الماضي","الفعل الأساسي"]],
[["طلب مهذب صحيح","Can I get the bill, please?","I can bill?","Do bill me.","Can I get the bill, please?"],["سؤال صحيح","Do you have coffee?","You do have coffee?","Have coffee do?","Do you have coffee?"],["Can I... تستخدم غالباً لـ","طلب شيء بأدب","الماضي","الجمع","طلب شيء بأدب"]],
[["أكمل: I ___ from Saudi Arabia.","am","is","are","am"],["مع he نستخدم","is","am","are","is"],["سؤال صحيح","Where do you live?","Where you live do?","Where is live?","Where do you live?"]],
[["الماضي من buy","bought","buyed","buys","bought"],["المستقبل الصحيح","I will travel tomorrow.","I will traveled tomorrow.","I travel will tomorrow.","I will travel tomorrow."],["Better تعني","أفضل","الأسوأ","الأبطأ","أفضل"]],
[["صيغة رأي صحيحة","I think this project is important.","I thinking project important.","Think I this.","I think this project is important."],["I agree تعني","أنا أوافق","أنا أرفض","أنا أنتظر","أنا أوافق"],["جملة احترافية","We need to check the deadline.","We deadline check need.","Need check we.","We need to check the deadline."]]
];
function buildQuiz(levelId){
var pool=levelId===6?[].concat.apply([],LEVELS.map(function(l){return l.words;})):LEVELS[levelId-1].words;
var vocabCount=levelId===6?20:10,questions=[],used={};
while(questions.length<vocabCount){
var w=pool[Math.floor(Math.random()*pool.length)];if(used[w.en])continue;used[w.en]=1;
var others=pool.filter(function(o){return o.ar!==w.ar;}).sort(function(){return Math.random()-.5;}).slice(0,3).map(function(o){return o.ar;});
var opts=[w.ar].concat(others).sort(function(){return Math.random()-.5;});
questions.push({q:"ما معنى "+w.en+"؟",opts:opts,answer:w.ar,type:"مفردات"});
}
var gs=levelId===6?[].concat.apply([],grammarQuiz):grammarQuiz[levelId-1];
var needG=levelId===6?6:3;
gs.sort(function(){return Math.random()-.5;}).slice(0,needG).forEach(function(q){questions.push({q:q[0],opts:[q[1],q[2],q[3]].sort(function(){return Math.random()-.5;}),answer:q[4],type:"قواعد"});});
var readLevels=levelId===6?LEVELS.slice(0,2):[LEVELS[levelId-1]];
var reads=[];readLevels.forEach(function(l){l.article.questions.forEach(function(q){reads.push(q);});});
var needR=levelId===6?4:2;
while(reads.length<needR)reads=reads.concat(reads);
reads.slice(0,needR).forEach(function(q){questions.push({q:q[0],opts:[q[1],q[2],q[3]].sort(function(){return Math.random()-.5;}),answer:q[4],type:"فهم المقروء"});});
return questions.sort(function(){return Math.random()-.5;});
}
function quiz(levelId){
var p=state.progress[levelId];if(p.completedSteps<4)return openLevel(levelId);
quizState={level:levelId,index:0,correct:0,answers:[],questions:buildQuiz(levelId)};renderQuiz();
}
function renderQuiz(){
var q=quizState.questions[quizState.index],l=LEVELS[quizState.level-1];
shell('<header><button class="ghost small" onclick="openLevel('+quizState.level+')">إنهاء</button><div class="lesson-count">🏆 اختبار '+l.cefr+' • '+(quizState.index+1)+'/'+quizState.questions.length+'</div></header>'+
'<section class="quiz-card"><span class="eyebrow">'+q.type+'</span><div class="quiz-meter"><i style="width:'+((quizState.index+1)/quizState.questions.length*100)+'%"></i></div><h1>'+esc(q.q)+'</h1><div class="quiz-options">'+q.opts.map(function(o){return '<button onclick="answerQuiz(\''+escJs(o)+'\',this)">'+esc(o)+'</button>';}).join("")+'</div></section>'+bottomNav());
}
function answerQuiz(answer,el){
var q=quizState.questions[quizState.index],buttons=document.querySelectorAll(".quiz-options button");
buttons.forEach(function(b){b.disabled=true;if(b.textContent===q.answer)b.classList.add("right");});
if(answer===q.answer){quizState.correct++;el.classList.add("right");}else el.classList.add("wrong");
setTimeout(function(){quizState.index++;if(quizState.index<quizState.questions.length)renderQuiz();else quizResult();},650);
}
function quizResult(){
var score=Math.round(quizState.correct/quizState.questions.length*100),id=quizState.level,pass=score>=80,p=state.progress[id];
p.score=Math.max(p.score||0,score);
if(pass){
p.completedSteps=5;p.status="completed";state.xp+=100;
if(id<6){state.unlockedLevel=Math.max(state.unlockedLevel,id+1);state.progress[id+1].status="in_progress";state.currentLevel=id+1;}
}
save();
shell('<section class="result '+(pass?"pass":"fail")+'"><div class="result-icon">'+(pass?"🏆":"💪")+'</div><span class="eyebrow">'+(pass?"نجحتِ":"نحتاج مراجعة بسيطة")+'</span><h1>'+score+'%</h1><p>'+(pass?(id<6?"ممتاز! فتح لك المستوى "+(id+1)+" تلقائياً.":"مبروك! أكملتِ مسار English Daily بالكامل."):"المطلوب 80% للعبور. راجعي المستوى ثم أعيدي الاختبار.")+'</p><button class="primary" onclick="'+(pass&&id<6?"openLevel("+(id+1)+")":"openLevel("+id+")")+'">'+(pass&&id<6?"ابدئي المستوى التالي ▶":"العودة للمستوى")+'</button>'+(pass&&id===6?'<button class="ghost" onclick="certificate()">🎓 عرض شهادة الإتمام</button>':'')+'</section>'+bottomNav("levels"));
}
function savedWords(){
var cards=state.saved.map(function(key){var p=key.split(":"),l=LEVELS[Number(p[0])-1],w=l.words[Number(p[1])];return '<button class="saved-card" onclick="vocabulary('+p[0]+','+p[1]+')"><span>'+w.icon+'</span><div><b dir="ltr">'+esc(w.en)+'</b><small>'+esc(w.ar)+' • '+esc(w.phonetic)+'</small></div><i>🔊</i></button>';});
shell('<header>'+brand()+'<button class="ghost small" onclick="home()">رجوع</button></header><section class="page-head"><h1>🔖 كلماتي المحفوظة</h1><p>أي كلمة تضغطين عليها ★ تبقى هنا للمراجعة السريعة.</p></section><div class="saved-list">'+(cards.length?cards.join(""):'<div class="empty">ما حفظتِ كلمات للحين. أثناء الدرس اضغطي ☆ على أي كلمة.</div>')+'</div>'+bottomNav("savedWords"));
}
function account(){
shell('<header>'+brand()+'<button class="ghost small" onclick="home()">رجوع</button></header><section class="page-head"><h1>👤 حسابي</h1><p>إعدادات النطق والتقدم على هذا الجهاز.</p></section>'+
'<section class="settings-card"><label>الاسم</label><input id="nameInput" value="'+esc(state.name)+'"><label>لهجة الصوت</label><div class="seg"><button class="'+(state.voiceLang==="en-US"?"active":"")+'" onclick="setVoice(\'en-US\')">🇺🇸 أمريكي</button><button class="'+(state.voiceLang==="en-GB"?"active":"")+'" onclick="setVoice(\'en-GB\')">🇬🇧 بريطاني</button></div><label>سرعة النطق الافتراضية</label><div class="seg"><button class="'+(state.speechRate===.7?"active":"")+'" onclick="setRate(.7)">🐢 بطيء</button><button class="'+(state.speechRate===1?"active":"")+'" onclick="setRate(1)">▶ عادي</button></div><button class="primary full" onclick="saveProfile()">حفظ الإعدادات</button><div class="account-stats"><div><b>'+state.unlockedLevel+'/6</b><span>المستويات المفتوحة</span></div><div><b>'+state.xp+'</b><span>XP</span></div><div><b>'+state.saved.length+'</b><span>كلمة محفوظة</span></div></div></section>'+bottomNav("account"));
}
function setVoice(v){state.voiceLang=v;save();account();}
function setRate(r){state.speechRate=r;save();account();}
function saveProfile(){var n=document.getElementById("nameInput").value.trim();if(n)state.name=n;save();home();}
function certificate(){
shell('<section class="certificate"><div class="cert-mark">🎓</div><span>Certificate of Completion</span><h1>English Daily</h1><p>تشهد المنصة بأن</p><h2>'+esc(state.name)+'</h2><p>أكملت المسار التعليمي الكامل بنجاح</p><strong>300 كلمة • صوتيات • قواعد • قراءة • اختبارات</strong><button class="primary" onclick="home()">العودة للرئيسية</button></section>');
}
function practiceVoice(target){
var out=document.getElementById("voiceResult");if(out)out.textContent="🎙️ تكلّمي الآن...";
var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
if(SR){
var r=new SR();r.lang=state.voiceLang;r.interimResults=false;r.maxAlternatives=1;
r.onresult=function(e){var heard=e.results[0][0].transcript,ok=heard.toLowerCase().indexOf(target.toLowerCase())>=0||target.toLowerCase().indexOf(heard.toLowerCase())>=0;if(out)out.innerHTML=(ok?"✅ ممتاز! ":"🔁 سمعنا: ")+esc(heard);};
r.onerror=function(){fallbackRecord(out);};r.start();return;
}
fallbackRecord(out);
}
function fallbackRecord(out){
if(!navigator.mediaDevices||!window.MediaRecorder){if(out)out.textContent="التسجيل الصوتي غير مدعوم في هذا المتصفح.";return;}
navigator.mediaDevices.getUserMedia({audio:true}).then(function(stream){
var rec=new MediaRecorder(stream),chunks=[];rec.ondataavailable=function(e){chunks.push(e.data);};rec.onstop=function(){var url=URL.createObjectURL(new Blob(chunks,{type:rec.mimeType}));if(out)out.innerHTML='تم التسجيل ✅ <audio controls src="'+url+'"></audio>';stream.getTracks().forEach(function(t){t.stop();});};rec.start();setTimeout(function(){rec.stop();},3000);
}).catch(function(){if(out)out.textContent="اسمحي للميكروفون من إعدادات المتصفح لتجربة النطق.";});
}
home();