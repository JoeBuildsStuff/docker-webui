// src/lib/docker.ts
import Docker from 'dockerode';

export const docker = new Docker({
  socketPath: '/var/run/docker.sock',          // default when local
  // or for remote: host: process.env.DOCKER_HOST,
  // tls: { /* cert/key if needed */ }
});
