const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getDatabase, ref, set } = require('firebase/database');

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyAe3PhCyMJigvguh3oxf1vCX_1MYvfSfMk",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "smartadmission-1c73e.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "smartadmission-1c73e",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "smartadmission-1c73e.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "792883031609",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:792883031609:web:fe36fa5823b2b91ed5a7e8",
  databaseURL: process.env.VITE_FIREBASE_DATABASE_URL || "https://smartadmission-1c73e-default-rtdb.asia-southeast1.firebasedatabase.app"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const rtdb = getDatabase(app);

const run = async () => {
  const email = (process.env.TEST_EMAIL || '').trim() || 'dineshr2209.sse@saveetha.com';
  const password = (process.env.TEST_PASSWORD || '').trim() || 'asdf1234';

  console.log(`🔑 Ensuring test user exists: ${email}`);

  try {
    let user;
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      user = cred.user;
      console.log(`👤 Signed in existing test user. UID: ${user.uid}`);
    } catch (signInErr) {
      console.error(`❌ Sign-in failed. Email verification / account issue.`);
      throw signInErr;
    }

    console.log("✍️ Seeding/verifying user profile in Realtime Database...");
    const profileRef = ref(rtdb, `users/${user.uid}`);
    const profileData = {
      name: "Test User",
      phone: "9876543210",
      phoneNumber: "9876543210",
      isProfileVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await set(profileRef, profileData);
    console.log("✅ Profile successfully seeded and verified!");

    const fs = require('fs');
    const path = require('path');
    const credsPath = path.resolve(__dirname, '../../../test-credentials.json');
    fs.writeFileSync(credsPath, JSON.stringify({ email, password }, null, 2), 'utf8');
    console.log(`💾 Saved credentials to: ${credsPath}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding test user:", error);
    process.exit(1);
  }
};

run();
