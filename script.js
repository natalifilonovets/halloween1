'use strict';
const monsters = [
{id:'vampire',name:'VAMPIRE',facts:['I have sharp fangs.','I can turn into a bat.'],ability:'TURN INTO A BAT',asset:'assets/vampire.png'},
{id:'mummy',name:'MUMMY',facts:['I am wrapped in bandages.','I come from ancient Egypt.'],ability:'ANCIENT MYSTERY',asset:'assets/mummy.png'},
{id:'werewolf',name:'WEREWOLF',facts:['I look like a wolf.','I howl at the full moon.'],ability:'HOWL AT THE MOON',asset:'assets/werewolf.png'},
{id:'frankenstein-monster',name:"FRANKENSTEIN'S MONSTER",facts:['I am very tall and strong.','I was made by a scientist.'],ability:'SUPER STRENGTH',asset:'assets/frankenstein-monster.png'},
{id:'invisible-man',name:'INVISIBLE MAN',facts:["You can't see my body.",'My clothes can still be seen.'],ability:'BECOME INVISIBLE',asset:'assets/invisible-man.png'}];
const questions=[['I have sharp fangs. I can turn into a bat. Who am I?','vampire',['werewolf','invisible-man']],['I am wrapped in bandages. Who am I?','mummy',['frankenstein-monster','vampire']],['I howl at the full moon. Who am I?','werewolf',['mummy','invisible-man']],['A scientist made me. I am very strong. Who am I?','frankenstein-monster',['werewolf','vampire']],["You can't see my body. Who am I?",'invisible-man',['mummy','frankenstein-monster']]];
// Round 3 transfers known language to a new situation.
const powers=[['A guest needs to fly through a small window. Who can help?','vampire'],['The hotel needs a loud howl at midnight. Who can help?','werewolf'],['A guest wants to hide without being seen. Who can help?','invisible-man'],['A guest has a very heavy bag. Who can lift it?','frankenstein-monster'],['We are making a film about ancient Egypt. Who is a good match?','mummy']];
const learning={
'vampire':{hint:'Look for sharp fangs and a cape.',reason:'He can turn into a bat.',frame:'He can',ending:'turn into a bat.'},
'mummy':{hint:'Look for strips of cloth. They are bandages.',reason:'He is wrapped in bandages.',frame:'He is',ending:'wrapped in bandages.'},
'werewolf':{hint:'Look for pointed ears, a muzzle and a tail.',reason:'He can howl loudly.',frame:'He has',ending:'a tail.'},
'frankenstein-monster':{hint:'Look for a tall body and a square head.',reason:'He is very strong.',frame:'He is',ending:'very strong.'},
'invisible-man':{hint:'Look for clothes with no visible body inside.',reason:'He can disappear from sight.',frame:'He can',ending:'disappear from sight.'}};
const shadowSentences={mummy:'He is wrapped in bandages.',werewolf:'He has a long tail.', 'frankenstein-monster':'He is tall and strong.'};
const escapeHTML=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let attempts=0;
const key='dracula-monster-check-v1';
const fresh=()=>({screen:'intro',viewed:[],round:1,index:0,stamps:[],shadows:[],shadowOrder:[],complete:false,intro:0,pendingShadow:null,wordOrder:[],wordBank:[]});
let state=fresh(),sound=false,locked=false,selected=null,audio;
try {const s=JSON.parse(localStorage.getItem(key));if(s&&Array.isArray(s.viewed)&&Array.isArray(s.stamps))state={...fresh(),...s};}catch{}
// Migrate runs saved before the shorter game flow.
if(state.screen==='practice'){state.screen='round';state.round=2;state.index=0;}
if(state.screen==='describe'){state.screen='victory';state.complete=true;}
delete state.writing;
const stage=document.querySelector('#stage');
const byId=id=>monsters.find(m=>m.id===id);
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function save(){try{localStorage.setItem(key,JSON.stringify(state));}catch{}}
function tone(correct=true){if(!sound)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.frequency.setValueAtTime(correct?660:220,audio.currentTime);o.frequency.exponentialRampToValueAtTime(correct?990:165,audio.currentTime+.15);g.gain.setValueAtTime(.05,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.25);o.start();o.stop(audio.currentTime+.26);}catch{}}
function go(screen){if(screen==='victory'&&!state.complete)return;state.screen=screen;save();render();}
function image(m,cls=''){return `<img class="${cls}" src="${m.asset}" alt="${m.name.toLowerCase()} character" width="1024" height="1024">`;}
function card(id,action='answer'){const m=byId(id);return `<button class="portrait theme-${id}" data-${action}="${id}"><span class="portrait-art">${image(m)}<span class="portrait-halo"></span><span class="portrait-platform" aria-hidden="true"></span></span><span class="portrait-name">${m.name}</span>${action==='profile'?`<span class="card-meta">${state.viewed.includes(id)?'✓ MET':'MEET MONSTER ↗'}</span>`:''}</button>`;}
function heading(kicker,title,sub=''){return `<div class="heading"><p class="eyebrow">${kicker}</p><h1>${title}</h1>${sub?`<p class="subtitle">${sub}</p>`:''}</div>`;}
function render(){if(state.screen==='start'){state.screen='intro';state.intro=0;}if(state.screen==='victory'&&(!state.complete||state.stamps.length!==5)){state.screen='intro';state.intro=0;state.complete=false;}locked=false;selected=null;attempts=0;if(window.speechSynthesis)window.speechSynthesis.cancel();stage.className=state.screen;document.querySelector('#pass').textContent=`MONSTER PASS ${['gallery','profile'].includes(state.screen)?state.viewed.length:state.stamps.length}/5`;document.querySelector('#pass').title=['gallery','profile'].includes(state.screen)?'Gallery: monsters met':'Monster Check: passport stamps earned';document.querySelector('#steps').innerHTML=['Gallery','Who am I?','Shadows','Skills & secrets','Guest'].map((x,i)=>`<span class="step ${state.complete||(['gallery','profile'].includes(state.screen)?i===0:state.screen==='round'?i===state.round:false)?'active':''}" title="${x}"></span>`).join('');
if(state.screen==='intro'||state.screen==='transition')renderCinematicDialogue();
else if(state.screen==='gallery'){stage.innerHTML=heading('THE PORTRAIT GALLERY','MEET THE MONSTERS','Behind every spooky face is a new friend. Choose a portrait to say hello.')+`<div class="cards five">${monsters.map(m=>card(m.id,'profile')).join('')}</div><div class="gallery-bottom"><span>${state.viewed.length} OF 5 MONSTERS MET <span class="medallions" aria-hidden="true">${monsters.map(m=>`<span class="medallion ${state.viewed.includes(m.id)?'lit':''}">✦</span>`).join('')}</span></span><button class="primary" id="start-check" ${state.viewed.length<5?'disabled':''}>${state.complete?'PLAY MONSTER CHECK AGAIN':'START MONSTER CHECK'} →</button></div>`;}
else if(state.screen==='profile')renderProfile();
else if(state.screen==='round')renderRound();
else if(state.screen==='victory')renderCelebration();
if(state.screen==='round'&&state.round===2&&state.shadows.length===3)document.querySelector('#next').hidden=false;
if(state.screen==='round'&&state.round===2&&state.pendingShadow)showShadowWords(state.pendingShadow);
wire();addListening();save();stage.focus({preventScroll:true});}
function renderRound(){const r=state.round,i=state.index;
if(r===1){const q=questions[i];stage.classList.add('who-challenge');stage.innerHTML=`<div class="challenge-top"><div class="challenge-title"><p class="eyebrow">DRACULA'S MONSTER CHALLENGE</p><h1>WHO AM I?</h1></div><div class="challenge-progress"><span class="round-count">ROUND 01 · ${i+1}/5</span><div class="quiz-medallions" aria-label="${i} of 5 clues solved">${[0,1,2,3,4].map(n=>`<span class="quiz-medallion ${n<i?'lit':''} ${n===i?'current':''}" aria-hidden="true">✦</span>`).join('')}</div></div></div><section class="clue-scroll" aria-label="Your magical clue"><div class="scroll-crest" aria-hidden="true">${profileIcon('bat')}</div><p class="scroll-label">READ THE MAGIC CLUE</p><p id="quiz-clue">${q[0]}</p><div id="clue-audio"></div></section><p class="challenge-instruction">Choose the portrait that matches the clue.</p><div class="cards three challenge-portraits">${shuffle([q[1],...q[2]]).map((id,n)=>quizPortrait(id,n)).join('')}</div><aside class="quiz-host" aria-label="Count Dracula"><img src="assets/3ad26a70-5601-48f9-bd42-0fc684b35cbf.png" width="1024" height="1024" alt="Count Dracula, your host" decoding="async"><div><small>COUNT DRACULA</small><p id="host-speech" aria-live="polite">Look closely, my friend!</p></div></aside>`;}
if(r===2){if(!state.shadowOrder.length)state.shadowOrder=shuffle(['werewolf','frankenstein-monster','mummy']);renderShadowTheatre();}
if(r===3)renderRescueMission();
stage.insertAdjacentHTML('beforeend','<div class="feedback-row"><p id="feedback" role="status"></p><button class="primary" id="next" hidden>NEXT →</button></div>');}
function feedback(text,correct){const el=document.querySelector('#feedback');el.textContent=(correct?'✦ ':'')+text;el.className=correct?'correct':'retry';if(correct)el.insertAdjacentHTML('afterbegin','<img class="feedback-stamp" src="assets/success-stamp.png" alt="Success">');document.querySelector('#live').textContent=text;tone(correct);}
function answer(id,button){if(locked)return;if(state.round===3){answerRescue(id,button);return;}const correct=(state.round===1?questions:powers)[state.index][1]===id;if(!correct){attempts++;const target=(state.round===1?questions:powers)[state.index][1];feedback(attempts===1?'Not quite. Read the clue and try again!':learning[target].hint,false);if(attempts>=3&&state.round!==1){document.querySelector(`[data-answer="${target}"]`).classList.add('hint-glow');feedback(learning[target].hint+' Look at the glowing portrait.',false);} if(state.round===1){feedback(byId(id).name+'. '+(attempts===1?'Not quite. Try the clue again!':learning[target].hint),false);document.querySelector('#host-speech').textContent=attempts===1?'A good try! Look again.':'You can do this!';}button.classList.remove('shake');void button.offsetWidth;button.classList.add('shake');return;}locked=true;button.classList.add('chosen');feedback("That's right! "+learning[id].reason,true);document.querySelectorAll('[data-answer]').forEach(b=>b.disabled=true);if(state.round===1)celebrateQuiz(id,button);document.querySelector('#next').hidden=false;save();}
function wire(){stage.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>go(b.dataset.go));stage.querySelectorAll('[data-profile]').forEach(b=>b.onclick=()=>{state.profile=b.dataset.profile;state.viewed=[...new Set([...state.viewed,state.profile])];go('profile');});stage.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>answer(b.dataset.answer,b));
const cont=document.querySelector('#continue');if(cont)cont.onclick=()=>{if(state.screen==='transition'){state.round=1;state.index=0;go('round');}else if(state.intro<2){state.intro++;save();updateCinematicDialogue();}else go('gallery');};
const start=document.querySelector('#start-check');if(start)start.onclick=()=>{state.round=1;state.index=0;state.shadows=[];state.shadowOrder=[];state.stamps=[];state.pendingShadow=null;state.wordOrder=[];state.wordBank=[];go('transition');};
if(state.screen==='round'&&state.round===2)wireShadowTheatre();
const next=document.querySelector('#next');if(next)next.onclick=()=>{if(state.round===2){state.round=3;state.index=0;}else if(state.index<4)state.index++;else if(state.round===1){state.round=2;state.index=0;}else{completeMission();return;}save();render();};
const passCard=document.querySelector('#monster-pass-card');if(passCard)passCard.onclick=()=>{passCard.classList.toggle('pass-sparkle');passCard.setAttribute('aria-pressed',String(passCard.classList.contains('pass-sparkle')));};
const map=document.querySelector('#map');if(map)map.onclick=()=>{const target=window.HOTEL_PARENT_MAP;if(typeof target==='string'&&target){const url=new URL('index.html?mission=1&complete=true',new URL(target,location.href));location.assign(url.href);}else{document.querySelector('#map-help').textContent='Return to your Genially hotel map to continue your adventure.';document.querySelector('#map-help').focus();}};}
document.querySelector('#sound').onclick=()=>{sound=!sound;const b=document.querySelector('#sound');b.textContent=sound?'SOUND ON':'SOUND OFF';b.setAttribute('aria-pressed',String(sound));b.setAttribute('aria-label',sound?'Turn sound off':'Turn sound on');tone();};
document.querySelector('#restart').onclick=()=>{state=fresh();save();render();};
for(const file of [...monsters.map(m=>m.asset),...Object.values(rescueScenes).map(s=>s.background).filter(Boolean),'assets/hotel-gate.png','assets/3ad26a70-5601-48f9-bd42-0fc684b35cbf.png','assets/castle-interior.png','assets/success-stamp.png','assets/monster-card-back.png','assets/monster-silhouettes.png','assets/gallery-frame.svg','assets/clue-scroll.svg','assets/rescue-suitcase.png','assets/rescue-camera.png']){const img=new Image();img.src=file;}
render();

function completeMission(){
 state.complete=true;go('victory');
 try{if(window.parent!==window)window.parent.postMessage({type:'HOTEL_MISSION_COMPLETED',mission:'meet-the-monsters',code:'MONSTER1'},'*');}catch{}
}
function showShadowWords(id){
 if(document.querySelector('#shadow-dialog')){document.querySelector('#shadow-dialog').showModal();return;}
 const words=shadowSentences[id].split(' ');
 if(!state.wordBank?.length){state.wordBank=shuffle(words.map((_,i)=>i));if(state.wordBank.every((x,i)=>x===i))state.wordBank.push(state.wordBank.shift());}
 state.wordOrder??=[];save();
 const dialog=document.createElement('dialog');dialog.id='shadow-dialog';dialog.setAttribute('aria-labelledby','word-title');
 dialog.innerHTML=`<button class="dialog-close" aria-label="Close word puzzle">×</button><div class="dialog-monster shadow-puzzle-portrait">${image(byId(id),'silhouette')}</div><p class="eyebrow">YOU FOUND ${byId(id).name}!</p><h2 id="word-title">Bring the words to life!</h2><p class="word-instruction">Tap the words in the correct order.</p><div id="word-answer" class="word-answer" aria-label="Your sentence"></div><p class="word-tip">Tap a word in your sentence to put it back.</p><div id="word-bank" class="word-bank" aria-label="Words to choose"></div><p id="word-feedback" role="status"></p><div class="word-actions"><button class="secondary" id="reset-words">START AGAIN</button><button class="primary" id="check-words">LIGHT THE CANDLE →</button></div>`;
 stage.append(dialog);
 let errors=0;
 function draw(){
 document.querySelector('#word-answer').innerHTML=state.wordOrder.length?state.wordOrder.map((n,i)=>`<button class="word-token placed" data-remove="${i}" aria-label="Remove ${words[n]}">${words[n]}</button>`).join(''):'<span class="word-placeholder">Your sentence goes here…</span>';
 document.querySelector('#word-bank').innerHTML=state.wordBank.map(n=>`<button class="word-token" data-word="${n}" ${state.wordOrder.includes(n)?'disabled':''}>${words[n]}</button>`).join('');
 dialog.querySelectorAll('[data-word]').forEach(b=>b.onclick=()=>{state.wordOrder.push(Number(b.dataset.word));save();draw();});
 dialog.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{state.wordOrder.splice(Number(b.dataset.remove),1);save();draw();});
 }
 dialog.querySelector('.dialog-close').onclick=()=>{dialog.close();offerResume();};
 function offerResume(){if(dialog.open)return;document.querySelector('#resume-shadow')?.remove();if(state.pendingShadow){const resume=document.createElement('button');resume.id='resume-shadow';resume.className='primary';resume.textContent='CONTINUE WORD PUZZLE →';resume.onclick=()=>{resume.remove();dialog.showModal();};document.querySelector('.feedback-row').append(resume);resume.focus();}}
 dialog.onclose=offerResume;
 dialog.querySelector('#reset-words').onclick=()=>{state.wordOrder=[];save();draw();document.querySelector('#word-feedback').textContent='';};
 dialog.querySelector('#check-words').onclick=()=>{
 const result=dialog.querySelector('#word-feedback');
 if(state.wordOrder.length!==words.length){result.textContent='Use all the words to make your sentence.';return;}
 if(state.wordOrder.some((n,i)=>n!==i)){errors++;result.textContent=errors<2?'Not quite. Tap a word to move it back and try again.':`Start with “He ${words[1]}”. What comes next?`;tone(false);return;}
 state.shadows=[...new Set([...state.shadows,id])];state.pendingShadow=null;state.wordOrder=[];state.wordBank=[];dialog.onclose=null;dialog.close();save();render();stage.querySelector(`[data-shadow="${id}"]`)?.classList.add('shadow-reveal');feedback('You found the monster! '+shadowSentences[id],true);
 };
 draw();dialog.showModal();
}
function addListening(){
 if(!('speechSynthesis' in window))return;
 const target=state.screen==='profile'?document.querySelector('#profile-actions'):state.screen==='round'&&state.round===1?document.querySelector('#clue-audio'):state.screen==='round'&&state.round===3?document.querySelector('#rescue-audio'):null;
 if(!target)return;
 const text=state.screen==='profile'?byId(state.profile).facts.join(' '):(state.round===1?questions:powers)[state.index][0];
 const button=document.createElement('button');button.className='listen-button secondary';button.innerHTML=state.screen==='profile'?`${profileIcon('sound')}<span>LISTEN</span>`:state.screen==='round'&&state.round===1?`${profileIcon('sound')}<span class="sr-only">Listen to the clue</span>`:'LISTEN';button.setAttribute('aria-label','Listen to the English sentences');
 button.onclick=()=>{const voice=window.speechSynthesis.getVoices().find(v=>v.localService&&/^en[-_]/i.test(v.lang));if(!voice){if(state.screen==='round'&&state.round===1){document.querySelector('#host-speech').textContent='No English voice is installed. Read the clue.';button.title='English voice unavailable';}else button.textContent='ENGLISH VOICE UNAVAILABLE';return;}window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.voice=voice;utterance.lang=voice.lang;utterance.rate=.82;utterance.onerror=()=>{if(state.screen==='round'&&state.round===1){const bubble=document.querySelector('#host-speech');if(bubble)bubble.textContent='Voice unavailable. Read the clue.';}else button.textContent='VOICE UNAVAILABLE';};window.speechSynthesis.speak(utterance);};target.append(button);
}

function profileIcon(kind){
 const paths={bat:'<path d="M32 20l-5-8-1 10C17 12 9 11 2 10c6 8 7 15 6 23 9-5 15-2 17 7l7 5 7-5c2-9 8-12 17-7-1-8 0-15 6-23-7 1-15 2-24 12l-1-10z"/>',fangs:'<path d="M9 17q23 18 46 0v12q-23 19-46 0z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M15 23l4 22 8-16zm34 0-4 22-8-16z"/>',sound:'<path d="M9 25h11l13-11v36L20 39H9z"/><path d="M41 22q11 10 0 20m7-28q19 18 0 36" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>',star:'<path d="M32 7l6 17 18 8-18 7-6 18-7-18-17-7 17-8z"/>'};
 return `<svg viewBox="0 0 64 64" fill="currentColor" aria-hidden="true" focusable="false">${paths[kind]||paths.star}</svg>`;
}
function renderProfile(){
 const m=byId(state.profile)||monsters[0],vampire=m.id==='vampire';stage.classList.add('profile-'+m.id);
 stage.innerHTML=`<div class="profile-topbar"><button class="text-btn back" data-go="gallery">← BACK TO GALLERY</button><div class="profile-progress" aria-label="${state.viewed.length} of 5 monsters met"><span>${profileIcon(vampire?'bat':'star')}</span><div><small>FRIENDS IN YOUR GALLERY</small><strong>MONSTER PASS ${state.viewed.length}/5</strong></div><div class="profile-progress-gems" aria-hidden="true">${monsters.map(x=>`<i class="${state.viewed.includes(x.id)?'lit':''}"></i>`).join('')}</div></div></div>
 <div class="profile-layout"><div class="profile-display"><div class="profile-crest" aria-hidden="true">${profileIcon(vampire?'bat':'star')}</div><div class="profile-art"><div class="velvet-glow" aria-hidden="true"></div><div class="profile-pedestal" aria-hidden="true"></div>${image(m)}<span class="profile-candle left" aria-hidden="true"><i></i></span><span class="profile-candle right" aria-hidden="true"><i></i></span></div><div class="portrait-plaque">${vampire?'THE MIDNIGHT GUEST':m.name}</div></div>
 <div class="profile-copy"><div class="profile-title">${heading('A FRIEND OF THE HOTEL',m.name)}<div class="profile-title-rule" aria-hidden="true">✦</div></div><section class="profile-facts" aria-labelledby="facts-title"><h2 id="facts-title" class="section-label">MONSTER FACTS</h2><div class="facts">${m.facts.map((fact,i)=>`<div class="fact-card"><span class="fact-emblem" aria-hidden="true">${profileIcon(vampire?(i?'bat':'fangs'):'star')}</span><p>${escapeHTML(fact)}</p><span class="fact-corner" aria-hidden="true">✧</span></div>`).join('')}</div></section>
 <section class="ability" aria-label="Signature ability"><span class="ability-medallion" aria-hidden="true">${profileIcon(vampire?'bat':'star')}</span><div><span class="section-label">SIGNATURE ABILITY</span><strong>${m.ability}</strong></div><span class="ability-spark" aria-hidden="true">✦</span></section>
 <div class="profile-actions" id="profile-actions"><button class="primary fantasy-button" data-go="gallery"><span>NICE TO MEET YOU!</span><span aria-hidden="true">→</span></button></div></div></div>`;
}

function quizPortrait(id,index){
 const descriptions={vampire:'Pale guest with fangs and a red-lined cape',mummy:'Guest wrapped in ivory bandages',werewolf:'Furry guest with pointed ears and a bushy tail','frankenstein-monster':'Tall green guest with a square head and big boots','invisible-man':'Floating hat, goggles and clothes with no visible body'};
 return `<button class="portrait quiz-portrait theme-${id}" data-answer="${id}" aria-label="Choose portrait ${index+1}: ${descriptions[id]}"><span class="quiz-frame-crest" aria-hidden="true">✦</span><span class="portrait-art"><span class="portrait-halo" aria-hidden="true"></span><img src="${byId(id).asset}" width="1024" height="1024" alt="${descriptions[id]}" decoding="sync" fetchpriority="high"><span class="portrait-platform" aria-hidden="true"></span></span><span class="quiz-choice-mark" aria-hidden="true">◇</span></button>`;
}
function celebrateQuiz(id,button){
 feedback("That's right! "+byId(id).name+'. '+learning[id].reason,true);
 document.querySelector('#host-speech').textContent='Splendid! You found my friend!';
 const gems=document.querySelectorAll('.quiz-medallion');gems[state.index].classList.add('lit');document.querySelector('.quiz-medallions').setAttribute('aria-label',`${state.index+1} of 5 clues solved`);
 button.classList.add('quiz-winner','effect-'+id);
 const burst=document.createElement('span');burst.className='quiz-particles';burst.setAttribute('aria-hidden','true');burst.innerHTML=Array.from({length:12},(_,i)=>`<i style="--angle:${i*30}deg;--delay:${i%3*.06}s">✦</i>`).join('');button.append(burst);
 const magic=document.createElement('span');magic.className='quiz-ability';magic.setAttribute('aria-hidden','true');magic.innerHTML=id==='vampire'?profileIcon('bat'):id==='werewolf'?'☾':id==='mummy'?'≋':id==='frankenstein-monster'?'ϟ':'✧';button.append(magic);
}

function theatreCandle(n){
 const lit=n<state.shadows.length;
 return `<span class="candle theatre-candle ${lit?'lit':''}" role="img" aria-label="Candle ${n+1}: ${lit?'lit':'unlit'}"><svg viewBox="0 0 70 100" aria-hidden="true"><defs><linearGradient id="wax-${n}"><stop stop-color="#b88b5a"/><stop offset=".45" stop-color="#fff0bf"/><stop offset="1" stop-color="#d3a774"/></linearGradient><linearGradient id="brass-${n}" x2="0" y2="1"><stop stop-color="#ffe4a2"/><stop offset=".5" stop-color="#c18a45"/><stop offset="1" stop-color="#73502d"/></linearGradient></defs><ellipse cx="35" cy="93" rx="28" ry="5" fill="#120c2044"/><path d="M15 83h40l-6 6H21zM31 74h8v11h-8z" fill="url(#brass-${n})" stroke="#b08b50"/><path d="M24 34q11-5 22 0v39q-11 6-22 0z" fill="url(#wax-${n})" stroke="#d5ad78"/><ellipse cx="35" cy="34" rx="11" ry="4" fill="#ffebbc"/><path d="M26 36v10q4 6 6-1v-8m11 0v18" fill="none" stroke="#fff0c7" stroke-width="3" stroke-linecap="round"/><path d="M35 35v-8" stroke="#492b28" stroke-width="2"/><g class="candle-flame"><path d="M35 3q-16 20-4 25 15 5 13-8Q43 13 35 3" fill="#ffc571"/><path d="M35 15q-8 10-1 13 8-1 1-13" fill="#fff6ca"/></g><path d="M18 84h34M24 77h22" stroke="#ffe4a0" stroke-width="2"/></svg></span>`;
}
function renderShadowTheatre(){
 stage.classList.add('shadow-theatre');
 stage.innerHTML=`<div class="theatre-atmosphere" aria-hidden="true"><span class="moonbeam"></span><span class="stage-fog"></span><span class="stage-fog second"></span></div><div class="theatre-heading"><span class="round-count">ROUND 02</span><h1>SHADOW ROOM</h1><div class="candles theatre-candles" aria-label="${state.shadows.length} of 3 candles lit">${[0,1,2].map(theatreCandle).join('')}</div></div><div class="theatre-parchment"><p>Match the shadows. Build the sentences. Light the candles!</p></div><div class="cards three shadows theatre-arches">${state.shadowOrder.map((id,n)=>{
 const done=state.shadows.includes(id),pending=state.pendingShadow===id;
 return `<div class="theatre-bay"><button class="shadow-card theatre-arch ${done?'matched':''}" data-shadow="${id}" aria-label="Shadow ${n+1}${done?', matched':', select this shadow'}" ${done?'disabled':''}><span class="arch-jewel" aria-hidden="true">✦</span><span class="theatre-screen"><span class="screen-moon" aria-hidden="true"></span><span class="screen-floor" aria-hidden="true"></span><img class="theatre-shadow" src="${byId(id).asset}" width="1024" height="1024" alt="${done?byId(id).name:'Mystery monster silhouette '+(n+1)}" decoding="sync"><img class="theatre-color" src="${byId(id).asset}" width="1024" height="1024" alt="" aria-hidden="true" decoding="sync"><span class="curtain left" aria-hidden="true"></span><span class="curtain right" aria-hidden="true"></span><span class="curtain-valance" aria-hidden="true"></span></span><span class="arch-label">${done?'✦ CANDLE LIT':'SHADOW 0'+(n+1)}</span></button><button class="name-slot ${done?'filled':pending?'pending':''}" data-slot="${id}" aria-label="${done?byId(id).name:'Place a name under shadow '+(n+1)}" ${done?'disabled':''}>${done||pending?byId(id).name:'PLACE A NAME HERE'}</button></div>`;
 }).join('')}</div><div class="name-choices golden-nameplates" aria-label="Monster nameplates">${shuffle(state.shadowOrder).map(id=>`<button class="secondary nameplate" data-match="${id}" draggable="${!state.shadows.includes(id)}" aria-pressed="false" ${state.shadows.includes(id)?'disabled':''}><span aria-hidden="true">✦</span><strong>${byId(id).name}</strong><span aria-hidden="true">✦</span></button>`).join('')}</div><p class="theatre-control-tip">Drag a name to a shadow, or tap a shadow and a name.</p>`;
}
function wireShadowTheatre(){
 let chosenName=null;
 function attemptMatch(id,name){
  if(state.pendingShadow){showShadowWords(state.pendingShadow);return;}
  if(state.shadows.includes(id))return;
  if(id!==name){feedback('A little mystery! Try another name or shadow.',false);const bay=stage.querySelector(`[data-slot="${id}"]`);bay.classList.remove('shake');void bay.offsetWidth;bay.classList.add('shake');return;}
  state.pendingShadow=id;state.wordOrder=[];state.wordBank=[];save();const slot=stage.querySelector(`[data-slot="${id}"]`);slot.textContent=byId(id).name;slot.classList.add('pending');showShadowWords(id);
 }
 function chooseShadow(id){
  if(state.pendingShadow){showShadowWords(state.pendingShadow);return;}
  selected=id;stage.querySelectorAll('[data-shadow]').forEach(b=>{b.classList.toggle('selected',b.dataset.shadow===id);b.setAttribute('aria-pressed',String(b.dataset.shadow===id));});
  if(chosenName){attemptMatch(id,chosenName);chosenName=null;stage.querySelectorAll('[data-match]').forEach(b=>{b.classList.remove('picked');b.setAttribute('aria-pressed','false');});}
 }
 stage.querySelectorAll('[data-shadow],[data-slot]').forEach(b=>{
  const id=b.dataset.shadow||b.dataset.slot;b.onclick=()=>chooseShadow(id);
  b.ondragover=e=>{if(!state.shadows.includes(id)){e.preventDefault();e.dataTransfer.dropEffect='move';b.classList.add('drop-ready');}};
  b.ondragleave=()=>b.classList.remove('drop-ready');
  b.ondrop=e=>{e.preventDefault();b.classList.remove('drop-ready');const name=e.dataTransfer.getData('text/plain');if(state.shadowOrder.includes(name))attemptMatch(id,name);};
 });
 stage.querySelectorAll('[data-match]').forEach(b=>{
  b.onclick=()=>{if(state.pendingShadow){showShadowWords(state.pendingShadow);return;}chosenName=b.dataset.match;stage.querySelectorAll('[data-match]').forEach(x=>{x.classList.toggle('picked',x===b);x.setAttribute('aria-pressed',String(x===b));});if(selected){attemptMatch(selected,chosenName);chosenName=null;}};
  b.ondragstart=e=>{e.dataTransfer.setData('text/plain',b.dataset.match);e.dataTransfer.effectAllowed='move';b.classList.add('dragging');};
  b.ondragend=()=>{b.classList.remove('dragging');stage.querySelectorAll('.drop-ready').forEach(x=>x.classList.remove('drop-ready'));};
 });
}

function dialogueLines(){return state.screen==='intro'?["Welcome to Hotel Transylvania! I'm Count Dracula!",'Before you enter, meet my monster friends!','Can you pass the Monster Check?']:["Great! Now let's test your monster skills!"];}
function renderCinematicDialogue(){
 stage.classList.add('cinematic-dialogue');
 stage.innerHTML=`<div class="lobby-light" aria-hidden="true"></div><div class="dracula-entrance"><span class="dracula-contact-shadow" aria-hidden="true"></span><img class="dialogue-host" src="assets/3ad26a70-5601-48f9-bd42-0fc684b35cbf.png" width="1024" height="1024" alt="Friendly Count Dracula" decoding="sync" fetchpriority="high"></div><div class="cinematic-conversation"><section class="gothic-bubble" aria-label="Count Dracula says"><span class="bubble-ornament top" aria-hidden="true">${profileIcon('bat')}</span><p class="eyebrow">COUNT DRACULA</p><h1 id="dracula-dialogue" aria-live="polite" aria-atomic="true"></h1><span class="bubble-ornament bottom" aria-hidden="true">✦</span></section><div class="cinematic-actions"><button class="primary" id="continue"></button><div class="dialogue-dots" aria-label="Dialogue progress"></div></div></div>`;
 updateCinematicDialogue(false);
}
function updateCinematicDialogue(animate=true){
 const lines=dialogueLines(),n=state.screen==='intro'?state.intro:0,dialogue=document.querySelector('#dracula-dialogue'),button=document.querySelector('#continue');
 dialogue.textContent=lines[n];button.textContent=(state.screen==='transition'?'START ROUND 1':n===2?"LET'S GO!":'CONTINUE')+' →';
 document.querySelector('.dialogue-dots').innerHTML=lines.map((_,i)=>`<span class="step ${i===n?'active':''}" aria-hidden="true"></span>`).join('');document.querySelector('.dialogue-dots').setAttribute('aria-label',`Dialogue ${n+1} of ${lines.length}`);
 if(animate){dialogue.classList.remove('dialogue-line-enter');void dialogue.offsetWidth;dialogue.classList.add('dialogue-line-enter');document.querySelector('.dracula-entrance').classList.remove('dracula-acknowledge');void dialogue.offsetWidth;document.querySelector('.dracula-entrance').classList.add('dracula-acknowledge');}
}

function renderRescueMission(){
 const id=powers[state.index][1];stage.classList.add('rescue-mission','rescue-'+id);
 stage.innerHTML=`<div class="rescue-heading"><div><p class="eyebrow">ROUND 03 · SKILLS & SECRETS · ${state.index+1}/5</p><h1>MONSTER RESCUE</h1></div><div class="rescue-medals" aria-label="${state.stamps.length} of 5 rescue stamps">${monsters.map(m=>`<span class="rescue-medal ${state.stamps.includes(m.id)?'earned':''}" aria-hidden="true">✦</span>`).join('')}</div></div><section class="rescue-clue"><p id="rescue-question">${powers[state.index][0]}</p><div id="rescue-audio"></div></section><div class="rescue-world" role="group" aria-label="${rescueScenes[id].label}">${rescueScenery(id)}<div class="rescue-actor" id="rescue-actor" aria-live="polite"></div><span class="rescue-bat" aria-hidden="true">${profileIcon('bat')}</span><div class="howl-rings" aria-hidden="true"><i></i><i></i><i></i></div><div class="rescue-bag illustrated-prop" aria-hidden="true"><img src="assets/rescue-suitcase.png" alt="" width="1024" height="1024" decoding="sync"></div><div class="film-camera illustrated-prop" aria-hidden="true"><img src="assets/rescue-camera.png" alt="" width="1024" height="1024" decoding="sync"><span class="camera-record"></span></div><div class="mission-solved" role="status">${rescueScenes[id].success}</div></div><section class="rescue-team" aria-labelledby="team-title"><div class="team-label"><h2 id="team-title">TEAM OF MONSTERS</h2><span>Choose a friend to help.</span></div><div class="team-portraits">${shuffle(monsters.map(m=>m.id)).map(m=>`<button class="team-portrait theme-${m}" data-answer="${m}" aria-label="Choose ${byId(m).name}"><img src="${byId(m).asset}" alt="${byId(m).name.toLowerCase()}" width="1024" height="1024" decoding="sync"><span>${byId(m).name}</span></button>`).join('')}</div></section>`;
}
function answerRescue(id,button){
 const correct=powers[state.index][1]===id,world=stage.querySelector('.rescue-world'),actor=stage.querySelector('#rescue-actor');
 // Replacing only the actor restarts its entrance, including repeated attempts.
 actor.innerHTML=`<img src="${byId(id).asset}" alt="${byId(id).name.toLowerCase()} enters the scene" width="1024" height="1024" decoding="sync">`;
 world.className='rescue-world '+(correct?'solved':'try-again')+' actor-'+id;
 stage.querySelectorAll('.team-portrait').forEach(b=>b.classList.toggle('selected',b===button));
 if(!correct){attempts++;const reactions={vampire:'My cape is ready… but try another friend!',mummy:'My bandages need a rest. Try a friend!',werewolf:'Woof! I need a different job!', 'frankenstein-monster':'Oops! This needs a different skill!', 'invisible-man':'Can you see a better helper?'};feedback(reactions[id],false);actor.insertAdjacentHTML('beforeend',`<span class="actor-reaction">${reactions[id]}</span>`);return;}
 locked=true;state.stamps=[...new Set([...state.stamps,id])];button.classList.add('chosen');stage.querySelectorAll('[data-answer]').forEach(b=>b.disabled=true);
 feedback("That's right! "+learning[id].reason,true);document.querySelector('#pass').textContent=`MONSTER PASS ${state.stamps.length}/5`;
 const medal=stage.querySelectorAll('.rescue-medal')[monsters.findIndex(m=>m.id===id)];medal.classList.add('earned');stage.querySelector('.rescue-medals').setAttribute('aria-label',`${state.stamps.length} of 5 rescue stamps`);
 document.querySelector('#next').hidden=false;save();
}

function renderCelebration(){
 stage.classList.add('victory-celebration');
 stage.innerHTML=`<div class="celebration-rays" aria-hidden="true"></div><div class="victory-confetti" aria-hidden="true">${Array.from({length:26},(_,i)=>`<i style="--x:${(i*37)%100}%;--delay:${i%7*.15}s;--turn:${i*29}deg;--color:${['#f8d18a','#d99cba','#c2dae8'][i%3]}"></i>`).join('')}</div><div class="victory-title"><p class="eyebrow">MISSION 01 COMPLETE</p><h1>Welcome to the monster family!</h1></div><img class="victory-dracula" src="assets/3ad26a70-5601-48f9-bd42-0fc684b35cbf.png" alt="Dracula welcomes you" width="1024" height="1024" decoding="sync"><div class="victory-dialogue"><small>COUNT DRACULA</small><p>Amazing! You know all my monster friends! Welcome to our family!</p></div><div class="victory-cast">${monsters.map((m,i)=>`<div class="celebrating-monster cast-${i}">${image(m)}<span class="cast-shadow" aria-hidden="true"></span></div>`).join('')}</div><button class="award magical-pass" id="monster-pass-card" aria-label="Your official Monster Pass. Click to add a magical sparkle." aria-pressed="false"><span class="pass-corner corner-tl" aria-hidden="true">✦</span><span class="pass-corner corner-tr" aria-hidden="true">✦</span><p class="eyebrow">HOTEL TRANSYLVANIA · MONSTER PASS</p><h2>OFFICIAL MONSTER FRIEND</h2><p class="pass-message">You've met all 5 monsters!</p><div class="pass-portraits">${monsters.map(m=>`<span>${image(m)}<i aria-hidden="true">✦</i></span>`).join('')}</div><span class="pass-ribbon" aria-hidden="true">✧ &nbsp; A FRIEND FOR ALL ETERNITY &nbsp; ✧</span></button><div class="secret-reward"><div class="golden-key" role="img" aria-label="Your golden adventure key"><svg viewBox="0 0 650 110" aria-hidden="true"><defs><linearGradient id="keygold" x2="0" y2="1"><stop stop-color="#fff1b2"/><stop offset=".45" stop-color="#f2c36d"/><stop offset=".7" stop-color="#bc8135"/><stop offset="1" stop-color="#efcb7c"/></linearGradient></defs><path d="M126 42H601V72H570V94H544V72H509V89H484V72H126" fill="url(#keygold)" stroke="#ffe7a1" stroke-width="3"/><path d="M82 8C18 8 18 102 82 102c59 0 66-93 0-94Zm0 24c29 0 30 46 0 46-31 0-31-46 0-46Z" fill="url(#keygold)" stroke="#ffe7a1" stroke-width="3"/><path d="M133 47H469M47 31q12-18 33-17" stroke="#fff2b9" fill="none" stroke-width="3"/></svg></div></div><div class="victory-actions"><button class="primary" id="map">CONTINUE ADVENTURE →</button></div><p id="map-help" tabindex="-1"></p><div class="victory-pumpkin pumpkin-left" aria-hidden="true">${victoryPumpkin()}</div><div class="victory-pumpkin pumpkin-right" aria-hidden="true">${victoryPumpkin()}</div>`;
}
function victoryPumpkin(){return `<svg viewBox="0 0 150 130"><defs><radialGradient id="pumpkin-orange"><stop stop-color="#ffb653"/><stop offset=".7" stop-color="#c85423"/><stop offset="1" stop-color="#703022"/></radialGradient></defs><path d="M70 25l-4-21 18-2-4 25" fill="#5b6340"/><ellipse cx="75" cy="77" rx="67" ry="49" fill="url(#pumpkin-orange)"/><ellipse cx="75" cy="77" rx="39" ry="49" fill="none" stroke="#8b391a77" stroke-width="3"/><path d="M34 63l22-8-5 19ZM114 63l-22-8 5 19ZM44 89l19 8 11-7 12 7 20-8-9 20H55Z" fill="#ffe6a3"/></svg>`;}
