"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ContainerActions } from "./container-actions"
import { ContainersSkeleton } from "./containers-skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Define an interface for the container data based on `docker ps` output
// Adjust this based on the exact structure returned by your API route
interface DockerContainer {
  ID: string;
  Names: string;
  Image: string;
  State: string;
  Status: string;
  CreatedAt: string; // docker ps gives a string description like "2 days ago" or a timestamp
  Ports: string;
  // Add other fields if needed based on your `docker ps --format`
}

export function ContainersList() {
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchContainers() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/containers');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data: DockerContainer[] = await response.json();
        setContainers(data);
      } catch (e: unknown) {
         if (e instanceof Error) {
           setError(e.message);
         } else {
           setError("An unknown error occurred while fetching containers.");
         }
         console.error("Failed to fetch containers:", e);
         setContainers([]); // Clear containers on error
      } finally {
        setLoading(false);
      }
    }

    fetchContainers();
    // Optional: Add interval refresh if needed
    // const intervalId = setInterval(fetchContainers, 10000); // every 10 seconds
    // return () => clearInterval(intervalId);
  }, []);


  // Loading State
  if (loading) {
    return <ContainersSkeleton />;
  }

  // Error State
  if (error) {
     return (
       <Alert variant="destructive">
         <AlertCircle className="h-4 w-4" />
         <AlertTitle>Error Loading Containers</AlertTitle>
         <AlertDescription>
           {error}
           <p className="text-xs text-muted-foreground mt-1">
             Please ensure Docker is running and accessible.
           </p>
         </AlertDescription>
       </Alert>
     );
   }

  // Data Loaded State
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Ports</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {containers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No containers found.
              </TableCell>
            </TableRow>
          ) : (
            containers.map((container) => (
              <TableRow key={container.ID}>
                <TableCell>
                  <Link href={`/containers/${container.ID}`} className="font-medium hover:underline">
                    {container.Names}
                  </Link>
                </TableCell>
                <TableCell className="font-mono text-xs">{container.Image}</TableCell>
                <TableCell>
                  <Badge variant={container.State === "running" ? "default" : "secondary"}>
                    {container.State || 'unknown'}
                  </Badge>
                </TableCell>
                <TableCell>{container.Status}</TableCell>
                <TableCell className="font-mono text-xs">{container.Ports || "-"}</TableCell>
                <TableCell className="text-right">
                  <ContainerActions id={container.ID} state={container.State} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
