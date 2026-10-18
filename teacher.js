const TA=document.getElementById("teacherApp");
const PIN=(window.REEM_CONFIG&&window.REEM_CONFIG.teacherPin)||"7780";
let page="dashboard";
let editingWordId=null;

function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));}
function logged(){return sessionStorage.getItem("reemTeacherPhase1")==="1";}
function profile(){return ReemStore.getProfile();}
function content(){return ReemStore.getContent();}
function currentLevel(p=profile()){
  const list=(window.REEM_CONFIG.levels||[]).slice().sort((a,b)=>a.minPoints-b.minPoints);
  let out=list[0]||{id:"starter",nameAr:"البداية",nameEn:"Starter"};
  list.forEach(l=>{if((p.points||0)>=l.minPoints)out=l});
  return out;
}
function courseProgress(p=profile()){
  const words=content().words||[];return words.length?Math.round((p.learnedWordIds.length/words.length)*100):0;
}
function login(){
  TA.innerHTML='<div class="login-wrap"><section class="login-card"><div class="login-icon">🔐</div><h1>ملف المعلم</h1><p>هذا القسم خاص بك: بيانات الطالب، التقدم، الكلمات، الفئات، وإعادة البدء من الصفر.</p><input id="pin" class="pin" maxlength="4" inputmode="numeric" type="password" placeholder="••••" onkeydown="if(event.key===\'Enter\')checkPin()"><div id="err"></div><button class="primary full" onclick="checkPin()">دخول</button><button class="ghost full" style="margin-top:8px" onclick="location.href=\'./\'">واجهة الطالب</button></section></div>';
  setTimeout(()=>document.getElementById("pin")?.focus(),100);
}
function checkPin(){const v=document.getElementById("pin")?.value||"";if(v===PIN){sessionStorage.setItem("reemTeacherPhase1","1");render()}else document.getElementById("err").innerHTML='<div class="error">الرقم السري غير صحيح</div>'}
function logout(){sessionStorage.removeItem("reemTeacherPhase1");login();}
function nav(){
  const items=[["dashboard","📊","الرئيسية"],["profile","👤","ملف الطالب"],["content","📚","الكلمات والفئات"],["tests","📝","الاختبارات"]];
  return '<aside id="side" class="sidebar"><div class="brand"><strong>Reem English</strong><small>Teacher Control</small></div><div class="teacher-card"><b>👨‍🏫 المعلم</b><small>تحكم كامل بطالب واحد</small></div><nav class="nav">'+items.map(x=>'<button class="'+(page===x[0]?"active":"")+'" onclick="go(\''+x[0]+'\')"><b>'+x[1]+'</b><span>'+x[2]+'</span></button>').join("")+'</nav><div class="side-bottom"><button class="ghost full" onclick="location.href=\'./\'">فتح واجهة الطالب</button><button class="danger full" style="margin-top:7px" onclick="logout()">تسجيل الخروج</button></div></aside>';
}
function shell(body,title,sub){
  TA.innerHTML='<div class="portal">'+nav()+'<main class="main"><header class="top"><div style="display:flex;align-items:center;gap:9px"><button class="mobile-menu" onclick="document.getElementById(\'side\').classList.toggle(\'open\')">☰</button><div><h1>'+esc(title)+'</h1><p>'+esc(sub||"")+'</p></div></div><button class="ghost" onclick="location.href=\'./\'">واجهة الطالب</button></header>'+body+'</main></div>';
}
function go(p){page=p;render();}
function render(){if(!logged())return login();if(page==="dashboard")dashboard();else if(page==="profile")profilePage();else if(page==="content")contentPage();else testsPage();}
async function dashboard(){
  if(window.ReemCloud){
    try{await ReemCloud.pull()}catch(e){}
  }
  const p=profile(),c=content(),prog=courseProgress(p),lvl=currentLevel(p);
  shell('<section class="grid4"><div class="card metric"><div class="ico">⭐</div><b>'+p.points+'</b><span>النقاط</span></div><div class="card metric"><div class="ico">📚</div><b>'+p.learnedWordIds.length+'/'+c.words.length+'</b><span>كلمات محفوظة</span></div><div class="card metric"><div class="ico">📝</div><b>'+p.completedTests+'</b><span>اختبارات منجزة</span></div><div class="card metric"><div class="ico">📊</div><b>'+prog+'%</b><span>التقدم</span></div></section><section class="two"><div class="card"><div class="section-head"><h2>الطالب الحالي</h2><small>'+esc(lvl.nameEn)+'</small></div><div class="status"><h3>'+esc(p.name)+'</h3><p>العمر: '+(p.age??"غير محدد")+' • المستوى: '+esc(lvl.nameAr)+'</p><div class="progress"><i style="width:'+prog+'%"></i></div><p style="margin-top:8px">المتبقي: '+(100-prog)+'%</p></div><div class="actions" style="margin-top:10px"><button class="primary" onclick="go(\'profile\')">تعديل الملف</button><button class="ghost" onclick="go(\'content\')">إدارة الكلمات</button></div></div><div class="card"><div class="section-head"><h2>المرحلة الأولى</h2><small>10 كلمات يوميًا</small></div><div class="status"><h3>عائلة الصباح ☀️</h3><p>الكلمات الحالية: '+c.words.filter(w=>w.categoryId==="morning").length+' كلمات</p><div class="progress"><i style="width:'+Math.min(100,c.words.filter(w=>w.categoryId==="morning").length*10)+'%"></i></div></div><div class="notice" style="margin-top:10px">الاختبارات الكاملة ستكون المرحلة الثانية. الآن نثبت الكلمات، الملف، التقدم، والفئات.</div></div></section>',"لوحة المعلم","طالب واحد فقط، وكل الصلاحيات عندك.");
}
function profilePage(){
  const p=profile();
  shell('<section class="two"><div class="card"><div class="section-head"><h2>بيانات الطالب</h2><small>طالب واحد فقط</small></div><div class="form"><div class="field"><label>الاسم</label><input id="sName" value="'+esc(p.name)+'"></div><div class="field"><label>العمر</label><input id="sAge" type="number" min="1" max="120" value="'+esc(p.age??"")+'"></div><div class="field"><label>المستوى الحالي</label><select id="sLevel">'+(window.REEM_CONFIG.levels||[]).map(l=>'<option value="'+esc(l.id)+'" '+(p.currentLevelId===l.id?"selected":"")+'>'+esc(l.nameAr)+' — '+esc(l.nameEn)+'</option>').join("")+'</select></div><button class="primary" onclick="saveStudent()">حفظ البيانات</button></div></div><div class="card"><div class="section-head"><h2>إعادة البدء</h2><small>صلاحية المعلم</small></div><div class="notice">يمسح تقدم الطالب ونقاطه وعدد الاختبارات، ويعيد اليوم إلى اليوم الأول. الاسم والعمر يبقون كما هم.</div><button class="danger full" style="margin-top:12px" onclick="resetStudent()">إعادة البدء من الصفر</button></div></section>',"ملف الطالب","عدّل بيانات الطالب أو صفّر تقدمه.");
}
function saveStudent(){
  const p=profile();p.name=document.getElementById("sName").value.trim()||p.name;p.age=Number(document.getElementById("sAge").value)||null;p.currentLevelId=document.getElementById("sLevel").value;ReemStore.saveProfile(p);alert("تم حفظ بيانات الطالب");dashboard();page="dashboard";
}
function resetStudent(){if(!confirm("متأكد؟ سيتم مسح تقدم الطالب ونقاطه والبدء من الصفر."))return;ReemStore.resetProgress();alert("تمت إعادة الطالب من الصفر");dashboard();page="dashboard";}
function contentPage(){
  const c=content();const cats=c.categories||[],words=c.words||[];
  shell('<div class="content-layout"><section class="card"><div class="section-head"><h2>الفئات</h2><small>'+cats.length+'</small></div><div class="list">'+cats.map(cat=>'<div class="row"><div><b>'+esc(cat.icon||"📁")+' '+esc(cat.nameAr)+'</b><small>'+esc(cat.nameEn)+' • '+words.filter(w=>w.categoryId===cat.id).length+' كلمة</small></div><button onclick="editCategory(\''+esc(cat.id)+'\')">تعديل</button><button onclick="deleteCategory(\''+esc(cat.id)+'\')">حذف</button></div>').join("")+'</div><div class="form" style="margin-top:14px"><div class="field"><label>فئة جديدة — الاسم العربي</label><input id="catAr" placeholder="مثال: عائلة السفر"></div><div class="field"><label>الاسم الإنجليزي</label><input id="catEn" placeholder="Travel"></div><div class="field"><label>أيقونة</label><input id="catIcon" placeholder="✈️"></div><button class="primary" onclick="addCategory()">+ إضافة فئة</button></div></section><section class="card"><div class="section-head"><h2>الكلمات</h2><small>'+words.length+' كلمة</small></div><div class="form"><div class="field"><label>الفئة</label><select id="wCat">'+cats.map(cat=>'<option value="'+esc(cat.id)+'">'+esc(cat.nameAr)+'</option>').join("")+'</select></div><div class="field"><label>الكلمة الإنجليزية</label><input id="wEn" placeholder="example"></div><div class="field"><label>المعنى بالعربي</label><input id="wAr" placeholder="المعنى"></div><div class="field"><label>النطق المبسط</label><input id="wPron" placeholder="إكزامبل"></div><div class="field"><label>مثال إنجليزي</label><input id="wExEn" placeholder="This is an example."></div><div class="field"><label>ترجمة المثال</label><input id="wExAr" placeholder="هذا مثال."></div><div class="field"><label>رابط الصورة</label><input id="wImg" placeholder="https://..."></div><button class="primary" onclick="saveWordForm()">+ إضافة الكلمة</button></div><div class="list" style="margin-top:14px">'+words.map(w=>'<div class="word-row"><img class="word-img" src="'+esc(w.image)+'" alt=""><div><b dir="ltr">'+esc(w.en)+'</b><small>'+esc(w.ar)+' • '+esc(w.pronunciation)+'</small></div><button onclick="loadWord(\''+esc(w.id)+'\')">تعديل</button><button onclick="deleteWord(\''+esc(w.id)+'\')">حذف</button></div>').join("")+'</div></section></div>',"الكلمات والفئات","أضف وعدّل محتوى المرحلة الأولى بنفسك.");
}
function addCategory(){
  const ar=document.getElementById("catAr").value.trim(),en=document.getElementById("catEn").value.trim(),icon=document.getElementById("catIcon").value.trim()||"📁";if(!ar||!en)return alert("اكتب الاسم العربي والإنجليزي");
  const c=content(),id="cat-"+Date.now();c.categories.push({id,nameAr:ar,nameEn:en,icon,order:c.categories.length+1});ReemStore.saveContent(c);contentPage();
}
function editCategory(id){
  const c=content(),cat=c.categories.find(x=>x.id===id);if(!cat)return;const ar=prompt("الاسم العربي",cat.nameAr);if(ar===null)return;const en=prompt("الاسم الإنجليزي",cat.nameEn);if(en===null)return;const icon=prompt("الأيقونة",cat.icon||"📁");cat.nameAr=ar.trim()||cat.nameAr;cat.nameEn=en.trim()||cat.nameEn;cat.icon=icon.trim()||cat.icon;ReemStore.saveContent(c);contentPage();
}
function deleteCategory(id){
  const c=content();if(c.words.some(w=>w.categoryId===id))return alert("انقل أو احذف كلمات هذه الفئة أولًا.");if(!confirm("حذف الفئة؟"))return;c.categories=c.categories.filter(x=>x.id!==id);ReemStore.saveContent(c);contentPage();
}
function loadWord(id){
  const c=content(),w=c.words.find(x=>x.id===id);if(!w)return;editingWordId=id;
  document.getElementById("wCat").value=w.categoryId;document.getElementById("wEn").value=w.en;document.getElementById("wAr").value=w.ar;document.getElementById("wPron").value=w.pronunciation;document.getElementById("wExEn").value=w.exampleEn;document.getElementById("wExAr").value=w.exampleAr;document.getElementById("wImg").value=w.image;window.scrollTo({top:0,behavior:"smooth"});
}
function saveWordForm(){
  const c=content(),obj={categoryId:document.getElementById("wCat").value,en:document.getElementById("wEn").value.trim(),ar:document.getElementById("wAr").value.trim(),pronunciation:document.getElementById("wPron").value.trim(),exampleEn:document.getElementById("wExEn").value.trim(),exampleAr:document.getElementById("wExAr").value.trim(),image:document.getElementById("wImg").value.trim()};
  if(!obj.en||!obj.ar||!obj.image)return alert("الكلمة، المعنى، والصورة مطلوبة");
  if(editingWordId){const w=c.words.find(x=>x.id===editingWordId);Object.assign(w,obj);editingWordId=null;}else{obj.id="word-"+Date.now();c.words.push(obj);}
  ReemStore.saveContent(c);contentPage();
}
function deleteWord(id){if(!confirm("حذف الكلمة؟"))return;const c=content();c.words=c.words.filter(x=>x.id!==id);ReemStore.saveContent(c);const p=profile();p.learnedWordIds=p.learnedWordIds.filter(x=>x!==id);p.reviewWordIds=p.reviewWordIds.filter(x=>x!==id);ReemStore.saveProfile(p);contentPage();}
function testsPage(){
  const p=profile();
  shell('<section class="two"><div class="card"><div class="section-head"><h2>الاختبارات</h2><small>المرحلة الثانية</small></div><div class="notice">سيكون عندك صانع اختبار كامل: اختيار من متعدد، كتابة، مطابقة، صح/خطأ، تحديد عدد الأسئلة والدرجات، ثم إرسال الاختبار للطالب وتصحيحه.</div></div><div class="card"><div class="section-head"><h2>الحالة الحالية</h2></div><div class="status"><h3>'+p.completedTests+' اختبارات منجزة</h3><p>لم نفعّل صانع الاختبارات في المرحلة الأولى حتى نثبت الكلمات والملف والواجهة أولًا.</p></div></div></section>',"الاختبارات","محجوزة للمرحلة الثانية بعد اعتماد المرحلة الأولى.");
}
render();