import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { ContainersList } from "@/components/containers/containers-list"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor and manage your Docker containers, images, volumes, and networks.
        </p>
      </div>

      <DashboardStats />

      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold tracking-tight">Containers</h2>
        <ContainersList />
      </div>
    </div>
  )
}