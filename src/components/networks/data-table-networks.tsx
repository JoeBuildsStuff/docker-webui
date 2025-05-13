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
import { columns } from "./data-table-networks-columns" // Import defined columns
import { NetworksActions } from "./networks-actions" // Import global actions
// Import the new skeleton (assuming it will be created next)
import { DataTableNetworksSkeleton } from "./data-table-networks-skeleton"
import type { DockerNetwork } from "./types"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Fetcher function
async function getNetworks(): Promise<DockerNetwork[]> {
  const response = await fetch('/api/networks')
  if (!response.ok) {
    try {
      const errorData = await response.json()
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    } catch (_e) {
      // Explicitly ignore the error variable as we only care about the status code here
      throw new Error(`HTTP error! status: ${response.status}`)
    }
  }
  return response.json()
}

export function DataTableNetworks() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({}) // Needed for row selection features

  const { data, isLoading, error, isError } = useQuery<DockerNetwork[], Error>({
    queryKey: ['networks'],
    queryFn: getNetworks,
    // Optional: Add staleTime or refetchInterval if needed
    // staleTime: 5 * 60 * 1000, // 5 minutes
    // refetchInterval: 60 * 1000, // Refetch every 60 seconds
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
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // Consider adding global filter if search needed: getFilteredRowModel: getFilteredRowModel(),
  })

  // Loading State
  if (isLoading) {
    // Use the new skeleton component (will be created in next step)
    return <DataTableNetworksSkeleton columnCount={columns.length} />
  }

  // Error State
  if (isError) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Networks</AlertTitle>
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
        {/* Remove commented-out global search input */}
        {/* <Input placeholder="Filter networks..." value={(table.getColumn('Name')?.getFilterValue() as string) ?? ''} onChange={(event) => table.getColumn('Name')?.setFilterValue(event.target.value)} className="max-w-sm" /> */}
        <NetworksActions /> {/* Add global actions */} 
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
                  No networks found.
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