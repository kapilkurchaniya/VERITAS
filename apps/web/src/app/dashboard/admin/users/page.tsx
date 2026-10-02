"use client";

import { useState, useEffect, useRef } from "react";
import { api, ApiClientError } from "@/lib/api";
import { Users, Loader2, Mail, Shield, Clock, Search, MoreHorizontal, Plus, X, UserCog, UserMinus } from "lucide-react";
import { SlideDrawer } from "@/app/components/SlideDrawer";

interface UserItem {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  roles: { id: string; name: string }[];
  created_at: string;
}

const AVAILABLE_ROLES = ["ADMIN", "PLANNER", "SUPERVISOR", "PROJECT_MANAGER", "AUDITOR"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Create user drawer
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRoles, setNewRoles] = useState<string[]>(["SUPERVISOR"]);

  // Actions dropdown
  const [activeActionsId, setActiveActionsId] = useState<string | null>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  // Click outside to close actions
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setActiveActionsId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const data: any = await api("/api/v1/users");
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateUser = async () => {
    if (!newEmail.trim() || !newName.trim() || !newPassword.trim() || newRoles.length === 0) return;

    setCreating(true);
    setCreateError(null);

    try {
      await api("/api/v1/users", {
        method: "POST",
        body: {
          email: newEmail.trim(),
          full_name: newName.trim(),
          password: newPassword.trim(),
          role_names: newRoles,
        },
      });
      // Reset
      setNewEmail(""); setNewName(""); setNewPassword(""); setNewRoles(["SUPERVISOR"]);
      setShowCreate(false);
      await loadUsers();
    } catch (err) {
      if (err instanceof ApiClientError) {
        setCreateError(typeof err.detail === "string" ? err.detail : "Failed to create user");
      } else {
        setCreateError("Failed to create user");
      }
    } finally {
      setCreating(false);
    }
  };

  const toggleRole = (role: string) => {
    setNewRoles(prev => 
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const filteredUsers = users.filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">User Management</h2>
          <p className="text-muted-foreground text-sm mt-2">
            Manage system access, roles, and security permissions across the platform.
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      <div className="flex space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      <div className="border border-border bg-card rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center">
            <Users className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-lg font-medium text-foreground">No users found.</p>
            <p className="text-sm mt-1">{search ? "Try adjusting your search." : "Add users to get started."}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground border-b border-border uppercase text-xs font-semibold tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">User</th>
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Joined</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shadow-sm">
                          {user.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-base">{user.full_name}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((r) => (
                          <span
                            key={r.id}
                            className="px-2.5 py-0.5 bg-secondary text-secondary-foreground border border-border rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                          >
                            <Shield className="w-3 h-3" />
                            {r.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.is_active ? (
                        <span className="px-2.5 py-1 bg-success/10 text-success border border-success/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          Active
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-destructive/10 text-destructive border border-destructive/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap text-xs font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <div ref={activeActionsId === user.id ? actionsRef : undefined} className="relative inline-block">
                        <button
                          onClick={() => setActiveActionsId(activeActionsId === user.id ? null : user.id)}
                          className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {activeActionsId === user.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 bg-card border border-border rounded-lg shadow-xl z-20 overflow-hidden">
                            <button
                              onClick={() => { setActiveActionsId(null); /* TODO: implement edit role */ }}
                              className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors text-foreground"
                            >
                              <UserCog className="w-4 h-4 text-muted-foreground" />
                              Edit Roles
                            </button>
                            <button
                              onClick={() => { setActiveActionsId(null); /* TODO: implement deactivate */ }}
                              className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors text-destructive"
                            >
                              <UserMinus className="w-4 h-4" />
                              {user.is_active ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Drawer */}
      <SlideDrawer
        open={showCreate}
        onClose={() => { setShowCreate(false); setCreateError(null); }}
        title="Add New User"
        subtitle="Create a new user account and assign roles"
        footer={
          <div className="flex items-center justify-end gap-3">
            <button onClick={() => setShowCreate(false)} className="btn btn-ghost">Cancel</button>
            <button
              onClick={handleCreateUser}
              disabled={creating || !newEmail.trim() || !newName.trim() || !newPassword.trim() || newRoles.length === 0}
              className="btn btn-primary gap-2 disabled:opacity-50"
            >
              {creating && <Loader2 className="w-4 h-4 animate-spin" />}
              Create User
            </button>
          </div>
        }
      >
        <div className="space-y-5">
          {createError && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-lg p-3 text-sm">
              {createError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Full Name *</label>
            <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Ravi Kumar" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email *</label>
            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="e.g. ravi@company.com" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Password *</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Minimum 6 characters" className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Roles *</label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_ROLES.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => toggleRole(role)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors border ${
                    newRoles.includes(role)
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-muted text-muted-foreground border-border hover:border-primary/30"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Select at least one role</p>
          </div>
        </div>
      </SlideDrawer>
    </div>
  );
}
