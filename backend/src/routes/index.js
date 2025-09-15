import express from 'express';
import authRoutes from './auth.routes.js';
import postRoutes from './post.routes.js'; 
import userRoutes from './user.routes.js'; 

const router = express.Router();

// Định nghĩa các route ở đây
router.get('/test', (req, res) => {
    res.json({ message: 'Hello from Vlant API!' });
});

// Gắn các router con vào
router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/users', userRoutes); 

export default router;