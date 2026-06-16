// Run this script ONCE to create the admin user document in Firestore
// Usage: node scripts/init-admin-firebase.js

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey:            "AIzaSyCAjg4UBnMalTXJHbWYXJ_iwh5bhNQJ0-Q",
  authDomain:        "smartadmission.firebaseapp.com",
  projectId:         "smartadmission",
  storageBucket:     "smartadmission.firebasestorage.app",
  messagingSenderId: "699907822094",
  appId:             "1:699907822094:web:0108bca1412bcbeea3a25f",
};

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

async function initAdmin() {
  const adminUid   = '8sB5yRkGoJMJie6FEkvRJ3yl9XN2';
  const adminEmail = 'dineshr2209.sse@saveetha.com';

  await setDoc(doc(db, 'users', adminUid), {
    uid:       adminUid,
    name:      'Dinesh R',
    email:     adminEmail,
    role:      'Admin',
    blocked:   false,
    provider:  'email',
    createdAt: new Date().toISOString(),
  });

  console.log('✅ Admin user document created in Firestore!');
  console.log('   UID:', adminUid);
  console.log('   Role: Admin');
  process.exit(0);
}

initAdmin().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });
