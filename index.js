import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
dotenv.config();
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(cors({
    origin: ['http://localhost:3000',]
}));
const port = 3000;
import router from './routes/route.js';

app.use('/', router);

const connectWithRetry = () => {
    mongoose.connect(process.env.MONGO_URI).then(() => {
        console.log('Connected to MongoDB 🥳');
    }).catch((err) => {
        console.error('Failed to connect to MongoDB:', err);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectWithRetry, 5000); // Retry connection after 5 seconds
    });
};

connectWithRetry();

app.listen(port, () => console.log(`yowamio listening on port ${port}! 🔥`));
