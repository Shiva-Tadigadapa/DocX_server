import express from 'express';
const router = express.Router();
<<<<<<< HEAD
import { startContainer,pullImage,getMachineInfo,getDockerInfo, stopContainer,runContainer, listContainers ,listImages,getContainerStats} from '../controllers/controller.js';
=======
import { startContainer,pullImage,getMachineInfo,getDockerInfo, stopContainer,runContainer, listContainers ,listImages} from '../controllers/controller.js';
>>>>>>> 8c224361ea43447ad640f040046d82bd902b1d4a



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

<<<<<<< HEAD

router.get('/stats/:containerId', getContainerStats);

=======
>>>>>>> 8c224361ea43447ad640f040046d82bd902b1d4a
export default router;
