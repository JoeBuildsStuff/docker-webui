"use client"

import * as React from "react"
import {
  useQuery,
} from '@tanstack/react-query'
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DataTableVolumesSkeleton } from './data-table-volumes-skeleton'
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { VolumesActions } from "./volumes-actions" // Global actions (Refresh, Create)
import { DockerVolume } from "./types"
import { columns } from "./data-table-volumes-columns"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Function to fetch volumes from the API
async function fetchVolumes(): Promise<DockerVolume[]> {
  const response = await fetch('/api/volumes');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Failed to parse error from /api/volumes" }));
    throw new Error(errorData.error || `Network response was not ok. Status: ${response.status}`);
  }
  const data: DockerVolume[] = await response.json();
  return data;
}

export default function DataTableVolumes() {
  const {
    data: volumesData,
    isLoading,
    error,
  } = useQuery<DockerVolume[], Error>({
    queryKey: ['volumes'],
    queryFn: fetchVolumes,
  });

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: volumesData || [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (isLoading) return <DataTableVolumesSkeleton />;

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Docker Volumes</AlertTitle>
        <AlertDescription>
          {error.message}
          <p className="text-xs text-muted-foreground mt-1">
            Please ensure Docker is running and accessible, and the API is responding correctly.
          </p>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <VolumesActions />
        <DataTableViewOptions table={table} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id} // Use row.id provided by react-table
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} style={{ width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined }}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No volumes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div>
        <DataTablePagination table={table} />
      </div>
    </div>
  )
} 