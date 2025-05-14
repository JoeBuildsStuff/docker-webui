"use client"

import type { ColumnDef } from "@tanstack/react-table"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { formatTimeAgo, formatBytes } from "@/lib/utils"
import type { DockerContainer, Port } from "./types"
import { ContainerActions } from "./container-actions" // Make sure this path is correct
import { DataTableColumnHeader } from "../ui/data-table-column-header"

function getStatusVariant(state: string): "default" | "secondary" | "destructive" | "outline" {
  const lowerState = state?.toLowerCase() || "";
  if (lowerState.includes('running') || lowerState.includes('up')) return "default";
  if (lowerState.includes('exited') || lowerState.includes('stopped') || lowerState.includes('dead')) return "secondary";
  if (lowerState.includes('paused')) return "outline";
  if (lowerState.includes('restarting')) return "outline"; // Consider a different color for restarting
  return "secondary";
}

function formatPorts(ports: Port[]): string {
  if (!ports || ports.length === 0) return "-";
  return ports.map(p => {
    let mapping = "";
    if (p.IP && p.PublicPort) mapping += `${p.IP}:${p.PublicPort}->`;
    else if (p.PublicPort) mapping += `${p.PublicPort}->`;
    mapping += `${p.PrivatePort}/${p.Type}`;
    return mapping;
  }).join(", ");
}

export const columns: ColumnDef<DockerContainer>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all" className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row" className="translate-y-[2px]"
      />
    ),
    enableSorting: false, enableHiding: false,
  },
  {
    accessorKey: "Names",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const names = row.getValue("Names") as string[];
      const displayName = names && names.length > 0 ? names[0].substring(1) : row.original.Id.substring(0, 12); // Remove leading '/'
      return (
        <Link href={`/containers/${row.original.Id}`} className="hover:underline font-medium" title={displayName}>
          {displayName}
        </Link>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => <div className="flex justify-start"><ContainerActions container={row.original} /></div>,
    enableSorting: false, enableHiding: false,
  },
  {
    accessorKey: "State",
    header: ({ column }) => <DataTableColumnHeader column={column} title="State" />,
    cell: ({ row }) => {
      const state = row.getValue("State") as string;
      return <Badge variant={getStatusVariant(state)} className="whitespace-nowrap">{state}</Badge>;
    },
  },
  {
    accessorKey: "Status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => <div className="text-xs" title={row.getValue("Status")}>{row.getValue("Status")}</div>,
  },
  {
    accessorKey: "Image",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Image" />,
    cell: ({ row }) => {
      const image = row.getValue("Image") as string;
      return <div className="font-mono text-xs" title={image}>{image}</div>;
    },
  },
  {
    accessorKey: "Ports",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Ports" />,
    cell: ({ row }) => <div className="font-mono text-xs" title={formatPorts(row.original.Ports)}>{formatPorts(row.original.Ports)}</div>,
  },
  {
    accessorKey: "Created",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => {
      const created = row.getValue("Created") as number;
      return <div>{formatTimeAgo(new Date(created * 1000))}</div>;
    },
  },
  {
    id: "shortId",
    accessorKey: "Id",
    header: ({ column }) => <DataTableColumnHeader column={column} title="ID" />,
    cell: ({ row }) => {
      const id = row.original.Id as string | undefined;
      return (
        <div className="font-mono text-xs" title={id}>
          {id ? id.substring(0, 12) : "---"}
        </div>
      );
    },
    enableHiding: true,
  },
  // Optional columns (can be hidden by default)
  {
    accessorKey: "Command",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Command" />,
    cell: ({ row }) => {
      const command = row.getValue("Command") as string;
      return <div className="font-mono text-xs" title={command}>{command.substring(0, 25)}</div>;
    },
    enableHiding: true,
  },
  {
    accessorKey: "NetworkSettings",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Networks" />,
    cell: ({ row }) => {
      const ns = row.original.NetworkSettings;
      const networkNames = ns?.Networks ? Object.keys(ns.Networks).join(", ") : "-";
      return <div className="text-xs" title={networkNames}>{networkNames}</div>;
    },
    enableHiding: true,
  },
  {
    accessorKey: "SizeRw",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Size RW" />,
    cell: ({ row }) => {
        const sizeRw = row.getValue("SizeRw") as number | undefined;
        return <div className="text-xs">{sizeRw ? formatBytes(sizeRw) : "-"}</div>;
    },
    enableHiding: true,
  },
]; 