"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
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
import type { DockerNetwork } from "./types" // Import type for response

// Type for the POST request payload - updated to lowercase keys
interface CreateNetworkPayload {
  name: string // Lowercase
  driver?: string // Lowercase
  // Note: Docker API for network creation might have more options (e.g., Subnet, Gateway, Options)
  // Adding only Name and Driver based on current UI fields
  // Subnet handling might require additional logic in the API if supported
}

// Remove empty interface, use DockerNetwork directly for response type
// interface CreateNetworkResponse extends DockerNetwork {}

export function NetworksActions() {
  const [open, setOpen] = useState(false)
  const [networkName, setNetworkName] = useState("")
  const [driver, setDriver] = useState("")
  // Add state for other fields if needed, e.g., subnet

  const queryClient = useQueryClient()

  const { mutate: refreshNetworks, isPending: isRefreshing } = useMutation({
    mutationFn: async () => {
      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ['networks'] })
    },
    onSuccess: () => {
      toast.success("Network list refreshed.")
    },
    onError: (error) => {
      toast.error(`Failed to refresh networks: ${error.message}`)
    },
  })

  const mutation = useMutation<DockerNetwork, Error, CreateNetworkPayload>({
    mutationFn: async (payload) => {
      const response = await fetch("/api/networks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        // Attempt to parse error message from response
        try {
          const errorData = await response.json()
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
        } catch (_e) {
          // Explicitly ignore the error variable (_e) as we only care about the status code here
          throw new Error(`HTTP error! status: ${response.status}`)
        }
      }

      // Assuming API returns the created network object
      const result: DockerNetwork = await response.json()
      return result
    },
    onSuccess: (_data) => {
      toast.success(`Network creation request sent successfully.`)
      queryClient.invalidateQueries({ queryKey: ['networks'] })
      setOpen(false) // Close dialog on success
      // Reset form fields
      setNetworkName("")
      setDriver("")
    },
    onError: (error) => {
      toast.error(`Failed to create network: ${error.message}`)
      // Keep dialog open on error for user to retry/correct
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!networkName) {
        toast.warning("Network name is required.");
        return;
    }
    // Correct the payload keys to lowercase to match API expectation
    const payload: CreateNetworkPayload = { name: networkName };
    if (driver) {
      payload.driver = driver
    }
    // Add other fields like Subnet to payload if implemented
    mutation.mutate(payload)
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={() => refreshNetworks()} disabled={isRefreshing}>
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        Refresh
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="secondary">
            <Plus className="h-4 w-4" />
            Create Network
          </Button>
        </DialogTrigger>
        <DialogContent>
          <form onSubmit={handleCreate}>
            <DialogHeader>
              <DialogTitle>Create a new network</DialogTitle>
              <DialogDescription>
                Enter the details for the network you want to create.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Network Name <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  placeholder="e.g., my-app-network"
                  value={networkName}
                  onChange={(e) => setNetworkName(e.target.value)}
                  required
                  disabled={mutation.isPending}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="driver">Driver (optional)</Label>
                <Input
                  id="driver"
                  placeholder="e.g., bridge (default)"
                  value={driver}
                  onChange={(e) => setDriver(e.target.value)}
                  disabled={mutation.isPending}
                />
              </div>

              {/* Remove commented out Subnet input */}
              {/* <div className="grid gap-2">
                <Label htmlFor="subnet">Subnet (optional)</Label>
                <Input id="subnet" placeholder="e.g., 172.18.0.0/16" />
              </div> */}
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={mutation.isPending}>
                    Cancel
                </Button>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Creating..." : "Create Network"}
                </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
