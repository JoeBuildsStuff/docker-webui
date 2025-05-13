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

import { DataTableImagesSkeleton } from './data-table-images-skeleton' // Renamed import
import { DataTablePagination } from "@/components/ui/data-table-pagination"
import { DataTableViewOptions } from "@/components/ui/data-table-view-options"
import { ImagesActions } from "./images-actions" // Global actions (Refresh, Pull)
import { DockerImage } from "./types"
import { columns } from "./data-table-images-columns"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Function to fetch images from the API
async function fetchImages(): Promise<DockerImage[]> {
  const response = await fetch('/api/images');
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Failed to parse error from /api/images" }));
    throw new Error(errorData.error || `Network response was not ok. Status: ${response.status}`);
  }
  const data: DockerImage[] = await response.json();
  // The backend /api/images route using `docker images --format "{{json .}}"` already gives full ID.
  // The old client-side prefixing logic might not be needed if backend guarantees full ID.
  // Let's assume the API provides IDs that are consistent for now.
  // If short IDs are sometimes returned, this mapping would be needed:
  // return data.map(img => ({ ...img, ID: img.ID.startsWith('sha256:') ? img.ID : `sha256:${img.ID}` }));
  return data;
}

export default function DataTableImages() {
  const {
    data: imagesData,
    isLoading,
    error,
    // refetch, // Can be used by a refresh button if not using queryClient.invalidateQueries
  } = useQuery<DockerImage[], Error>({
    queryKey: ['images'],
    queryFn: fetchImages,
    // staleTime: 5 * 60 * 1000, // Optional: 5 minutes
    // refetchInterval: 10 * 60 * 1000, // Optional: Refetch every 10 minutes
  });

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data: imagesData || [], // Provide empty array as default if data is undefined
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
    // autoResetPageIndex: false, // Consider this if filters/sorting change page index unexpectedly
  });

  if (isLoading) return <DataTableImagesSkeleton />;

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Docker Images</AlertTitle>
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
        <ImagesActions />
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
                  key={row.id}
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
                  No images found.
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