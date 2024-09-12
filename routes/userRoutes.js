import express from "express";
import {
  register,
  login,
  logout,
  getProfile,
  editProfile,
  getSuggestedUsers,
  followOrUnfollow,
} from "../controllers/user.controller.js";

import isAuthenticatied from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/:id/profile", isAuthenticatied, getProfile);
router.put(
  "/profile/edit",
  isAuthenticatied,
  upload.single("profilePicture"),
  editProfile
);
router.get("/suggested", isAuthenticatied, getSuggestedUsers);
router.get("/followOrUnfollow/:id", isAuthenticatied, followOrUnfollow);

export default router;
