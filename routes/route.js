import express from 'express';
import { sendPairs,getTokensList,getPriceById } from '../controllers/controller.js';
const router = express.Router();

router.post('/pairs', sendPairs);

router.get('/get-tokenlist',getTokensList);

router.get('/getPrice/:ID', getPriceById);
export default router;