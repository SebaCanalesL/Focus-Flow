import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  projectId: "studio-808864941-b51ba",
  appId: "1:444464760523:web:4e3ec710d3d56e23747d4e",
  storageBucket: "studio-808864941-b51ba.firebasestorage.app",
  apiKey: "AIzaSyBJqudC8uilNGktrFFHxI8YVmd-DprZxXY",
  authDomain: "studio-808864941-b51ba.firebaseapp.com",
  messagingSenderId: "444464760523",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { app, auth };
