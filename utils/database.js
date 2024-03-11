import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'

//Usuario de pruebas:
//danielalfaro@social.com
//123456

const firebaseConfig = {
  apiKey: "AIzaSyCxfqwV3jf-JC_8DeDOQdUGm2H2uuMG0Tg",
  authDomain: "social-database-1ca38.firebaseapp.com",
  projectId: "social-database-1ca38",
  storageBucket: "social-database-1ca38.appspot.com",
  messagingSenderId: "690285034741",
  appId: "1:690285034741:web:24f3d6834ce18b3c3219bc"
};

// Initialize Firebase
const appFirebase = initializeApp(firebaseConfig);

export default appFirebase;
export const database = getFirestore();