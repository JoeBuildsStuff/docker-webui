"use client"

import { useState } from "react"
import { Plus, RefreshCw } from "lucide-react"
import { useMutation, useQueryClient } from '@tanstack/react-query'
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

interface CreateVolumePayload {
  name: string;
  driver?: string;
}

interface CreateVolumeResponse {
  message: string;
  name: string; // The actual name returned by API might be useful
  error?: string;
}

// Async function to call the POST API endpoint for creating a volume
async function createVolume(payload: CreateVolumePayload): Promise<CreateVolumeResponse> {
  const response = await fetch(`/api/volumes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const responseData = await response.json();

  if (!response.ok || response.status !== 201) { // Check for 201 Created specifically
    throw new Error(responseData.error || `Failed to create volume. Status: ${response.status}`);
  }

  return responseData;
}

export function VolumesActions() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [volumeName, setVolumeName] = useState("");
  const [driver, setDriver] = useState("");

  const createMutation = useMutation({
    mutationFn: createVolume,
    onSuccess: (data) => {
      toast.success(data.message || `Volume "${data.name}" created successfully`);
      queryClient.invalidateQueries({ queryKey: ['volumes'] });
      setOpen(false);
      setVolumeName("");
      setDriver("");
    },
    onError: (error: Error) => {
      console.error("Error creating volume:", error);
      toast.error(`Failed to create volume: ${error.message}`);
    },
  });

  const handleRefresh = () => {
    toast.info("Refreshing volume list...")
    queryClient.invalidateQueries({ queryKey: ['volumes'] });
  };

  const handleCreateSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (volumeName.trim()) {
      createMutation.mutate({ name: volumeName.trim(), driver: driver.trim() || undefined });
    }
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleRefresh}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Refresh
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Volume
          </Button>
        </DialogTrigger>
        <DialogContent>
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle>Create a new volume</DialogTitle>
              <DialogDescription>Enter the details for the volume you want to create.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Volume Name <span className="text-destructive">*</span></Label>
                <Input
                  id="name"
                  placeholder="e.g., my-data"
                  value={volumeName}
                  onChange={(e) => setVolumeName(e.target.value)}
                  disabled={createMutation.isPending}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="driver">Driver (optional)</Label>
                <Input
                  id="driver"
                  placeholder="e.g., local (default)"
                  value={driver}
                  onChange={(e) => setDriver(e.target.value)}
                  disabled={createMutation.isPending}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending || !volumeName.trim()}>
                {createMutation.isPending ? "Creating..." : "Create Volume"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
