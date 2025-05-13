export interface DockerContainer {
  ID: string; // Unique identifier for the container
  Names: string; // Names assigned to the container
  Image: string; // Docker image used to create the container
  State: string; // Current state of the container (e.g., "running", "exited", "paused")
  Status: string; // Human-readable status of the container (e.g., "Up 2 hours", "Exited (0) 5 minutes ago")
  CreatedAt: string; // Timestamp of when the container was created
  Ports: string; // Port mappings for the container (formatted string like "0.0.0.0:8080->80/tcp")
  Command: string; // Command that was used to start the container
  Mounts: string; // Mount points associated with the container
  Networks: string; // Networks to which the container is connected
  Labels: string; // Labels assigned to the container for organization
  LocalVolumes: string; // Number of local volumes attached to the container
  RunningFor: string; // Duration the container has been running - Note: This might be redundant with Status
  Size: string; // Size of the container
} 