import express from "express";

import isAuthenticatied from "../middlewares/isAuthenticated.js";
import upload from "../middlewares/multer.js";
import {
  addComment,
  addNewPost,
  bookmarPost,
  deletePost,
  dislikePost,
  getAllPost,
  getCommentsOfPost,
  getUserPost,
  likePost,
} from "../controllers/post.controller.js";

const router = express.Router();

router.post("/addpost", isAuthenticatied, upload.single("image"), addNewPost);
router.get("/all", isAuthenticatied, getAllPost);
router.get("/userpost/all", isAuthenticatied, getUserPost);
router.get("/:id/like", isAuthenticatied, likePost);
router.get("/:id/dislike", isAuthenticatied, dislikePost);
router.post("/:id/comment", isAuthenticatied, addComment);
router.post("/:id/comment/all", isAuthenticatied, getCommentsOfPost);
router.post("/delete/:id", isAuthenticatied, deletePost);
router.post("/:id/bookmark", isAuthenticatied, bookmarPost);

export default router;
