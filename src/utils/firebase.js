import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBVhnGNh26plCNBH7ZB6eyKh-bj2eoREAA",
  authDomain: "zaov1-d8287.firebaseapp.com",
  projectId: "zaov1-d8287",
  storageBucket: "zaov1-d8287.firebasestorage.app",
  messagingSenderId: "364533364010",
  appId: "1:364533364010:web:8f2504a87f2ff3be37da53",
  measurementId: "G-ESWGZ1VHQ6"
};

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

export { auth, googleProvider };
