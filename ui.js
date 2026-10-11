function heroAvatar(){
 return '<svg viewBox="0 0 460 420"><defs><linearGradient id="hs" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffd9c8"/><stop offset="1" stop-color="#efad9e"/></linearGradient><linearGradient id="hh" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#7a4338"/><stop offset="1" stop-color="#2f2029"/></linearGradient></defs><rect x="60" y="320" width="340" height="28" rx="14" fill="#6e4751"/><rect x="76" y="246" width="215" height="90" rx="16" fill="#2f365c"/><rect x="91" y="260" width="185" height="61" rx="9" fill="#5964a0"/><path d="M286 330h85l-30-58h-93Z" fill="#444c82"/><path d="M125 254c6-84 36-141 91-155 53-13 101 19 105 90 2 43-12 91-44 118-26 21-65 27-99 12-32-14-57-36-53-65Z" fill="url(#hh)"/><ellipse cx="224" cy="178" rx="73" ry="84" fill="url(#hs)"/><path d="M151 160c8-62 42-88 76-87 42 1 72 28 73 87-18-24-45-39-76-36-27 2-49 13-73 36Z" fill="url(#hh)"/><ellipse cx="201" cy="180" rx="6" ry="7" fill="#3c2928"/><ellipse cx="249" cy="180" rx="6" ry="7" fill="#3c2928"/><path d="M213 208c9 8 20 8 29 0" fill="none" stroke="#c65d6f" stroke-width="4" stroke-linecap="round"/><path d="M147 346c12-72 42-101 80-101 40 0 72 33 84 101Z" fill="#efc7cf"/><rect x="54" y="287" width="42" height="44" rx="8" fill="#fff1ea"/></svg>';
}
function home(){
 shell(topbar()+
 '<section class="hero glass"><div class="hero-art"><div class="avatar-scene">'+heroAvatar()+'</div></div><div class="hero-copy"><span class="kicker">☀️ صباح الخير يا ريم!</span><h1>جاهزة لدرس اليوم؟</h1><p>كل كلمة جديدة بتقربك خطوة ✨</p><div class="today-card"><div class="today-head"><div><small>درس اليوم</small><strong>My Morning ☀️</strong></div><span>8–12 دقيقة</span></div><div class="today-meta"><span>7 كلمات</span><span>لعبة تثبيت</span><span>سر نطق</span><span>قاعدة بسيطة</span></div><button class="primary full" onclick="lessonMap()">'+(state.lessonDone?'راجعي درس اليوم':'ابدئي درس اليوم')+' ▶</button></div></div></section>'+
 '<div class="stats"><div class="stat"><b>🔥 '+state.streak+'</b><span>سلسلة أيام</span></div><div class="stat"><b>⭐ '+state.xp+'</b><span>نقطة XP</span></div><div class="stat"><b>📊 '+state.worldProgress+'%</b><span>My Day</span></div><div class="stat"><b>👑 '+(state.lessonDone?1:0)+'</b><span>إنجازات</span></div></div>'+
 '<div class="section-head"><div><small>عالمك الحالي</small><h2>My Day 🌅</h2></div><button class="secondary" onclick="levels()">كل العوالم</button></div>'+
 '<div class="world-preview"><div class="world-card glass"><span class="kicker">WORLD 1 • مفتوح</span><h3>My Day</h3><p>الصباح، البيت، الفطور والعائلة.</p><div class="progress"><i style="width:'+state.worldProgress+'%"></i></div></div><div class="quick-actions"><button class="quick-card" onclick="levels()"><b>🏆</b><span>مستوياتي</span></button><button class="quick-card" onclick="savedWords()"><b>📘</b><span>كلماتي</span></button><button class="quick-card" onclick="review()"><b>⭐</b><span>التحديات</span></button><button class="quick-card" onclick="account()"><b>💗</b><span>الإنجازات</span></button></div></div><div class="teacher-entry"><button onclick="teacherLogin()">🔐 وضع المدرّس</button></div>','home');
}
function levels(){
 var rows=WORLDS.map(function(w,i){
  return '<button class="world-row '+(i?'locked':'')+'" '+(i?'disabled':'onclick="lessonMap()"')+'><div class="world-thumb"><span>'+w[0]+'</span></div><div class="world-copy"><span>WORLD '+(i+1)+'</span><h3>'+w[1]+'</h3><p>'+w[2]+'</p></div><div class="world-status">'+(i?'🔒 مقفل':'▶ مفتوح')+'</div></button>';
 }).join('');
 shell(topbar()+'<section class="page-head glass"><span class="kicker">Learning Worlds</span><h1>مستوياتي 🗺️</h1><p>كل عالم له خلفيته ومشهده، لكن هوية Reem English ثابتة. العوالم التالية تنفتح بالتقدم.</p></section><div class="world-list">'+rows+'</div>','levels');
}
function lessonMap(){
 var data=[['1','مراجعة سريعة','دقيقة واحدة','quickReview'],['2','الكلمات الجديدة','7 كلمات من صباحك','vocab'],['3','لعبة التثبيت','ثبتي الكلمات بالصور','game'],['4','سر النطق','SH = ش','phonics'],['5','جملة / قاعدة اليوم','I + verb','grammar'],['6','استخدام حقيقي','سؤال وتسجيل صوت','realUse'],['7','إنهاء الدرس','يرسل الدرس لعبدالعزيز للتقييم','finishForTeacher']];
 var rows=data.map(function(x,i){
  var n=i+1,done=n<state.step||state.lessonDone,current=n===state.step&&!state.lessonDone,locked=n>state.step&&!state.lessonDone;
  return '<button class="lesson-step '+(done?'done':current?'current':'locked')+'" '+(locked?'disabled':'onclick="'+x[3]+'()"')+'><div class="step-num">'+(done?'✓':locked?'🔒':x[0])+'</div><div><span>الخطوة '+x[0]+'</span><h3>'+x[1]+'</h3><p>'+x[2]+'</p></div><i>'+(done?'⭐':current?'▶':'')+'</i></button>';
 }).join('');
 shell(topbar('home()')+'<section class="lesson-hero glass"><span class="kicker">WORLD 1 • My Day</span><h1>My Morning ☀️</h1><p>تجربة متتابعة، خطوة واحدة فقط أمام ريم في كل مرة.</p><div class="progress"><i style="width:'+Math.min((state.step-1)/7*100,100)+'%"></i></div></section><div class="lesson-path">'+rows+'</div>');
}
function advance(n,next){
 state.step=Math.max(state.step,n+1);
 save();
 if(next)next();else lessonMap();
}
function quickReview(){
 shell('<div class="lesson-shell">'+topbar('lessonMap()')+'<div class="lesson-top"><div><span class="kicker">1 / 7</span><h2>مراجعة سريعة 🧠</h2></div><span>1 دقيقة</span></div><div class="big-progress"><i style="width:14%"></i></div><section class="review-card glass center"><h1>جاهزة؟</h1><p style="color:var(--muted);line-height:1.8">لأن هذا أول درس، ما عندنا مراجعة سابقة. لاحقًا تظهر 3 كلمات من أمس وكلمتان من الأسبوع الماضي.</p><button class="primary" onclick="advance(1,vocab)">ابدئي الكلمات الجديدة ←</button></section></div>');
}
