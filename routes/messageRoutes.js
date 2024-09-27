import express from "express";

import isAuthenticatied from "../middlewares/isAuthenticated.js";
import { getMessage, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

router.post("/send/:id", isAuthenticatied, sendMessage);
router.get("/all/:id", isAuthenticatied, getMessage);

export default router;
