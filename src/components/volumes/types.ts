export interface DockerVolume {
  Name: string; // The name of the Docker volume, e.g., 'dnsmasq'
  Driver: string; // The storage driver used for the volume, e.g., 'local'
  Mountpoint: string; // The path where the volume is mounted on the host, e.g., '/var/lib/docker/volumes/dnsmasq/_data'
  Labels: string; // A string of comma-separated labels associated with the volume, e.g., ''
  Scope: string; // The scope of the volume, which can be 'local' for single-host or 'swarm' for multi-host setups
  Size: string; // The size of the volume, represented as a string; may show 'N/A' when size is not available, e.g., 'N/A'
  Links: string; // Information about linked volumes or containers, defaulting to 'N/A' if not applicable, e.g., 'N/A'
} 