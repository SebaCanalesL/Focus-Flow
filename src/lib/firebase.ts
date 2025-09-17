import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Replace this with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBJqudC8uilNGktrFFHxI8YVmd-DprZxXY",
  authDomain: "studio-808864941-b51ba.firebaseapp.com",
  projectId: "studio-808864941-b51ba",
  storageBucket: "studio-808864941-b51ba.firebasestorage.app",
  messagingSenderId: "444464760523",
  appId: "1:444464760523:web:4e3ec710d3d56e23747d4e",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
auth.useDeviceLanguage();


export { app, auth };
