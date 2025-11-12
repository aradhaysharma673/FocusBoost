import React, { useEffect, useState, useRef } from 'react';
const newXp = prev + gained;
// level logic
let newLevel = level;
if(newXp >= newLevel*100){ newLevel++; setLevel(newLevel); }
// persist
chrome.storage.local.set({xp:newXp, level:newLevel});
// sync to firebase if logged in
firebaseClient.syncProfile({xp:newXp, level:newLevel});
return newXp;
});
setStreak(prev=>{
const next = isWork ? prev + 1 : prev; // increase on work
chrome.storage.local.set({streak:next});
firebaseClient.syncProfile({streak:next});
return next;
});

import firebaseClient from '../shared/firebaseClient';
import { useEffect, useState } from 'react';

// inside component:
const [user, setUser] = useState(null);

useEffect(()=>{
  // start listening to auth state
  const unsubscribe = firebaseClient.onAuthStateChanged(u => setUser(u));
  return () => unsubscribe && unsubscribe();
},[]);

async function handleSignIn(){
  const u = await firebaseClient.signInWithGoogle();
  if(u) {
    // optionally fetch profile after sign-in
    const profile = await firebaseClient.fetchProfile();
    // update UI or local storage accordingly
  } else {
    // show error
    alert('Sign-in failed. Try again.');
  }
}



// notification
chrome.runtime.sendMessage({type:'session_complete'});


// toggle session type
setIsWork(!isWork);
// auto start next session? keep paused by default
}


return (
<div className="p-3 w-80 font-sans">
<h1 className="text-lg font-bold">FocusBoost</h1>
<div className="mt-3 text-center">
<div className="text-4xl font-mono">{String(minutes).padStart(2,'0')}:{String(seconds).padStart(2,'0')}</div>
<div className="mt-2 flex justify-center gap-2">
<button className="px-3 py-1 rounded bg-blue-500 text-white" onClick={onStart}>Start</button>
<button className="px-3 py-1 rounded bg-gray-300" onClick={onPause}>Pause</button>
<button className="px-3 py-1 rounded bg-red-400 text-white" onClick={onReset}>Reset</button>
</div>
</div>


<div className="mt-4 grid grid-cols-3 gap-2 text-sm">
<div>XP<br/><strong>{xp}</strong></div>
<div>Level<br/><strong>{level}</strong></div>
<div>Streak<br/><strong>{streak}</strong></div>
</div>


<div className="mt-4">
<details>
<summary className="cursor-pointer">Settings</summary>
<div className="mt-2">
<label className="block text-sm">Work minutes
<input type="number" value={workMin} onChange={e=>{const v=Math.max(1,parseInt(e.target.value||25,10)); setWorkMin(v); setMinutes(v); chrome.storage.local.set({prefs:{...(JSON.parse(sessionStorage.getItem('prefs')||'{}')), workMinutes:v}})}} className="w-full p-1 mt-1 rounded border" />
</label>
<label className="block text-sm mt-2">Break minutes
<input type="number" value={breakMin} onChange={e=>{const v=Math.max(1,parseInt(e.target.value||5,10)); setBreakMin(v); chrome.storage.local.set({prefs:{...(JSON.parse(sessionStorage.getItem('prefs')||'{}')), breakMinutes:v}})}} className="w-full p-1 mt-1 rounded border" />
</label>
</div>
</details>
</div>
</div>
);
}
