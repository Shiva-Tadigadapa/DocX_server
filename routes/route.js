import express from 'express';
const router = express.Router();
import { startContainer, stopContainer, listContainers ,listImages} from '../controllers/controller.js';



// Start a container
router.post('/start/:id', startContainer);

// Stop a container
router.post('/stop/:id', stopContainer);

// Get list of containers
router.get('/', listContainers);

router.get('/', listImages);

export default router;
