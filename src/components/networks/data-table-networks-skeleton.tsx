import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableNetworksSkeletonProps {
  // columnCount: number // Will be removed, columns are now fixed
  rowCount?: number
}

export function DataTableNetworksSkeleton({
  // columnCount, // Will be removed
  rowCount = 10, // Default number of skeleton rows
}: DataTableNetworksSkeletonProps) {
  return (
    <div className="w-full space-y-4"> {/* Changed from space-y-4 to w-full space-y-4 */}
      {/* Skeleton for Header (Actions + View Options) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"> {/* Changed from space-x-2 to gap-2 */}
          <Skeleton className="h-8 w-24" /> {/* Refresh Button - adjusted size */}
          <Skeleton className="h-8 w-36" /> {/* Create Button - adjusted size */}
        </div>
        <Skeleton className="h-8 w-18" /> {/* View Options - adjusted size */}
      </div>

      {/* Skeleton for Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {/* Fixed columns similar to images/volumes skeletons */}
              <TableHead className="w-1">
                <Skeleton className="h-4 w-4 rounded-sm" /> {/* Select Checkbox */}
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-40" /> {/* Name */}
              </TableHead>
              <TableHead className="w-[100px]">
                <Skeleton className="h-4 w-20" /> {/* Driver */}
              </TableHead>
              <TableHead className="w-[100px]">
                <Skeleton className="h-4 w-20" /> {/* Scope */}
              </TableHead>
              <TableHead className="w-[200px]">
                <Skeleton className="h-4 w-48" /> {/* Attached Containers */}
              </TableHead>
              <TableHead className="text-right w-[80px]">
                <Skeleton className="ml-auto h-4 w-20" /> {/* Actions */}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rowCount }).map((_, i) => (
              <TableRow key={`skeleton-row-${i}`}> {/* Added key */}
                {/* Fixed cells matching the new headers */}
                <TableCell>
                  <Skeleton className="h-4 w-4 rounded-sm" />
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
                <TableCell className="flex justify-end items-end"> {/* Added flex justify-end items-end */}
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Inline Skeleton for Pagination - updated to match images/volumes */}
      <div className="flex items-center justify-between py-4"> {/* Added py-4 */}
        <Skeleton className="h-5 w-32" /> {/* Selected row count - adjusted size */}
        <div className="flex items-center space-x-6 lg:space-x-8">
           <div className="flex items-center space-x-2">
             <Skeleton className="h-8 w-24" /> {/* Rows per page label - adjusted size */}
             <Skeleton className="h-8 w-16" /> {/* Rows per page select - adjusted size */}
           </div>
           <Skeleton className="h-5 w-20" /> {/* Page count - adjusted size */}
           <div className="flex items-center space-x-2">
             <Skeleton className="h-8 w-8" /> {/* First page - adjusted size, removed hidden and lg:flex */}
             <Skeleton className="h-8 w-8" /> {/* Prev page - adjusted size */}
             <Skeleton className="h-8 w-8" /> {/* Next page - adjusted size */}
             <Skeleton className="h-8 w-8" /> {/* Last page - adjusted size, removed hidden and lg:flex */}
           </div>
        </div>
      </div>
    </div>
  )
} 