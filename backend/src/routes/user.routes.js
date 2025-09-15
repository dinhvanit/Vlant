import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { 
    getUserProfile, 
    sendFriendRequest, 
    handleFriendRequest,
    unfriendUser,
    searchUsers,
    getFriendSuggestions
} from '../controllers/user.controller.js';

const router = express.Router();

router.use(protect);

router.get('/search/users', searchUsers);
router.get('/suggestions/all', getFriendSuggestions);

// --- CÁC ROUTE ĐỘNG VỚI ID/USERNAME ---
router.route('/request/:senderId')
  .post(sendFriendRequest)
  .put(handleFriendRequest);

router.delete('/friends/:friendId', unfriendUser);

// Route động nhất (bắt được nhiều thứ nhất) phải đặt cuối cùng
router.get('/:username', getUserProfile);

export default router;