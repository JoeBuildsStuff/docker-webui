"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { NetworkActions } from "./network-actions"
import { NetworksSkeleton } from "./networks-skeleton"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Interface based on `docker network ls --format "{{json .}}"` output
interface DockerNetwork {
  ID: string;
  Name: string;
  Driver: string;
  Scope: string;
  // Subnet is not available from `docker network ls`
}

export function NetworksList() {
  const [networks, setNetworks] = useState<DockerNetwork[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNetworks() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/networks');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data: DockerNetwork[] = await response.json();
        setNetworks(data);
      } catch (e: unknown) {
         if (e instanceof Error) {
           setError(e.message);
         } else {
           setError("An unknown error occurred while fetching networks.");
         }
         console.error("Failed to fetch networks:", e);
         setNetworks([]); // Clear networks on error
      } finally {
        setLoading(false);
      }
    }

    fetchNetworks();
    // Optional: Add interval refresh if needed
    // const intervalId = setInterval(fetchNetworks, 30000);
    // return () => clearInterval(intervalId);
  }, []);

  // Loading State
  if (loading) {
    return <NetworksSkeleton />;
  }

  // Error State
  if (error) {
     return (
       <Alert variant="destructive">
         <AlertCircle className="h-4 w-4" />
         <AlertTitle>Error Loading Networks</AlertTitle>
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
            <TableHead>Scope</TableHead>
            <TableHead>Subnet</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {networks.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No networks found.
              </TableCell>
            </TableRow>
          ) : (
            networks.map((network) => (
              <TableRow key={network.ID}>
                <TableCell className="font-medium">{network.Name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{network.Driver}</Badge>
                </TableCell>
                <TableCell>{network.Scope}</TableCell>
                <TableCell className="font-mono text-xs">{"-"} {/* Subnet data unavailable */}</TableCell>
                <TableCell className="text-right">
                  <NetworkActions id={network.ID} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
