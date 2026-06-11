import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";

const requiredEnv = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
};

for (const [key, value] of Object.entries(requiredEnv)) {
    if (!value) {
        throw new Error(`Firebase config missing: ${key}`);
    }
}

const firebaseConfig = {
    apiKey: requiredEnv.apiKey,
    authDomain: requiredEnv.authDomain,
    projectId: requiredEnv.projectId,
};

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);

export async function getAnonymousIdToken(): Promise<string> {
    const user = auth.currentUser ?? (await signInAnonymously(auth)).user;

    return user.getIdToken();
}