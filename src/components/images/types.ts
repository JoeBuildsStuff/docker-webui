export interface DockerImage {
  Id: string; // Full Image ID, e.g., "sha256:a6bd71f..."
  ParentId: string;
  Repository: string; // Derived from RepoTags, e.g., "ubuntu"
  Tag: string;        // Derived from RepoTags, e.g., "12.04"
  RepoTags?: string[]; // Changed from | null to optional string[]
  RepoDigests?: string[]; // Changed from | null to optional string[]
  Created: number;    // Unix timestamp
  Size: number;       // Size in bytes
  VirtualSize: number; // Virtual size in bytes
  SharedSize: number; // Shared size in bytes
  Labels?: Record<string, string>; // Changed from | null to optional object
  Containers: number; // Number of containers using this image
} 