"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { VolumeActions } from "./volume-actions"
import { VolumesSkeleton } from "./volumes-skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Interface based on `docker volume ls --format "{{json .}}"` output
interface DockerVolume {
  Name: string;
  Driver: string;
  Mountpoint: string;
  // Other fields like Labels, Scope, etc. are available if needed
}

export function VolumesList() {
  const [volumes, setVolumes] = useState<DockerVolume[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVolumes() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/volumes');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data: DockerVolume[] = await response.json();
        setVolumes(data);
      } catch (e: unknown) {
         if (e instanceof Error) {
           setError(e.message);
         } else {
           setError("An unknown error occurred while fetching volumes.");
         }
         console.error("Failed to fetch volumes:", e);
         setVolumes([]); // Clear volumes on error
      } finally {
        setLoading(false);
      }
    }

    fetchVolumes();
    // Optional: Add interval refresh if needed
    // const intervalId = setInterval(fetchVolumes, 30000);
    // return () => clearInterval(intervalId);
  }, []);

  // Loading State
  if (loading) {
    return <VolumesSkeleton />;
  }

  // Error State
  if (error) {
     return (
       <Alert variant="destructive">
         <AlertCircle className="h-4 w-4" />
         <AlertTitle>Error Loading Volumes</AlertTitle>
         <AlertDescription>
           {error}
           <p className="text-xs text-muted-foreground mt-1">
             Please ensure Docker is running and accessible.
           </p>
         </AlertDescription>
       </Alert>
     );
   }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Mountpoint</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {volumes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center">
                No volumes found.
              </TableCell>
            </TableRow>
          ) : (
            volumes.map((volume) => (
              <TableRow key={volume.Name}>
                <TableCell className="font-medium">{volume.Name}</TableCell>
                <TableCell>{volume.Driver}</TableCell>
                <TableCell className="font-mono text-xs">{volume.Mountpoint || "-"}</TableCell>
                <TableCell className="text-right">
                  <VolumeActions name={volume.Name} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
