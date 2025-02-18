const admin = require('firebase-admin');
const fs = require('fs');
require('dotenv').config();

function initializeFirebase() {
  try {
    const serviceAccount = JSON.parse(
      fs.readFileSync(process.env.FIREBASE_SERVICE_ACCOUNT)
      // console.log("Firebase Path:", process.env.FIREBASE_SERVICE_ACCOUNT)
    );
    admin.initializeApp({ credentials: admin.credential.cert(serviceAccount) });
    return admin;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    throw error;
  }
}

module.exports = initializeFirebase;
