import { NetworksList } from "@/components/networks/networks-list"
import { NetworksActions } from "@/components/networks/networks-actions"

export default function NetworksPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Networks</h1>
          <p className="text-muted-foreground">Manage your Docker networks.</p>
        </div>
        <NetworksActions />
      </div>

      <NetworksList />
    </div>
  )
}
