import { Badge } from "@/components/ui/badge"

interface ContainerDetailsProps {
  id: string
}

// Mock data for UI demonstration
const mockContainerDetails = {
  ID: "abc123",
  Name: "nginx-web",
  State: {
    Status: "running",
    Running: true,
    StartedAt: "2023-05-10T12:34:56Z",
  },
  Config: {
    Image: "nginx:latest",
    Env: ["NGINX_HOST=example.com", "NGINX_PORT=80"],
  },
}

export function ContainerDetails({ id }: ContainerDetailsProps) {
  const container = mockContainerDetails

  if (!container) {
    return <div>Container {id} not found</div>
  }

  const name = container.Name
  const status = container.State.Status

  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
      <div className="flex items-center gap-2">
        <Badge variant={status === "running" ? "default" : "secondary"}>{status}</Badge>
        <span className="text-sm text-muted-foreground">{container.Config.Image}</span>
      </div>
    </div>
  )
}
