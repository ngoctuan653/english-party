// Firebase Cloud Messaging Service Worker
// Handles background push notifications when the app is not in focus

importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js");

const urlParams = new URLSearchParams(self.location.search);
const apiKey = urlParams.get('apiKey');
const authDomain = urlParams.get('authDomain');
const projectId = urlParams.get('projectId');
const storageBucket = urlParams.get('storageBucket');
const messagingSenderId = urlParams.get('messagingSenderId');
const appId = urlParams.get('appId');

if (apiKey) {
  firebase.initializeApp({
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  });
} else {
  console.warn("[firebase-messaging-sw.js] Firebase config parameters are missing in service worker URL.");
}

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
