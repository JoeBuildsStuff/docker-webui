export interface DockerVolume {
  Name: string;
  Driver: string;
  Mountpoint: string;
  // Other potentially useful fields from `docker volume ls --format "{{json .}}"`:
  // Labels: string; // Comma-separated labels
  // Scope: string; // e.g., 'local', 'swarm'
  // Options: string; // Driver options if any
  // Availability: string; // For swarm: 'active', 'pause', 'drain'
  // Size: string; // Note: Not directly available from 'ls', requires 'inspect' or 'df'
} 