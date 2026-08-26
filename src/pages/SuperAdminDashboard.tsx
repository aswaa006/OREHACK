import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldAlert, Users, FolderGit2, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";

type Team = {
  id: string;
  team_name: string;
  team_id: string;
  is_active: boolean;
  hackathon_slug: string;
};

type Submission = {
  id: string;
  team_id: string;
  repository_url: string;
  status: string;
  hackathon_slug: string;
  submitted_at: string;
};

type Admin = {
  id: string;
  email: string;
  display_name: string | null;
  role: string | null;
  hackathon_slug: string | null;
};

export default function SuperAdminDashboard() {
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  
  const [loading, setLoading] = useState(true);

  // New Admin Form State
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("hackathon_admin");
  const [newAdminSlug, setNewAdminSlug] = useState("");
  const [newAdminName, setNewAdminName] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    
    const [teamsRes, subsRes, adminsRes] = await Promise.all([
      supabase.from("teams").select("*").order("created_at", { ascending: false }),
      supabase.from("submissions").select("*").order("submitted_at", { ascending: false }),
      supabase.from("admins").select("*").order("created_at", { ascending: false })
    ]);

    if (teamsRes.data) setTeams(teamsRes.data as Team[]);
    if (subsRes.data) setSubmissions(subsRes.data as Submission[]);
    if (adminsRes.data) setAdmins(adminsRes.data as Admin[]);
    
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleTeamStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from("teams").update({ is_active: !currentStatus }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setTeams(teams.map(t => t.id === id ? { ...t, is_active: !currentStatus } : t));
      toast({ title: "Success", description: "Team status updated." });
    }
  };

  const updateSubmissionStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("submissions").update({ status: newStatus }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setSubmissions(submissions.map(s => s.id === id ? { ...s, status: newStatus } : s));
      toast({ title: "Success", description: "Submission status updated." });
    }
  };

  const updateSubmissionRepo = async (id: string, newUrl: string) => {
    const { error } = await supabase.from("submissions").update({ repository_url: newUrl }).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Repository URL updated." });
    }
  };

  const addAdmin = async () => {
    if (!newAdminEmail) return toast({ title: "Error", description: "Email is required.", variant: "destructive" });

    const { data, error } = await supabase.from("admins").insert([{
      email: newAdminEmail,
      role: newAdminRole,
      hackathon_slug: newAdminSlug || null,
      display_name: newAdminName || null
    }]).select().single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else if (data) {
      setAdmins([data as Admin, ...admins]);
      setNewAdminEmail("");
      setNewAdminName("");
      setNewAdminSlug("");
      toast({ title: "Success", description: "Admin added successfully." });
    }
  };

  const deleteAdmin = async (id: string) => {
    const { error } = await supabase.from("admins").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setAdmins(admins.filter(a => a.id !== id));
      toast({ title: "Success", description: "Admin removed." });
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-primary" />
            Super Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">Manage Teams, Repositories, and System Admins across all hackathons.</p>
        </div>

        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="teams" className="flex items-center gap-2"><Users className="w-4 h-4" /> Teams ({teams.length})</TabsTrigger>
            <TabsTrigger value="repos" className="flex items-center gap-2"><FolderGit2 className="w-4 h-4" /> Repos ({submissions.length})</TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center gap-2"><ShieldAlert className="w-4 h-4" /> Admins ({admins.length})</TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            <TabsContent value="teams">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border rounded-lg bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team Name</TableHead>
                      <TableHead>Team ID</TableHead>
                      <TableHead>Hackathon</TableHead>
                      <TableHead>Status (Active)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teams.map(team => (
                      <TableRow key={team.id}>
                        <TableCell className="font-medium">{team.team_name}</TableCell>
                        <TableCell className="text-muted-foreground">{team.team_id}</TableCell>
                        <TableCell>{team.hackathon_slug}</TableCell>
                        <TableCell>
                          <Switch 
                            checked={team.is_active} 
                            onCheckedChange={() => toggleTeamStatus(team.id, team.is_active)}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    {teams.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No teams found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </motion.div>
            </TabsContent>

            <TabsContent value="repos">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border rounded-lg bg-card">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team ID</TableHead>
                      <TableHead>Repository URL</TableHead>
                      <TableHead>Hackathon</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map(sub => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">{sub.team_id}</TableCell>
                        <TableCell>
                          <Input 
                            defaultValue={sub.repository_url} 
                            onBlur={(e) => updateSubmissionRepo(sub.id, e.target.value)}
                            className="h-8 max-w-[300px]"
                          />
                        </TableCell>
                        <TableCell>{sub.hackathon_slug}</TableCell>
                        <TableCell>
                          <Select 
                            value={sub.status || "queued"} 
                            onValueChange={(val) => updateSubmissionStatus(sub.id, val)}
                          >
                            <SelectTrigger className="w-[130px] h-8">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="queued">Queued</SelectItem>
                              <SelectItem value="evaluated">Evaluated</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                    {submissions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No submissions found.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </motion.div>
            </TabsContent>

            <TabsContent value="admins">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                
                <div className="bg-card border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Add New Admin</h3>
                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="space-y-2 flex-1 min-w-[200px]">
                      <label className="text-sm font-medium">Email</label>
                      <Input value={newAdminEmail} onChange={e => setNewAdminEmail(e.target.value)} placeholder="admin@example.com" />
                    </div>
                    <div className="space-y-2 flex-1 min-w-[200px]">
                      <label className="text-sm font-medium">Display Name</label>
                      <Input value={newAdminName} onChange={e => setNewAdminName(e.target.value)} placeholder="John Doe" />
                    </div>
                    <div className="space-y-2 flex-1 min-w-[200px]">
                      <label className="text-sm font-medium">Hackathon Slug</label>
                      <Input value={newAdminSlug} onChange={e => setNewAdminSlug(e.target.value)} placeholder="Leave blank for global" />
                    </div>
                    <div className="space-y-2 flex-1 min-w-[150px]">
                      <label className="text-sm font-medium">Role</label>
                      <Select value={newAdminRole} onValueChange={setNewAdminRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="developer_admin">Developer Admin</SelectItem>
                          <SelectItem value="hackathon_admin">Hackathon Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={addAdmin} className="w-full md:w-auto">Add Admin</Button>
                  </div>
                </div>

                <div className="border rounded-lg bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Scope (Slug)</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {admins.map(admin => (
                        <TableRow key={admin.id}>
                          <TableCell className="font-medium">{admin.email}</TableCell>
                          <TableCell>{admin.display_name || "—"}</TableCell>
                          <TableCell className="capitalize">{admin.role?.replace("_", " ")}</TableCell>
                          <TableCell>{admin.hackathon_slug || <span className="text-muted-foreground italic">Global</span>}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" onClick={() => deleteAdmin(admin.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {admins.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No admins found.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </div>
    </div>
  );
}
