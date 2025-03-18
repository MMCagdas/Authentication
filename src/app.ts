import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config();

const app = express();

// CORS ayarları
app.use(cors({
    origin: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN, // Firebase Auth Domain'i kullanıyoruz
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Test endpoint'i
app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
});

// Rotalar
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
