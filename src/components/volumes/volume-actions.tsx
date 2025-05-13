"use client"

import { useState } from "react"
import { Trash2 } from "lucide-react"
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface VolumeActionsProps {
  name: string // Volume name
}

// Async function to call the DELETE API endpoint
async function deleteVolume(volumeName: string): Promise<void> {
  const response = await fetch(`/api/volumes/${encodeURIComponent(volumeName)}`, { // Ensure name is URL encoded
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }));
    throw new Error(errorData.error || `Failed to delete volume. Status: ${response.status}`);
  }

  // Handle 200 OK or 204 No Content
  try {
    await response.json();
  } catch (_e) {
    // Ignore parsing error for 204
  }
}

export function VolumeActions({ name }: VolumeActionsProps) {
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const mutation = useMutation({
    mutationFn: deleteVolume,
    onSuccess: () => {
      toast.success(`Volume "${name}" removed successfully`);
      queryClient.invalidateQueries({ queryKey: ['volumes'] });
      setShowDeleteDialog(false);
    },
    onError: (error: Error) => {
      console.error("Error removing volume:", error);
      toast.error(`Failed to remove volume: ${error.message}`);
      setShowDeleteDialog(false);
    },
  });

  function handleRemoveClick() {
    mutation.mutate(name);
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setShowDeleteDialog(true)}
        disabled={mutation.isPending}
        title={`Remove volume ${name}`}
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Remove volume {name}</span>
      </Button>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Volume: {name}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the volume &quot;<span className="font-semibold">{name}</span>&quot;?
              <br />
              <span className="text-destructive font-medium">This action cannot be undone and all data in the volume will be lost.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveClick}
              disabled={mutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {mutation.isPending ? "Removing..." : "Remove Volume"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
