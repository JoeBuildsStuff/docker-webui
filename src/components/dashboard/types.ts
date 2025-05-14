export interface DockerSystemInfo {
  ID: string;
  Containers: number;
  ContainersRunning: number;
  ContainersPaused: number;
  ContainersStopped: number;
  Images: number;
  Driver: string;
  DriverStatus: Array<[string, string]>;
  DockerRootDir: string;
  SystemStatus?: Array<[string, string]> | null; // Can be null
  Plugins: {
    Volume: string[];
    Network: string[];
    Authorization: string[] | null; // Can be null
    Log: string[];
  };
  MemoryLimit: boolean;
  SwapLimit: boolean;
  KernelMemory?: boolean; // Made optional as not in user sample but in my prev def
  KernelMemoryTCP?: boolean; // From user sample
  CpuCfsPeriod: boolean;
  CpuCfsQuota: boolean;
  CPUShares: boolean;
  CPUSet: boolean;
  PidsLimit?: boolean; // From user sample
  OomKillDisable: boolean;
  IPv4Forwarding: boolean;
  BridgeNfIptables: boolean;
  BridgeNfIp6tables: boolean;
  Debug: boolean;
  NFd?: number; // Optional based on debug mode
  NGoroutines?: number; // Optional based on debug mode
  SystemTime: string;
  LoggingDriver: string;
  CgroupDriver: 'cgroupfs' | 'systemd' | string; // Added string for CgroupVersion: '2'
  CgroupVersion?: '1' | '2' | string; // From user sample
  NEventsListener?: number; // Seen in some outputs, mark as optional
  KernelVersion: string;
  OperatingSystem: string;
  OSVersion?: string; // From user sample
  OSType: 'linux' | 'windows' | string; // Add string for other potential values
  Architecture: string;
  NCPU: number;
  MemTotal: number;
  IndexServerAddress: string;
  RegistryConfig?: { // Mark as optional as it can be complex and might not always be needed
    AllowNondistributableArtifactsCIDRs?: string[];
    AllowNondistributableArtifactsHostnames?: string[];
    InsecureRegistryCIDRs?: string[];
    IndexConfigs?: Record<string, {
      Name: string;
      Mirrors?: string[];
      Secure: boolean;
      Official: boolean;
    }>;
    Mirrors?: string[];
  } | null;
  GenericResources?: Array<{
    DiscreteResourceSpec?: { Kind: string; Value: number };
    NamedResourceSpec?: { Kind: string; Value: string };
  }> | null;
  HttpProxy?: string;
  HttpsProxy?: string;
  NoProxy?: string;
  Name: string;
  Labels?: string[] | null; // Can be null
  ExperimentalBuild: boolean;
  ServerVersion: string;
  ClusterStore?: string;
  ClusterAdvertise?: string;
  Runtimes?: Record<string, { path: string; runtimeArgs?: string[] }>;
  DefaultRuntime: string;
  Swarm?: SwarmInfo; // Define SwarmInfo below
  LiveRestoreEnabled: boolean;
  Isolation?: 'default' | 'hyperv' | 'process' | '' | string;
  InitBinary?: string;
  ContainerdCommit?: CommitInfo;
  RuncCommit?: CommitInfo;
  InitCommit?: CommitInfo;
  SecurityOptions?: string[];
  // Fields not in the provided sample but seen in Dockerode.SystemInfo type
  Warnings?: string[] | null;
}

export interface CommitInfo {
  ID: string;
  Expected: string;
}

export interface SwarmInfo {
  NodeID: string;
  NodeAddr: string;
  LocalNodeState: 'active' | 'inactive' | 'pending' | 'locked' | 'error' | string;
  ControlAvailable: boolean;
  Error: string;
  RemoteManagers: Array<{ NodeID: string; Addr: string }> | null;
  Nodes?: number;
  Managers?: number;
  Cluster?: ClusterInfo; // Define ClusterInfo below
  Warnings?: string[] | null; // Added from Dockerode types
}

export interface ClusterInfo {
  ID: string;
  Version: { Index: number };
  CreatedAt: string;
  UpdatedAt: string;
  Spec: {
    Name: string;
    Labels: Record<string, string>;
    Orchestration?: { TaskHistoryRetentionLimit?: number };
    Raft: {
      SnapshotInterval: number;
      KeepOldSnapshots?: number;
      LogEntriesForSlowFollowers: number;
      ElectionTick: number;
      HeartbeatTick: number;
    };
    Dispatcher?: { HeartbeatPeriod?: number };
    CAConfig?: {
      NodeCertExpiry?: number;
      ExternalCAs?: Array<{
        Protocol: 'cfssl' | string;
        URL: string;
        Options?: Record<string, string>;
        CACert?: string;
      }> | null;
      SigningCACert?: string;
      SigningCAKey?: string; // Note: Sensitive, may not always be present
      ForceRotate?: number;
    };
    EncryptionConfig?: { AutoLockManagers?: boolean };
    TaskDefaults?: {
      LogDriver?: {
        Name: string;
        Options?: Record<string, string> | null;
      };
    };
  };
  TLSInfo: {
    TrustRoot: string;
    CertIssuerSubject: string;
    CertIssuerPublicKey: string;
  };
  RootRotationInProgress?: boolean;
  JoinTokens?: { // Added from Dockerode types
    Worker: string;
    Manager: string;
  };
}

export interface DockerVersionComponentDetail {
  ApiVersion?: string;
  Arch?: string;
  BuildTime?: string | Date;
  Experimental?: string;
  GitCommit: string; // Common to all components in sample
  GoVersion?: string;
  KernelVersion?: string;
  MinAPIVersion?: string;
  Os?: string;
}

export interface DockerVersionComponent {
  Name: string;
  Version: string;
  Details: DockerVersionComponentDetail;
}

export interface DockerVersionInfo {
  Platform?: { Name: string };
  Components?: DockerVersionComponent[];
  Version: string;
  ApiVersion: string;
  MinAPIVersion?: string;
  GitCommit: string;
  GoVersion: string;
  Os: string;
  Arch: string;
  KernelVersion?: string; // Marked optional as it's in Engine details too
  BuildTime?: string | Date; // Marked optional as it's in Engine details too
}

// This is what the frontend dashboard will consume
export interface DashboardStatsData {
  runningContainers: number;
  pausedContainers: number; // Added based on docker.info()
  stoppedContainers: number;
  totalContainers: number; // Added based on docker.info()
  images: number;
  volumes: number;
  networks: number;
  dockerVersion: string; // Will be from DockerVersionInfo.Version
  apiVersion: string; // From DockerVersionInfo.ApiVersion
  kernelVersion?: string; // From DockerVersionInfo or DockerSystemInfo
  os: string; // From DockerVersionInfo.Os or SystemInfo.OperatingSystem
  arch: string; // From DockerVersionInfo.Arch or SystemInfo.Architecture
  cpus: number;
  memoryTotal: string; // Formatted string like "2 GB"
  cpuUsagePercent: number; // From getResourceUsage
  memoryUsagePercent: number; // From getResourceUsage
  id: string; // Docker Host ID
  name: string; // Docker Host Name
}
