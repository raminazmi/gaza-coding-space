// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import axios from 'axios';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
getToken(messaging, { vapidKey: 'BCNx8QUEkYqJgAqYOA-IHPhfWLKfpe6s4Nz5EHmFUPu9EQ7iS70wV68ipFAkmjUTZmaAEdyE3B0whxZIAcAyjOQ' }).then((currentToken) => {
    if (currentToken) {
        // Send the token to your server and update the UI if necessary
        // ...
        console.log(currentToken)
        axios.post('/device-tokens', {
            token: currentToken,
            device_name: window.navigator.userAgent
        },)
    } else {
        // Show permission request UI
        console.log('No registration token available. Request permission to generate one.');
        // ...
    }
}).catch((err) => {
    console.log('An error occurred while retrieving token. ', err);
    // ...
});

onMessage(messaging, (payload) => {
    console.log("Message received. ", payload);
    // ...
    alert(payload.data.code)
});