import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from "firebase/auth";

import Constants from 'expo-constants';

//Usuario de pruebas:
//danielalfaro@social.com
//123456

const API_KEY = Constants.expoConfig.extra.API_KEY;
const AUTH_DOMAIN = Constants.expoConfig.extra.AUTH_DOMAIN;
const PROJECT_ID = Constants.expoConfig.extra.PROJECT_ID;
const STORAGE_BUCKET = Constants.expoConfig.extra.STORAGE_BUCKET;
const MESSAGING_SENDER_ID = Constants.expoConfig.extra.MESSAGING_SENDER_ID;
const APP_ID = Constants.expoConfig.extra.APP_ID;

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
};

// Initialize Firebase
const appFirebase = initializeApp(firebaseConfig);

export default appFirebase;

export const database = getFirestore();

export const auth = getAuth(appFirebase);

// Test si se están cargando las keys:
export function testKeys() {
  console.log(Constants);
  console.log(API_KEY);
}