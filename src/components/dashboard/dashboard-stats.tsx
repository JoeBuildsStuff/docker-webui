"use client"

import { useEffect, useState } from "react";
import { Box, Boxes, HardDrive, Play, Power, Server } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardSkeleton } from "./dashboard-skeleton";

// Define a type for your stats
interface DockerStats {
  runningContainers: number;
  stoppedContainers: number;
  images: number;
  volumes: number;
  networks: number;
  dockerVersion: string;
  os: string;
  cpus: number;
  memory: string;
  cpuUsage: number;
  memoryUsage: number;
}

const initialStats: DockerStats = {
  runningContainers: 0,
  stoppedContainers: 0,
  images: 0,
  volumes: 0,
  networks: 0,
  dockerVersion: "N/A",
  os: "N/A",
  cpus: 0,
  memory: "N/A",
  cpuUsage: 0,
  memoryUsage: 0,
};

export function DashboardStats() {
  const [stats, setStats] = useState<DockerStats>(initialStats);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/docker-stats');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data: DockerStats = await response.json();
        setStats(data);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("An unknown error occurred while fetching stats.");
        }
        console.error("Failed to fetch stats:", e);
        // Keep initialStats or some default error state if prefered
        setStats(initialStats); 
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // Optional: set up an interval to refresh data periodically
    // const intervalId = setInterval(fetchData, 5000); // every 5 seconds
    // return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <DashboardSkeleton />
    );
  }

  if (error) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive-foreground">{error}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Please ensure Docker Desktop is running and the API can execute Docker commands.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Running Containers</CardTitle>
          <Play className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.runningContainers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Stopped Containers</CardTitle>
          <Power className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.stoppedContainers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Images</CardTitle>
          <Box className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.images}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Volumes</CardTitle>
          <HardDrive className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.volumes}</div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Info</CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Docker Version</p>
              <p className="text-sm font-medium">{stats.dockerVersion}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">OS</p>
              <p className="text-sm font-medium">{stats.os}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">CPU</p>
              <p className="text-sm font-medium">{stats.cpus} CPUs</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Memory</p>
              <p className="text-sm font-medium">{stats.memory}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resource Usage</CardTitle>
          <Boxes className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">CPU Usage</span>
                <span className="font-medium">{stats.cpuUsage}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary" style={{ width: `${stats.cpuUsage}%` }} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Memory Usage</span>
                <span className="font-medium">{stats.memoryUsage}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary" style={{ width: `${stats.memoryUsage}%` }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
