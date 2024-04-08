import express from "express";
import ErrorMiddleware from "./middlewares/error.js";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
app.use(
  cors({
    origin: "*",
    methods: "GET,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: "shadi-karen.appspot.com", // process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};
initializeApp(firebaseConfig);

// Routes import
// import product from "./routes/product.js";
import user from "./routes/account/user.js";
import profile from "./routes/account/profile.js";
import matches from "./routes/matches.js";
import block from "./routes/block.js";
import dashboard from "./routes/dashboard.js";
import employee from "./routes/account/employee.js";
import assignedUsers from "./routes/assignedUsers.js";
import followUp from "./routes/followUp.js";
import { initializeApp } from "firebase/app";

// Routes
let baseUrl = "/api/shadiKaren/v1";

app.get("/", (req, res) => res.send("Server is working"));
app.get(`${baseUrl}/razorpay/key`, (req, res) =>
  res.send({ success: true, key: process.env.RAZORPAY_API_KEY })
);

app.use(`${baseUrl}/user`, user);
app.use(`${baseUrl}/profile`, profile);
app.use(`${baseUrl}/matches`, matches);
app.use(`${baseUrl}/block`, block);
app.use(`${baseUrl}/dashboard`, dashboard);
app.use(`${baseUrl}/employee`, employee);
app.use(`${baseUrl}/assignedUsers`, assignedUsers);
app.use(`${baseUrl}/followUp`, followUp);

// Middlewares for errors
app.use(ErrorMiddleware);

export default app;
