'use strict';
// One stable 1600 × 900 composition inside any iframe or browser viewport.
function fitGameViewport(){
 const width=document.documentElement.clientWidth,height=window.innerHeight;
 document.documentElement.style.setProperty('--game-scale',Math.min(width/1600,height/900));
 document.documentElement.style.setProperty('--dialog-scale',Math.min(1,width/780,height/800));
}
fitGameViewport();
window.addEventListener('resize',fitGameViewport,{passive:true});
window.visualViewport?.addEventListener('resize',fitGameViewport,{passive:true});
