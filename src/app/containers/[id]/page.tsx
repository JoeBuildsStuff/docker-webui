import { ContainerDetails } from "@/components/containers/container-details"
import { ContainerActions } from "@/components/containers/container-actions"
import { ContainerTabs } from "@/components/containers/container-tabs"
import type { DockerContainer } from "@/components/containers/types"

export default async function ContainerPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  
  // Fetch container data
  const response = await fetch(`http://localhost:3000/api/containers/${id}`); // Assuming API is on localhost:3000
  if (!response.ok) {
    // Handle error appropriately, maybe return a not found page
    // For now, let's throw an error or return null
    console.error("Failed to fetch container data:", response.status);
    // Depending on how you want to handle errors, you might redirect
    // or show an error message. For simplicity, returning null.
    return <div>Container not found or an error occurred.</div>;
  }
  const container: DockerContainer = await response.json();

  if (!container) {
    return <div>Loading container details... or container not found.</div>
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <ContainerDetails id={id} />
        <ContainerActions container={container} />
      </div>

      <ContainerTabs id={id} />
    </div>
  )
}
