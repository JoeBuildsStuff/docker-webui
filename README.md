# Docker Manager

<div align="center">
  <img src="https://github.com/joetaylordev/assets/raw/main/docker-manager-screenshot.png" alt="Docker Manager Dashboard" width="800"/>
</div>

A modern, intuitive web interface for managing your Docker environment. Monitor and control containers, images, volumes, and networks through a sleek, responsive dashboard.

## ✨ Features

- **Dashboard Overview**: Real-time monitoring of Docker resources and system stats
- **Container Management**
  - List, start, stop, restart, and remove containers
  - View detailed container information including logs, configuration, and stats
  - Real-time resource monitoring (CPU, memory usage)
- **Image Management**
  - List and remove Docker images
  - Pull new images from Docker Hub
- **Volume Management**
  - Create and remove Docker volumes
  - View mountpoints and other volume details
- **Network Management**
  - Create and remove Docker networks
  - View network configuration and subnet details
- **Dark/Light Mode**: Support for both dark and light themes

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/get-started) installed and running
- [Node.js](https://nodejs.org/) (v18 or newer)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/) for package management

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/docker-manager.git
   cd docker-manager
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   pnpm install
   ```

3. Start the development server
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🏗️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) with App Router
- **UI Components**: Custom components using [Tailwind CSS](https://tailwindcss.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Docker Integration**: Native Docker CLI commands via Node.js child_process

## 📝 Technical Architecture

The application uses a hybrid architecture with:

- **Server-side Components**: For data fetching directly from the Docker daemon
- **Client-side Components**: For interactive UI elements and state management
- **API Routes**: For secure communication with the Docker engine
- **Docker CLI Integration**: Executes Docker commands and parses results into structured data

## 🧩 Project Structure

```
src/
├── app/                  # Next.js App Router pages and layouts
│   ├── api/              # API routes for Docker operations
│   ├── containers/       # Container management pages
│   ├── images/           # Image management pages
│   ├── networks/         # Network management pages
│   ├── volumes/          # Volume management pages
│   └── page.tsx          # Dashboard home page
├── components/           # React components
│   ├── containers/       # Container-related components
│   ├── dashboard/        # Dashboard components
│   ├── images/           # Image-related components
│   ├── networks/         # Network-related components
│   ├── ui/               # Reusable UI components
│   └── volumes/          # Volume-related components
```

## 🔒 Security Considerations

This application executes Docker commands on your system. It's recommended to:

- Run this application only on trusted networks
- Ensure proper Docker permissions are set
- Never expose this application directly to the internet without proper authentication

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgements

- [Docker](https://www.docker.com/) for the amazing containerization platform
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Lucide Icons](https://lucide.dev/) for the beautiful SVG icons