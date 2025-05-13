"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DockerVolume } from "./types"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { VolumeActions } from "./volume-actions"
import { Badge } from "@/components/ui/badge";

const parseLabelsToBadges = (labelsString: string | null | undefined) => {
  if (!labelsString) {
    return <span className="text-muted-foreground">-</span>;
  }
  const labels = labelsString.split(',');
  return (
    <div className="flex flex-wrap gap-1">
      {labels.map((label) => {
        const parts = label.split('=');
        const value = parts[1] || parts[0]; // Use value after '=' or the whole string if no '='
        return <Badge key={value} variant="outline">{value}</Badge>;
      })}
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
      return <div className="font-medium">{name.length > 25 ? `${name.substring(0, 25)}...` : name}</div>;
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
        <div className="font-mono text-xs">
          {mountpoint.length > 25 ? `${mountpoint.substring(0, 25)}...` : mountpoint || <span className="text-muted-foreground">-</span>}
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
      const labels = row.getValue("Labels") as string;
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
    accessorKey: "Size",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Size" />
    ),
    cell: ({ row }) => {
      const size = row.getValue("Size") as string;
      return <div>{size === 'N/A' ? '' : size}</div>;
    },
  },
  {
    accessorKey: "Links",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Links" />
    ),
    cell: ({ row }) => {
      const links = row.getValue("Links") as string;
      return <div>{links === 'N/A' ? '' : links || <span className="text-muted-foreground">-</span>}</div>;
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