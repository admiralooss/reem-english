function vocab(){
 var i=Math.min(state.vocabIndex,WORDS.length-1),w=WORDS[i],saved=state.saved.includes(w.id);
 shell('<div class="lesson-shell">'+topbar('lessonMap()')+
 '<div class="lesson-top"><div><span class="kicker">2 / 7</span><h2>الكلمات الجديدة</h2></div><span>'+(i+1)+' / '+WORDS.length+'</span></div>'+
 '<div class="big-progress"><i style="width:'+((i+1)/WORDS.length*100)+'%"></i></div>'+
 '<section class="vocab-card glass"><div class="visual-pane">'+art(w.kind)+'<button class="save-btn '+(saved?'saved':'')+'" onclick="toggleSave(\''+w.id+'\')">'+(saved?'♥':'♡')+'</button></div>'+
 '<div class="vocab-copy"><span class="kicker">My Morning</span><h1 dir="ltr">'+esc(w.en)+'</h1><div class="ipa" dir="ltr">'+w.ipa+'</div><h2>'+w.ar+'</h2>'+(state.arabicPhonetic?'<span class="ar-phonetic">'+w.ph+'</span>':'')+
 '<div class="example" dir="ltr">'+esc(w.example)+'</div><div class="audio-actions"><button class="primary" onclick="speakWord(\''+esc(w.en)+'\',false)">🔊 عادي</button><button class="secondary" onclick="speakWord(\''+esc(w.en)+'\',true)">🐢 بطيء</button><button class="soft" onclick="startRecord(\''+esc(w.en)+'\')">🎙️ قوليها</button></div><div id="recordBox" class="record-box">اسمعي الصوت الصحيح، سجلي صوتك، ثم قارني بين الاثنين.</div></div></section>'+
 '<div class="pager"><button '+(i===0?'disabled':'')+' onclick="prevWord()">→ السابق</button><div class="pager-mid"><b>'+(i+1)+' / '+WORDS.length+'</b><small>7 كلمات فقط اليوم</small></div><button class="primary" onclick="nextWord()">'+(i===WORDS.length-1?'أنهيت الكلمات ✓':'التالي ←')+'</button></div></div>');
}
function prevWord(){if(state.vocabIndex>0){state.vocabIndex--;save();vocab();}}
function nextWord(){if(state.vocabIndex<WORDS.length-1){state.vocabIndex++;save();vocab();}else{state.vocabIndex=0;advance(2,game);}}
function toggleSave(id){var p=state.saved.indexOf(id);if(p>=0)state.saved.splice(p,1);else state.saved.push(id);save();vocab();}

const GAME=[['bed',['bed','shower','clock','room']],['water',['water','breakfast','bed','room']],['shower',['wash','shower','water','clock']],['breakfast',['room','bed','breakfast','water']],['room',['shower','clock','room','bed']]];
function game(){
 var q=GAME[gameIndex];
 var opts=q[1].map(function(id){return '<button class="game-option" data-id="'+id+'" onclick="answerGame(\''+id+'\',this)">'+art(byId(id).kind)+'</button>';}).join('');
 shell('<div class="lesson-shell">'+topbar('lessonMap()')+'<div class="lesson-top"><div><span class="kicker">3 / 7</span><h2>لعبة التثبيت 🎮</h2></div><span>'+(gameIndex+1)+' / '+GAME.length+'</span></div><div class="big-progress"><i style="width:'+((gameIndex+1)/GAME.length*100)+'%"></i></div><section class="game-card glass"><span class="kicker">اسمعي واختاري</span><h1>اختاري الصورة الصحيحة</h1><button class="soft" onclick="speakWord(\''+q[0]+'\',false)">🔊 '+q[0]+'</button><div class="game-grid">'+opts+'</div><div id="gameFeedback"></div></section></div>');
}
function answerGame(id,btn){
 if(gameAnswered)return;
 gameAnswered=true;
 var ans=GAME[gameIndex][0],box=document.getElementById('gameFeedback');
 document.querySelectorAll('.game-option').forEach(function(b){if(b.dataset.id===ans)b.classList.add('correct');if(b===btn&&id!==ans)b.classList.add('wrong');});
 if(id===ans)box.innerHTML='<div class="feedback">✅ ممتاز! هذه هي <b>'+ans+'</b> 🎉</div>';
 else{box.innerHTML='<div class="feedback" style="background:rgba(255,102,125,.1)">🤍 قريبة، بنرجع لهذه الكلمة في المراجعة.</div>';if(!state.weak.includes(ans))state.weak.push(ans);}
 save();
 setTimeout(function(){gameIndex++;gameAnswered=false;if(gameIndex<GAME.length)game();else{gameIndex=0;advance(3,phonics);}},850);
}
function mouth(){
 return '<svg viewBox="0 0 420 260"><rect width="420" height="260" rx="28" fill="#f1ad99"/><path d="M72 137c55-58 94-66 138-28 44-38 83-30 138 28-44 57-93 71-138 42-45 29-94 15-138-42Z" fill="#df6282"/><path d="M112 137c35-17 65-20 98-7 33-13 64-10 98 7-30 27-65 36-98 24-34 12-68 3-98-24Z" fill="#6f263d"/><path d="M132 139c26-9 53-10 78-1 26-9 51-8 78 1-23 18-49 24-78 18-29 6-55 0-78-18Z" fill="#fff8f5"/></svg>';
}
function phonics(){
 shell('<div class="lesson-shell">'+topbar('lessonMap()')+'<div class="lesson-top"><div><span class="kicker">4 / 7</span><h2>سر النطق 🔤</h2></div><span>SH = ش</span></div><div class="big-progress"><i style="width:57%"></i></div><section class="phonics-card glass"><span class="kicker">Phonics & Pronunciation</span><h1>صوت SH</h1><p style="color:var(--muted);line-height:1.8">نسمعه في بداية <b>shower</b> وفي نهاية <b>wash</b>.</p><div class="sound-hero"><div class="sound-mouth">'+mouth()+'</div><div class="sound-list"><div class="sound-example"><span><b dir="ltr">shower</b><small style="display:block;color:var(--muted)">/ˈʃaʊər/</small></span><button class="icon-btn" onclick="speakWord(\'shower\',false)">🔊</button></div><div class="sound-example"><span><b dir="ltr">wash</b><small style="display:block;color:var(--muted)">/wɒʃ/</small></span><button class="icon-btn" onclick="speakWord(\'wash\',false)">🔊</button></div></div></div><div class="notice">💡 نسمع الصوت داخل كلمات نعرفها، ثم نكرره. ما نحول الدرس إلى مادة صوتيات ثقيلة.</div><button class="primary full" style="margin-top:14px" onclick="advance(4,grammar)">فهمت الصوت، التالي ←</button></section></div>');
}
function grammar(){
 var lines=['I wake up early.','I drink water.','I eat breakfast.'].map(function(s){return '<div class="grammar-line"><span dir="ltr"><b>'+s+'</b></span><button class="icon-btn" onclick="speakSentence(\''+s+'\')">🔊</button></div>';}).join('');
 shell('<div class="lesson-shell">'+topbar('lessonMap()')+'<div class="lesson-top"><div><span class="kicker">5 / 7</span><h2>جملة اليوم 🧩</h2></div><span>قاعدة بسيطة</span></div><div class="big-progress"><i style="width:71%"></i></div><section class="grammar-card glass"><span class="kicker">نفهم الاستخدام أولًا</span><h1>I + verb</h1><div class="rule"><small>الجملة البسيطة</small><br><strong>I + verb + object</strong></div><div class="grammar-lines">'+lines+'</div><div class="notice">✨ بعد الفهم نعرف أن هذا من أساسيات Present Simple — بدون شرح مدرسي طويل.</div><button class="primary full" style="margin-top:14px" onclick="advance(5,realUse)">استخدميها بنفسك ←</button></section></div>');
}
function realUse(){
 shell('<div class="lesson-shell">'+topbar('lessonMap()')+'<div class="lesson-top"><div><span class="kicker">6 / 7</span><h2>استخدام حقيقي 💬</h2></div><span>تكلمي</span></div><div class="big-progress"><i style="width:86%"></i></div><section class="use-card glass"><h1>What do you drink in the morning?</h1><div class="chat"><div class="bubble ai" dir="ltr">What do you drink in the morning?</div><div class="bubble me" dir="ltr">I drink water in the morning.</div></div><div class="use-visual">'+art('water')+'</div><div class="center"><button class="mic-button" onclick="startRecord(\'I drink water in the morning\')">🎙️</button><p style="color:var(--muted)">اسمعي السؤال، ثم سجلي إجابتك وقارني صوتك بالصوت الأصلي.</p><div class="audio-actions"><button class="secondary" onclick="speakSentence(\'What do you drink in the morning?\')">🔊 السؤال</button><button class="secondary" onclick="speakSentence(\'I drink water in the morning.\')">🔊 الإجابة النموذجية</button></div><div id="recordBox" class="record-box">التقييم في هذه النسخة مقارنة استماع ذاتي. تقييم AI الحقيقي يحتاج API نطق خارجي.</div></div><button class="primary full" style="margin-top:14px" onclick="advance(6,startQuiz)">ابدئي الاختبار القصير ←</button></section></div>');
}
