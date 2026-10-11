const TA=document.getElementById("teacherApp");
const PIN="7780";
const WORDS=[
 {id:"bed",en:"bed",ar:"سرير"},{id:"water",en:"water",ar:"ماء"},{id:"shower",en:"shower",ar:"دش"},
 {id:"wash",en:"wash",ar:"يغسل"},{id:"breakfast",en:"breakfast",ar:"فطور"},{id:"wake",en:"wake up",ar:"يستيقظ"}
];
let page="dashboard";
let draft={title:"اختبار My Morning",lesson:"My Morning",questions:[]};
let qDraft={type:"oral",prompt:"",answer:"",points:10,options:[],audio:""};
function student(){return Object.assign({xp:0,streak:0,worldProgress:0,lessonStep:1,readyForTeacher:false,weak:[],saved:[]},JSON.parse(localStorage.getItem("reemStudentV5")||"{}"))}
function tests(){return JSON.parse(localStorage.getItem("reemTeacherTests")||"[]")}
function saveTests(v){localStorage.setItem("reemTeacherTests",JSON.stringify(v))}
function results(){return JSON.parse(localStorage.getItem("reemTestResults")||"[]")}
function saveResults(v){localStorage.setItem("reemTestResults",JSON.stringify(v))}
function statuses(){return JSON.parse(localStorage.getItem("reemTeacherWordStatus")||"{}")}
function saveStatuses(v){localStorage.setItem("reemTeacherWordStatus",JSON.stringify(v))}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function logged(){return sessionStorage.getItem("reemTeacherAuth")==="1"}
function login(){
 TA.innerHTML='<div class="login-wrap"><section class="login-card"><div class="login-lock">🔐</div><h1>ملف عبدالعزيز</h1><p>هذا القسم خاص بالمدرّس: متابعة ريم، بناء الاختبارات، إرسالها، ومراجعة النتائج.</p><input id="pin" class="pin" type="password" inputmode="numeric" maxlength="4" placeholder="••••" onkeydown="if(event.key===\'Enter\')checkPin()"><div id="err"></div><button class="primary full" onclick="checkPin()">دخول</button><button class="ghost full" style="margin-top:8px" onclick="location.href=\'./\'">رجوع لموقع ريم</button></section></div>';
 setTimeout(()=>document.getElementById("pin")?.focus(),100);
}
function checkPin(){const v=document.getElementById("pin")?.value||"";if(v===PIN){sessionStorage.setItem("reemTeacherAuth","1");render()}else document.getElementById("err").innerHTML='<div class="error">الرقم السري غير صحيح</div>'}
function logout(){sessionStorage.removeItem("reemTeacherAuth");login()}
function side(){
 const nav=[["dashboard","📊","الرئيسية"],["progress","📚","تقدم ريم"],["builder","🧩","صانع الاختبار"],["tests","📝","اختباراتي"],["results","✅","النتائج"]];
 return '<aside id="sidebar" class="sidebar"><div class="logo"><strong>Reem English</strong><small>Abdulaziz Teacher</small></div><div class="teacher-badge"><b>👨‍🏫 عبدالعزيز</b><small>صلاحية المدرّس الكاملة</small></div><nav class="side-nav">'+nav.map(n=>'<button class="'+(page===n[0]?"active":"")+'" onclick="go(\''+n[0]+'\')"><b>'+n[1]+'</b><span>'+n[2]+'</span></button>').join("")+'</nav><div class="side-bottom"><button class="ghost full" onclick="location.href=\'./\'">واجهة ريم</button><button class="danger full" style="margin-top:7px" onclick="logout()">تسجيل الخروج</button></div></aside>'
}
function portal(content,title,sub){
 TA.innerHTML='<div class="portal">'+side()+'<main class="main"><header class="top"><div style="display:flex;align-items:center;gap:10px"><button class="mobile-menu" onclick="document.getElementById(\'sidebar\').classList.toggle(\'open\')">☰</button><div><h1>'+esc(title)+'</h1><p>'+esc(sub||"")+'</p></div></div><div class="top-actions"><button class="ghost" onclick="location.href=\'./\'">فتح واجهة ريم</button></div></header>'+content+'</main></div>'
}
function go(p){page=p;render()}
function render(){if(!logged())return login();if(page==="dashboard")dashboard();else if(page==="progress")progress();else if(page==="builder")builder();else if(page==="tests")savedTests();else if(page==="results")resultsPage()}
function dashboard(){
 const s=student(),ts=tests(),rs=results(),st=statuses();
 const good=Object.values(st).filter(x=>x==="mastered").length,rev=Object.values(st).filter(x=>x==="review").length;
 let assigned=localStorage.getItem("reemAssignedTest");
 portal('<section class="grid4"><div class="card metric"><div class="icon">🌱</div><b>'+s.worldProgress+'%</b><span>تقدم My Day</span></div><div class="card metric"><div class="icon">⭐</div><b>'+s.xp+'</b><span>XP</span></div><div class="card metric"><div class="icon">✅</div><b>'+good+'</b><span>كلمات متقنة</span></div><div class="card metric"><div class="icon">↻</div><b>'+rev+'</b><span>تحتاج مراجعة</span></div></section><section class="content-grid"><div class="card"><div class="section-title"><h2>الدرس الحالي</h2><span class="status-pill">'+(s.readyForTeacher?"جاهز لتقييمك":"ريم ما زالت تتعلم")+'</span></div><div class="lesson-status"><small>WORLD 1</small><h3>My Morning ☀️</h3><p>الخطوة '+s.lessonStep+' من 7</p><div class="progress-line" style="margin-top:10px"><i style="width:'+Math.min(100,s.lessonStep/7*100)+'%"></i></div></div><div style="display:flex;gap:7px;margin-top:10px"><button class="primary" onclick="go(\'progress\')">تقييم الكلمات</button><button class="ghost" onclick="go(\'builder\')">أنشئ اختبارًا</button></div></div><div class="card"><div class="section-title"><h2>الاختبارات</h2><small>'+ts.length+' محفوظ</small></div><div class="lesson-status"><h3>'+(assigned?"يوجد اختبار مُرسل لريم":"لا يوجد اختبار مُرسل الآن")+'</h3><p>'+rs.filter(r=>r.status==="awaiting_teacher").length+' نتيجة بانتظار مراجعتك</p></div><button class="ghost full" style="margin-top:10px" onclick="go(\'results\')">فتح النتائج</button></div></section>',"لوحة عبدالعزيز","أنت المسؤول عن التقييم والاختبارات، وليس الموقع.")
}
function progress(){
 const s=student(),st=statuses();
 const rows=WORDS.map(w=>'<div class="word"><div><b dir="ltr">'+esc(w.en)+'</b><small>'+esc(w.ar)+'</small></div><button class="'+(st[w.id]==="mastered"?"on-good":"")+'" onclick="markWord(\''+w.id+'\',\'mastered\')">✓ أتقنت</button><button class="'+(st[w.id]==="review"?"on-review":"")+'" onclick="markWord(\''+w.id+'\',\'review\')">↻ مراجعة</button></div>').join("");
 portal('<section class="content-grid"><div class="card"><div class="section-title"><h2>كلمات My Morning</h2><small>حكمك أنت</small></div><div class="words">'+rows+'</div></div><div class="card"><div class="section-title"><h2>حالة الدرس</h2></div><div class="lesson-status"><span class="status-pill">'+(s.readyForTeacher?"جاهز للتقييم":"قيد التعلّم")+'</span><h3>My Morning</h3><p>الخطوة '+s.lessonStep+' / 7</p><p style="margin-top:6px">الكلمات التي اختار الموقع لمراجعتها: '+(s.weak?.join("، ")||"—")+'</p></div><button class="primary full" style="margin-top:12px" onclick="go(\'builder\')">صمّم اختبارك الآن</button></div></section>',"تقدم ريم","تابع الدرس والكلمات وحدد ما أتقنته وما يحتاج مراجعة.")
}
function markWord(id,status){const st=statuses();st[id]=status;saveStatuses(st);progress()}
const TYPE_LABEL={oral:"شفهي",meaning:"معنى/ترجمة",pronunciation:"نطق",listening:"استماع",written:"كتابي",sentence:"تكوين جملة",order:"ترتيب",mcq:"اختيارات"};
function builder(){
 const total=draft.questions.reduce((a,q)=>a+(Number(q.points)||0),0);
 const qlist=draft.questions.length?draft.questions.map((q,i)=>'<div class="question"><div class="question-head"><b>'+(i+1)+'. '+TYPE_LABEL[q.type]+'</b><span>'+q.points+' درجات</span></div><p>'+esc(q.prompt)+'</p><div class="question-actions"><button onclick="moveQ('+i+',-1)">↑</button><button onclick="moveQ('+i+',1)">↓</button><button onclick="removeQ('+i+')">حذف</button></div></div>').join(""):'<div class="empty">أضف أول سؤال من اللوحة.</div>';
 portal('<div class="builder"><section class="card"><div class="section-title"><h2>إعداد الاختبار</h2><small>'+total+' درجة</small></div><div class="field"><label>اسم الاختبار</label><input id="testTitle" value="'+esc(draft.title)+'" oninput="draft.title=this.value"></div><div class="field"><label>الدرس</label><select id="lessonSel" onchange="draft.lesson=this.value"><option>My Morning</option></select></div><div class="section-title" style="margin-top:16px"><h2>سؤال جديد</h2><small>اختر النوع</small></div><div class="q-type-grid">'+Object.keys(TYPE_LABEL).map(k=>'<button class="'+(qDraft.type===k?"active":"")+'" onclick="setQType(\''+k+'\')">'+TYPE_LABEL[k]+'</button>').join("")+'</div><div class="field" style="margin-top:10px"><label>السؤال / التعليمات</label><textarea id="qPrompt" oninput="qDraft.prompt=this.value">'+esc(qDraft.prompt)+'</textarea></div><div class="field"><label>الإجابة المتوقعة أو ملاحظة التصحيح</label><input id="qAnswer" value="'+esc(qDraft.answer)+'" oninput="qDraft.answer=this.value"></div>'+(qDraft.type==="mcq"?'<div class="field"><label>الخيارات — افصل بينها بعلامة |</label><input id="qOptions" value="'+esc((qDraft.options||[]).join(" | "))+'" oninput="qDraft.options=this.value.split(\'|\').map(x=>x.trim()).filter(Boolean)"></div>':"")+(qDraft.type==="listening"?'<div class="field"><label>النص الذي سيُقرأ بالصوت</label><input id="qAudio" value="'+esc(qDraft.audio)+'" oninput="qDraft.audio=this.value"></div>':"")+'<div class="field"><label>الدرجة</label><input id="qPoints" type="number" min="1" value="'+qDraft.points+'" oninput="qDraft.points=Number(this.value)||1"></div><button class="primary full" onclick="addQuestion()">+ أضف السؤال</button></section><section class="card"><div class="section-title"><h2>أسئلة الاختبار</h2><small>'+draft.questions.length+' سؤال</small></div><div class="question-list">'+qlist+'</div><div style="display:flex;gap:7px;margin-top:12px"><button class="primary" onclick="saveDraft()">حفظ الاختبار</button><button class="ghost" onclick="clearDraft()">اختبار جديد</button></div></section></div>',"صانع الاختبار","صمّم الاختبار من الصفر بالطريقة التي تريدها.")
}
function setQType(t){qDraft.type=t;builder()}
function addQuestion(){if(!String(qDraft.prompt||"").trim())return alert("اكتب السؤال أولًا");draft.questions.push(JSON.parse(JSON.stringify(qDraft)));qDraft={type:"oral",prompt:"",answer:"",points:10,options:[],audio:""};builder()}
function removeQ(i){draft.questions.splice(i,1);builder()}
function moveQ(i,d){const n=i+d;if(n<0||n>=draft.questions.length)return;const x=draft.questions.splice(i,1)[0];draft.questions.splice(n,0,x);builder()}
function clearDraft(){draft={title:"اختبار My Morning",lesson:"My Morning",questions:[]};qDraft={type:"oral",prompt:"",answer:"",points:10,options:[],audio:""};builder()}
function saveDraft(){if(!draft.questions.length)return alert("أضف سؤالًا واحدًا على الأقل");const all=tests();const t={id:Date.now(),title:draft.title||"اختبار",lesson:draft.lesson||"My Morning",questions:JSON.parse(JSON.stringify(draft.questions)),createdAt:new Date().toISOString()};all.push(t);saveTests(all);draft={title:"اختبار My Morning",lesson:"My Morning",questions:[]};alert("تم حفظ الاختبار");page="tests";render()}
function savedTests(){
 const all=tests();
 const rows=all.length?all.slice().reverse().map(t=>'<div class="test-card"><div><h3>'+esc(t.title)+'</h3><p>'+esc(t.lesson)+' • '+t.questions.length+' أسئلة • '+t.questions.reduce((a,q)=>a+(Number(q.points)||0),0)+' درجة</p></div><div class="test-actions"><button class="primary" onclick="assignTest('+t.id+')">إرسال لريم</button><button class="ghost" onclick="duplicateTest('+t.id+')">نسخ</button><button class="danger" onclick="deleteTest('+t.id+')">حذف</button></div></div>').join(""):'<div class="empty">ما عندك اختبارات محفوظة حتى الآن.</div>';
 portal('<section class="card"><div class="section-title"><h2>اختباراتي</h2><button class="primary" onclick="go(\'builder\')">+ اختبار جديد</button></div>'+rows+'</section>',"اختباراتي","احفظ أكثر من اختبار وأرسل أي واحد لريم وقت ما تريد.")
}
function assignTest(id){localStorage.setItem("reemAssignedTest",String(id));alert("تم إرسال الاختبار لواجهة ريم");savedTests()}
function deleteTest(id){if(!confirm("حذف الاختبار؟"))return;saveTests(tests().filter(t=>t.id!==id));savedTests()}
function duplicateTest(id){const t=tests().find(x=>x.id===id);if(!t)return;draft={title:t.title+" - نسخة",lesson:t.lesson,questions:JSON.parse(JSON.stringify(t.questions))};page="builder";render()}
function resultsPage(){
 const rs=results(),ts=tests();
 const rows=rs.length?rs.slice().reverse().map(r=>{const t=ts.find(x=>x.id===r.testId);return '<div class="result-card"><h3>'+esc(t?.title||"اختبار")+'</h3><p>'+new Date(r.submittedAt).toLocaleString("ar-SA")+' • '+(r.status==="graded"?"تم التصحيح":"بانتظار تقييمك")+'</p><div>'+r.answers.map((a,i)=>'<div class="answer"><b>س'+(i+1)+':</b> '+esc(a.a)+'</div>').join("")+'</div><div class="score-row"><input id="score'+r.id+'" type="number" min="0" placeholder="الدرجة" value="'+esc(r.teacherScore||"")+'"><input id="note'+r.id+'" placeholder="ملاحظة لعبدالعزيز" value="'+esc(r.teacherNote||"")+'"></div><button class="primary" style="margin-top:8px" onclick="gradeResult('+r.id+')">حفظ التقييم</button></div>'}).join(""):'<div class="empty">لا توجد إجابات مرسلة من ريم حتى الآن.</div>';
 portal('<section class="card"><div class="section-title"><h2>نتائج ريم</h2><small>التصحيح يدوي بقرارك</small></div>'+rows+'</section>',"النتائج","راجع الإجابات وسجل الدرجة والملاحظات بنفسك.")
}
function gradeResult(id){const rs=results(),r=rs.find(x=>x.id===id);if(!r)return;r.teacherScore=document.getElementById("score"+id)?.value||"";r.teacherNote=document.getElementById("note"+id)?.value||"";r.status="graded";r.gradedAt=new Date().toISOString();saveResults(rs);resultsPage()}
render();