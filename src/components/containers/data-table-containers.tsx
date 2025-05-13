"use client"

import * as React from "react"
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
import { useQuery } from "@tanstack/react-query"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { columns } from "./data-table-containers-columns" // Import defined columns
import { ContainersActions } from "./containers-actions" // Import global actions
// Import the new skeleton (assuming it will be created next)
import { DataTableContainersSkeleton } from "./data-table-containers-skeleton"
import type { DockerContainer } from "./types"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Fetcher function
async function getContainers(): Promise<DockerContainer[]> {
  const response = await fetch('/api/containers')
  if (!response.ok) {
    let errorMsg = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json()
      errorMsg = errorData.error || errorMsg;
    } catch {
      // Ignore failed JSON parse, or log if needed
      // console.warn("Failed to parse error response as JSON:", e);
    }
    throw new Error(errorMsg)
  }
  return response.json()
}

export function DataTableContainers() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({}) // Needed for row selection features

  const { data, isLoading, error, isError } = useQuery<DockerContainer[], Error>({
    queryKey: ['containers'],
    queryFn: getContainers,
    // Optional: Add staleTime or refetchInterval if needed
    // refetchInterval: 5000, // e.g., every 5 seconds for container status
  })

  const table = useReactTable({
    data: data ?? [], // Provide empty array as default if data is undefined
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(), // Enable basic filtering if needed later
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  // Loading State
  if (isLoading) {
    // Use the new skeleton component (will be created in next step)
    return <DataTableContainersSkeleton columnCount={8} />
  }

  // Error State
  if (isError) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Containers</AlertTitle>
        <AlertDescription>
          {error?.message || "An unknown error occurred."}
          <p className="text-xs text-muted-foreground mt-1">
            Please ensure Docker is running and accessible.
          </p>
        </AlertDescription>
      </Alert>
    )
  }

  // Success State (Render Table)
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {/* Add global search/filter input here if needed */}
        {/* <Input placeholder="Filter containers..." ... /> */}
        <ContainersActions /> {/* Add global actions */}
        <DataTableViewOptions table={table} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No containers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  )
} 