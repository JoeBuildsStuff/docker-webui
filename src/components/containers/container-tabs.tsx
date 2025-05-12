"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ContainerDetails {
  ID: string
  Name: string
  Image: string
  Created: string
  State: {
    Status: string
    Running: boolean
    StartedAt: string
  }
  Config: {
    Hostname: string
    Env: string[]
    Cmd: string[]
    Image: string
    ExposedPorts: Record<string, object>
  }
  NetworkSettings: {
    Ports: Record<string, { HostIp: string; HostPort: string }[]>
    Networks: Record<
      string,
      {
        IPAddress: string
        Gateway: string
        MacAddress: string
      }
    >
  }
  Mounts: {
    Type: string
    Source: string
    Destination: string
    Mode: string
    RW: boolean
    Propagation: string
  }[]
}

interface ContainerTabsProps {
  id: string
}

// Mock data for UI demonstration
const mockLogs = `2023-05-11T12:34:56.789Z INFO  Starting application
2023-05-11T12:34:57.123Z INFO  Connected to database
2023-05-11T12:34:57.456Z INFO  Initializing cache
2023-05-11T12:34:58.789Z INFO  Loading configuration
2023-05-11T12:34:59.012Z INFO  Starting HTTP server
2023-05-11T12:34:59.345Z INFO  Server listening on port 8080
2023-05-11T12:35:00.678Z INFO  Received request: GET /api/status
2023-05-11T12:35:00.901Z INFO  Request processed in 123ms
2023-05-11T12:35:10.234Z WARN  High memory usage detected: 75%
2023-05-11T12:35:15.567Z INFO  Received request: POST /api/data
2023-05-11T12:35:15.890Z INFO  Request processed in 323ms
2023-05-11T12:35:30.123Z ERROR Failed to connect to external service
2023-05-11T12:35:30.456Z INFO  Retrying connection in 5s
2023-05-11T12:35:35.789Z INFO  Successfully connected to external service
2023-05-11T12:36:00.012Z INFO  Periodic health check: OK
2023-05-11T12:36:30.345Z INFO  Received request: GET /api/users
2023-05-11T12:36:30.678Z INFO  Request processed in 333ms
2023-05-11T12:37:00.901Z INFO  Periodic health check: OK
2023-05-11T12:37:30.234Z INFO  Received request: GET /api/metrics
2023-05-11T12:37:30.567Z INFO  Request processed in 333ms
2023-05-11T12:38:00.890Z INFO  Periodic health check: OK`

const mockContainerDetails = {
  ID: "abc123",
  Name: "nginx-web",
  Image: "nginx:latest",
  Created: "2023-05-10T12:34:56Z",
  State: {
    Status: "running",
    Running: true,
    StartedAt: "2023-05-10T12:34:56Z",
  },
  Config: {
    Hostname: "abc123",
    Env: [
      "PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
      "NGINX_VERSION=1.21.6",
      "NJS_VERSION=0.7.3",
      "PKG_RELEASE=1~bullseye",
    ],
    Cmd: ["nginx", "-g", "daemon off;"],
    Image: "nginx:latest",
    ExposedPorts: {
      "80/tcp": {},
    },
  },
  NetworkSettings: {
    Ports: {
      "80/tcp": [
        {
          HostIp: "0.0.0.0",
          HostPort: "80",
        },
      ],
    },
    Networks: {
      bridge: {
        IPAddress: "172.17.0.2",
        Gateway: "172.17.0.1",
        MacAddress: "02:42:ac:11:00:02",
      },
    },
  },
  Mounts: [
    {
      Type: "bind",
      Source: "/var/www/html",
      Destination: "/usr/share/nginx/html",
      Mode: "ro",
      RW: false,
      Propagation: "rprivate",
    },
  ],
}

export function ContainerTabs({ id }: ContainerTabsProps) {
  console.log("ContainerTabs", id)
  const [logs] = useState<string>(mockLogs)
  const [containerDetails] = useState<ContainerDetails>(mockContainerDetails)

  return (
    <Tabs defaultValue="logs">
      <TabsList>
        <TabsTrigger value="logs">Logs</TabsTrigger>
        <TabsTrigger value="inspect">Inspect</TabsTrigger>
        <TabsTrigger value="stats">Stats</TabsTrigger>
        <TabsTrigger value="env">Environment</TabsTrigger>
      </TabsList>

      <TabsContent value="logs" className="mt-4">
        <ScrollArea className="h-[500px] rounded-md border bg-muted/50 p-4">
          <pre className="font-mono text-xs">{logs}</pre>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="inspect" className="mt-4">
        <ScrollArea className="h-[500px] rounded-md border bg-muted/50 p-4">
          <pre className="font-mono text-xs whitespace-pre-wrap">{JSON.stringify(containerDetails, null, 2)}</pre>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="stats" className="mt-4">
        <div className="rounded-md border p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">CPU Usage</span>
                <span>25%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary" style={{ width: "25%" }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Memory Usage</span>
                <span>128MB / 512MB</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary" style={{ width: "25%" }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Network I/O</span>
                <span>2.5MB / 1.2MB</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Block I/O</span>
                <span>0.5MB / 0.1MB</span>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="env" className="mt-4">
        <div className="rounded-md border">
          <div className="p-4">
            <h3 className="font-medium">Environment Variables</h3>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="border-t p-4">
              {containerDetails.Config.Env && containerDetails.Config.Env.length > 0 ? (
                <div className="grid gap-2">
                  {containerDetails.Config.Env.map((env: string, index: number) => {
                    const [key, value] = env.split("=")
                    return (
                      <div key={index} className="grid grid-cols-2 gap-4">
                        <div className="font-mono text-xs">{key}</div>
                        <div className="font-mono text-xs">{value}</div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No environment variables found.</p>
              )}
            </div>
          </ScrollArea>
        </div>
      </TabsContent>
    </Tabs>
  )
}
