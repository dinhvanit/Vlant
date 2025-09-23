import asyncHandler from "express-async-handler";
import User from "../models/User.model.js";

// @desc    Lấy thông tin profile của một người dùng
// @route   GET /api/users/:username
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  // Tìm user dựa trên username từ URL params
  const profileUser = await User.findOne({
    username: req.params.username,
  }).select("-password");

  if (!profileUser) {
    res.status(404);
    throw new Error("User not found");
  }

  // Lấy thông tin người dùng đang đăng nhập (từ middleware 'protect')
  const currentUser = await User.findById(req.user._id);

  // Mặc định, chúng ta không phải là bạn bè
  let friendStatus = "not_friends";

  // Xác định trạng thái quan hệ bạn bè
  if (currentUser.friends.includes(profileUser._id)) {
    friendStatus = "friends";
  } else if (currentUser.friendRequestsSent.includes(profileUser._id)) {
    friendStatus = "request_sent";
  } else if (currentUser.friendRequestsReceived.includes(profileUser._id)) {
    friendStatus = "request_received";
  } else if (currentUser._id.equals(profileUser._id)) {
    friendStatus = "self";
  }

  // Trả về thông tin profile và trạng thái bạn bè
  res.json({
    _id: profileUser._id,
    username: profileUser.username,
    avatar: profileUser.avatar,
    bio: profileUser.bio,
    friends: profileUser.friends, // Có thể trả về số lượng bạn bè thay vì cả mảng
    createdAt: profileUser.createdAt,
    friendStatus: friendStatus,
  });
});

// @desc    Gửi lời mời kết bạn
// @route   POST /api/users/request/:userId
// @access  Private
const sendFriendRequest = asyncHandler(async (req, res) => {
  // SỬA LỖI Ở ĐÂY:
  // Đọc đúng tên tham số từ route. Về mặt logic, đây là ID của người NHẬN.
  const recipientId = req.params.senderId; 
  const senderId = req.user._id;

  if (senderId.equals(recipientId)) {
    res.status(400);
    throw new Error("You cannot send a friend request to yourself.");
  }
  
  const recipient = await User.findById(recipientId);
  const sender = await User.findById(senderId);
  
  if (!recipient) {
    res.status(404);
    throw new Error("Recipient user not found.");
  }

  if (sender.friends.includes(recipientId)) {
    res.status(400);
    throw new Error("You are already friends.");
  }
  if (sender.friendRequestsSent.includes(recipientId)) {
    res.status(400);
    throw new Error("Friend request already sent.");
  }
  if (sender.friendRequestsReceived.includes(recipientId)) {
    res.status(400);
    throw new Error("This user has already sent you a friend request. Please respond to it.");
  }
  
  sender.friendRequestsSent.push(recipientId);
  recipient.friendRequestsReceived.push(senderId);

  await sender.save();
  await recipient.save();

  res.status(200).json({ message: "Friend request sent." });
});

// @desc    Chấp nhận hoặc từ chối lời mời kết bạn
// @route   PUT /api/users/request/:senderId
// @access  Private
const handleFriendRequest = asyncHandler(async (req, res) => {
  const { senderId } = req.params;
  const { action } = req.body; // action sẽ là 'accept' hoặc 'decline'
  const recipientId = req.user._id; // Người dùng hiện tại là người nhận

  const sender = await User.findById(senderId);
  const recipient = await User.findById(recipientId);

  // Kiểm tra xem lời mời có thực sự tồn tại không
  if (
    !recipient.friendRequestsReceived.includes(senderId) ||
    !sender.friendRequestsSent.includes(recipientId)
  ) {
    res.status(404);
    throw new Error("Friend request not found.");
  }

  // Xóa lời mời khỏi cả hai phía trước
  recipient.friendRequestsReceived.pull(senderId);
  sender.friendRequestsSent.pull(recipientId);

  if (action === "accept") {
    // Nếu chấp nhận, thêm vào danh sách bạn bè của nhau
    recipient.friends.push(senderId);
    sender.friends.push(recipientId);
  }

  // Lưu lại tất cả thay đổi
  await recipient.save();
  await sender.save();

  res
    .status(200)
    .json({
      message: `Friend request ${
        action === "accept" ? "accepted" : "declined"
      }.`,
    });
});

// Thêm unfriendUser để hoàn thiện
// @desc    Hủy kết bạn
// @route   DELETE /api/users/friends/:friendId
// @access  Private
const unfriendUser = asyncHandler(async (req, res) => {
  const { friendId } = req.params;
  const currentUserId = req.user._id;

  const friend = await User.findById(friendId);
  const currentUser = await User.findById(currentUserId);

  if (!currentUser.friends.includes(friendId)) {
    res.status(400);
    throw new Error("You are not friends with this user.");
  }

  // Xóa khỏi danh sách bạn bè của nhau
  currentUser.friends.pull(friendId);
  friend.friends.pull(currentUserId);

  await currentUser.save();
  await friend.save();

  res.status(200).json({ message: "Unfriended successfully." });
});

// @desc    Tìm kiếm người dùng bằng username
// @route   GET /api/users/search?q=query
// @access  Private
const searchUsers = asyncHandler(async (req, res) => {
  // Lấy query từ URL, ví dụ: /search?q=test
  const query = req.query.q;

  if (!query) {
    return res.json([]); // Trả về mảng rỗng nếu không có query
  }

  // Tìm kiếm user có username chứa query (không phân biệt hoa thường)
  // Loại trừ chính người dùng đang tìm kiếm
  const users = await User.find({
    username: { $regex: query, $options: "i" },
    _id: { $ne: req.user._id },
  })
    .select("username avatar bio")
    .limit(10); // Giới hạn 10 kết quả

  res.json(users);
});

// @desc    Gợi ý kết bạn
// @route   GET /api/users/suggestions
// @access  Private
const getFriendSuggestions = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id);

  // Lấy danh sách những người đã là bạn và đã gửi/nhận lời mời
  const existingConnections = [
    ...currentUser.friends,
    ...currentUser.friendRequestsSent,
    ...currentUser.friendRequestsReceived,
  ];
  // Thêm cả ID của chính mình vào để loại trừ
  existingConnections.push(currentUser._id);

  // Tìm những người dùng không nằm trong danh sách trên
  // Sử dụng aggregate để lấy ngẫu nhiên
  const suggestions = await User.aggregate([
    { $match: { _id: { $nin: existingConnections } } }, // Loại trừ các kết nối đã có
    { $sample: { size: 5 } }, // Lấy ngẫu nhiên 5 người
    { $project: { username: 1, avatar: 1, bio: 1 } }, // Chỉ lấy các trường cần thiết
  ]);

  res.json(suggestions);
});

// @desc    Lấy danh sách các lời mời kết bạn đã nhận
// @route   GET /api/users/requests/received
// @access  Private
const getFriendRequests = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id).populate({
    path: 'friendRequestsReceived',
    select: 'username avatar bio' // Populate đầy đủ thông tin người gửi
  });

  if (!currentUser) {
    res.status(404);
    throw new Error('User not found.');
  }
  
  res.json(currentUser.friendRequestsReceived);
});

// @desc    Lấy danh sách bạn bè chi tiết của một người dùng
// @route   GET /api/users/:userId/friends
// @access  Private
const getFriends = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).populate({
    path: 'friends',
    select: 'username avatar bio' // Lấy các thông tin cần thiết của bạn bè
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json(user.friends);
});

export {
  getUserProfile,
  sendFriendRequest,
  handleFriendRequest,
  unfriendUser,
  searchUsers,
  getFriendSuggestions,
  getFriendRequests,
  getFriends,
};
