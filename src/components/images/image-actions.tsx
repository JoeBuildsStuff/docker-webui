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

interface ImageActionsProps {
  id: string // Expecting full image ID
}

// Async function to call the DELETE API endpoint
async function deleteImage(imageId: string): Promise<void> {
  const response = await fetch(`/api/images/${imageId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }));
    throw new Error(errorData.error || `Failed to delete image. Status: ${response.status}`);
  }

  // If response is OK but has no body (like 204 No Content), just resolve.
  // If it has a body (like 200 OK with a message), you might optionally parse and use it.
  try {
    await response.json(); // Attempt to parse JSON, useful for 200 OK responses
  } catch (_e) {
    // Ignore parsing error if status was OK (likely 204)
  }
}

export function ImageActions({ id }: ImageActionsProps) {
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const mutation = useMutation({
    mutationFn: deleteImage,
    onSuccess: () => {
      toast.success(`Image ${id.substring(7, 19)} removed successfully`);
      // Invalidate the images query to trigger a refetch
      queryClient.invalidateQueries({ queryKey: ['images'] });
      setShowDeleteDialog(false); // Close dialog on success
    },
    onError: (error: Error) => {
      console.error("Error removing image:", error);
      toast.error(`Failed to remove image: ${error.message}`);
      setShowDeleteDialog(false); // Close dialog on error as well
    },
  });

  function handleRemoveClick() {
    mutation.mutate(id);
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setShowDeleteDialog(true)}
        disabled={mutation.isPending} // Disable button while mutation is in progress
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Remove</span>
      </Button>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove image ID {id.substring(7, 19)}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveClick}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
