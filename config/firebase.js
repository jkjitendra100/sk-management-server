import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBZcbsXcIW5PyXewI8QcNF4pOkZm5yotxs",
  authDomain: "sadi-karen.firebaseapp.com",
  projectId: "sadi-karen",
  storageBucket: "sadi-karen.appspot.com",
  messagingSenderId: "888190890673",
  appId: "1:888190890673:web:e572ff7ab2954fff3be890",
};

const app = initializeApp(firebaseConfig);
const storage = getStorage();

export { app, storage };
