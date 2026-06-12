import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';

// Fallback configuration if .env keys are not provided
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app;
let auth;
let db;
let googleProvider;
let isFirebaseAvailable = false;

// Check if Config is valid and complete
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.projectId;

if (isConfigValid) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    isFirebaseAvailable = true;
    console.log("🔥 Firebase initialized successfully.");
  } catch (error) {
    console.error("⚠️ Failed to initialize Firebase: ", error);
  }
} else {
  console.log("ℹ️ Firebase credentials missing in environment. Running in Offline Mock mode.");
}

// Mock database wrapper using LocalStorage
const mockDb = {
  saveHistory: async (userId, data) => {
    const key = `carboniq_history_${userId}`;
    const history = JSON.parse(localStorage.getItem(key) || '[]');
    const newItem = {
      id: Math.random().toString(36).substring(2, 9),
      userId,
      timestamp: new Date().toISOString(),
      ...data
    };
    history.unshift(newItem);
    localStorage.setItem(key, JSON.stringify(history));
    return newItem;
  },
  getHistory: async (userId) => {
    const key = `carboniq_history_${userId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }
};

// Authentication services
export const loginWithGoogle = async () => {
  if (isFirebaseAvailable) {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error("Auth Error:", error);
      throw error;
    }
  } else {
    // Simulated auth
    const mockUser = {
      uid: 'mock_user_123',
      displayName: 'Demo User',
      email: 'demo@carboniq.app',
      photoURL: 'https://api.dicebear.com/7.x/bottts/svg?seed=carboniq'
    };
    localStorage.setItem('carboniq_mock_user', JSON.stringify(mockUser));
    window.dispatchEvent(new Event('auth-state-change'));
    return mockUser;
  }
};

export const logoutUser = async () => {
  if (isFirebaseAvailable) {
    await signOut(auth);
  } else {
    localStorage.removeItem('carboniq_mock_user');
    window.dispatchEvent(new Event('auth-state-change'));
  }
};

export const subscribeToAuth = (callback) => {
  if (isFirebaseAvailable) {
    return onAuthStateChanged(auth, callback);
  } else {
    const handleStorageChange = () => {
      const stored = localStorage.getItem('carboniq_mock_user');
      callback(stored ? JSON.parse(stored) : null);
    };
    window.addEventListener('auth-state-change', handleStorageChange);
    // Initial call
    const stored = localStorage.getItem('carboniq_mock_user');
    callback(stored ? JSON.parse(stored) : null);
    return () => window.removeEventListener('auth-state-change', handleStorageChange);
  }
};

// Database services
export const saveCalculationResult = async (user, answers, score, actionPlan) => {
  const data = {
    answers,
    score,
    actionPlan,
    createdAt: new Date().toISOString()
  };

  const userId = user ? user.uid : 'anonymous';

  if (isFirebaseAvailable && user) {
    try {
      const docRef = await addDoc(collection(db, 'calculations'), {
        userId,
        ...data,
        createdAtServer: new Date() // Firestore timestamp
      });
      return { id: docRef.id, ...data };
    } catch (e) {
      console.error("Error saving to Firestore, falling back to LocalStorage:", e);
      return await mockDb.saveHistory(userId, data);
    }
  } else {
    return await mockDb.saveHistory(userId, data);
  }
};

export const fetchCalculationHistory = async (user) => {
  const userId = user ? user.uid : 'anonymous';

  if (isFirebaseAvailable && user) {
    try {
      const q = query(
        collection(db, 'calculations'),
        where('userId', '==', userId),
        orderBy('createdAtServer', 'desc'),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const list = [];
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      return list;
    } catch (e) {
      console.error("Error reading from Firestore, falling back to LocalStorage:", e);
      return await mockDb.getHistory(userId);
    }
  } else {
    return await mockDb.getHistory(userId);
  }
};

export { isFirebaseAvailable };
