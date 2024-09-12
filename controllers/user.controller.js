import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../config/datauri.js";
import cloudinary from "../config/cloudinary.js";
// import redisClient from "../config/radis.js";

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
        secure: process.env.NODE_ENV === "production", // Secure flag only in production
        sameSite: "strict",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
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

    // Check cache first radis
    /*     const cachedUser = await redisClient.get(`user:${userId}`);
    if (cachedUser) {
      return res
        .status(200)
        .json({ user: JSON.parse(cachedUser), success: true });
    }
 */
    // If not cached, fetch from database
    const user = await User.findById(userId).select("-password"); // Exclude password
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Cache the result
    // await redisClient.set(`user:${userId}`, JSON.stringify(user), "EX", 3600); // Cache for 1 hour

    return res.status(200).json({ user, success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error, please try again later",
      success: false,
    });
  }
};

// Edit Profile Controller
export const editProfile = async (req, res) => {
  try {
    const userId = req.id;
    const { bio, gender } = req.body;
    const profilePicture = req.file;
    let cloudResponse;

    if (profilePicture) {
      const fileUri = getDataUri(profilePicture);
      cloudResponse = await cloudinary.uploader.upload(fileUri);
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found.",
        success: false,
      });
    }
    if (bio) user.bio = bio;
    if (gender) user.gender = gender;
    if (profilePicture) user.profilePicture = cloudResponse.secure_url;

    await user.save();

    // Clear cache for this user profile
    // await redisClient.del(`user:${userId}`);

    return res.status(200).json({
      message: "Profile updated",
      success: true,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Server error, please try again later",
      success: false,
    });
  }
};

// Helper function to get mutual friends
const getMutualFriends = async (currentUserId, userFriends) => {
  const mutualFriendCounts = new Map();

  // Loop through each friend of the current user
  await Promise.all(
    userFriends.map(async (friendId) => {
      const friend = await User.findById(friendId).select("friends");

      if (!friend) return;

      // For each friend of a friend, count mutuals
      friend.friends.forEach((mutualFriendId) => {
        if (
          mutualFriendId.toString() !== currentUserId &&
          !userFriends.includes(mutualFriendId)
        ) {
          mutualFriendCounts.set(
            mutualFriendId,
            (mutualFriendCounts.get(mutualFriendId) || 0) + 1
          );
        }
      });
    })
  );

  return Array.from(mutualFriendCounts.entries())
    .sort(([, countA], [, countB]) => countB - countA)
    .map(([userId]) => userId);
};

// Helper function to get contact-based suggestions
const getContactBasedSuggestions = async (phoneContacts, currentUserId) => {
  if (!phoneContacts || !phoneContacts.length) return [];

  const contactMatches = await User.find({
    phone: { $in: phoneContacts },
    _id: { $ne: currentUserId },
  }).select("_id");

  return contactMatches.map((user) => user._id);
};

// Helper function to get new users
const getNewUsers = async (currentUserId) => {
  const newUsers = await User.find({
    _id: { $ne: currentUserId },
  })
    .sort({ createdAt: -1 })
    .limit(10)
    .select("_id");

  return newUsers.map((user) => user._id);
};

// Friend Suggestion Controller
export const getSuggestedUsers = async (req, res) => {
  try {
    const currentUserId = req.id; // Current user's ID (from token)
    const currentUser = await User.findById(currentUserId).populate(
      "friends contacts"
    );

    if (!currentUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const { friends: userFriends, contacts: phoneContacts } = currentUser;

    // Fetch mutual friends suggestions
    const mutualFriends = await getMutualFriends(currentUserId, userFriends);

    // Fetch phone contact suggestions
    const contactSuggestions = await getContactBasedSuggestions(
      phoneContacts,
      currentUserId
    );

    // Fetch new user suggestions
    const newUsers = await getNewUsers(currentUserId);

    // Merge and prioritize suggestions: mutual friends > contacts > new users
    const suggestionsSet = new Set([
      ...mutualFriends,
      ...contactSuggestions,
      ...newUsers,
    ]);

    const suggestedUsers = await User.find({
      _id: { $in: Array.from(suggestionsSet) },
    }).select("-password");

    return res.status(200).json({
      success: true,
      users: suggestedUsers,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error, please try again later",
      success: false,
    });
  }
};

// Follow or Unfollow Controller
export const followOrUnfollow = async (req, res) => {
  try {
    const userFollower = req.id;
    const userFollowing = req.params.id;

    if (userFollower == userFollowing) {
      return res.status(400).json({
        message: "You can't follow/unfollow yourself",
        success: false,
      });
    }

    const user = await User.findById(userFollower);
    const targetUser = await User.findById(userFollowing);

    if (!user || !targetUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    const isFollowing = user.following.includes(userFollowing);
    if (isFollowing) {
      // Unfollow logic
      await Promise.all([
        User.updateOne(
          { _id: userFollower },
          { $pull: { following: userFollowing } }
        ),
        User.updateOne(
          { _id: userFollowing },
          { $pull: { following: userFollower } }
        ),
      ]);

      return res.status(200).json({
        message: "Unfollowed successfully",
        success: true,
      });
    } else {
      // Follow logic
      await Promise.all([
        User.updateOne(
          { _id: userFollower },
          { $push: { following: userFollowing } }
        ),
        User.updateOne(
          { _id: userFollowing },
          { $push: { following: userFollower } }
        ),
      ]);

      return res.status(200).json({
        message: "Followed successfully",
        success: true,
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error, please try again later",
      success: false,
    });
  }
};
