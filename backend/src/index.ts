import express from "express";
import admin from "firebase-admin";
import goalsRoutes from "./routes/goals.routes.js";
import locationRoutes from "./routes/location.routes.js";
 
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
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }

  next();
});
 
app.get("/", (_req, res) => {
  res.json({ status: "online", version: "1.0.0" });
});
 
app.use("/users/goals", goalsRoutes);

app.use("/users/location", locationRoutes);
 
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
