"use client"

import { useState } from "react"
import { Download, RefreshCw } from "lucide-react"
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

interface PullImageResponse {
  message?: string;
  output?: string; // Based on POST API route, it might also return output
  error?: string;
}

// Async function to call the POST API endpoint for pulling an image
async function pullImage(imageName: string): Promise<PullImageResponse> { // Return type can be more specific based on API response
  const response = await fetch(`/api/images`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ imageName }),
  });

  const responseData = await response.json(); // Try to parse JSON regardless of status

  if (!response.ok) {
    throw new Error(responseData.error || `Failed to pull image. Status: ${response.status}`);
  }

  return responseData;
}

export function ImagesActions() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [imageName, setImageName] = useState("");

  const pullMutation = useMutation({
    mutationFn: pullImage,
    onSuccess: (data) => {
      toast.success(data.message || `Image ${imageName} pulled successfully`);
      queryClient.invalidateQueries({ queryKey: ['images'] });
      setOpen(false); // Close dialog on success
      setImageName(""); // Reset input
    },
    onError: (error: Error) => {
      console.error("Error pulling image:", error);
      toast.error(`Failed to pull image: ${error.message}`);
      // Optionally keep the dialog open on error: setOpen(true);
    },
  });

  const handleRefresh = () => {
    toast.info("Refreshing image list...")
    queryClient.invalidateQueries({ queryKey: ['images'] });
  };

  const handlePullSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (imageName.trim()) {
      pullMutation.mutate(imageName.trim());
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
            <Download className="mr-2 h-4 w-4" />
            Pull Image
          </Button>
        </DialogTrigger>
        <DialogContent>
          <form onSubmit={handlePullSubmit}>
            <DialogHeader>
              <DialogTitle>Pull a Docker image</DialogTitle>
              <DialogDescription>Enter the name of the image you want to pull (e.g., nginx:latest).</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="image">Image Name</Label>
                <Input
                  id="image"
                  placeholder="e.g., nginx:latest"
                  value={imageName}
                  onChange={(e) => setImageName(e.target.value)}
                  disabled={pullMutation.isPending}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={pullMutation.isPending || !imageName.trim()}>
                {pullMutation.isPending ? "Pulling..." : "Pull Image"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
