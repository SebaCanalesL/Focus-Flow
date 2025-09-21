import { onRequest } from "firebase-functions/v2/https";
import admin from "firebase-admin";

admin.initializeApp();

export const helloWorld = onRequest((req, res) => {
  res.send("Hello from Firebase!");
  });
