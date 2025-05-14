"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import { formatTimeAgo } from "@/lib/utils" // Assuming utils path

import type { DockerNetwork } from "./types"
import { NetworkActions } from "./network-actions"
import { DataTableColumnHeader } from "../ui/data-table-column-header"

export const columns: ColumnDef<DockerNetwork>[] = [
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
    cell: ({ row }) => <div>{row.getValue("Name")}</div>,
  },
  {
    accessorKey: "Id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => {
      const id = row.getValue("Id") as string
      return <div>{id.substring(0, 12)}</div>
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
    accessorKey: "Scope",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Scope" />
    ),
    cell: ({ row }) => <div>{row.getValue("Scope")}</div>,
  },
  {
    accessorKey: "Created",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const createdAt: string = row.getValue("Created");
      return <div>{formatTimeAgo(createdAt)}</div>;
    },
  },
  {
    accessorKey: "Internal",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Internal" />
    ),
    cell: ({ row }) => <div>{row.getValue("Internal") ? "Yes" : "No"}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id) ? 'Yes' : 'No')
    },
  },
  {
    accessorKey: "EnableIPv6",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="IPv6" />
    ),
    cell: ({ row }) => <div>{row.getValue("EnableIPv6") ? "Enabled" : "Disabled"}</div>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id) ? 'Enabled' : 'Disabled')
    },
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader className="justify-end text-right" column={column} title="Actions" />
    ),
    cell: ({ row }) => <div className="flex justify-end"><NetworkActions network={row.original} /></div>,
    enableSorting: false,
    enableHiding: false,
  },
] 