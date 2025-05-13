import DataTableImages from "@/components/images/data-table-images"

export default function ImagesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Images</h1>
          <p className="text-muted-foreground">Manage your Docker images.</p>
        </div>
      </div>
      <DataTableImages />
    </div>
  )
}
