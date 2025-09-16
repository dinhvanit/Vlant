import express from 'express';
import { protect } from '../middleware/auth.middleware.js';
import { getNotifications, markNotificationsAsRead } from '../controllers/notification.controller.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getNotifications);

router.route('/read')
  .put(markNotificationsAsRead);

export default router;