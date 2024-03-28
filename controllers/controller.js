import Docker from "dockerode";
import os from "os";

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
export const listContainers = (req, res) => {
  docker.listContainers((err, containers) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // only send the container id and name
      console.log(containers);
      containers = containers.map((container) => {
        return {
          id: container.Id,
          name: container.Names[0].replace("/", ""),
        };
      });
      res.json(containers);
    }
  });
};

export const listImages = (req, res) => {
  docker.listImages((err, images) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // send only image id name
      images = images.map((image) => {
        return {
          id: image.Id,
          name: image.RepoTags[0],
        };
      });
      res.json(images);
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
    
    const stats = await container.stats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};