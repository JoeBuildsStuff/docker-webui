import { ContainersList } from "@/components/containers/containers-list"
import { ContainersActions } from "@/components/containers/containers-actions"

export default function ContainersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Containers</h1>
          <p className="text-muted-foreground">Manage your Docker containers.</p>
        </div>
        <ContainersActions />
      </div>

      <ContainersList />
    </div>
  )
}
