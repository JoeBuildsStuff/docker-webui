import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { NetworkActions } from "./network-actions"

// Mock data for UI demonstration
const mockNetworks = [
  {
    ID: "n1",
    Name: "bridge",
    Driver: "bridge",
    Scope: "local",
    Subnet: "172.17.0.0/16",
  },
  {
    ID: "n2",
    Name: "host",
    Driver: "host",
    Scope: "local",
    Subnet: "",
  },
  {
    ID: "n3",
    Name: "none",
    Driver: "null",
    Scope: "local",
    Subnet: "",
  },
  {
    ID: "n4",
    Name: "app_network",
    Driver: "bridge",
    Scope: "local",
    Subnet: "172.18.0.0/16",
  },
  {
    ID: "n5",
    Name: "backend_network",
    Driver: "bridge",
    Scope: "local",
    Subnet: "172.19.0.0/16",
  },
]

export function NetworksList() {
  const networks = mockNetworks

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
                <TableCell className="font-mono text-xs">{network.Subnet || "-"}</TableCell>
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
