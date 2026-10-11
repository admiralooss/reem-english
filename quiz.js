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
function finishForTeacher(){
 state.assessmentStatus='ready';
 state.step=7;
 save();
 shell('<div class="lesson-shell">'+topbar('home()')+'<section class="reward-card glass"><div class="reward-star">✨</div><span class="kicker">My Morning</span><h1>خلصتِ درس اليوم يا ريم 🤍</h1><p style="color:var(--muted);line-height:1.8">ممتاز! الآن دور مراجعة بسيطة مع عبدالعزيز. ما فيه اختبار طويل ولا نسبة نجاح هنا.</p><div class="notice">⏳ الدرس جاهز لتقييم عبدالعزيز</div><button class="primary full" style="margin-top:14px" onclick="home()">العودة للرئيسية</button></section></div>');
}
function teacherLogin(){
 shell('<div class="lesson-shell">'+topbar('home()')+'<section class="teacher-login glass"><div class="teacher-lock">🔐</div><span class="kicker">Teacher Mode</span><h1>ملف عبدالعزيز</h1><p>أدخل الرقم السري للدخول إلى المتابعة والتقييم.</p><input id="teacherPin" class="pin-input" inputmode="numeric" maxlength="4" type="password" placeholder="••••" onkeydown="if(event.key===\'Enter\')checkTeacherPin()"><div id="pinError"></div><button class="primary full" onclick="checkTeacherPin()">دخول</button></section></div>');
 setTimeout(function(){var x=document.getElementById('teacherPin');if(x)x.focus();},100);
}
function checkTeacherPin(){
 var x=document.getElementById('teacherPin'),e=document.getElementById('pinError');
 if(x&&x.value==='7780'){sessionStorage.setItem('reemTeacher','1');teacherDashboard();}
 else if(e)e.innerHTML='<div class="feedback" style="background:rgba(255,102,125,.1)">الرقم السري غير صحيح</div>';
}
function teacherGuard(){if(sessionStorage.getItem('reemTeacher')!=='1'){teacherLogin();return false;}return true;}
function teacherDashboard(){
 if(!teacherGuard())return;
 var status=state.assessmentStatus==='approved'?'✓ معتمد':state.assessmentStatus==='ready'?'جاهز للتقييم':'قيد التعلّم';
 var learned=Math.max(0,Math.min(7,state.vocabIndex+(state.step>2?1:0)));
 shell('<div class="lesson-shell">'+topbar('teacherLogout()')+
 '<section class="teacher-hero glass"><span class="kicker">Teacher Dashboard</span><h1>أهلًا عبدالعزيز 👨‍🏫</h1><p>أنت المتحكم بالتقييم والانتقال. ريم تتعلم فقط، وأنت تختار كيف تختبرها ومتى تعتمد الدرس.</p></section>'+
 '<div class="teacher-stats"><div><b>'+learned+'/7</b><span>كلمات الدرس</span></div><div><b>'+state.step+'/7</b><span>التقدم</span></div><div><b>'+state.weak.length+'</b><span>تحتاج مراجعة</span></div><div><b>'+state.xp+'</b><span>XP</span></div></div>'+
 '<section class="teacher-panel glass"><div class="teacher-row"><div><small>الدرس الحالي</small><h2>My Morning ☀️</h2><p>'+status+'</p></div><button class="secondary" onclick="teacherWords()">عرض الكلمات</button></div>'+
 '<h3>اختر طريقة التقييم</h3><div class="assessment-types">'+teacherTypeButton('oral','💬','شفهي')+teacherTypeButton('meaning','🧠','معاني')+teacherTypeButton('pronunciation','🎙️','نطق')+teacherTypeButton('sentence','🧩','جمل')+teacherTypeButton('listening','🎧','استماع')+'</div>'+
 '<button class="primary full" style="margin-top:16px" onclick="teacherAssessment()">ابدأ التقييم الذي اخترته</button>'+
 '<button class="secondary full" style="width:100%;margin-top:9px" onclick="approveLesson()">✓ اعتماد الدرس وفتح التالي</button></section></div>');
}
function teacherTypeButton(id,icon,label){
 var on=(state.teacherAssessmentTypes||[]).includes(id);
 return '<button class="'+(on?'selected':'')+'" onclick="toggleTeacherType(\''+id+'\')"><b>'+icon+'</b><span>'+label+'</span></button>';
}
function toggleTeacherType(id){
 var a=state.teacherAssessmentTypes||[];
 var i=a.indexOf(id);if(i>=0)a.splice(i,1);else a.push(id);
 state.teacherAssessmentTypes=a;save();teacherDashboard();
}
function teacherWords(){
 if(!teacherGuard())return;
 var rows=WORDS.map(function(w){
  var m=(state.teacherMastered||[]).includes(w.id),r=(state.teacherReview||[]).includes(w.id);
  return '<div class="teacher-word"><div class="review-thumb">'+art(w.kind)+'</div><div><b dir="ltr">'+w.en+'</b><small>'+w.ar+(state.arabicPhonetic?' • '+w.ph:'')+'</small></div><button class="'+(m?'mastered':'')+'" onclick="teacherMark(\''+w.id+'\',\'mastered\')">✓ أتقنت</button><button class="'+(r?'needs-review':'')+'" onclick="teacherMark(\''+w.id+'\',\'review\')">↻ مراجعة</button></div>';
 }).join('');
 shell('<div class="lesson-shell">'+topbar('teacherDashboard()')+'<section class="teacher-panel glass"><span class="kicker">متابعة الكلمات</span><h1>My Morning</h1><p style="color:var(--muted)">علّم كل كلمة حسب تقييمك أنت.</p><div class="teacher-word-list">'+rows+'</div></section></div>');
}
function teacherMark(id,type){
 var m=state.teacherMastered||[],r=state.teacherReview||[];
 m=m.filter(function(x){return x!==id});r=r.filter(function(x){return x!==id});
 if(type==='mastered')m.push(id);else r.push(id);
 state.teacherMastered=m;state.teacherReview=r;state.weak=r.slice();save();teacherWords();
}
function teacherAssessment(){
 if(!teacherGuard())return;
 var types=state.teacherAssessmentTypes||[];
 if(!types.length){alert('اختر طريقة تقييم واحدة على الأقل');return;}
 var cards=[];
 if(types.includes('oral'))cards.push(['💬','شفهي','اختر كلمة من الدرس واطلب من ريم أن تقول معناها أو تستخدمها في كلامها.']);
 if(types.includes('meaning'))cards.push(['🧠','المعاني','أنت اختر الكلمة واسألها عن معناها، ثم سجّل حكمك من صفحة الكلمات.']);
 if(types.includes('pronunciation'))cards.push(['🎙️','النطق','شغّل الكلمة أو قلها أنت، ثم خلي ريم تكررها.']);
 if(types.includes('sentence'))cards.push(['🧩','الجمل','اطلب منها تكوين جملة باستخدام: I + verb.']);
 if(types.includes('listening'))cards.push(['🎧','الاستماع','شغّل كلمة بدون عرض معناها واسأل ريم ماذا سمعت.']);
 shell('<div class="lesson-shell">'+topbar('teacherDashboard()')+'<section class="teacher-panel glass"><span class="kicker">اختبار عبدالعزيز</span><h1>أنت تقود الاختبار 👨‍🏫</h1><p style="color:var(--muted)">الموقع يعطيك الأدوات فقط، ولا يحسب نجاح أو رسوب.</p><div class="teacher-assessment">'+cards.map(function(x){return '<div><b>'+x[0]+' '+x[1]+'</b><p>'+x[2]+'</p></div>';}).join('')+'</div><div class="audio-actions"><button class="secondary" onclick="speakWord(\'water\',false)">🔊 water</button><button class="secondary" onclick="speakWord(\'shower\',false)">🔊 shower</button><button class="secondary" onclick="speakWord(\'breakfast\',false)">🔊 breakfast</button></div><button class="primary full" style="margin-top:16px" onclick="teacherWords()">سجّل تقييم الكلمات ←</button></section></div>');
}
function approveLesson(){
 if(!teacherGuard())return;
 state.assessmentStatus='approved';state.lessonDone=true;state.step=8;state.worldProgress=Math.max(state.worldProgress,25);state.xp=Math.max(state.xp,170);save();
 shell('<div class="lesson-shell">'+topbar('teacherDashboard()')+'<section class="reward-card glass"><div class="reward-star">✓</div><h1>تم اعتماد My Morning</h1><p style="color:var(--muted)">اعتمادك أنت هو الذي يحدد اجتياز الدرس. لا توجد نسبة نجاح آلية.</p><button class="primary full" onclick="teacherDashboard()">رجوع لملف المدرّس</button></section></div>');
}
function teacherLogout(){sessionStorage.removeItem('reemTeacher');home();}

function review(){
 var rows=state.weak.length?state.weak.map(function(id){var w=byId(id);return '<div class="review-item"><div class="review-thumb">'+art(w.kind)+'</div><div><b dir="ltr">'+w.en+'</b><small>'+w.ar+(state.arabicPhonetic?' • '+w.ph:'')+'</small></div><button class="icon-btn" onclick="speakWord(\''+w.en+'\',false)">🔊</button></div>';}).join(''):'<div class="notice">✨ ممتاز! ما عندك نقاط ضعف حالية.</div>';
 shell(topbar()+'<section class="page-head glass"><span class="kicker">Smart Review</span><h1>المراجعة الذكية 🧠</h1><p>نرجع فقط للكلمات والنقاط اللي تحتاج تثبيت.</p></section><section class="review-card glass"><h2>تحتاج تثبيت 🤍</h2><div class="review-list">'+rows+'</div><h2 style="margin-top:24px">مراجعة يومية</h2><div class="notice">لاحقًا: 3 كلمات من أمس + كلمتان من الأسبوع الماضي بنظام التكرار المتباعد.</div></section>','review');
}
function savedWords(){
 var rows=state.saved.map(function(id){var w=byId(id);return '<div class="review-item"><div class="review-thumb">'+art(w.kind)+'</div><div><b dir="ltr">'+w.en+'</b><small>'+w.ar+(state.arabicPhonetic?' • '+w.ph:'')+'</small></div><button class="icon-btn" onclick="speakWord(\''+w.en+'\',false)">🔊</button></div>';}).join('');
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
