import { ContainerDetails } from "@/components/containers/container-details"
import { ContainerActions } from "@/components/containers/container-actions"
import { ContainerTabs } from "@/components/containers/container-tabs"

export default function ContainerPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <ContainerDetails id={params.id} />
        <ContainerActions id={params.id} state="running" />
      </div>

      <ContainerTabs id={params.id} />
    </div>
  )
}
