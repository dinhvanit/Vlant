import express from 'express';
import { getPosts, createPost, likePost, addComment, getCommentsForPost} from '../controllers/post.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router
  .route('/')
  .get(getPosts)
  .post(protect, createPost);

router.route('/:id/like').put(protect, likePost);
router.route('/:id/comments')
  .post(protect, addComment)
  .get(getCommentsForPost);


export default router;