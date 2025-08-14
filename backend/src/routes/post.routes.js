import express from 'express';
import { getPosts, createPost } from '../controllers/post.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// Route này public, ai cũng xem được
router.route('/').get(getPosts);

router.route('/').post(protect, createPost);

export default router;