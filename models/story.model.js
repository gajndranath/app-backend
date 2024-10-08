import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  media: {
    type: String, // Store the URL of the image or video
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "24h", // Automatically remove after 24 hours
  },
  isArchived: {
    type: Boolean,
    default: false,
  },
});

export const Story = mongoose.model("Story", storySchema);
