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
import type { DockerNetwork } from "./types"

interface NetworkActionsProps {
  network: DockerNetwork
}

export function NetworkActions({ network }: NetworkActionsProps) {
  const queryClient = useQueryClient()
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const mutation = useMutation({
    mutationFn: async (networkId: string) => {
      const response = await fetch(`/api/networks/${networkId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        if (response.status === 404) throw new Error("Network not found.")
        if (response.status === 409) throw new Error("Network is in use and cannot be removed.")
        // Attempt to read error message from response body
        try {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        } catch (_e) { // Handle cases where response body is not JSON or empty
            // Explicitly ignore the error variable as we only care about the status code here
            throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      // Handle 204 No Content response explicitly if necessary
      // We expect no content on successful DELETE, so just proceed
      return; // Or return something if needed, though DELETE usually doesn't return content
    },
    onSuccess: () => {
      toast.success(`Network "${network.Name}" removed successfully.`)
      queryClient.invalidateQueries({ queryKey: ['networks'] })
      setShowDeleteDialog(false) // Close dialog on success
    },
    onError: (error) => {
      toast.error(`Failed to remove network: ${error.message}`)
      setShowDeleteDialog(false) // Close dialog on error as well
    },
  })

  const handleRemove = () => {
    mutation.mutate(network.ID) // Use network ID (uppercase) from prop
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setShowDeleteDialog(true)}
        disabled={mutation.isPending} // Use mutation pending state
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Remove</span>
      </Button>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Network</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the network &quot;{network.Name}&quot; ({network.ID.substring(0, 12)})? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove} // Call the mutation trigger function
              disabled={mutation.isPending} // Disable button while pending
            >
              {mutation.isPending ? "Removing..." : "Remove"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
