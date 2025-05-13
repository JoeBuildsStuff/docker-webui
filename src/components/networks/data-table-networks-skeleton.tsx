import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface DataTableNetworksSkeletonProps {
  columnCount: number
  rowCount?: number
}

export function DataTableNetworksSkeleton({
  columnCount,
  rowCount = 10, // Default number of skeleton rows
}: DataTableNetworksSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Skeleton for Header (Actions + View Options) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-[150px]" /> {/* Refresh Button Skeleton */}
          <Skeleton className="h-8 w-[150px]" /> {/* Create Button Skeleton */}
        </div>
        <Skeleton className="h-8 w-[70px]" /> {/* View Options Skeleton */}
      </div>

      {/* Skeleton for Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: columnCount }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-6 w-full" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: columnCount }).map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Inline Skeleton for Pagination */}
      <div className="flex items-center justify-between px-2">
        {/* Skeleton for selected row count */}
        <Skeleton className="h-6 w-[100px]" />
        <div className="flex items-center space-x-6 lg:space-x-8">
           {/* Skeleton for rows per page */}
           <div className="flex items-center space-x-2">
             <Skeleton className="h-6 w-[100px]" />
             <Skeleton className="h-8 w-[70px]" />
           </div>
           {/* Skeleton for page count */}
           <Skeleton className="h-6 w-[100px]" />
           {/* Skeleton for navigation buttons */}
           <div className="flex items-center space-x-2">
             <Skeleton className="hidden h-8 w-8 lg:flex" />
             <Skeleton className="h-8 w-8" />
             <Skeleton className="h-8 w-8" />
             <Skeleton className="hidden h-8 w-8 lg:flex" />
           </div>
        </div>
      </div>
    </div>
  )
} 