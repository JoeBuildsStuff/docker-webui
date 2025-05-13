import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Helper to parse multi-JSON output (one JSON object per line)
function parseMultiJson(stdout: string): Record<string, unknown>[] {
  if (!stdout.trim()) {
    return [];
  }
  return stdout
    .trim()
    .split('\n')
    .map(line => {
      try {
        return JSON.parse(line);
      } catch (_e) { // Use _e to denote unused variable
        console.warn('Skipping line that failed to parse as JSON:', line, _e);
        return null; // Return null for lines that fail to parse
      }
    })
    .filter(item => item !== null) as Record<string, unknown>[]; // Filter out nulls and assert type
}

export async function GET() {
  try {
    // Fetch all images in JSON format
    const { stdout, stderr } = await execAsync('docker images --format "{{json .}}"');

    if (stderr) {
      console.error('Error executing docker images:', stderr);
      // Decide if stderr always means failure or sometimes just warnings
      // For now, let's return an error if stderr is not empty
      return NextResponse.json({ error: `Docker command failed: ${stderr}` }, { status: 500 });
    }

    const images = parseMultiJson(stdout);

    // You might want to map/transform the data structure here
    // if the default docker images output doesn't perfectly match your frontend needs.
    // For example, 'CreatedAt' might be a string timestamp or 'CreatedSince' a string
    // that you might want to parse or convert.
    // 'Size' is also a string like "142MB" which is likely fine.
    // 'ID' might need to be prefixed with 'sha256:' if not already present and your UI expects it.
    // Docker's json output for images typically includes:
    // {
    //   "Containers": "N/A", (or count if used)
    //   "CreatedAt": "2023-10-26 10:00:00 -0700 PDT",
    //   "CreatedSince": "5 months ago",
    //   "Digest": "<none>", (or actual digest)
    //   "ID": "a6bd71f48f68", (this is a short ID)
    //   "Repository": "nginx",
    //   "SharedSize": "N/A",
    //   "Size": "142MB",
    //   "Tag": "latest",
    //   "UniqueSize": "N/A",
    //   "VirtualSize": "142.0MB"
    // }
    // We will need to ensure the ID field is unique and long enough if we were using short IDs.
    // The mock data uses a long ID. `docker images --format "{{json .}}"` provides a short ID.
    // For now, we'll use the short ID and adjust the UI if needed, or change the command
    // to `docker images --format "{{json .}}" --digests` if we need the full digest for uniqueness,
    // or `docker inspect` each image for its full ID if the short ID is not sufficient.
    // The current mock data uses `ID: "sha256:a6bd71f48f6839d9faae1f29d3babef831e76bc213107682c5cc80f0cbb30866"`
    // The `docker images` command gives short ID. Let's get the full ID using `docker inspect`
    // or more simply, use `ImageID` from the format.
    // No, `docker images --format "{{json .}}"` already provides `ID` as the full image ID.
    // The `CreatedAt` in mock data is a Unix timestamp, but `docker images` gives a string.
    // We'll need to parse this or adjust the `formatTimeAgo` function.
    // The `docker images` json format gives `CreatedAt` like "2024-01-15 10:50:41 -0800 PST"
    // and `CreatedSince` like "3 weeks ago".
    // Let's adjust the command to get a parseable date or use CreatedSince directly.
    // `docker images --format '{"ID":"{{.ID}}", "Repository":"{{.Repository}}", "Tag":"{{.Tag}}", "CreatedSince":"{{.CreatedSince}}", "Size":"{{.Size}}"}'`
    // The current code will parse the `CreatedAt` field which is a string, this will likely fail in `formatTimeAgo`.
    // The mock data used `CreatedAt: 1652184000` (unix timestamp)
    // `docker images --format '{"ID":"{{.ID}}", "Repository":"{{.Repository}}", "Tag":"{{.Tag}}", "CreatedAt":"{{.CreatedAt}}", "Size":"{{.Size}}"}'`
    // The `CreatedAt` field from `docker images --format "{{json .}}"` is a string like "2023-03-16 13:02:08 +0000 UTC".
    // We can parse this on the client.

    return NextResponse.json(images);

  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred while fetching Docker images.';
    if (error instanceof Error) {
      if ('stderr' in error && typeof error.stderr === 'string' && error.stderr) {
        errorMessage = `Docker command error: ${error.stderr}`;
      } else if ('stdout' in error && typeof error.stdout === 'string' && error.stdout) {
        errorMessage = `Docker command output error: ${error.stdout}`;
      } else {
         errorMessage = error.message;
      }
    }
    console.error('[API /images] Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// POST handler for pulling a new image
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const imageName = body.imageName;

    if (!imageName || typeof imageName !== 'string') {
      return NextResponse.json({ error: 'Image name is required in the request body' }, { status: 400 });
    }

    // Basic validation: Check for potentially unsafe characters.
    // A more robust validation might involve stricter regex or allowlisting.
    if (!/^[a-zA-Z0-9_.:/-]+$/.test(imageName)) {
      return NextResponse.json({ error: 'Invalid image name format' }, { status: 400 });
    }

    console.log(`Attempting to pull image: ${imageName}`);
    const { stdout, stderr } = await execAsync(`docker pull ${imageName}`);

    if (stderr) {
       // Docker pull often shows progress in stderr, which isn't necessarily an error.
       // It might also contain actual errors like "repository not found".
       // We need to be careful distinguishing progress/info from real errors.
       console.warn(`[API /images POST] Docker pull stderr for ${imageName}: ${stderr}`);
       // Let's check for common failure indicators
       if (stderr.includes("pull access denied") || stderr.includes("repository does not exist") || stderr.includes("manifest not found")) {
          return NextResponse.json({ error: `Failed to pull image: ${stderr}` }, { status: 400 }); // Or 404?
       }
       // If stderr contains text but not a clear error, it might just be progress info.
       // We'll proceed but log the stderr.
    }

    console.log(`[API /images POST] Docker pull stdout for ${imageName}: ${stdout}`);
    // The stdout usually confirms the image is up to date or downloaded.
    return NextResponse.json({ message: `Image ${imageName} pulled successfully`, output: stdout || stderr }, { status: 200 });

  } catch (error: unknown) {
    let errorMessage = 'An unknown error occurred while pulling the Docker image.';
    // Using the same ExecError type as in the DELETE route
    interface ExecError extends Error {
      stderr?: string;
      stdout?: string;
    }
    if (error instanceof Error) {
        errorMessage = error.message;
        const execError = error as ExecError;
        if (execError.stderr) {
            errorMessage = `Docker command error: ${execError.stderr}`;
        } else if (execError.stdout) {
            errorMessage = `Docker command output (error context): ${execError.stdout}`;
        }
    }
    console.error('[API /images POST] Error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 