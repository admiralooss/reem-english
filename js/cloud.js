window.ReemCloud=(function(){
  const URL="https://ybslpnqvzoccyamukujp.supabase.co";
  const KEY="sb_publishable_MX9MVXJRvXtOuei1t0xAfQ_iGibzjNU";
  const STUDENT_ID="student-1";
  const headers={"apikey":KEY,"Authorization":"Bearer "+KEY,"Content-Type":"application/json"};
  let applying=false,timer=null;

  async function read(){
    const r=await fetch(URL+"/rest/v1/student_state?student_id=eq."+encodeURIComponent(STUDENT_ID)+"&select=profile,submissions,updated_at",{headers,cache:"no-store"});
    if(!r.ok)throw new Error("cloud_read_"+r.status);
    const rows=await r.json();return rows[0]||null;
  }
  async function write(profile,submissions){
    const body={student_id:STUDENT_ID,profile:profile||{},submissions:submissions||[],updated_at:new Date().toISOString()};
    const r=await fetch(URL+"/rest/v1/student_state?on_conflict=student_id",{
      method:"POST",headers:Object.assign({},headers,{"Prefer":"resolution=merge-duplicates,return=minimal"}),body:JSON.stringify(body)
    });
    if(!r.ok)throw new Error("cloud_write_"+r.status);
    return true;
  }
  function localProfile(){try{return JSON.parse(localStorage.getItem("reem_single_student_profile_v1")||"null")}catch(e){return null}}
  function localSubs(){try{return JSON.parse(localStorage.getItem("reem_test_submissions_v2")||"[]")}catch(e){return[]}}
  function applyLocal(row){
    if(!row||!row.profile)return false;
    applying=true;
    localStorage.setItem("reem_single_student_profile_v1",JSON.stringify(row.profile));
    localStorage.setItem("reem_test_submissions_v2",JSON.stringify(row.submissions||[]));
    applying=false;return true;
  }
  function queuePush(){
    if(applying)return;
    clearTimeout(timer);
    timer=setTimeout(()=>write(localProfile(),localSubs()).catch(()=>{}),180);
  }
  async function pull(){
    const row=await read();if(row)applyLocal(row);return row;
  }
  async function mergeAndSync(){
    const remote=await read().catch(()=>null);
    const local=localProfile();
    if(!remote||!remote.profile){if(local)await write(local,localSubs());return local}
    if(!local){applyLocal(remote);return remote.profile}
    const rp=remote.profile||{},lp=local||{};
    const learned=[...new Set([...(rp.learnedWordIds||[]),...(lp.learnedWordIds||[])])];
    const review=[...new Set([...(rp.reviewWordIds||[]),...(lp.reviewWordIds||[])])].filter(x=>!learned.includes(x));
    const merged=Object.assign({},rp,lp,{
      learnedWordIds:learned,reviewWordIds:review,
      points:Math.max(Number(rp.points)||0,Number(lp.points)||0,learned.length*10),
      completedTests:Math.max(Number(rp.completedTests)||0,Number(lp.completedTests)||0)
    });
    const rs=Array.isArray(remote.submissions)?remote.submissions:[],ls=localSubs();
    const map=new Map();[...rs,...ls].forEach(x=>map.set(x.id||JSON.stringify(x),x));
    const submissions=[...map.values()];
    applying=true;
    localStorage.setItem("reem_single_student_profile_v1",JSON.stringify(merged));
    localStorage.setItem("reem_test_submissions_v2",JSON.stringify(submissions));
    applying=false;
    await write(merged,submissions);
    return merged;
  }
  return {pull,mergeAndSync,queuePush,write,isApplying:()=>applying};
})();