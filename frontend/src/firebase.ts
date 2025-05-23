import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const firebaseConfig = {
  apiKey: "AIzaSyAcoX8YHHH5yXQd6_5f-LQKFRcPvGauE1M",
  authDomain: "menu-app-823bd.firebaseapp.com",
  projectId: "menu-app-823bd",
  storageBucket: "menu-app-823bd.appspot.com",
  messagingSenderId: "840849253944",
  appId: "1:840849253944:web:7df351b402c88a3a03a8cd"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const checkIsAdmin = async (email: string): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_BASE}/admins`);
    const admins = response.data;
    return admins.some((admin: any) => admin.email === email);
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export { auth }; 