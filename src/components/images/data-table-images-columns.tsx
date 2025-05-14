"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DockerImage } from "./types"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { formatTimeAgo, formatBytes } from "@/lib/utils"
import { ImageActions } from "./image-actions"

export const columns: ColumnDef<DockerImage>[] = [
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
    accessorKey: "Repository",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Repository" />
    ),
    cell: ({ row }) => {
      const repository = row.getValue("Repository") as string;
      return <div className="font-medium truncate max-w-xs" title={repository}>{repository}</div>;
    },
  },
  {
    accessorKey: "Tag",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tag" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline">{row.getValue("Tag")}</Badge>
    ),
  },
  {
    accessorKey: "Id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Image ID" />
    ),
    cell: ({ row }) => {
      const fullId = row.getValue("Id") as string;
      // Display short ID, typically first 12 chars after 'sha256:'
      const shortId = fullId.startsWith("sha256:") ? fullId.substring(7, 19) : fullId.substring(0, 12);
      return <div className="font-mono text-xs" title={fullId}>{shortId}</div>;
    },
  },
  {
    accessorKey: "Created",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const createdTimestamp = row.getValue("Created") as number;
      return <div>{formatTimeAgo(new Date(createdTimestamp * 1000))}</div>;
    },
  },
  {
    accessorKey: "Size",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Size" />
    ),
    cell: ({ row }) => {
      const sizeInBytes = row.getValue("Size") as number;
      return <div>{formatBytes(sizeInBytes)}</div>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => {
      const image = row.original;
      return (
        <div className="text-right">
          <ImageActions id={image.Id} />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
]; 