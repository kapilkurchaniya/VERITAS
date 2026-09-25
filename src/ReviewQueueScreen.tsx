import { 
  ChevronDown, 
  LayoutDashboard, 
  ClipboardCheck, 
  CalendarDays, 
  ChartNoAxesCombined, 
  TriangleAlert, 
  BrainCircuit, 
  History, 
  ChevronRight, 
  Search, 
  Bell, 
  Download,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ReviewQueueScreen() {
  return (
    <div className="min-h-screen bg-background font-['IBM_Plex_Sans'] text-foreground">
      {/* Sidebar Shell */}
      <aside className="fixed inset-y-0 left-0 z-20 flex w-[236px] flex-col border-r border-border bg-sidebar">
        <div className="flex h-16 items-center border-b border-border px-6">
          <span className="text-lg font-semibold tracking-[0.18em] text-foreground flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-primary flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 text-white" />
            </span>
            VERITAS
          </span>
        </div>

        <div className="border-b border-border p-4">
          <button type="button" className="flex w-full items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2.5 text-left shadow-sm">
            <span className="min-w-0">
              <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Project</span>
              <span className="mt-1 block truncate text-sm font-medium text-foreground">Northline Civic Center</span>
            </span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4" aria-label="Primary navigation">
          <a href="#" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-all">
            <LayoutDashboard className="h-4 w-4 shrink-0" />
            <span>Dashboard</span>
          </a>
          <a href="#" className="flex items-center gap-3 rounded-md bg-white border border-border px-3 py-2.5 text-sm font-medium text-primary shadow-sm">
            <ClipboardCheck className="h-4 w-4 shrink-0" />
            <span>Review Queue</span>
          </a>
          <a href="#" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-all">
            <CalendarDays className="h-4 w-4 shrink-0" />
            <span>Schedule</span>
          </a>
          <a href="#" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-all">
            <ChartNoAxesCombined className="h-4 w-4 shrink-0" />
            <span>Variance</span>
          </a>
          <a href="#" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-all">
            <TriangleAlert className="h-4 w-4 shrink-0" />
            <span>Risks & Alerts</span>
          </a>
          <a href="#" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-all">
            <BrainCircuit className="h-4 w-4 shrink-0" />
            <span>Project Memory</span>
          </a>
          <a href="#" className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-all">
            <History className="h-4 w-4 shrink-0" />
            <span>Audit Trail</span>
          </a>
        </nav>
      </aside>

      {/* Header Shell */}
      <header className="fixed inset-x-0 top-0 z-10 ml-[236px] flex h-16 items-center justify-between border-b border-border bg-card px-8 shadow-sm">
        <div className="flex min-w-0 items-center gap-2 text-sm">
          <span className="text-muted-foreground">Project</span>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
          <span className="truncate font-medium text-foreground">Northline Civic Center</span>
        </div>

        <div className="flex items-center gap-5">
          <label className="relative block">
            <span className="sr-only">Search</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input type="search" placeholder="Search" className="h-9 w-56 rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:ring-1 focus:ring-primary transition-all" />
          </label>
          <button type="button" aria-label="Notifications" className="relative rounded-md p-2 text-muted-foreground hover:bg-muted transition-all">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
          </button>
          <button type="button" className="flex items-center gap-3 border-l border-border pl-5 text-left">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary">MC</span>
            <span className="hidden min-w-0 lg:block">
              <span className="block text-sm font-medium text-foreground">Maya Chen</span>
              <span className="block text-xs text-muted-foreground">PM/Admin</span>
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-[236px] pt-16 min-h-screen">
        <div className="mx-auto max-w-[1140px] px-8 py-8">
          
          {/* Page Intro Row */}
          <div className="flex items-end justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">Review queue</h1>
              <p className="mt-2 text-sm text-muted-foreground">18 field submissions require validation</p>
            </div>
            <div className="flex items-center gap-4">
              <button className="btn btn-outline shadow-sm text-sm font-medium px-4 py-2 border-primary text-primary hover:bg-primary hover:text-white rounded-md transition-all">
                Saved views
              </button>
              <span className="text-xs text-muted-foreground">Last updated 2 min ago</span>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-card border border-border rounded-lg p-4 shadow-sm flex flex-col justify-between">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Awaiting review</p>
              <p className="text-2xl font-semibold mt-2">18</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 shadow-sm flex flex-col justify-between">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">High confidence</p>
              <p className="text-2xl font-semibold text-primary mt-2">6</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 shadow-sm flex flex-col justify-between">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Needs correction</p>
              <p className="text-2xl font-semibold text-destructive mt-2">4</p>
            </div>
            <div className="bg-card border border-border rounded-lg p-4 shadow-sm flex flex-col justify-between">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Due today</p>
              <p className="text-2xl font-semibold mt-2">2</p>
            </div>
          </div>

          {/* Filters & Segmented Control */}
          <div className="flex items-end gap-4 mb-6 pb-6 border-b border-border flex-wrap">
            <div className="flex flex-col gap-2 min-w-[140px]">
              <span className="text-xs font-medium text-muted-foreground">Location</span>
              <select className="input cursor-pointer">
                <option value="all">All locations</option>
                <option value="level2">Level 2 east wing</option>
              </select>
            </div>
            <div className="flex flex-col gap-2 min-w-[140px]">
              <span className="text-xs font-medium text-muted-foreground">Discipline</span>
              <select className="input cursor-pointer">
                <option value="all">All disciplines</option>
                <option value="structural">Structural</option>
                <option value="civil">Civil</option>
              </select>
            </div>
            <div className="flex flex-col gap-2 min-w-[140px]">
              <span className="text-xs font-medium text-muted-foreground">Status</span>
              <select className="input cursor-pointer">
                <option value="any">Any status</option>
                <option value="pending">Pending</option>
                <option value="verified">Verified</option>
              </select>
            </div>
            <div className="flex flex-col gap-2 min-w-[172px]">
              <span className="text-xs font-medium text-muted-foreground">Date range</span>
              <select className="input cursor-pointer">
                <option value="jun10-18">Jun 10 to Jun 18</option>
              </select>
            </div>
            
            <button className="btn btn-primary ml-auto shadow-sm gap-2">
              <Download className="w-4 h-4" />
              Export queue
            </button>
          </div>

          {/* Segmented Control */}
          <div className="flex items-center gap-1 bg-muted p-1 rounded-md w-fit mb-4">
            <button className="px-3 py-1.5 text-sm font-medium bg-card shadow-sm rounded text-foreground">
              All submissions 18
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all">
              Pending 12
            </button>
            <button className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-all">
              Reviewed 6
            </button>
          </div>

          {/* Table */}
          <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-muted text-muted-foreground font-medium border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-medium">Submission</th>
                    <th className="px-4 py-3 font-medium">Field input</th>
                    <th className="px-4 py-3 font-medium">Activity match</th>
                    <th className="px-4 py-3 font-medium">Confidence</th>
                    <th className="px-4 py-3 font-medium">Submitted</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    { id: 'SUB-1048', loc: 'Level 2 east wing', input: 'Rebar cage tied and inspected', match: 'L2 structural steel', conf: '94%', date: 'Jun 18, 09:42', status: 'Pending', confColor: 'text-primary', confBg: 'bg-primary/10' },
                    { id: 'SUB-1047', loc: 'Level 2 slab', input: 'Concrete pour sequence started', match: 'L2 slab pour', conf: '88%', date: 'Jun 18, 08:15', status: 'Verified', confColor: 'text-success', confBg: 'bg-green-100' },
                    { id: 'SUB-1046', loc: 'Utility trench', input: 'Trenching complete', match: 'Site works - trenching', conf: '92%', date: 'Jun 17, 16:30', status: 'Pending', confColor: 'text-primary', confBg: 'bg-primary/10' },
                    { id: 'SUB-1045', loc: 'North facade', input: 'Scaffolding issues', match: 'Facade access setup', conf: '45%', date: 'Jun 17, 14:10', status: 'Pending', confColor: 'text-warning', confBg: 'bg-yellow-100', icon: <AlertCircle className="w-3 h-3 text-warning inline-block mr-1"/> },
                    { id: 'SUB-1044', loc: 'Loading dock', input: 'Materials received', match: 'Delivery - steel', conf: '96%', date: 'Jun 17, 11:20', status: 'Verified', confColor: 'text-success', confBg: 'bg-green-100' },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-muted/50 transition-colors cursor-pointer group">
                      <td className="px-4 py-3 align-top">
                        <a href="#" className="text-primary font-medium group-hover:underline">{row.id}</a>
                        <span className="block mt-1 text-xs text-muted-foreground">{row.loc}</span>
                      </td>
                      <td className="px-4 py-3 align-top max-w-[200px] truncate">{row.input}</td>
                      <td className="px-4 py-3 align-top font-medium">{row.match}</td>
                      <td className="px-4 py-3 align-top">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${row.confBg} ${row.confColor}`}>
                          {row.icon}
                          {row.conf}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top text-xs text-muted-foreground whitespace-nowrap">{row.date}</td>
                      <td className="px-4 py-3 align-top">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${row.status === 'Verified' ? 'bg-[#dcfce7] text-[#008236]' : 'bg-[#ffedd5] text-[#c2410c]'}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <a href="#" className="text-primary font-medium hover:underline text-sm">Review</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Footer note */}
            <div className="bg-background/50 border-t border-border px-4 py-3 text-xs text-muted-foreground flex justify-between items-center">
              <span>Showing 5 of 18 submissions · Sorted by newest</span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
