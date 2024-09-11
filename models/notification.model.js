import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // User receiving the notification
    type: {
      type: String,
      enum: ["like", "comment", "follow", "message"],
      required: true,
    }, // Type of notification
    post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" }, // Post that triggered the notification
    message: { type: mongoose.Schema.Types.ObjectId, ref: "Message" }, // Message that triggered the notification
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // Who triggered the notification
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = mongoose.model("Notification", notificationSchema);
