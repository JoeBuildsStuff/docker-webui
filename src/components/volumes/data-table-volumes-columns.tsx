"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DockerVolume } from "./types"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { VolumeActions } from "./volume-actions"
import { Badge } from "@/components/ui/badge";
import { formatTimeAgo } from "@/lib/utils"; // Assuming utils path

const parseLabelsToBadges = (labelsObject: Record<string, string> | null | undefined) => {
  if (!labelsObject || Object.keys(labelsObject).length === 0) {
    return <span className="text-muted-foreground">-</span>;
  }
  return (
    <div className="flex flex-wrap gap-1">
      {Object.entries(labelsObject).map(([key, value]) => (
        <Badge key={key} variant="outline" title={`${key}: ${value}`}>
          {value} 
        </Badge>
      ))}
    </div>
  );
};

export const columns: ColumnDef<DockerVolume>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "Name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const name = row.getValue("Name") as string;
      return <div className="truncate max-w-xs" title={name}>{name}</div>;
    },
  },
  {
    accessorKey: "Driver",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Driver" />
    ),
    cell: ({ row }) => <div>{row.getValue("Driver")}</div>,
  },
  {
    accessorKey: "Mountpoint",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Mountpoint" />
    ),
    cell: ({ row }) => {
      const mountpoint = row.getValue("Mountpoint") as string;
      return (
        <div className="font-mono text-xs truncate max-w-xs" title={mountpoint}>
          {mountpoint ? `${mountpoint.substring(0, 25)}...` : <span className="text-muted-foreground">-</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "Labels",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Labels" />
    ),
    cell: ({ row }) => {
      const labels = row.getValue("Labels") as Record<string, string>;
      return parseLabelsToBadges(labels);
    },
  },
  {
    accessorKey: "Scope",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Scope" />
    ),
    cell: ({ row }) => <div>{row.getValue("Scope")}</div>,
  },
  {
    accessorKey: "CreatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const createdAt = row.getValue("CreatedAt") as string | undefined;
      return createdAt ? <div>{formatTimeAgo(createdAt)}</div> : <span className="text-muted-foreground">-</span>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const volume = row.original;
      return (
        <div className="text-right">
          <VolumeActions name={volume.Name} />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
]; 