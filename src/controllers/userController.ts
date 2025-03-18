import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';

export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, email: true, name: true, createdAt: true}
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json(user);
        
    }   catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const updatePassword = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        const {currentPassword, newPassword} = req.body;

        if(!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current and new password are required' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if(!validPassword) {
            return res.status(401).json({ message: 'Invalid current password' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });

        return res.status(200).json({ message: 'Password updated successfully' });

    }   catch ( error ) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const deleteAccount = async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body;

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        await prisma.user.delete({
            where: { email }
        });
        
        return res.status(200).json({ message: 'Account deleted successfully' });

    }   catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

