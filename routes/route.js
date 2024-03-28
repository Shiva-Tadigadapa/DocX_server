import express from 'express';
const router = express.Router();
import { startContainer, stopContainer, listContainers ,listImages} from '../controllers/controller.js';



// Start a container
router.get('/start/:id', startContainer);

// Stop a container
router.get('/stop/:id', stopContainer);

// Get list of containers
router.get('/allContainers', listContainers);

router.get('/allImages', listImages);

export default router;
