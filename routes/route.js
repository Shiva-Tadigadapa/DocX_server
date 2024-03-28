import express from 'express';
const router = express.Router();
import { startContainer,pullImage,getMachineInfo,getDockerInfo, stopContainer,runContainer, listContainers ,listImages} from '../controllers/controller.js';



// Start a container
router.get('/start/:id', startContainer);

// Stop a container
router.get('/stop/:id', stopContainer);

// Get list of containers
router.get('/allContainers', listContainers);

router.get('/allImages', listImages);


router.post('/createContainer', runContainer)

//get machine info htop 
router.get('/machineInfo', getMachineInfo)

router.get('/dockerInfo', getDockerInfo)

router.post('/pullImage' , pullImage)

export default router;
