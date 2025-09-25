import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    // Mảng chứa ID của 2 người tham gia cuộc trò chuyện
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Mảng chứa các tin nhắn trong cuộc trò chuyện
    messages: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
        default: [],
      },
    ],
    isAnonymousMatch: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
