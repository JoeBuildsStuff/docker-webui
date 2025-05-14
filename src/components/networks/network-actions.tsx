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
        try {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        } catch {
            // Catch block for when response.json() fails (e.g. not JSON or empty)
            // The error message will be based on the status code.
            throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      return; 
    },
    onSuccess: () => {
      toast.success(`Network "${network.Name}" removed successfully.`)
      queryClient.invalidateQueries({ queryKey: ['networks'] })
      setShowDeleteDialog(false) 
    },
    onError: (error) => {
      toast.error(`Failed to remove network: ${error.message}`)
      setShowDeleteDialog(false) 
    },
  })

  const handleRemove = () => {
    mutation.mutate(network.Id) // Use network.Id (lowercase d)
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setShowDeleteDialog(true)}
        disabled={mutation.isPending} 
      >
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Remove</span>
      </Button>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Network</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the network &quot;{network.Name}&quot; ({network.Id.substring(0, 12)})? This action cannot be undone.
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
