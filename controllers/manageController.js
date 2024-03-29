import Docker from "dockerode";
import os from "os";
import { exec } from "child_process";
import { spawn } from "child_process";
import { logger } from "../Logs/logger.js";
import { CLIENT_RENEG_LIMIT } from "tls";

const docker = new Docker();

export const startContainer = (req, res) => {
  const containerId = req.params.id;
  const container = docker.getContainer(containerId);

  container.start((err, data) => {
    if (err) {
      logger.error(`Error starting container ${containerId}: ${err.message}`);
      if (err.statusCode === 404) {
        res.status(404).json({ error: `Container ${containerId} not found` });
      } else {
        res.status(500).json({
          error: `Failed to start container ${containerId}: ${err.message}`,
        });
      }
    } else {
      logger.info(`Container ${containerId} started successfully`);
      res.json({ message: "Container started successfully" });
    }
  });
};

export const stopContainer = (req, res) => {
  const containerId = req.params.id;
  const container = docker.getContainer(containerId);
  container.stop((err, data) => {
    if (err) {
      logger.error(`Error stopping container ${containerId}: ${err.message}`);
      res.status(500).json({
        error: `Failed to stop container ${containerId}: ${err.message}`,
      });
    } else {
      logger.info(`Container ${containerId} stopped successfully`);
      res.json({ message: "Container stopped successfully" });
    }
  });
};

export const runContainer = (req, res) => {
  const imagename = req.body.imagename;
  const createOptions = {
    Image: imagename,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
  };
  docker.createContainer(createOptions, function (err, container) {
    if (err) {
      logger.error(
        `Error creating container for image ${imagename}: ${err.message}`
      );
      res.status(500).json({
        error: `Failed to create container for image ${imagename}: ${err.message}`,
      });
      return;
    }
    container.start(function (err, data) {
      if (err) {
        logger.error(
          `Error starting container for image ${imagename}: ${err.message}`
        );
        res.status(500).json({
          error: `Failed to start container for image ${imagename}: ${err.message}`,
        });
        return;
      }
      logger.info(`Container for image ${imagename} started successfully`);
      res.send({ message: "Container started successfully" });
    });
  });
};

export const pushImageToHub = async (req, res) => {
  const { imageName, tag, username, password } = req.body;
  const repository = `${username}/${imageName}:${tag}`;

  try {
    const loginCmd = `echo ${password} | docker login --username ${username} --password-stdin`;

    const pushCmd = `docker push ${repository}`;

    exec(loginCmd, (loginErr, loginStdout, loginStderr) => {
      if (loginErr) {
        logger.error(`Docker login error: ${loginErr.message}`);
        res.status(500).json({ error: "Failed to login to Docker Hub" });
        return;
      }

      exec(pushCmd, (pushErr, pushStdout, pushStderr) => {
        if (pushErr) {
          logger.error(`Docker push error: ${pushErr.message}`);

          res.status(500).json({ error: "Failed to push image to Docker Hub" });
          return;
        }
        logger.info(`Image pushed to Docker Hub successfully: ${repository}`);
        res
          .status(200)
          .json({ message: "Image pushed to Docker Hub successfully" });
      });
    });
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteContainerById = async (req, res) => {
  try {
    const { containerID } = req.params;
    const container = docker.getContainer(containerID);
    const containerInfo = await container.inspect();
    if (containerInfo.State.Running) {
      await container.stop();
    }
    await container.remove();
    logger.info(`Container ${containerID} deleted successfully`);
    res.json({ message: `Container ${containerID} deleted successfully` });
  } catch (error) {
    logger.error(`Failed to delete container ${containerID}: ${error.message}`);
    res
      .status(500)
      .json({ error: `Failed to delete container ${containerID}` });
  }
};


// import { exec } from 'child_process';

export const openDocker = (req, res) => {
  // Use 'start' instead of 'open' for Windows
  const openDocker = () => {
    const command = process.platform === 'win32' ? 'start Docker' : 'open -a Docker';
  
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Error opening Docker:', error);
        console.error('stderr:', stderr);
        return;
      }
      console.log('Docker opened successfully');
    });
  };
  
  // Call the function to open Docker
  openDocker();
};
// Function to process the prompt and extract action and image name
export const processPrompt = (prompt) => {
  // Check if the prompt is not undefined
  if (typeof prompt !== 'undefined') {
    // Split the prompt into words
    const words = prompt.split(' ');

    // Take the first and last words from the prompt
    const action = words[0];
    const imageName = words[words.length - 1];
    console.log(imageName+"fhdb");

    // Check if both action and image name are provided
    if (action && imageName) {
      return { action, imageName };
    }
  }

  // If prompt is undefined or action/image name is not found, return null
  return null;
};

export const ChatCmds = (req, res) => {
  // Extract prompt from request body
  const { prompt } = req.body;

  // Process the prompt to get action, image name or ID
  const processedPrompt = processPrompt(prompt);

  // Check if prompt is valid
  if (!processedPrompt) {
    return res.status(400).json({ error: 'Invalid prompt: Action or image name/ID not provided' });
  }

  // Extract action, image name or ID from processed prompt
  const { action, imageName } = processedPrompt;

  // Execute Docker command based on the action
  switch (action) {
    case 'run':
      // Run the Docker container in detached mode with the specified image name
      spawn('docker', ['run', '-d', imageName, 'sleep', 'infinity'], { stdio: 'inherit' });
      return res.status(200).json({ message: `Docker container for '${imageName}' started successfully` });

    case 'stop':
      // Stop the Docker container with the specified container ID
      const stopProcess = spawn('docker', ['stop', imageName], { stdio: 'inherit' });

      stopProcess.on('exit', (code) => {
        if (code === 0) {
          return res.status(200).json({ message: `Docker container '${imageName}' stopped successfully` });
        } else {
          return res.status(500).json({ error: `Failed to stop Docker container '${imageName}'` });
        }
      });
      break;

    case 'push':
      // Push the Docker image with the specified image name or ID
      const pushProcess = spawn('docker', ['push', imageName], { stdio: 'inherit' });

      pushProcess.on('exit', (code) => {
        if (code === 0) {
          return res.status(200).json({ message: `Docker image '${imageName}' pushed successfully` });
        } else {
          return res.status(500).json({ error: `Failed to push Docker image '${imageName}'` });
        }
      });
      break;

    case 'pull':
      // Pull the Docker image with the specified image name or ID
      const pullProcess = spawn('docker', ['pull', imageName], { stdio: 'inherit' });

      pullProcess.on('exit', (code) => {
        if (code === 0) {
          return res.status(200).json({ message: `Docker image '${imageName}' pulled successfully` });
        } else {
          return res.status(500).json({ error: `Failed to pull Docker image '${imageName}'` });
        }
      });
      break;

    default:
      return res.status(400).json({ error: 'Invalid action' });
  }
};


export const getMachineInfo = (req, res) => {
  const machineInfo = {
    platform: os.platform(),
    architecture: os.arch(),
    hostname: os.hostname(),
    cpus: os.cpus(),
    totalMemory: os.totalmem(),
    freeMemory: os.freemem(),
    uptime: os.uptime(),
  };

  res.json(machineInfo);
}
export const getDockerInfo = (req, res) => {
  docker.info(function (err, data) {
    if (err) {
      console.error("Error getting docker info:", err);
      return;
    }
    res.json(data);
  });
}

export const searchResults = (req, res) => {
  //ivae this api  https://hub.docker.com/v2/search/repositories?query=ubuntu&page_size=10
  const { query } = req.body;
  const url = `https://hub.docker.com/v2/search/repositories?query=${query}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      res.json(data);
    })
    .catch((error) => {
      console.error("Error fetching search results:", error);
      res.status(500).json({ error: "Failed to fetch search results" });
    });
}
