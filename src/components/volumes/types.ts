export interface DockerVolume {
  Name: string; // The name of the Docker volume, e.g., 'dnsmasq'
  Driver: string; // The storage driver used for the volume, e.g., 'local'
  Mountpoint: string; // The path where the volume is mounted on the host, e.g., '/var/lib/docker/volumes/dnsmasq/_data'
  CreatedAt?: string; // Optional, as per Docker API docs, but often present
  Labels: Record<string, string>; // Changed from string to object
  Scope: "local" | "global"; // More specific type
  Options?: Record<string, string>; // Driver-specific options
  // UsageData is sometimes available, especially via inspect. Can be null.
  UsageData?: {
    Size: number; // Size in bytes
    RefCount: number; // Number of containers using the volume
  } | null;
  // Warnings are part of the list response, not individual volume objects typically.
} 