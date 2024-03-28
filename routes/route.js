import express from 'express';
const router = express.Router();
import { startContainer,pullImage,getMachineInfo,getDockerInfo, stopContainer,runContainer, listContainers ,listImages,getContainerStats,pushImageToHub} from '../controllers/controller.js';
import {getCommitMessage} from '../controllers/Gemini.js'


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


router.get('/stats/:containerId', getContainerStats);

router.post('/push', pushImageToHub);

router.post('/Gpt',getCommitMessage);



export default router;
