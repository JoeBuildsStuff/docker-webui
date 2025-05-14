
export default async function DockerPage() {
    const networks = await fetch(process.env.NEXT_PUBLIC_SITE_URL + '/api/dockerode');
    const networksData = await networks.json();

    return (
        <div>
            <h1>Docker</h1>
            <pre>{JSON.stringify(networksData, null, 2)}</pre>
        </div>
    )
}
