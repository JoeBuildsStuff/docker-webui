"use client"

import { useState } from "react"
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

export function ContainersActions() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm">
        <RefreshCw className="h-4 w-4" />
        Refresh
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="h-4 w-4" />
            Add Container
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Run a new container</DialogTitle>
            <DialogDescription>Enter the details for the container you want to run.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            <div className="grid gap-2">
              <Label htmlFor="image">Image</Label>
              <Input id="image" placeholder="e.g., nginx:latest" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Container Name (optional)</Label>
              <Input id="name" placeholder="e.g., my-nginx" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="ports">Ports (optional)</Label>
              <Input id="ports" placeholder="e.g., 8080:80" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="env">Environment Variables (optional)</Label>
              <Input id="env" placeholder="e.g., KEY=value" />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" onClick={() => setOpen(false)}>
              Add Container
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
