export interface DockerNetwork {
  Name: string;
  Id: string;
  Created: string;
  Scope: string;
  Driver: string;
  EnableIPv6: boolean;
  IPAM: {
    Driver: string;
    Options: Record<string, string> | null;
    Config: {
      Subnet?: string;
      Gateway?: string;
      IPRange?: string;
      AuxiliaryAddresses?: Record<string, string>;
    }[];
  };
  Internal: boolean;
  Attachable: boolean;
  Ingress: boolean;
  ConfigFrom: {
    Network: string;
  };
  ConfigOnly: boolean;
  Containers: Record<string, {
    Name: string;
    EndpointID: string;
    MacAddress: string;
    IPv4Address: string;
    IPv6Address: string;
  }>;
  Options: Record<string, string>;
  Labels: Record<string, string>;
} 