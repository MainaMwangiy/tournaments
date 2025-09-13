import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_GITHUB_SSO_API_KEY,
  authDomain: process.env.REACT_APP_GITHUB_SSO_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_GITHUB_SSO_PROJECT_ID,
  storageBucket: process.env.REACT_APP_GITHUB_SSO_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_GITHUB_SSO_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_GITHUB_SSO_APP_ID,
  measurementId: process.env.REACT_APP_GITHUB_SSO_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider()

export { auth, googleProvider };
