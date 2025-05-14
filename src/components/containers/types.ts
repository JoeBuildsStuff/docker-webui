export interface Port {
  IP?: string;
  PrivatePort: number;
  PublicPort?: number;
  Type: 'tcp' | 'udp' | 'sctp';
}

export interface MountPoint {
  Type?: 'bind' | 'volume' | 'tmpfs' | 'npipe';
  Name?: string;
  Source?: string;
  Destination?: string;
  Driver?: string;
  Mode?: string;
  RW?: boolean;
  Propagation?: string;
}

export interface NetworkInfo {
  IPAMConfig?: null | { IPv4Address?: string; IPv6Address?: string; };
  Links?: null | string[];
  Aliases?: null | string[];
  NetworkID?: string;
  EndpointID?: string;
  Gateway?: string;
  IPAddress?: string;
  IPPrefixLen?: number;
  IPv6Gateway?: string;
  GlobalIPv6Address?: string;
  GlobalIPv6PrefixLen?: number;
  MacAddress?: string;
  DriverOpts?: null | Record<string, string>;
}

export interface DockerContainer {
  Id: string; 
  Names: string[]; 
  Image: string; 
  ImageID: string;
  Command: string; 
  Created: number; // Unix timestamp
  State: string; 
  Status: string; 
  Ports: Port[]; 
  Labels: { [key: string]: string }; 
  SizeRw?: number; // Size of files that have been created or changed by this container (if requested with size=true)
  SizeRootFs?: number; // Total size of all the files in this container (if requested with size=true)
  HostConfig: {
    NetworkMode: string;
  };
  NetworkSettings: {
    Networks: { [networkName: string]: NetworkInfo };
  };
  Mounts: MountPoint[];
  // Fields from your old type that are not directly in dockerode.listContainers()
  // unless custom formatting or further inspect calls are made:
  // CreatedAt: string; (Covered by Created: number)
  // LocalVolumes: string; (Can be inferred from Mounts of type 'volume')
  // RunningFor: string; (Covered by Status)
} 