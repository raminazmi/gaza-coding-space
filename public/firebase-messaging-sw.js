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

  // استخراج البيانات المهمة
  const notificationData = {
    title: payload.data.title || payload.notification?.title || 'إشعار جديد',
    body: payload.data.body || payload.notification?.body || '',
    icon: payload.data.icon || payload.notification?.icon || '/favicon.ico',
    url: payload.data.url || '/'
  };

  const notificationTitle = notificationData.title;
  const notificationOptions = {
    body: notificationData.body,
    icon: notificationData.icon,
    data: { url: notificationData.url }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(clientList) {
      // حاول فتح في نافذة موجودة
      for (const client of clientList) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      
      // إذا لم توجد نافذة، افتح جديدة
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});