import DataTableVolumes from "@/components/volumes/data-table-volumes";

export default function VolumesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Volumes</h1>
          <p className="text-muted-foreground">Manage your Docker volumes.</p>
        </div>
      </div>
      <DataTableVolumes />
    </div>
  );
}
