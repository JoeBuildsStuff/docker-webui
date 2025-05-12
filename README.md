## Project Overview

This Docker Dashboard provides a clean, intuitive interface for managing your local Docker environment. It allows you to:

1. **Monitor Docker resources** with a comprehensive dashboard showing containers, images, volumes, and networks
2. **Manage containers** - start, stop, restart, and remove containers with a simple UI
3. **View container logs and details** in real-time
4. **Manage images, volumes, and networks** with dedicated views


## Key Features

- **Dashboard View**: Shows summary statistics of your Docker environment
- **Container Management**: List, inspect, and control containers
- **Image Management**: View and remove Docker images
- **Volume & Network Management**: Manage Docker volumes and networks
- **Real-time Logs**: View container logs directly in the UI


## Technical Implementation

The application is built with:

- **Next.js App Router**: For routing and server components
- **Server Components**: For data fetching directly from the Docker daemon
- **Client Components**: For interactive UI elements
- **Docker CLI Integration**: Uses `child_process.exec` to communicate with Docker


## How It Works

The application communicates with Docker through the Docker CLI, executing commands like `docker ps`, `docker logs`, etc. The results are parsed and displayed in a user-friendly interface.

To run this application, you'll need:

1. Docker installed and running on your machine
2. Node.js and npm/pnpm installed
3. Permissions to execute Docker commands