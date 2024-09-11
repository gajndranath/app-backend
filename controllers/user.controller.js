import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Register Controller
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validate the input
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email, and password are required!",
        success: false,
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({
        message: "Account already exists with this email",
        success: false,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Account created successfully",
      success: true,
      user: {
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error, please try again later",
      success: false,
    });
  }
};

// Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required!",
        success: false,
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    // Check password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
        success: false,
      });
    }

    // Create token
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
      expiresIn: "1d",
    });

    // Return success with token in httpOnly cookie
    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // secure flag only in production
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000,
      })
      .json({
        message: `Welcome back ${user.username}`,
        success: true,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          profilePicture: user.profilePicture,
          bio: user.bio,
          followers: user.followers,
          following: user.following,
          posts: user.posts,
        },
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error, please try again later",
      success: false,
    });
  }
};

// Logout Controller
export const logout = async (req, res) => {
  try {
    return res
      .clearCookie("token")
      .status(200)
      .json({ message: "Logout successfully.", success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error, please try again later",
      success: false,
    });
  }
};

// Get Profile Controller
export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    return res.status(200).json({ user, success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error, please try again later",
      success: false,
    });
  }
};

export const editProfile = async (req, res) => {
  try {
    // const
  } catch (error) {
    console.log(error);
  }
};
