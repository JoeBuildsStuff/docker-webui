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

export function NetworksActions() {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm">
        <RefreshCw className="mr-2 h-4 w-4" />
        Refresh
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Network
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create a new network</DialogTitle>
            <DialogDescription>Enter the details for the network you want to create.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Network Name</Label>
              <Input id="name" placeholder="e.g., my-network" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="driver">Driver (optional)</Label>
              <Input id="driver" placeholder="e.g., bridge" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="subnet">Subnet (optional)</Label>
              <Input id="subnet" placeholder="e.g., 172.18.0.0/16" />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" onClick={() => setOpen(false)}>
              Create Network
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
