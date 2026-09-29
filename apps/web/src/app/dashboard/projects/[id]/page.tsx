export default async function ProjectOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Project Overview</h2>
      <p className="text-white/60">
        Project ID: {id}
      </p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder cards */}
        <div className="p-6 border border-white/10 bg-white/5 rounded-lg">
          <p className="text-sm text-white/50 mb-1">Total Activities</p>
          <p className="text-3xl font-light">--</p>
        </div>
        <div className="p-6 border border-white/10 bg-white/5 rounded-lg">
          <p className="text-sm text-white/50 mb-1">Active Alerts</p>
          <p className="text-3xl font-light text-amber-500">0</p>
        </div>
      </div>
    </div>
  );
}
