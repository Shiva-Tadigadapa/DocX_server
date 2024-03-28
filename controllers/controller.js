import Docker from "dockerode";
import os from "os";
import { exec } from 'child_process';
import { spawn } from 'child_process';

const docker = new Docker();

// Start a container
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

// Stop a container
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

// Get list of containers
export const listRunningContainers = (docker) => {
  return new Promise((resolve, reject) => {
    docker.listContainers((err, containers) => {
      if (err) {
        reject(err);
      } else {
        // Only send the container id and name
        const runningContainers = containers.map((container) => ({
          id: container.Id,
          name: container.Names[0].replace("/", ""),
        }));
        resolve(runningContainers);
      }
    });
  });
};

// Function to execute Docker CLI command to list past exited containers
export const listExitedContainers = () => {
  return new Promise((resolve, reject) => {
    // Execute 'docker ps -a' command using child process
    const dockerPs = spawn('docker', ['ps', '-a', '--format', '{{json .}}']);
    
    let exitedContainers = '';
    
    // Capture stdout data
    dockerPs.stdout.on('data', (data) => {
      exitedContainers += data.toString();
    });
    
    // Handle process completion
    dockerPs.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Failed to execute 'docker ps -a' command`));
      } else {
        // Parse the JSON output to get container information
        const containers = exitedContainers.trim().split('\n').map(JSON.parse);
        resolve(containers);
      }
    });
  });
};

// Handler function for listing both running and exited containers
export const listContainers = async (req, res) => {
  try {
    // Execute both functions concurrently and wait for both to complete
    const [runningContainers, exitedContainers] = await Promise.all([
      listRunningContainers(docker),
      listExitedContainers()
    ]);
    
    // Send both sets of containers together in the response
    res.json({ runningContainers, exitedContainers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const listImages = (req, res) => {
  docker.listImages({ all: true }, (err, images) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // Map and process all image details
      const processedImages = images.map((image) => ({
        id: image.Id.split(':')[1].substring(0, 12), // Extract first 12 characters of ID
        repoTags: image.RepoTags,
        size: image.Size,
        created: new Date(image.Created * 1000), // Convert Unix timestamp to Date object
        labels: image.Labels,
        // Add other properties as needed
      }));
      res.json(processedImages);
    }
  });
};


// run a container from an image
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


// cpu usage ram 

export const getMachineInfo = (req, res) => {
  const cpu = os.cpus();
  const ram = os.totalmem();
  const freeRam = os.freemem();
  const cpuUsage = os.loadavg();
  const machineInfo = {
    cpu: cpu,
    ram: ram,
    freeRam: freeRam,
    cpuUsage: cpuUsage,
  };
  res.json(machineInfo);
}


// get docker usage resources 

export const getDockerInfo = (req, res) => {
  docker.info(function (err, data) {
    if (err) {
      console.error("Error getting docker info:", err);
      return;
    }
    res.json(data);
  });
}


// pull an image from docker hub
export const pullImage = (req, res) => {
  const imagename = req.body.imagename;
  docker.pull(imagename, function (err, stream) {
    if (err) {
      console.error("Error pulling image:", err);
      return;
    }
    docker.modem.followProgress(stream, onFinished, onProgress);
    function onFinished(err, output) {
      if (err) {
        console.error("Error pulling image:", err);
        return;
      }
      res.send({ message: "Image pulled successfully" });
    }
    function onProgress(event) {
      console.log(event);
    }
  });
  

}

export const getContainerStats = async (req, res) => {
  const { containerId } = req.params;

  try {
    const container = docker.getContainer(containerId);
    const stats = await container.stats({ stream: false });

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



export const pushImageToHub = async (req, res) => {
  const { imageName, tag, username, password } = req.body;
  const repository = `${username}/${imageName}:${tag}`;

  try {
      // Docker login command
      const loginCmd = `echo ${password} | docker login --username ${username} --password-stdin`;

      // Docker push command
      const pushCmd = `docker push ${repository}`;

      // Execute Docker login command
      exec(loginCmd, (loginErr, loginStdout, loginStderr) => {
          if (loginErr) {
              console.error('Docker login error:', loginErr);
              res.status(500).json({ error: 'Failed to login to Docker Hub' });
              return;
          }

          // Execute Docker push command
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