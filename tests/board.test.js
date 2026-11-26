const {JSDOM}=require('jsdom');const fs=require('fs');const dir=process.argv[2];
const html=fs.readFileSync(dir+'/index.html','utf8').replace(/<script src="[^"]+"><\/script>/g,'');
const scripts=[...fs.readFileSync(dir+'/index.html','utf8').matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>fs.readFileSync(dir+'/'+m[1],'utf8'));
const ok=(c,m)=>{console.log((c?'PASS':'FAIL')+' '+m);if(!c)process.exitCode=1};
let failFetch=false;
function boot(stored){const dom=new JSDOM(html,{runScripts:'outside-only',url:'http://localhost/'});const w=dom.window;
 if(stored!==undefined)w.localStorage.setItem('taskflow-tasks',stored);
 w.confirm=()=>true;w.prompt=()=>'Edited';
 w.fetch=async(u)=>{if(failFetch)throw new Error('network down');const b=fs.readFileSync(dir+'/'+u,'utf8');return{ok:true,status:200,json:async()=>JSON.parse(b)}};
 scripts.forEach(s=>w.eval(s));return w;}
const tick=()=>new Promise(r=>setTimeout(r,20));
(async()=>{
let w=boot();let d=w.document;const cnt=s=>d.querySelector(`.column[data-status="${s}"] .task-count`).textContent;
ok(d.querySelectorAll('.task-card').length==0&&cnt('todo')=='0','clean load with empty storage');
d.querySelector('#import-button').click();await tick();
ok(d.querySelectorAll('.task-card').length==6&&cnt('todo')=='2'&&cnt('progress')=='2'&&cnt('done')=='2','import 6 starter tasks into right columns');
d.querySelector('#import-button').click();await tick();
ok(d.querySelectorAll('.task-card').length==6,'repeat import dedupes by id');
d.querySelector('#task-input').value='Persist me';d.querySelector('.add-task-form').dispatchEvent(new w.Event('submit',{cancelable:true}));
let saved=JSON.parse(w.localStorage.getItem('taskflow-tasks'));ok(saved.length==7&&saved.some(t=>t.title=='Persist me'&&t.status=='todo'),'add saved to localStorage');
const card=[...d.querySelectorAll('.task-card')].find(c=>c.querySelector('.task-title').textContent=='Persist me');
card.querySelector('.move-button').click();saved=JSON.parse(w.localStorage.getItem('taskflow-tasks'));ok(saved.find(t=>t.title=='Persist me').status=='progress','move saved');
d.querySelector('.task-card .delete-button').click();saved=JSON.parse(w.localStorage.getItem('taskflow-tasks'));ok(saved.length==6,'delete saved');
const raw=w.localStorage.getItem('taskflow-tasks');
w=boot(raw);d=w.document;ok(d.querySelectorAll('.task-card').length==6&&d.querySelector('.column[data-status="progress"]').textContent.includes('Persist me'),'reload restores tasks from localStorage');
const s=d.querySelector('#search-input');s.value='repo';s.dispatchEvent(new w.Event('input'));ok(d.querySelectorAll('.task-card').length==2,'search filters by title ("repo" -> 2)');
s.value='';s.dispatchEvent(new w.Event('input'));
failFetch=true;d.querySelector('#import-button').click();await tick();ok(d.querySelector('#status-message').classList.contains('is-error')&&d.querySelectorAll('.task-card').length==6,'fetch error handled with message');
w=boot('not json{');ok(w.document.querySelectorAll('.task-card').length==0,'corrupted storage loads clean');
if(process.argv[3]){
 // Week 4 checks
 failFetch=false;w=boot(raw);d=w.document;const c=d.querySelector('.column[data-status="todo"] .task-card');
 ok(c.getAttribute('draggable')=='true','cards draggable');
 const dt={data:{},setData(k,v){this.data[k]=v},getData(k){return this.data[k]},effectAllowed:'',dropEffect:''};
 const ev=(type,t)=>{const e=new w.Event(type,{bubbles:true,cancelable:true});e.dataTransfer=dt;t.dispatchEvent(e);return e};
 const id=c.dataset.id;ev('dragstart',c);const done=d.querySelector('.column[data-status="done"]');
 const over=ev('dragover',done);ok(over.defaultPrevented&&done.classList.contains('drag-over'),'dragover allows drop + highlights column');
 ev('drop',done);ok(!done.classList.contains('drag-over')&&JSON.parse(w.localStorage.getItem('taskflow-tasks')).find(t=>t.id==id).status=='done'&&d.querySelector('.column[data-status="done"] .task-count').textContent=='3','drop moves task, saves, updates counts');
 const st=d.querySelector('.stats-bar').textContent;ok(/50%/.test(st),'stats bar shows completion % ('+st.trim().replace(/\s+/g,' ')+')');
 ok(d.querySelector('.app-footer').textContent.includes('Built during the SkillMe Web Development Internship by Abhishek Kumar'),'footer note');
}
})();
