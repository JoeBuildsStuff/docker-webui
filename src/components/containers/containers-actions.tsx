"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

// Payload type for the POST /api/containers endpoint
interface CreateContainerPayload {
  image: string; // Required
  name?: string;
  ports?: string; // e.g., "8080:80, 9001:9000"
  env?: string;   // e.g., "KEY1=val1,KEY2=val2"
}

// Expected response from POST /api/containers (assuming success message + ID)
interface CreateContainerResponse {
    message: string;
    id: string;
}

export function ContainersActions() {
  const [open, setOpen] = useState(false)
  const [imageName, setImageName] = useState("")
  const [containerName, setContainerName] = useState("")
  const [ports, setPorts] = useState("")
  const [envVars, setEnvVars] = useState("")

  const queryClient = useQueryClient()

  // Mutation for refreshing the list
  const { mutate: refreshContainers, isPending: isRefreshing } = useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: ['containers'] })
    },
    onSuccess: () => {
      toast.success("Container list refreshed.")
    },
    onError: (error) => {
      toast.error(`Failed to refresh containers: ${error.message}`)
    },
  })

  // Mutation for creating/running a new container
  const mutation = useMutation<CreateContainerResponse, Error, CreateContainerPayload>({
    mutationFn: async (payload) => {
      const response = await fetch("/api/containers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          // Use specific errors from API response if available
          if (response.status === 400) throw new Error(errorData.error || "Invalid input provided.");
          if (response.status === 404) throw new Error(errorData.error || "Image not found.");
          if (response.status === 409) throw new Error(errorData.error || "Conflict (name/port already in use).");
          throw new Error(errorData.error || errorMsg);
        } catch {
             throw new Error(errorMsg);
        }
      }
      return response.json() // API returns { message, id }
    },
    onSuccess: (data) => {
      toast.success(data.message || `Container started successfully (ID: ${data.id.substring(0,12)}).`)
      queryClient.invalidateQueries({ queryKey: ['containers'] })
      setOpen(false) // Close dialog on success
      // Reset form fields
      setImageName("")
      setContainerName("")
      setPorts("")
      setEnvVars("")
    },
    onError: (error) => {
      toast.error(`Failed to run container: ${error.message}`)
      // Keep dialog open on error for user to retry/correct
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!imageName) {
        toast.warning("Image name is required.");
        return;
    }
    const payload: CreateContainerPayload = { image: imageName };
    if (containerName) payload.name = containerName;
    if (ports) payload.ports = ports;
    if (envVars) payload.env = envVars;

    mutation.mutate(payload)
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => refreshContainers()} disabled={isRefreshing}>
        <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Container
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px]"> {/* Wider dialog maybe */} 
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Run a new container</DialogTitle>
              <DialogDescription>Enter the details for the container you want to run.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">Image <span className="text-destructive">*</span></Label>
                <Input
                  id="image"
                  placeholder="e.g., nginx:latest, ubuntu:22.04"
                  value={imageName}
                  onChange={(e) => setImageName(e.target.value)}
                  className="col-span-3"
                  required
                  disabled={mutation.isPending}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Container Name</Label>
                <Input
                  id="name"
                  placeholder="(optional) e.g., my-nginx"
                  value={containerName}
                  onChange={(e) => setContainerName(e.target.value)}
                  className="col-span-3"
                  disabled={mutation.isPending}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ports" className="text-right">Ports</Label>
                <Input
                  id="ports"
                  placeholder="(optional) host:container, e.g., 8080:80"
                  value={ports}
                  onChange={(e) => setPorts(e.target.value)}
                  className="col-span-3"
                  disabled={mutation.isPending}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="env" className="text-right">Environment</Label>
                <Input
                  id="env"
                  placeholder="(optional) KEY=value,KEY2=val2"
                  value={envVars}
                  onChange={(e) => setEnvVars(e.target.value)}
                  className="col-span-3"
                  disabled={mutation.isPending}
                />
              </div>
            </div>

            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline" disabled={mutation.isPending}>
                        Cancel
                    </Button>
                </DialogClose>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Starting..." : "Start Container"}
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
