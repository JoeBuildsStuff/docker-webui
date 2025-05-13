"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DockerImage } from "./types"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTableColumnHeader } from "@/components/ui/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { formatTimeAgo } from "@/lib/utils"
import { ImageActions } from "./image-actions" // Assumes image-actions.tsx is in the same directory

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
      return <div className="font-medium">{repository.length > 25 ? `${repository.substring(0, 25)}...` : repository}</div>;
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
    accessorKey: "ID",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Image ID" />
    ),
    cell: ({ row }) => {
      const fullId: string = row.getValue("ID");
      // Display short ID, typically first 12 chars after 'sha256:'
      const shortId = fullId.startsWith("sha256:") ? fullId.substring(7, 19) : fullId.substring(0, 12);
      return <div className="font-mono text-xs">{shortId}</div>;
    },
  },
  {
    accessorKey: "CreatedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const createdAt: string = row.getValue("CreatedAt");
      return <div>{formatTimeAgo(createdAt)}</div>;
    },
  },
  {
    accessorKey: "Size",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Size" />
    ),
    cell: ({ row }) => <div>{row.getValue("Size")}</div>,
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>, // Or DataTableColumnHeader if sorting/hiding is needed
    cell: ({ row }) => {
      const image = row.original;
      return (
        <div className="text-right">
          <ImageActions id={image.ID} />
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
]; 