import { Mic, Paperclip, LogOut, Map as MapIcon, Settings, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function MobileCaptureScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('capture');

  const bottomTabs = [
    { id: 'capture', name: 'Capture', icon: Mic },
    { id: 'history', name: 'History', icon: Clock },
    { id: 'map', name: 'Map', icon: MapIcon },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background font-['IBM_Plex_Sans'] text-foreground flex justify-center bg-gray-100 p-0 sm:p-8">
      {/* Mobile Device Container */}
      <div className="w-full max-w-[360px] bg-background min-h-[100dvh] sm:min-h-0 sm:h-[780px] sm:rounded-[2rem] sm:border-8 border-gray-900 overflow-hidden shadow-2xl relative flex flex-col">
        
        {/* App Bar */}
        <header className="flex items-center justify-between p-4 border-b border-border bg-background shrink-0 z-10">
          <div className="flex flex-col">
            <span className="text-base font-semibold tracking-wide text-foreground">VERITAS</span>
            <span className="text-xs text-muted-foreground mt-0.5">Northline Civic Center</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted border border-border text-xs font-semibold text-foreground">
              JR
            </div>
            <button 
              onClick={() => navigate('/login')}
              className="text-muted-foreground hover:text-foreground transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 pb-24">
          
          {activeTab === 'capture' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-6">
              {/* Capture Progress Section */}
              <section className="flex flex-col gap-3">
                <div>
                  <h1 className="text-xl font-semibold tracking-tight">Capture progress</h1>
                  <p className="text-sm text-muted-foreground mt-1">Tue, Jun 18, 2024</p>
                </div>
                
                <div className="flex flex-col gap-2 mt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">Today's field log</span>
                    <span className="text-muted-foreground">6 of 8 updates complete</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className="bg-primary w-3/4 h-full rounded-full"></div>
                  </div>
                </div>
              </section>

              {/* Recording Card */}
              <section className="bg-card border border-border rounded-xl p-5 flex flex-col items-center gap-4 shadow-sm relative">
                <div className="w-full flex justify-end">
                  <span className="bg-primary/10 text-primary text-[11px] font-medium px-2.5 py-1 rounded-full border border-primary/20">
                    Ready to record
                  </span>
                </div>
                
                <button className="w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform">
                  <Mic className="w-8 h-8" />
                </button>
                
                <div className="flex flex-col items-center gap-1 text-center">
                  <span className="text-sm font-medium">Hold to record</span>
                  <span className="text-xs text-muted-foreground">Hold for a voice note up to 2 minutes</span>
                </div>
              </section>

              {/* Manual Update Form */}
              <section className="flex flex-col gap-3">
                <label htmlFor="field-update" className="text-sm font-medium">
                  Write an update instead
                </label>
                <textarea 
                  id="field-update"
                  className="w-full bg-card border border-border rounded-lg p-3 text-sm min-h-[112px] resize-none focus:outline-none focus:border-primary transition-colors placeholder:text-muted-foreground shadow-sm"
                  placeholder="Describe completed work, blockers, or changes..."
                />
                <button className="flex items-center gap-2 text-primary font-medium text-sm py-2 px-1 w-fit hover:bg-primary/5 rounded transition-colors">
                  <Paperclip className="w-4 h-4" />
                  Add photos
                </button>
                
                <button className="w-full bg-primary text-primary-foreground font-semibold py-3 rounded-lg mt-2 shadow-sm active:bg-primary-hover transition-colors">
                  Submit update
                </button>
              </section>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col gap-6">
              {/* Site Conditions */}
              <section className="bg-card border border-border rounded-xl p-4 shadow-sm">
                <h2 className="text-sm font-semibold mb-3">Site conditions</h2>
                <div className="grid grid-cols-3 gap-2 divide-x divide-border">
                  <div className="flex flex-col gap-1 pr-2">
                    <span className="text-[11px] text-muted-foreground">Weather</span>
                    <span className="text-xs font-medium">18°C / Clear</span>
                  </div>
                  <div className="flex flex-col gap-1 px-3">
                    <span className="text-[11px] text-muted-foreground">Crew on site</span>
                    <span className="text-xs font-medium">24</span>
                  </div>
                  <div className="flex flex-col gap-1 pl-3">
                    <span className="text-[11px] text-muted-foreground">Last sync</span>
                    <span className="text-xs font-medium">09:42</span>
                  </div>
                </div>
              </section>

              {/* Recent Submissions */}
              <section className="flex flex-col gap-3 pb-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold">Recent submissions</h2>
                </div>
                
                <div className="flex flex-col bg-card border border-border rounded-xl shadow-sm overflow-hidden divide-y divide-border">
                  
                  {[
                    { time: '09:42', title: 'Rebar delivery received', status: 'Verified' },
                    { time: '08:15', title: 'Level 2 slab prep', status: 'Pending' },
                    { time: 'Yesterday', title: 'Utility trench inspection', status: 'Verified' },
                    { time: 'Yesterday', title: 'Concrete pour sequence', status: 'Pending' },
                    { time: 'Jun 16', title: 'Site fence adjustment', status: 'Verified' },
                  ].map((item, i) => (
                    <div key={i} className="p-3 flex items-center justify-between gap-3 active:bg-muted transition-colors">
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-[11px] text-muted-foreground mb-0.5">{item.time}</span>
                        <span className="text-sm font-medium truncate">{item.title}</span>
                      </div>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${
                        item.status === 'Verified' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-orange-50 text-orange-700 border-orange-200'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  ))}

                </div>
              </section>
            </div>
          )}

          {/* Placeholders for Map and Settings */}
          {(activeTab === 'map' || activeTab === 'settings') && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center h-full text-center mt-20">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-primary/20">
                {bottomTabs.find(t => t.id === activeTab)?.icon && (() => {
                  const Icon = bottomTabs.find(t => t.id === activeTab)!.icon;
                  return <Icon className="w-8 h-8" />;
                })()}
              </div>
              <h2 className="text-xl font-semibold mb-2">{bottomTabs.find(t => t.id === activeTab)?.name}</h2>
              <p className="text-muted-foreground text-sm leading-relaxed px-4">
                This feature is available in the desktop application or coming soon to mobile.
              </p>
            </div>
          )}

        </main>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 inset-x-0 h-16 bg-background border-t border-border flex items-center justify-around px-2 z-10 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
          {bottomTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'fill-primary/20 stroke-[2.5px]' : ''}`} />
                <span className="text-[10px] font-medium">{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
