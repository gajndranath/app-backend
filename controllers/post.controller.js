import sharp from "sharp";
import cloudinary from "../config/cloudinary";
import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";

export const addNewPost = async (req, res) => {
  try {
    const { caption } = req.body;
    const image = req.file;
    const authorId = req.id;

    if (!image) return res.status(400).json({ message: "Image required" });

    //image upload
    const optimizedImageBuffer = await sharp(image.buffer)
      .resize({ width: 800, fit: "inside" })
      .toFormat("jpeg", { quality: 80 })
      .toBuffer();

    const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString(
      "base64"
    )}`;
    const cloudResponse = await cloudinary.uploader(fileUri);

    const post = await Post.create({
      caption,
      image: cloudResponse.secure_url,
      author: authorId,
    });

    const user = await User.findById(authorId);

    if (user) {
      user.posts.push(post._id);
      await user.save();
    }

    await post.populate({ path: "author", select: "-password" });
    return res.status(201).json({
      message: " New post added",
      post,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({ path: "author", select: "username profilePicture" })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "author",
          select: "username, profilePicture",
        },
      });

    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

export const getUserPost = async (req, res) => {
  try {
    const authorId = req.id;
    const posts = await Post.find({ author: authorId })
      .sort({ createdAt: -1 })
      .populate({
        path: "author",
        select: "username, profilePicture",
      })
      .populate({
        path: "comments",
        sort: { createdAt: -1 },
        populate: {
          path: "author",
          select: "username, profilePicture",
        },
      });
    return res.status(200).json({
      posts,
      success: true,
    });
  } catch (error) {}
};

export const likePost = async (req, res) => {
  try {
    const likeBy = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);

    if (!post)
      return res
        .status(404)
        .json({ message: "post not found", success: false });

    //Like Logics
    await post.updateOne({ $addToSet: { likes: likeBy } });
    await post.save();

    //real time notification

    return res.status(200).json({ message: "Post liked", success: true });
  } catch (error) {}
};

export const dislikePost = async (req, res) => {
  try {
    const likeBy = req.id;
    const postId = req.params.id;
    const post = await Post.findById(postId);

    if (!post)
      return res
        .status(404)
        .json({ message: "post not found", success: false });

    //Like Logics
    await post.updateOne({ $pull: { likes: likeBy } });
    await post.save();

    //real time notification

    return res.status(200).json({ message: "Post disliked", success: true });
  } catch (error) {}
};

export const addComment = async (req, post) => {
  try {
    const postId = req.params.id;
    const commentBy = req.id;

    const { text } = req.body;
    const post = await Post.findById(postId);

    if (!text)
      return res
        .status(400)
        .json({ message: "text is required", success: false });

    const comment = await Comment.create({
      text,
      author: commentBy,
      post: postId,
    }).populate({
      path: "author",
      select: "username, profilePicture",
    });

    post.comments.push(comment._id);
    await post.save();

    return res.status(201).json({
      message: "Comment Added",
      comment,
      success: true,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getCommentsOfPost = async (req, res) => {
  try {
    const postId = req.params.id;

    const comments = await Comment.find({ post: postId }).populate(
      "author",
      "username",
      "profilePicture"
    );

    if (!comments)
      return res
        .status(404)
        .json({ message: "No comments found for this post", success: false });

    return res.status(200).json({ success: true, comments });
  } catch (error) {
    console.log(error);
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;

    const post = await Post.findById(postId);
    if (!post)
      return res
        .status(404)
        .json({ message: "Post not found", success: false });

    //check 0auth and ownership of post
    if (post.author.toString() !== authorId)
      return res.status(403).json({ message: "Unauthorized" });

    //delete post
    await Post.findByIdAndDelete(postId);

    //remove post id from the user post

    let user = await User.findById(authorId);
    user.posts = user.posts.filter((id) => id.toString() !== postId);
    await user.save();

    //delete associated comments
    await Comment.deleteMany({ post: postId });

    return res.status(200).json({
      success: true,
      message: "Post deleted",
    });
  } catch (error) {
    console.log(error);
  }
};

export const bookmarPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const authorId = req.id;

    const post = await Post.findById(postId);

    if (!post)
      return res
        .status(404)
        .json({ message: "Post not found", success: false });

    const user = await user.findById(authorId);
    if (user.bookmarks.includes(post._id)) {
      //already saved
      await user.updateOne({ $pull: { bookmarks: post._if } });
      await user.save();
      return res.status(200).json({
        type: "unsaved",
        message: "Post removed from saved",
        success: true,
      });
    } else {
      //saved
      await user.updateOne({ $addToSet: { bookmarks: post._if } });
      await user.save();
      return res.status(200).json({
        type: "saved",
        message: "Post saved",
        success: true,
      });
    }
  } catch (error) {}
};
