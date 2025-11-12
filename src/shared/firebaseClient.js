import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';


const FIREBASE_CONFIG = {
// Replace these with your Firebase project's config
apiKey: "AIzaSyBL3eZc9EHXN17udL09-62usGkZ4ANfqdY",
authDomain: "focusboost-b93ac.firebaseapp.com",
projectId: "focusboost-b93ac",
storageBucket: "focusboost-b93ac.firebasestorage.app",
messagingSenderId: "712986873105",
appId: "1:712986873105:web:4023877a522c1e2fe990b0",
measurementId: "G-46ESJFPJFH"
};


let app, auth, db;


const firebaseClient = {
init(){
if(!app){
app = initializeApp(FIREBASE_CONFIG);
auth = getAuth(app);
db = getFirestore(app);
}
},
async signInWithGoogle(){
this.init();
const provider = new GoogleAuthProvider();
try{
const res = await signInWithPopup(auth, provider);
const user = res.user;
// save minimal profile to chrome.storage
chrome.storage.local.set({fbUser:{uid:user.uid,displayName:user.displayName}});
return user;
}catch(e){ console.error('firebase signin',e); return null; }
},
async syncProfile(profile){
// optional: sync to firestore under users/{uid}
try{
this.init();
const stored = await chrome.storage.local.get(['fbUser']);
const fbUser = stored.fbUser;
if(!fbUser) return;
const ref = doc(db, 'users', fbUser.uid);
await setDoc(ref, {...profile, updatedAt: new Date().toISOString()}, {merge:true});
}catch(e){ console.error('syncProfile',e); }
}
};


export default firebaseClient;
