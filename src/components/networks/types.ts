export interface DockerNetwork {
  ID: string;
  Name: string;
  Driver: string;
  Scope: string;
  IPv6?: string; // Optional, from `docker network ls`
  Internal?: string; // Optional, from `docker network ls`
  Labels?: string; // Optional, comma-separated
  // Subnet information requires `docker network inspect` and is not included by default from `ls`.
  // If Subnet is a critical feature, the API and this type would need to be enhanced.
  // For now, we align with what `docker network ls --format "{{json .}}"` provides easily.
} 