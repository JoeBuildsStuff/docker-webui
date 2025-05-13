import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import { Skeleton } from "@/components/ui/skeleton"
  
  export default function TableSkeleton() {
    return (
      <div className="w-full space-y-4 pb-10">
        {/* Toggle Collumns */}
        <div className="flex items-center justify-end">
            <Skeleton className="h-7 w-18" />
        </div>
        {/* Table */}
        <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Skeleton className="h-4 w-4" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-24" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-40" />
              </TableHead>
              <TableHead className="text-right">
                <Skeleton className="ml-auto h-4 w-20" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="w-[50px]">
                  <Skeleton className="h-4 w-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-4 w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
        {/* Pagination */}
        <div className="flex items-center justify-between px-2">
          <Skeleton className="h-3 w-40" />
          <div className="flex items-center space-x-2">
          <Skeleton className="h-3 w-22" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-3 w-20 mx-10" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>
    )
  }
  