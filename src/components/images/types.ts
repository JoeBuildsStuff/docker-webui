export interface DockerImage {
  ID: string;          // Full Image ID (e.g., "sha256:a6bd71f...")
  Repository: string;  // Image repository name
  Tag: string;         // Image tag
  CreatedAt: string;   // Creation timestamp string (e.g., "2023-03-16 13:02:08 +0000 UTC")
  Size: string;        // Image size string (e.g., "142MB")
  // Other fields like CreatedSince, Digest, VirtualSize might also be available from docker inspect
} 