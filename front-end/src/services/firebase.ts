import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyCkHkGern67LdFNjS5Pz39c9UbNUqnHsf0",
    authDomain: "yu-tutorial-pratico.firebaseapp.com",
    projectId: "yu-tutorial-pratico",
};

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);

export async function getAnonymousIdToken(): Promise<string> {
    const user = auth.currentUser ?? (await signInAnonymously(auth)).user;

    return user.getIdToken();
}
