import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import fs from 'fs';
import path from 'path';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import todoRoutes from './routes/todoRoutes';

dotenv.config();

const app = express();

// Swagger yapılandırması
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API Dokümantasyonu',
            version: '1.0.0',
            description: 'Express API dokümantasyonu',
        },
        servers: [
            {
                url: `http://localhost:${process.env.PORT || 3000}`,
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT'
                }
            }
        }
    },
    apis: ['./src/routes/*.ts'], // Route dosyalarının yolu
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Swagger JSON dosyasını oluştur
const swaggerPath = path.join(__dirname, '../swagger.json');
fs.writeFileSync(swaggerPath, JSON.stringify(swaggerDocs, null, 2));

// CORS ayarları
app.use(cors({
    origin: ['https://todo-b4cad.web.app', 'http://todo-b4cad.firebaseapp.com'], // İki domain için izin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Tüm yanıtlara CORS başlıklarını ekleyen middleware
app.use((req, res, next) => {
    const allowedOrigins = ['https://todo-b4cad.web.app', 'http://todo-b4cad.firebaseapp.com'];
    const origin = req.headers.origin;
    
    if (origin && allowedOrigins.includes(origin)) {
        res.header("Access-Control-Allow-Origin", origin);
    }
    
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

app.use(express.json());

// Test endpoint'i
app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
});

// Rotalar
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/todos', todoRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
