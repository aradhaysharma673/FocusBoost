// This file must be at the root of the extension (alongside manifest.json)
self.addEventListener('install', (e)=>{ self.skipWaiting(); });


chrome.runtime.onMessage.addListener((msg, sender, sendResp)=>{
if(msg && msg.type === 'session_complete'){
chrome.notifications.create({
type: 'basic',
iconUrl: 'icons/icon128.png',
title: 'FocusBoost — Session complete!',
message: 'Nice work — you earned XP! Take a break.'
});
}
});
