import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ContainerDetailsSkeleton() {
  return (
    <Tabs defaultValue="logs">
      <TabsList>
        <TabsTrigger value="logs">Logs</TabsTrigger>
        <TabsTrigger value="inspect">Inspect</TabsTrigger>
        <TabsTrigger value="stats">Stats</TabsTrigger>
        <TabsTrigger value="env">Environment</TabsTrigger>
      </TabsList>
      <TabsContent value="logs" className="mt-4">
        <div className="rounded-md border bg-muted/50 p-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-3/4" />
          <Skeleton className="mt-2 h-4 w-5/6" />
          <Skeleton className="mt-2 h-4 w-2/3" />
        </div>
      </TabsContent>
    </Tabs>
  )
}
