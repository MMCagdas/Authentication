import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware';
import prisma from '../lib/prisma';
import { Request, Response } from 'express';

const router = express.Router();

/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: Kullanıcının tüm todo'larını getirir
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Todo listesi başarıyla getirildi
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   completed:
 *                     type: boolean
 *                   userId:
 *                     type: integer
 *       401:
 *         description: Kullanıcı girişi yapılmamış
 *       500:
 *         description: Sunucu hatası
 */
router.get('/', authenticateToken, async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const todos = await prisma.todo.findMany({
            where: {
                userId: req.user.id
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(todos);
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({ message: 'Error fetching todos' });
    }
});

/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: Yeni bir todo oluşturur
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Todo başarıyla oluşturuldu
 *       400:
 *         description: Geçersiz istek (title eksik)
 *       401:
 *         description: Kullanıcı girişi yapılmamış
 */
router.post('/', authenticateToken, async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const { title, description } = req.body;
        
        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        const todo = await prisma.todo.create({
            data: {
                title,
                description,
                userId: req.user.id
            }
        });
        
        res.status(201).json(todo);
    } catch (error) {
        console.error('Error creating todo:', error);
        res.status(400).json({ message: 'Error creating todo' });
    }
});

/**
 * @swagger
 * /api/todos/{id}:
 *   put:
 *     summary: Bir todo'yu günceller
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Güncellenecek todo'nun ID'si
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Todo başarıyla güncellendi
 *       404:
 *         description: Todo bulunamadı
 *       401:
 *         description: Kullanıcı girişi yapılmamış
 */
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const { id } = req.params;
        const { title, description, completed } = req.body;

        // Önce todo'nun kullanıcıya ait olduğunu kontrol et
        const existingTodo = await prisma.todo.findFirst({
            where: {
                id: parseInt(id),
                userId: req.user.id
            }
        });

        if (!existingTodo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        const updatedTodo = await prisma.todo.update({
            where: {
                id: parseInt(id)
            },
            data: {
                title: title || undefined,
                description: description || undefined,
                completed: completed !== undefined ? completed : undefined
            }
        });

        res.json(updatedTodo);
    } catch (error) {
        console.error('Error updating todo:', error);
        res.status(400).json({ message: 'Error updating todo' });
    }
});

/**
 * @swagger
 * /api/todos/{id}:
 *   delete:
 *     summary: Bir todo'yu siler
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Silinecek todo'nun ID'si
 *     responses:
 *       200:
 *         description: Todo başarıyla silindi
 *       404:
 *         description: Todo bulunamadı
 *       401:
 *         description: Kullanıcı girişi yapılmamış
 */
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const { id } = req.params;

        // Önce todo'nun kullanıcıya ait olduğunu kontrol et
        const existingTodo = await prisma.todo.findFirst({
            where: {
                id: parseInt(id),
                userId: req.user.id
            }
        });

        if (!existingTodo) {
            return res.status(404).json({ message: 'Todo not found' });
        }

        await prisma.todo.delete({
            where: {
                id: parseInt(id)
            }
        });

        res.json({ message: 'Todo deleted successfully' });
    } catch (error) {
        console.error('Error deleting todo:', error);
        res.status(400).json({ message: 'Error deleting todo' });
    }
});

export default router; 