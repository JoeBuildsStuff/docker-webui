import { NextResponse } from 'next/server';
import Dockerode from 'dockerode';

export async function GET() {
    const docker = new Dockerode(); // Defaults to /var/run/docker.sock or Windows equivalent
    try {
        const info = await docker.info();
        return NextResponse.json(info);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Failed to list Docker networks', error: (error as Error).message }, { status: 500 });
    }
}