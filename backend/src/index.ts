import express from "express";
import admin from "firebase-admin";
import goalsRoutes from "./routes/goals.routes.js";
 
const app = express();
const PORT = process.env.PORT || 3000;
 
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});
 
app.use(express.json());
 
app.get("/", (_req, res) => {
  res.json({ status: "online", version: "1.0.0" });
});
 
app.use("/users/goals", goalsRoutes);
 
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});