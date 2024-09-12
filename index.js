import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { json, urlencoded } from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import securityMiddleware from "./middlewares/security.js";

import userRoutes from "./routes/userRoutes.js";

dotenv.config({});

const app = express();

// Server
const PORT = process.env.PORT || 3000;

// Routes
app.get("/", (_, res) => {
  res.status(200).json({
    message: "Index.js",
    success: true,
  });
});

// Middleware
app.use(json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));
app.use(securityMiddleware);

// CORS Configuration
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));

// Routes
app.use("/api/v1/user", userRoutes);

app.listen(PORT, () => {
  connectDB();
  console.log(`Server is listening on port ${PORT}`);
});
