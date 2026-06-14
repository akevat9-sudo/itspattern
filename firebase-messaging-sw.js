importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBWEhMPYemyAEj_ZU9G7lKBffGEhobNWKI",
  authDomain: "itspattern.firebaseapp.com",
  projectId: "itspattern",
  storageBucket: "itspattern.firebasestorage.app",
  messagingSenderId: "1065011759370",
  appId: "1:1065011759370:web:6539365900cba4c05d12f3"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
