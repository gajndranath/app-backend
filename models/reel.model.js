import mongoose from "mongoose";

const reelSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    media: {
      url: { type: String, required: true },
      mediaType: { type: String, enum: ["video"], required: true }, // Only videos for reels
    },
    caption: { type: String, default: "" },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  },
  { timestamps: true }
);

export const Reel = mongoose.model("Reel", reelSchema);
