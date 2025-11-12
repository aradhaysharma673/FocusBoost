export function startConfetti(){
// tiny, dependency-free confetti: create many small divs and animate with CSS keyframes
const el = document.createElement('div');
el.className = 'focusboost-confetti';
el.innerHTML = '';
for(let i=0;i<12;i++){
const d = document.createElement('div');
d.className = 'confetti-piece';
d.style.left = (10 + i*6) + '%';
el.appendChild(d);
}
document.body.appendChild(el);
setTimeout(()=>{ el.remove(); }, 3100);
}
