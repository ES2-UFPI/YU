import { config } from "dotenv";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";

config({ path: "../.env" });

const app = initializeApp({
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
});

const auth = getAuth(app);

async function main() {
  const result = await signInAnonymously(auth);
  const token = await result.user.getIdToken();
  console.log("\nToken gerado:\n");
  console.log(token);
  console.log("\nCopie esse token para usar nos testes.\n");
  process.exit(0);
}

main().catch(console.error);
