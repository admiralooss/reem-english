const QUIZ=[
{t:'image',q:'ما الكلمة الصحيحة لهذه الصورة؟',kind:'water',o:['milk','water','bread'],a:'water'},
{t:'listen',q:'اسمعي الكلمة واختاري معناها',s:'shower',o:['دش','سرير','غرفة'],a:'دش'},
{t:'order',q:'رتبي الجملة الصحيحة',w:['water','I','drink'],a:'I drink water'},
{t:'choice',q:'اختاري الجملة الصحيحة',o:['I drink water.','I water drink.','Drink I water.'],a:'I drink water.'},
{t:'choice',q:'ما معنى breakfast؟',o:['الفطور','الغرفة','الماء'],a:'الفطور'}
];
function startQuiz(){quizIndex=0;quizCorrect=0;quizAnswered=false;arranged=[];quiz();}
function quiz(){
 var q=QUIZ[quizIndex],body='';
 if(q.t==='image')body='<div class="use-visual">'+art(q.kind)+'</div>'+opts(q);
 else if(q.t==='listen')body='<div class="center" style="margin:25px 0"><button class="mic-button" onclick="speakWord(\''+q.s+'\',false)">🔊</button></div>'+opts(q);
 else if(q.t==='order')body='<div class="sentence-drop" id="sentenceDrop"></div><div class="word-bank">'+q.w.map(function(w){return '<button class="word-chip" onclick="addWord(\''+w+'\',this)">'+w+'</button>';}).join('')+'</div><button class="primary full" style="margin-top:16px" onclick="checkOrder()">تحقق</button>';
 else body=opts(q);
 shell('<div class="lesson-shell">'+topbar('lessonMap()')+'<div class="lesson-top"><div><span class="kicker">7 / 7</span><h2>الاختبار القصير 🏆</h2></div><span>'+(quizIndex+1)+' / '+QUIZ.length+'</span></div><div class="quiz-meter"><i style="width:'+((quizIndex+1)/QUIZ.length*100)+'%"></i></div><section class="quiz-card glass" style="margin-top:14px"><h1>'+q.q+'</h1>'+body+'<div id="quizFeedback"></div></section></div>');
}
function opts(q){return '<div class="quiz-options">'+q.o.map(function(o){return '<button onclick="answerQuiz(\''+esc(o)+'\',this)">'+esc(o)+'</button>';}).join('')+'</div>';}
function answerQuiz(ans,btn){
 if(quizAnswered)return;
 quizAnswered=true;
 var q=QUIZ[quizIndex];
 document.querySelectorAll('.quiz-options button').forEach(function(b){if(b.textContent===q.a)b.classList.add('correct');});
 if(ans===q.a){quizCorrect++;btn.classList.add('correct');}else btn.classList.add('wrong');
 nextQuiz();
}
function addWord(w,btn){if(quizAnswered)return;arranged.push(w);btn.disabled=true;document.getElementById('sentenceDrop').innerHTML=arranged.map(function(x){return '<span class="word-chip">'+x+'</span>';}).join('');}
function checkOrder(){
 if(quizAnswered)return;
 quizAnswered=true;
 var q=QUIZ[quizIndex],ok=arranged.join(' ')===q.a;
 if(ok)quizCorrect++;
 document.getElementById('quizFeedback').innerHTML='<div class="feedback">'+(ok?'✅ ممتاز! الجملة صحيحة.':'🤍 الصحيح: <span dir="ltr">'+q.a+'</span>')+'</div>';
 nextQuiz();
}
function nextQuiz(){setTimeout(function(){quizIndex++;quizAnswered=false;arranged=[];if(quizIndex<QUIZ.length)quiz();else quizResult();},850);}
function quizResult(){
 var score=Math.round(quizCorrect/QUIZ.length*100);
 state.quizBest=Math.max(state.quizBest||0,score);
 if(score>=80){state.lessonDone=true;state.step=8;state.worldProgress=Math.max(state.worldProgress,25);state.xp+=50;state.streak=Math.max(state.streak,8);state.weak=state.weak.filter(function(x){return x!=='water';});}
 else{if(!state.weak.includes('water'))state.weak.push('water');state.step=7;}
 save();
 if(score>=80)reward(score);else weakResult(score);
}
function reward(score){
 shell('<div class="lesson-shell">'+topbar('home()')+'<section class="reward-card glass"><div class="reward-star">⭐</div><span class="kicker">درس مكتمل</span><h1>أحسنتِ يا ريم! 🎉</h1><p style="color:var(--muted)">أكملتِ My Morning بنجاح. الدرس التالي يفتح بعد اعتماد محتواه.</p><div class="reward-grid"><div class="reward-box"><b>+50</b><span>XP</span></div><div class="reward-box"><b>🔥 +1</b><span>Streak</span></div><div class="reward-box"><b>'+score+'%</b><span>النتيجة</span></div></div><button class="primary full" onclick="home()">العودة للرئيسية</button><button class="secondary full" style="margin-top:9px;width:100%" onclick="review()">مراجعة الكلمات</button></section></div>');
}
function weakResult(score){
 shell('<div class="lesson-shell">'+topbar('lessonMap()')+'<section class="reward-card glass"><div class="reward-star" style="background:radial-gradient(circle,#ffb0c5,#8b5cf6)">💪</div><span class="kicker">نتيجة الاختبار</span><h1>'+score+'%</h1><p style="color:var(--muted)">قريبة جدًا يا ريم 🤍 المطلوب 80%. ما راح نعيد كل شيء؛ بنثبت النقاط اللي تحتاج مراجعة فقط.</p><div class="notice">🧠 water • shower • ترتيب I + verb</div><button class="primary full" style="margin-top:14px" onclick="review()">ابدئي المراجعة الذكية</button></section></div>');
}
function review(){
 var rows=state.weak.length?state.weak.map(function(id){var w=byId(id);return '<div class="review-item"><div class="review-thumb">'+art(w.kind)+'</div><div><b dir="ltr">'+w.en+'</b><small>'+w.ar+' • '+w.ipa+'</small></div><button class="icon-btn" onclick="speakWord(\''+w.en+'\',false)">🔊</button></div>';}).join(''):'<div class="notice">✨ ممتاز! ما عندك نقاط ضعف حالية.</div>';
 shell(topbar()+'<section class="page-head glass"><span class="kicker">Smart Review</span><h1>المراجعة الذكية 🧠</h1><p>نرجع فقط للكلمات والنقاط اللي تحتاج تثبيت.</p></section><section class="review-card glass"><h2>تحتاج تثبيت 🤍</h2><div class="review-list">'+rows+'</div><h2 style="margin-top:24px">مراجعة يومية</h2><div class="notice">لاحقًا: 3 كلمات من أمس + كلمتان من الأسبوع الماضي بنظام التكرار المتباعد.</div></section>','review');
}
function savedWords(){
 var rows=state.saved.map(function(id){var w=byId(id);return '<div class="review-item"><div class="review-thumb">'+art(w.kind)+'</div><div><b dir="ltr">'+w.en+'</b><small>'+w.ar+' • '+w.ipa+'</small></div><button class="icon-btn" onclick="speakWord(\''+w.en+'\',false)">🔊</button></div>';}).join('');
 shell(topbar()+'<section class="page-head glass"><span class="kicker">Saved Words</span><h1>كلماتي المحفوظة ♥</h1><p>أي كلمة تحبين ترجعين لها بسرعة تلقينها هنا.</p></section><section class="review-card glass"><div class="review-list">'+rows+'</div></section>','review');
}
function account(){
 var voice=getPreferredVoice();
 shell(topbar()+'<section class="page-head glass"><span class="kicker">Profile & Audio</span><h1>حسابي 👤</h1><p>إعدادات بسيطة للصوت والنطق.</p></section><section class="settings-card glass"><label>النطق العربي المبسط</label><div class="toggle-row"><div><b>إظهار / إخفاء</b><small style="display:block;color:var(--muted)">يظهر في البداية ويمكن إخفاؤه تدريجيًا.</small></div><button class="switch '+(state.arabicPhonetic?'on':'')+'" onclick="toggleArabicPhonetic()"></button></div><label>لهجة الصوت</label><div class="seg-row"><span>English voice</span><div class="seg"><button class="'+(state.accent==='en-US'?'active':'')+'" onclick="setAccent(\'en-US\')">🇺🇸 أمريكي</button><button class="'+(state.accent==='en-GB'?'active':'')+'" onclick="setAccent(\'en-GB\')">🇬🇧 بريطاني</button></div></div><label>اختبار السرعة</label><div class="seg-row"><span>'+(voice?esc(voice.name):'صوت الجهاز')+'</span><div class="seg"><button onclick="speakWord(\'Good morning\',false)">🔊 عادي</button><button onclick="speakWord(\'Good morning\',true)">🐢 بطيء</button></div></div><div class="notice">العادي 0.95 والبطيء 0.55 عشان الفرق يكون واضح. الصوت السحابي Neural يحتاج مزود خارجي.</div><div class="notice">🎙️ التسجيل يعمل للمقارنة الذاتية. تقييم AI الحقيقي لن نعرضه قبل ربط API مخصص للنطق.</div><button class="secondary full" style="width:100%;margin-top:14px" onclick="resetDemo()">إعادة My Morning من البداية</button></section>','account');
}
function toggleArabicPhonetic(){state.arabicPhonetic=!state.arabicPhonetic;save();account();}
function setAccent(x){state.accent=x;save();account();}
function resetDemo(){state=Object.assign({},DEFAULT);save();home();}
function getPreferredVoice(){
 if(!('speechSynthesis' in window))return null;
 var v=speechSynthesis.getVoices().filter(function(x){return x.lang&&x.lang.toLowerCase().startsWith('en');});
 v.sort(function(a,b){function s(x){return /premium|enhanced|natural|google|samantha|ava|serena|daniel|jenny|aria/i.test(x.name)?1:0;}return s(b)-s(a);});
 return v.find(function(x){return x.lang===state.accent;})||v[0]||null;
}
function speakWord(text,slow){
 if(!('speechSynthesis' in window))return alert('الصوت غير مدعوم');
 speechSynthesis.cancel();
 var u=new SpeechSynthesisUtterance(text),v=getPreferredVoice();
 if(v)u.voice=v;
 u.lang=state.accent;u.rate=slow?.55:.95;u.pitch=1;u.volume=1;
 speechSynthesis.speak(u);
}
function speakSentence(text){speakWord(text,false);}
async function startRecord(target){
 var box=document.getElementById('recordBox');
 if(!navigator.mediaDevices||!window.MediaRecorder){if(box)box.textContent='التسجيل غير مدعوم في هذا المتصفح.';return;}
 try{
  var stream=await navigator.mediaDevices.getUserMedia({audio:true});
  chunks=[];recorder=new MediaRecorder(stream);
  recorder.ondataavailable=function(e){if(e.data.size)chunks.push(e.data);};
  recorder.onstop=function(){
   var blob=new Blob(chunks,{type:recorder.mimeType});
   if(recordUrl)URL.revokeObjectURL(recordUrl);
   recordUrl=URL.createObjectURL(blob);
   if(box)box.innerHTML='<b>تم التسجيل ✅</b><audio controls src="'+recordUrl+'"></audio><div class="audio-actions"><button class="secondary" onclick="speakWord(\''+esc(target)+'\',false)">🔊 الصحيح</button><button class="secondary" onclick="startRecord(\''+esc(target)+'\')">🎙️ مرة ثانية</button></div>';
   stream.getTracks().forEach(function(t){t.stop();});
  };
  recorder.start();
  if(box)box.innerHTML='🎙️ التسجيل الآن... <button class="primary" style="margin-right:8px" onclick="stopRecord()">إيقاف</button>';
  setTimeout(function(){if(recorder&&recorder.state==='recording')stopRecord();},5000);
 }catch(e){if(box)box.textContent='اسمحي للميكروفون من إعدادات المتصفح ثم حاولي مرة ثانية.';}
}
function stopRecord(){if(recorder&&recorder.state==='recording')recorder.stop();}
home();
