import express from "express";
const router = express.Router();
import {
  pullImage,
  getMachineInfo,
  getDockerInfo,
  listContainers,
  listImages,
  getContainerStats,
} from "../controllers/controller.js";
import { getCommitMessage } from "../controllers/Gemini.js";
import {
  startContainer,
  runContainer,
  stopContainer,
  pushImageToHub,
} from "../controllers/manageController.js";

// Start a container
router.get("/start/:id", startContainer);

// Stop a container
router.get("/stop/:id", stopContainer);

// Get list of containers
router.get("/allContainers", listContainers);

// get list of all images
router.get("/allImages", listImages);

// start a container with image
router.post("/createContainer", runContainer);

//get machine info htop
router.get("/machineInfo", getMachineInfo);

// docker info for number of container and images
router.get("/dockerInfo", getDockerInfo);

// pull image from dockerhub
router.post("/pullImage", pullImage);

router.get("/stats/:containerId", getContainerStats);

router.post("/push", pushImageToHub);

router.post("/Gpt", getCommitMessage);

export default router;
