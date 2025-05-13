"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Trash2 } from "lucide-react"
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
import type { DockerContainer } from "./types" // Import type

interface ContainerActionsProps {
  container: DockerContainer // Use the full container object
}

export function ContainerActions({ container }: ContainerActionsProps) {
  const queryClient = useQueryClient()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const mutation = useMutation({
    mutationFn: async (containerId: string) => {
      const response = await fetch(`/api/containers/${containerId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        // Try to parse error json from API
        const errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          // Use specific error messages from API if available
          if (response.status === 404) throw new Error(errorData.error || "Container not found.")
          if (response.status === 409) throw new Error(errorData.error || "Container is running or conflict occurred.")
          throw new Error(errorData.error || errorMsg);
        } catch { // Handle cases where response body is not JSON or empty
          throw new Error(errorMsg);
        }
      }
      // Handle 200/204 success
      return; // DELETE often returns no content
    },
    onSuccess: () => {
      toast.success(`Container "${container.Names}" removed successfully.`)
      queryClient.invalidateQueries({ queryKey: ['containers'] })
      setShowDeleteDialog(false) // Close dialog on success
    },
    onError: (error) => {
      toast.error(`Failed to remove container: ${error.message}`)
      setShowDeleteDialog(false) // Close dialog on error as well
    },
  })

  const handleRemove = () => {
    mutation.mutate(container.ID) // Pass container ID to mutation
  }

  return (
    <>
      {/* Keep the div for flex alignment if needed by the parent Cell */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowDeleteDialog(true)}
          disabled={mutation.isPending}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remove</span>
        </Button>
        {/* Add other action buttons here (Start, Stop, Restart) if needed */}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Container</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove container &quot;{container?.Names}&quot; ({container?.ID.substring(0, 12)})?
              {container?.State === 'running' && (
                <span className="block text-destructive text-sm mt-2">Warning: Container is currently running. Removing may cause issues if not stopped gracefully. Standard remove will fail; consider stopping it first.</span>
              )}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
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
