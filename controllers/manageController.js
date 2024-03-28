import Docker from "dockerode";
import os from "os";
import { exec } from 'child_process';
import { spawn } from 'child_process';

const docker = new Docker();


export const startContainer = (req, res) => {
    const container = docker.getContainer(req.params.id);
    container.start((err, data) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: "Container started successfully" });
      }
    });
  };
  
  
  export const stopContainer = (req, res) => {
    const container = docker.getContainer(req.params.id);
    container.stop((err, data) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
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
        console.error("Error creating container:", err);
        return;
      }
      container.start(function (err, data) {
        if (err) {
          console.error("Error starting container:", err);
          return;
        }
        res.send({ message: "Container started successfully"});
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
                console.error('Docker login error:', loginErr);
                res.status(500).json({ error: 'Failed to login to Docker Hub' });
                return;
            }
  
            exec(pushCmd, (pushErr, pushStdout, pushStderr) => {
                if (pushErr) {
                    console.error('Docker push error:', pushErr);
                    res.status(500).json({ error: 'Failed to push image to Docker Hub' });
                    return;
                }
  
                console.log('Docker push output:', pushStdout);
                res.status(200).json({ message: 'Image pushed to Docker Hub successfully' });
            });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
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
  
      res.json({ message: `Container ${containerID} deleted successfully` });
    } catch (error) {
      console.error('Failed to delete container:', error);
      res.status(500).json({ error: 'Failed to delete container' });
    }
  };