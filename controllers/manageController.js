import Docker from "dockerode";
import os from "os";
import { exec } from "child_process";
import { spawn } from "child_process";
import { logger } from "../Logs/logger.js";

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
