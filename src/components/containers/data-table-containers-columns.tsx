"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
// Assuming formatTimeAgo exists and is appropriate, if not, Created column might need adjustment
// import { formatTimeAgo } from "@/lib/utils"

import type { DockerContainer } from "./types"
import { ContainerActions } from "./container-actions"
import { DataTableColumnHeader } from "../ui/data-table-column-header"

// Helper function to determine badge variant based on state
function getStatusVariant(state: string): "default" | "secondary" | "destructive" | "outline" {
  const lowerState = state.toLowerCase();
  if (lowerState.includes('running') || lowerState.includes('up')) {
    return "default"; // Greenish for running
  } else if (lowerState.includes('exited') || lowerState.includes('stopped')) {
    return "secondary"; // Gray for stopped
  } else if (lowerState.includes('paused')) {
    return "outline"; // Outline for paused
  } else if (lowerState.includes('restarting')) {
    return "outline"; // Could use a different color/style
  }
  return "secondary"; // Default fallback
}

export const columns: ColumnDef<DockerContainer>[] = [
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
    accessorKey: "ID",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("ID")}</div>,
    enableHiding: true, // Hidden by default
  },
  {
    accessorKey: "Names",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
    cell: ({ row }) => (
      <Link href={`/containers/${row.original.ID}`} className="hover:underline">
        {row.getValue("Names")}
      </Link>
    ),
  },
  {
    accessorKey: "Image",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Image" />
    ),
    cell: ({ row }) => {
      const image = row.getValue("Image") as string;
      return <div className="font-mono text-xs">{image.length > 50 ? `${image.substring(0, 25)}...` : image}</div>;
    },
  },
  {
    accessorKey: "State", // Base the badge on State, display Status text
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="State" />
    ),
    cell: ({ row }) => {
      const state = row.getValue("State") as string;
      return (
        <Badge variant={getStatusVariant(state)} className="whitespace-nowrap">
          {state}
        </Badge>
      );
    },
  },
  {
    accessorKey: "Status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("Status") as string;
      // Basic display, consider formatting if needed
      return <div className="text-xs whitespace-nowrap">{status}</div>;
    },
    enableHiding: true, // Can be hidden by default
  },
  {
    accessorKey: "Ports",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ports" />
    ),
    cell: ({ row }) => <div className="font-mono text-xs">{row.getValue("Ports") || "-"}</div>,
  },
  {
    accessorKey: "Networks",
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Networks" />
    ),
    cell: ({ row }) => <div className="text-xs">{row.getValue("Networks") || "-"}</div>,
  },
  {
    accessorKey: "Size",
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Size" />
    ),
    cell: ({ row }) => <div className="text-xs whitespace-nowrap">{row.getValue("Size") || "-"}</div>,
  },
  {
    accessorKey: "Command",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Command" />
    ),
    cell: ({ row }) => {
      const command = row.getValue("Command") as string;
      return <div className="font-mono text-xs">{command.length > 40 ? `${command.substring(0, 37)}...` : command}</div>;
    },
    enableHiding: true, // Hidden by default
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader className="justify-end text-right" column={column} title="Actions" />
    ),
    cell: ({ row }) => <div className="flex justify-end"><ContainerActions container={row.original} /></div>,
    enableSorting: false,
    enableHiding: false,
  },
] 