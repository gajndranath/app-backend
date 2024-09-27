import { Conversation } from "../models/converstation.model.js";
import { Message } from "../models/message.model.js";
export const sendMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;

    const { message } = req.body;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    //chat if not started yet

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = Message.create({
      senderId,
      receiverId,
      message,
    });

    if (newMessage) conversation.message.push(newMessage._id);
    await Promise.all();

    //adding socket for real time data

    return res.status(201).json({
      success: true,
      newMessage,
    });
  } catch (error) {
    console.error(error);
  }
};

export const getMessage = async (req, res) => {
  try {
    const senderId = req.id;
    const receiverId = req.params.id;
    const conversation = await Conversation.find({
      participants: { $all: [senderId, receiverId] },
    });
    if (!conversation)
      return res.status(200).json({
        success: true,
        message: [],
      });
    return res
      .status(200)
      .json({ success: true, messages: conversation?.message });
  } catch (error) {}
};
