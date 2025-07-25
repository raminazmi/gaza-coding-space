// firebase.ts
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from 'axios';
import { apiBaseUrl } from "./lib/utils";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDmfyHHxvOeoy0pi3hNPD4N61EFCFQHCpk",
    authDomain: "gazacoding-8d421.firebaseapp.com",
    projectId: "gazacoding-8d421",
    storageBucket: "gazacoding-8d421.firebasestorage.app",
    messagingSenderId: "67710457100",
    appId: "1:67710457100:web:dd88db9a25dcdcd8d6e529",
    measurementId: "G-YV7LL7LMDL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };

// Request token and register with backend
getToken(messaging, { vapidKey: 'BCNx8QUEkYqJgAqYOA-IHPhfWLKfpe6s4Nz5EHmFUPu9EQ7iS70wV68ipFAkmjUTZmaAEdyE3B0whxZIAcAyjOQ' })
    .then((currentToken) => {
        if (currentToken) {
            const userToken = localStorage.getItem('token');
            axios.post(`${apiBaseUrl}/api/device-tokens`, {
                token: currentToken,
                device_name: window.navigator.userAgent
            }, {
                headers: userToken ? { Authorization: `Bearer ${userToken}` } : {}
            }).catch((err) => {
                console.error('Error registering token:', err);
            });
        } else {
            console.log('No registration token available. Request permission to generate one.');
        }
    })
    .catch((err) => {
        console.error('An error occurred while retrieving token:', err);
    });

// Handle foreground messages
onMessage(messaging, (payload) => {
    console.log('Message received:', payload);
    alert(payload.notification?.body || 'New message received!');
});