const admin = require('firebase-admin');

const initializeFirebase = () => {
    if (!process.env.FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID === 'your-firebase-project-id') {
        console.log('⚠️  Firebase credentials not configured, skipping');
        return null;
    }

    if (!admin.apps.length) {
        try {
            const serviceAccount = {
                type: "service_account",
                project_id: process.env.FIREBASE_PROJECT_ID,
                private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
                private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                client_email: process.env.FIREBASE_CLIENT_EMAIL,
                client_id: process.env.FIREBASE_CLIENT_ID,
                auth_uri: process.env.FIREBASE_AUTH_URI,
                token_uri: process.env.FIREBASE_TOKEN_URI,
            };

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: process.env.FIREBASE_PROJECT_ID,
            });

            console.log('✅ Firebase Admin initialized successfully');
        } catch (error) {
            console.log('⚠️  Firebase initialization skipped:', error.message);
            return null;
        }
    }
    return admin;
};

module.exports = { initializeFirebase, admin };