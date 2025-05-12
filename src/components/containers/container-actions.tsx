"use client"

import { useState } from "react"
import { Play, Power, RefreshCw, Trash2 } from "lucide-react"
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

interface ContainerActionsProps {
  id: string
  state?: string
}

export function ContainerActions({ id, state }: ContainerActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const isRunning = state === "running"

  async function handleAction(action: string) {
    setLoading(action)

    // Simulate API call
    setTimeout(() => {
      toast.success(`Container ${action}ed successfully for ${id}`)
      setLoading(null)
    }, 1000)
  }

  return (
    <>
      <div className="flex justify-end gap-2">
        {isRunning ? (
          <Button variant="outline" size="icon" onClick={() => handleAction("stop")} disabled={loading !== null}>
            <Power className="h-4 w-4" />
            <span className="sr-only">Stop</span>
          </Button>
        ) : (
          <Button variant="outline" size="icon" onClick={() => handleAction("start")} disabled={loading !== null}>
            <Play className="h-4 w-4" />
            <span className="sr-only">Start</span>
          </Button>
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() => handleAction("restart")}
          disabled={loading !== null || !isRunning}
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Restart</span>
        </Button>

        <Button variant="outline" size="icon" onClick={() => setShowDeleteDialog(true)} disabled={loading !== null}>
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Remove</span>
        </Button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Container</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this container? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowDeleteDialog(false)
                handleAction("remove")
              }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
