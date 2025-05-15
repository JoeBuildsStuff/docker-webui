"use client"

import { useEffect, useState } from "react";
import { Cloud, Container, HardDrive, Play, Server, Cpu } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DashboardSkeleton } from "./dashboard-skeleton";
import type { DashboardStatsData } from "./types";

const initialStats: DashboardStatsData = {
  runningContainers: 0,
  pausedContainers: 0,
  stoppedContainers: 0,
  totalContainers: 0,
  images: 0,
  volumes: 0,
  networks: 0,
  dockerVersion: "N/A",
  apiVersion: "N/A",
  kernelVersion: "N/A",
  os: "N/A",
  arch: "N/A",
  cpus: 0,
  memoryTotal: "N/A",
  cpuUsagePercent: 0,
  memoryUsagePercent: 0,
  id: "N/A",
  name: "N/A",
};

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStatsData>(initialStats);
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
        const data: DashboardStatsData = await response.json();
        setStats(data);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("An unknown error occurred while fetching stats.");
        }
        console.error("Failed to fetch stats:", e);
        setStats(initialStats); 
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // const intervalId = setInterval(fetchData, 30000); // Refresh every 30 seconds
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
            <CardTitle className="text-destructive">Error Loading Docker Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Please ensure Docker is running and the application has permissions to access it.
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
          <CardTitle className="text-sm font-medium">Running</CardTitle>
          <Play className="h-5 w-5" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.runningContainers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Containers</CardTitle>
          <Container className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalContainers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Images</CardTitle>
          <Cloud className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.images}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Volumes</CardTitle>
          <HardDrive className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.volumes}</div>
        </CardContent>
      </Card>
      
      <Card className="md:col-span-2 lg:col-span-2 xl:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Version Info</CardTitle>
          <Server className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="text-sm @container">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Docker</p>
              <p className="text-sm font-medium">v{stats.dockerVersion}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">API</p>
              <p className="text-sm font-medium">v{stats.apiVersion}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">OS</p>
              <p className="text-sm font-medium">{stats.os}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Arch</p>
              <p className="text-sm font-medium">{stats.arch}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">CPUs</p>
              <p className="text-sm font-medium">{stats.cpus} Cores</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Memory</p>
              <p className="text-sm font-medium">{stats.memoryTotal}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 lg:col-span-2 xl:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Host Resources</CardTitle>
          <Cpu className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="mt-4 space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Avg. Container CPU Usage</span>
                <span className="font-medium">{stats.cpuUsagePercent.toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary transition-all duration-300 ease-in-out" style={{ width: `${stats.cpuUsagePercent}%` }} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Avg. Container Memory Usage</span>
                <span className="font-medium">{stats.memoryUsagePercent.toFixed(1)}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary transition-all duration-300 ease-in-out" style={{ width: `${stats.memoryUsagePercent}%` }} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
