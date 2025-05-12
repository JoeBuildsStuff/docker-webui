import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ImageActions } from "./image-actions"

// Mock data for UI demonstration
const mockImages = [
  {
    ID: "sha256:a6bd71f48f6839d9faae1f29d3babef831e76bc213107682c5cc80f0cbb30866",
    Repository: "nginx",
    Tag: "latest",
    CreatedAt: 1652184000, // Unix timestamp
    Size: "142MB",
  },
  {
    ID: "sha256:b6bd71f48f6839d9faae1f29d3babef831e76bc213107682c5cc80f0cbb30866",
    Repository: "postgres",
    Tag: "14",
    CreatedAt: 1651184000,
    Size: "376MB",
  },
  {
    ID: "sha256:c6bd71f48f6839d9faae1f29d3babef831e76bc213107682c5cc80f0cbb30866",
    Repository: "redis",
    Tag: "alpine",
    CreatedAt: 1650184000,
    Size: "32MB",
  },
  {
    ID: "sha256:d6bd71f48f6839d9faae1f29d3babef831e76bc213107682c5cc80f0cbb30866",
    Repository: "node",
    Tag: "16",
    CreatedAt: 1649184000,
    Size: "910MB",
  },
  {
    ID: "sha256:e6bd71f48f6839d9faae1f29d3babef831e76bc213107682c5cc80f0cbb30866",
    Repository: "alpine",
    Tag: "latest",
    CreatedAt: 1648184000,
    Size: "5.6MB",
  },
]

export function ImagesList() {
  const images = mockImages

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Repository</TableHead>
            <TableHead>Tag</TableHead>
            <TableHead>Image ID</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Size</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {images.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                No images found.
              </TableCell>
            </TableRow>
          ) : (
            images.map((image) => (
              <TableRow key={image.ID}>
                <TableCell className="font-medium">{image.Repository}</TableCell>
                <TableCell>
                  <Badge variant="outline">{image.Tag}</Badge>
                </TableCell>
                <TableCell className="font-mono text-xs">{image.ID.substring(7, 19)}</TableCell>
                <TableCell>{formatTimeAgo(new Date(image.CreatedAt * 1000))}</TableCell>
                <TableCell>{image.Size}</TableCell>
                <TableCell className="text-right">
                  <ImageActions id={image.ID} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

// Simple time formatter function
function formatTimeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  let interval = seconds / 31536000
  if (interval > 1) return Math.floor(interval) + " years ago"

  interval = seconds / 2592000
  if (interval > 1) return Math.floor(interval) + " months ago"

  interval = seconds / 86400
  if (interval > 1) return Math.floor(interval) + " days ago"

  interval = seconds / 3600
  if (interval > 1) return Math.floor(interval) + " hours ago"

  interval = seconds / 60
  if (interval > 1) return Math.floor(interval) + " minutes ago"

  return Math.floor(seconds) + " seconds ago"
}
