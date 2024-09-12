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
router.get("/profile/:id", isAuthenticatied, getProfile);
router.put(
  "/profile/edit",
  isAuthenticatied,
  upload.single("profilePicture"),
  editProfile
);
router.get("/suggested-users", isAuthenticatied, getSuggestedUsers);
router.get("/followOrUnfollow/:id", isAuthenticatied, followOrUnfollow);

export default router;
