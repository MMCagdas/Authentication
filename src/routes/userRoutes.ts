import { Router } from 'express';
import { getProfile, updatePassword, deleteAccount } from '../controllers/userController';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Kullanıcı profilini getir
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı profili
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 email:
 *                   type: string
 *                 name:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Yetkilendirme gerekli
 *       404:
 *         description: Kullanıcı bulunamadı
 */
router.get('/profile', authenticateToken, getProfile);

/**
 * @swagger
 * /api/users/password:
 *   put:
 *     summary: Kullanıcı şifresini güncelle
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Şifre başarıyla güncellendi
 *       401:
 *         description: Geçersiz mevcut şifre
 *       404:
 *         description: Kullanıcı bulunamadı
 */
router.put('/password', authenticateToken, updatePassword);

/**
 * @swagger
 * /api/users/delete-account:
 *   delete:
 *     summary: Kullanıcı hesabını sil
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Hesap başarıyla silindi
 *       401:
 *         description: Geçersiz şifre
 *       404:
 *         description: Kullanıcı bulunamadı
 */
router.delete('/delete-account', authenticateToken, deleteAccount);

export default router;
