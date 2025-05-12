import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ContainerActions } from "./container-actions"

// Mock data for UI demonstration
const mockContainers = [
  {
    ID: "abc123",
    Names: "nginx-web",
    Image: "nginx:latest",
    State: "running",
    Status: "Up 2 days",
    CreatedAt: new Date(Date.now() - 172800000).toISOString(),
    Ports: "0.0.0.0:80->80/tcp",
  },
  {
    ID: "def456",
    Names: "postgres-db",
    Image: "postgres:14",
    State: "running",
    Status: "Up 1 day",
    CreatedAt: new Date(Date.now() - 86400000).toISOString(),
    Ports: "0.0.0.0:5432->5432/tcp",
  },
  {
    ID: "ghi789",
    Names: "redis-cache",
    Image: "redis:alpine",
    State: "running",
    Status: "Up 3 hours",
    CreatedAt: new Date(Date.now() - 10800000).toISOString(),
    Ports: "0.0.0.0:6379->6379/tcp",
  },
  {
    ID: "jkl012",
    Names: "old-app",
    Image: "node:16",
    State: "exited",
    Status: "Exited (0) 5 days ago",
    CreatedAt: new Date(Date.now() - 432000000).toISOString(),
    Ports: "",
  },
  {
    ID: "mno345",
    Names: "test-container",
    Image: "alpine:latest",
    State: "exited",
    Status: "Exited (1) 2 days ago",
    CreatedAt: new Date(Date.now() - 172800000).toISOString(),
    Ports: "",
  },
]

export function ContainersList() {
  const containers = mockContainers

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Ports</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {containers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No containers found.
              </TableCell>
            </TableRow>
          ) : (
            containers.map((container) => (
              <TableRow key={container.ID}>
                <TableCell>
                  <Link href={`/containers/${container.ID}`} className="font-medium hover:underline">
                    {container.Names}
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-xs">{container.Image}</TableCell>
                <TableCell>
                  <Badge variant={container.State === "running" ? "default" : "secondary"}>{container.State}</Badge>
                </TableCell>
                <TableCell>{formatTimeAgo(new Date(container.CreatedAt))}</TableCell>
                <TableCell className="font-mono text-xs">{container.Ports || "-"}</TableCell>
                <TableCell className="text-right">
                  <ContainerActions id={container.ID} state={container.State} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

// Simple time formatter function
function formatTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + " years ago"

  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + " months ago"

  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + " days ago"

  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + " hours ago"

  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + " minutes ago"

  return Math.floor(seconds) + " seconds ago"
}
