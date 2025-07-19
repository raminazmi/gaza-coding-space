 importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-app.js");
 importScripts("https://www.gstatic.com/firebasejs/8.2.0/firebase-messaging.js");

 const firebaseConfig = {
    apiKey: "AIzaSyDmfyHHxvOeoy0pi3hNPD4N61EFCFQHCpk",
    authDomain: "gazacoding-8d421.firebaseapp.com",
    projectId: "gazacoding-8d421",
    storageBucket: "gazacoding-8d421.firebasestorage.app",
    messagingSenderId: "67710457100",
    appId: "1:67710457100:web:dd88db9a25dcdcd8d6e529",
    measurementId: "G-YV7LL7LMDL"
 };

 firebase.initializeApp(firebaseConfig);

 const messaging = firebase.messaging();

 messaging.onBackgroundMessage(function(payload) {
   console.log("Received background message ", payload);

   const notificationTitle = payload.notification.title;
   const notificationOptions = {
     body: payload.notification.body,
   };

   self.registration.showNotification(notificationTitle, notificationOptions);
 });