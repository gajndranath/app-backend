import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { json, urlencoded } from "express";

const app = express();

// Middleware
app.use(json());
app.use(cookieParser());
app.use(urlencoded({ extended: true }));

// CORS Configuration
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};
app.use(cors(corsOptions));

// Routes
app.get("/", (_, res) => {
  res.status(200).json({
    message: "Index.js",
    success: true,
  });
});

// Server
const PORT = 8000;

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
