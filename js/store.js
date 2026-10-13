window.ReemStore=(function(){
  const PROFILE_KEY="reem_single_student_profile_v1";
  const CONTENT_KEY="reem_single_student_content_v1";
  const TESTS_KEY="reem_teacher_tests_v2";
  const SUBMISSIONS_KEY="reem_test_submissions_v2";

  function nowIso(){return new Date().toISOString();}
  function deepClone(v){return JSON.parse(JSON.stringify(v));}

  function defaultProfile(){
    const cfg=window.REEM_CONFIG||{};
    return {
      id:(cfg.student&&cfg.student.id)||"student-1",
      name:(cfg.student&&cfg.student.name)||"الطالب",
      age:(cfg.student&&cfg.student.age)??null,
      currentLevelId:(cfg.student&&cfg.student.currentLevelId)||"starter",
      points:0,
      completedTests:0,
      startedAt:nowIso(),
      learnedWordIds:[],
      reviewWordIds:[],
      completedDailySets:[],
      preferences:{fontScale:1,theme:"dark",accent:"pink"}
    };
  }

  function getProfile(){
    try{
      return Object.assign(defaultProfile(),JSON.parse(localStorage.getItem(PROFILE_KEY)||"{}"));
    }catch(e){return defaultProfile();}
  }
  function saveProfile(profile){localStorage.setItem(PROFILE_KEY,JSON.stringify(profile));return profile;}
  function patchProfile(patch){const p=getProfile();Object.assign(p,patch||{});return saveProfile(p);}

  function baseContent(){
    return {
      categories:deepClone((window.REEM_CONFIG&&window.REEM_CONFIG.categories)||[]),
      words:deepClone(window.REEM_WORDS||[])
    };
  }
  function getContent(){
    const base=baseContent();
    try{
      const saved=JSON.parse(localStorage.getItem(CONTENT_KEY)||"null");
      if(saved&&Array.isArray(saved.categories)&&Array.isArray(saved.words)){
        const baseById=Object.fromEntries((base.words||[]).map(w=>[w.id,w]));
        const savedIds=new Set((saved.words||[]).map(w=>w.id));
        let changed=false;
        saved.words=saved.words.map(w=>{
          const fresh=baseById[w.id];
          if(fresh && (!w.image || /^https:\/\/loremflickr\.com\//i.test(String(w.image)))){
            changed=true;
            return Object.assign({},w,{image:fresh.image});
          }
          return w;
        });
        (base.words||[]).forEach(w=>{
          if(!savedIds.has(w.id)){saved.words.push(deepClone(w));changed=true;}
        });
        const catIds=new Set((saved.categories||[]).map(c=>c.id));
        (base.categories||[]).forEach(c=>{
          if(!catIds.has(c.id)){saved.categories.push(deepClone(c));changed=true;}
        });
        if(changed)localStorage.setItem(CONTENT_KEY,JSON.stringify(saved));
        return saved;
      }
    }catch(e){}
    localStorage.setItem(CONTENT_KEY,JSON.stringify(base));
    return base;
  }
  function saveContent(content){localStorage.setItem(CONTENT_KEY,JSON.stringify(content));return content;}

  function resetProgress(){
    const old=getProfile();
    const fresh=defaultProfile();
    fresh.name=old.name;
    fresh.age=old.age;
    fresh.currentLevelId="starter";
    fresh.preferences=old.preferences||fresh.preferences;
    saveProfile(fresh);
    localStorage.removeItem(SUBMISSIONS_KEY);
    return fresh;
  }

  function addLearned(wordId){
    const p=getProfile();
    if(!p.learnedWordIds.includes(wordId))p.learnedWordIds.push(wordId);
    p.reviewWordIds=p.reviewWordIds.filter(id=>id!==wordId);
    p.points=Math.max(p.points,p.learnedWordIds.length*10);
    saveProfile(p);return p;
  }
  function addReview(wordId){
    const p=getProfile();
    if(!p.reviewWordIds.includes(wordId))p.reviewWordIds.push(wordId);
    saveProfile(p);return p;
  }

  function getTests(){try{return JSON.parse(localStorage.getItem(TESTS_KEY)||"[]")}catch(e){return[]}}
  function saveTests(v){localStorage.setItem(TESTS_KEY,JSON.stringify(v||[]));}
  function getSubmissions(){try{return JSON.parse(localStorage.getItem(SUBMISSIONS_KEY)||"[]")}catch(e){return[]}}
  function saveSubmissions(v){localStorage.setItem(SUBMISSIONS_KEY,JSON.stringify(v||[]));}

  return {
    keys:{PROFILE_KEY,CONTENT_KEY,TESTS_KEY,SUBMISSIONS_KEY},
    getProfile,saveProfile,patchProfile,getContent,saveContent,resetProgress,
    addLearned,addReview,getTests,saveTests,getSubmissions,saveSubmissions
  };
})();