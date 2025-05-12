import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { VolumeActions } from "./volume-actions"

// Mock data for UI demonstration
const mockVolumes = [
  {
    Name: "postgres_data",
    Driver: "local",
    Mountpoint: "/var/lib/docker/volumes/postgres_data/_data",
  },
  {
    Name: "nginx_config",
    Driver: "local",
    Mountpoint: "/var/lib/docker/volumes/nginx_config/_data",
  },
  {
    Name: "app_uploads",
    Driver: "local",
    Mountpoint: "/var/lib/docker/volumes/app_uploads/_data",
  },
  {
    Name: "redis_data",
    Driver: "local",
    Mountpoint: "/var/lib/docker/volumes/redis_data/_data",
  },
  {
    Name: "backup_volume",
    Driver: "local",
    Mountpoint: "/var/lib/docker/volumes/backup_volume/_data",
  },
]

export function VolumesList() {
  const volumes = mockVolumes

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Mountpoint</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {volumes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No volumes found.
              </TableCell>
            </TableRow>
          ) : (
            volumes.map((volume) => (
              <TableRow key={volume.Name}>
                <TableCell className="font-medium">{volume.Name}</TableCell>
                <TableCell>{volume.Driver}</TableCell>
                <TableCell className="font-mono text-xs">{volume.Mountpoint || "-"}</TableCell>
                <TableCell className="text-right">
                  <VolumeActions name={volume.Name} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
