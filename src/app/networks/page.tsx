import { DataTableNetworks } from "@/components/networks/data-table-networks"

export default function NetworksPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Networks</h1>
          <p className="text-muted-foreground">Manage your Docker networks.</p>
        </div>
      </div>

      <DataTableNetworks />
    </div>
  )
}
