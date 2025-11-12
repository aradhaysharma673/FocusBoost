// src/shared/firebaseClient.js
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyBL3eZc9EHXN17udL09-62usGkZ4ANfqdY",
  authDomain: "focusboost-b93ac.firebaseapp.com",
  projectId: "focusboost-b93ac",
  storageBucket: "focusboost-b93ac.firebasestorage.app",
  messagingSenderId: "712986873105",
  appId: "1:712986873105:web:4023877a522c1e2fe990b0",
  measurementId: "G-46ESJFPJFH"
};

let app, auth, db;
function init() {
  if (!app) {
    app = initializeApp(FIREBASE_CONFIG);
    auth = getAuth(app);
    db = getFirestore(app);
  }
}

// Helper: return currently signed-in user's minimal profile from local storage or null
async function getLocalUser() {
  return new Promise(resolve => {
    chrome.storage.local.get(['fbUser'], res => resolve(res.fbUser || null));
  });
}

// Public API
const firebaseClient = {
  init,

  // Sign in with Google (popup). Returns user object or null.
  async signInWithGoogle() {
    init();
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const minimal = { uid: user.uid, displayName: user.displayName || null, email: user.email || null };
      chrome.storage.local.set({ fbUser: minimal });
      // Ensure a user doc exists
      await setDoc(doc(db, 'users', minimal.uid), {
        displayName: minimal.displayName,
        email: minimal.email,
        xp: 0,
        level: 1,
        streak: 0,
        updatedAt: serverTimestamp()
      }, { merge: true });
      return minimal;
    } catch (err) {
      console.error('firebase signInWithGoogle error', err);
      return null;
    }
  },

  // Sign out
  async signOut() {
    init();
    try {
      await fbSignOut(auth);
      chrome.storage.local.remove('fbUser');
      return true;
    } catch (err) {
      console.error('firebase signOut', err);
      return false;
    }
  },

  // Sync a profile object { xp, level, streak } to Firestore under users/{uid}
  async syncProfile(profile = {}) {
    init();
    try {
      const fbUser = await getLocalUser();
      if (!fbUser || !fbUser.uid) return;
      const ref = doc(db, 'users', fbUser.uid);
      const data = {
        ...profile,
        updatedAt: serverTimestamp()
      };
      await setDoc(ref, data, { merge: true });
    } catch (err) {
      console.error('syncProfile error', err);
    }
  },

  // Fetch current user's profile from Firestore (returns object or null)
  async fetchProfile() {
    init();
    try {
      const fbUser = await getLocalUser();
      if (!fbUser || !fbUser.uid) return null;
      const ref = doc(db, 'users', fbUser.uid);
      const snap = await getDoc(ref);
      return snap.exists() ? snap.data() : null;
    } catch (err) {
      console.error('fetchProfile error', err);
      return null;
    }
  },

  // Fetch top N leaderboard entries
  async fetchLeaderboard(limitN = 10) {
    init();
    try {
      const q = query(collection(db, 'users'), orderBy('xp', 'desc'), limit(limitN));
      const snaps = await getDocs(q);
      const results = [];
      snaps.forEach(s => results.push({ id: s.id, ...s.data() }));
      return results;
    } catch (err) {
      console.error('fetchLeaderboard error', err);
      return [];
    }
  },

  // Listen to auth state changes and call callback(user) where user is minimal profile or null
  onAuthStateChanged(callback) {
    init();
    return onAuthStateChanged(auth, (user) => {
      if (user) {
        const minimal = { uid: user.uid, displayName: user.displayName || null, email: user.email || null };
        chrome.storage.local.set({ fbUser: minimal }, () => callback(minimal));
      } else {
        chrome.storage.local.remove('fbUser', () => callback(null));
      }
    });
  }
};

export default firebaseClient;
