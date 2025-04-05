import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';

declare global {
    namespace Express {
        interface Request {
            user?: { 
                id: number; 
                email: string;
            };
        }
    }
}

export const authenticateToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
            id: number;
            email: string;
        };

        // Kullanıcının hala var olduğunu kontrol et
        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
}
