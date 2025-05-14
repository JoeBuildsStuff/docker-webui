import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export function DataTableImagesSkeleton() {
  const rowCount = 10; // Number of skeleton rows to display

  return (
    <div className="w-full space-y-4">
      {/* Top Bar: Actions and View Options */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24" /> {/* Refresh button */}
          <Skeleton className="h-8 w-36" /> {/* Create Volume button */}
        </div>
        <Skeleton className="h-8 w-18" /> {/* View options button */}
      </div>

      {/* Table Skeleton */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
            <TableHead className="w-1">
                <Skeleton className="h-4 w-4 rounded-sm" /> {/* Select Checkbox */}
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-32" /> {/* Repository */}
              </TableHead>
              <TableHead className="w-[100px]">
                <Skeleton className="h-4 w-16" /> {/* Tag */}
              </TableHead>
              <TableHead className="w-[150px]">
                <Skeleton className="h-4 w-24" /> {/* Image ID */}
              </TableHead>
              <TableHead className="w-[150px]">
                <Skeleton className="h-4 w-24" /> {/* Created */}
              </TableHead>
              <TableHead className="w-[100px]">
                <Skeleton className="h-4 w-16" /> {/* Size */}
              </TableHead>
              <TableHead className="text-right w-[80px]">
                <Skeleton className="ml-auto h-4 w-20" /> {/* Actions */}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, i) => (
              <TableRow key={`skeleton-row-${i}`}>
                <TableCell>
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
                <TableCell className="flex justify-end items-end">
                  <Skeleton className="h-8 w-8 " />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between py-4">
        <Skeleton className="h-5 w-32" /> {/* Selected X of Y rows */}
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-24" /> {/* Rows per page label */}
            <Skeleton className="h-8 w-16" /> {/* Rows per page dropdown */}
          </div>
          <Skeleton className="h-5 w-20" /> {/* Page X of Y */}
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8" /> {/* First page */}
            <Skeleton className="h-8 w-8" /> {/* Previous page */}
            <Skeleton className="h-8 w-8" /> {/* Next page */}
            <Skeleton className="h-8 w-8" /> {/* Last page */}
          </div>
        </div>
      </div>
    </div>
  );
} 