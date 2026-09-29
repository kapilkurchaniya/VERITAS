"use client";

import { Settings, Save, Bell, Shield, Key, Mail, Smartphone, Monitor } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">System Settings</h2>
          <p className="text-muted-foreground text-sm mt-2">
            Manage global configuration, security policies, and integrations.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm">
          <Save className="w-4 h-4" />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Navigation/Sidebar */}
        <div className="col-span-1 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium bg-muted text-foreground transition-colors">
            <Monitor className="w-4 h-4 shrink-0" />
            General
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
            <Shield className="w-4 h-4 shrink-0" />
            Security
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
            <Bell className="w-4 h-4 shrink-0" />
            Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors">
            <Key className="w-4 h-4 shrink-0" />
            API Keys
          </button>
        </div>

        {/* Content Area */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Platform Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Platform Name</label>
                  <input type="text" defaultValue="VERITAS" className="input w-full" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Support Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="email" defaultValue="support@nexus.dev" className="input w-full pl-10" />
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Appearance</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Dark Mode</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Force dark mode across all users</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-9 h-5 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
