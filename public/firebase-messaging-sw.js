importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyAtpRsEkdRbMAchpLEG4UToDlpIFwv64mY",
  authDomain: "businessconnect-a9bcc.firebaseapp.com",
  projectId: "businessconnect-a9bcc",
  storageBucket: "businessconnect-a9bcc.firebasestorage.app",
  messagingSenderId: "409761820299",
  appId: "1:409761820299:web:8c5f09bffcee754c8fee8e"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
