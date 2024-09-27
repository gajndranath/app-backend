import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "media", "event"],
      required: true,
    },
    text: { type: String }, // For text messages
    media: {
      url: { type: String }, // For media (image, video)
      mediaType: { type: String, enum: ["image", "video"] },
    },
    event: {
      title: { type: String },
      date: { type: Date },
      location: {
        name: { type: String },
        coordinates: {
          latitude: { type: Number },
          longitude: { type: Number },
        },
      },
    },
    seen: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
