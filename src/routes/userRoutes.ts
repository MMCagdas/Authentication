import { Router } from 'express';
import { getProfile, updatePassword, deleteAccount } from '../controllers/userController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.get('/profile', authenticateToken, getProfile);
router.put('/password', authenticateToken, updatePassword);
router.delete('/delete-account', authenticateToken, deleteAccount);
export default router;
