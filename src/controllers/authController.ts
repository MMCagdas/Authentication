import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
}

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password , name} = req.body;
        if(!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
    
        if(existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || null,
            },
        });
        
        const { password: _, ...userWithoutPassword } = user;
        return res.status(201).json(userWithoutPassword);
    
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try{
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        const validPassword = user && await bcrypt.compare(password, user.password);

        if(!user || !validPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: 'Server configuration error' });
        }

        const token = jwt.sign(
            {id: user.id, email: user.email},
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const { password: _, ...userWithoutPassword } = user;
        return res.status(200).json({
            user: userWithoutPassword,
            token
        });
        
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}; 