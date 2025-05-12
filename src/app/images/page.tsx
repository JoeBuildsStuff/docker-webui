import { ImagesList } from "@/components/images/images-list"
import { ImagesActions } from "@/components/images/images-actions"

export default function ImagesPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Images</h1>
          <p className="text-muted-foreground">Manage your Docker images.</p>
        </div>
        <ImagesActions />
      </div>

      <ImagesList />
    </div>
  )
}
