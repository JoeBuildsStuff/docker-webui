import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Note: Pagination skeleton is inlined here, assuming no shared component exists

interface DataTableContainersSkeletonProps {
  columnCount: number
  rowCount?: number
}

export function DataTableContainersSkeleton({
  columnCount,
  rowCount = 10, // Default number of skeleton rows
}: DataTableContainersSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Skeleton for Header (Actions + View Options) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-[90px]" /> {/* Refresh Button */}
          <Skeleton className="h-8 w-[130px]" /> {/* Add Button */}
        </div>
        <Skeleton className="h-8 w-[70px]" /> {/* View Options */}
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
        <Skeleton className="h-6 w-[100px]" /> {/* Selected row count */}
        <div className="flex items-center space-x-6 lg:space-x-8">
           <div className="flex items-center space-x-2">
             <Skeleton className="h-6 w-[100px]" /> {/* Rows per page label */}
             <Skeleton className="h-8 w-[70px]" /> {/* Rows per page select */}
           </div>
           <Skeleton className="h-6 w-[100px]" /> {/* Page count */}
           <div className="flex items-center space-x-2">
             <Skeleton className="hidden h-8 w-8 lg:flex" /> {/* First page */}
             <Skeleton className="h-8 w-8" /> {/* Prev page */}
             <Skeleton className="h-8 w-8" /> {/* Next page */}
             <Skeleton className="hidden h-8 w-8 lg:flex" /> {/* Last page */}
           </div>
        </div>
      </div>
    </div>
  )
} 