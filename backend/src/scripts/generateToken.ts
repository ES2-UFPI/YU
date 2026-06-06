import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";

const app = initializeApp({
  apiKey: "AIzaSyCkHkGern67LdFNjS5Pz39c9UbNUqnHsf0",
  authDomain: "yu-tutorial-pratico.firebaseapp.com",
  projectId: "yu-tutorial-pratico",
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