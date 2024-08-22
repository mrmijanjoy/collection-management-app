import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider, OAuthProvider } from "firebase/auth"; 

const firebaseConfig = {
  apiKey: "AIzaSyCgqpS7SxHbd-H_0SleNsqNfameIpotykk",
  authDomain: "collection-management-b05ec.firebaseapp.com",
  projectId: "collection-management-b05ec",
  storageBucket: "collection-management-b05ec.appspot.com",
  messagingSenderId: "288911065692",
  appId: "1:288911065692:web:c2756ef9cf646eb0289c99",
  measurementId: "G-6G12F4H04T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize and export Firebase Auth
const auth = getAuth(app);

// Export providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const twitterProvider = new TwitterAuthProvider();
const appleProvider = new OAuthProvider('apple.com');

export { auth, googleProvider, facebookProvider, twitterProvider, appleProvider };
