// Firebase Cloud Messaging Service Worker
// Handles background push notifications when the app is not in focus

importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAWYgfD8vEJ-UQaYppsCjPVLrBhHgcOk8s",
  authDomain: "english-party.firebaseapp.com",
  projectId: "english-party",
  storageBucket: "english-party.firebasestorage.app",
  messagingSenderId: "376449805687",
  appId: "1:376449805687:web:54492b19a5b966fc4cc572",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Background message received:", payload);

  const notificationTitle = payload.notification?.title || "EnglishParty";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new notification!",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: payload.data,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
