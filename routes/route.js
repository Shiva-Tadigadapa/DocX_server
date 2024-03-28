import express from 'express';
const router = express.Router();
import { hello } from '../controllers/controller.js';



router.get('/' , hello);


export default router;