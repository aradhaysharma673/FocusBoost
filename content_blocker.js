// Lightweight content-blocker; runs on pages and checks chrome.storage for blocklist/sessionActive
(function(){
const overlayId = 'focusboost-overlay';
if(document.getElementById(overlayId)) return;
const overlay = document.createElement('div');
overlay.id = overlayId;
Object.assign(overlay.style,{
position:'fixed',top:0,left:0,right:0,bottom:0,zIndex:999999999,display:'none',alignItems:'center',justifyContent:'center',background:'rgba(0,0,0,0.86)',color:'#fff',fontSize:'20px',textAlign:'center',padding:'20px'
});
overlay.innerHTML = '<div style="max-width:600px">Focus session active — that site is blocked. Close this tab and get back to work 💪<br/><button id="focusboost-close" style="margin-top:12px;padding:8px 12px;border-radius:6px">Close tab</button></div>';
document.documentElement.appendChild(overlay);
document.addEventListener('click', (e)=>{ if(e.target && e.target.id==='focusboost-close') chrome.runtime.sendMessage({type:'close_tab'}); });


chrome.runtime.onMessage.addListener((msg)=>{ if(msg && msg.type === 'update_overlay') updateOverlay(); });


async function updateOverlay(){
chrome.storage.local.get(['prefs','sessionActive'], (res)=>{
const prefs = res.prefs || {};
const blocklist = prefs.blocklist || ['facebook.com','youtube.com','twitter.com','instagram.com'];
const sessionActive = res.sessionActive || false;
const hostname = location.hostname || '';
const isBlocked = blocklist.some(s=> hostname.includes(s));
overlay.style.display = (sessionActive && isBlocked) ? 'flex' : 'none';
});
}


// poll every 1s
setInterval(updateOverlay, 1000);
})();
