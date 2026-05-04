const admin = require('firebase-admin');

let serviceAccount;

// Check if running on Railway (for production)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  console.log('Using Firebase credentials from environment variable');
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Local development
  console.log('Using Firebase credentials from serviceAccountKey.json');
  serviceAccount = require('../serviceAccountKey.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'athlight-1.firebasestorage.app'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();
const auth = admin.auth();

module.exports = { admin, db, bucket, auth };