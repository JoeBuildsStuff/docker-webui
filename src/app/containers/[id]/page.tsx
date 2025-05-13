import { ContainerDetails } from "@/components/containers/container-details"
import { ContainerActions } from "@/components/containers/container-actions"
import { ContainerTabs } from "@/components/containers/container-tabs"

export default async function ContainerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <ContainerDetails id={id} />
        <ContainerActions id={id} state="running" />
      </div>

      <ContainerTabs id={id} />
    </div>
  )
}
