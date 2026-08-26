import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTeamToken, getTeamDashboard, submitStageLinks } from "@/lib/backend-api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle2, Clock, Github, ExternalLink, Presentation, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

export default function ParticipantDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [pptLink, setPptLink] = useState("");
  const [repoLink, setRepoLink] = useState("");

  const token = getTeamToken();
  const teamCode = token ? token.split(":")[1] : null;

  useEffect(() => {
    if (!token || !teamCode) {
      navigate("/hackathons");
    }
  }, [token, teamCode, navigate]);

  const { data: dashboard, isLoading } = useQuery({
    queryKey: ["team_dashboard", teamCode],
    queryFn: () => getTeamDashboard(teamCode as string),
    enabled: !!teamCode,
  });

  // Sync state when data loads
  useEffect(() => {
    if (dashboard) {
      setPptLink(dashboard.ppt_link || "");
      setRepoLink(dashboard.repo_url || "");
    }
  }, [dashboard]);

  const mutation = useMutation({
    mutationFn: () => submitStageLinks(teamCode as string, pptLink, repoLink),
    onSuccess: () => {
      toast.success("Submissions updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["team_dashboard", teamCode] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update submissions");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#080c14] flex items-center justify-center text-white">Loading dashboard...</div>;
  }

  if (!dashboard) return null;

  const status = dashboard.evaluation_status || "PENDING";
  const problemStatement = dashboard.problem_statement || "No problem statement assigned yet. Please check back later.";

  return (
    <div className="min-h-screen bg-[#080c14] text-foreground">
      <Navbar />
      
      <div className="max-w-5xl mx-auto px-4 py-24 space-y-8 animate-in fade-in duration-500">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 tracking-tight">
              {dashboard.team_name}
            </h1>
            <p className="text-muted-foreground mt-1 text-lg">{dashboard.event_name} • {dashboard.institution}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-3 flex flex-col items-end backdrop-blur-sm">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-1">Team Code</span>
            <span className="text-xl font-mono text-indigo-400 font-bold">{dashboard.team_code}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Submission Form */}
          <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleSubmit}>
              
              {/* STAGE 1: PPT Submission */}
              <Card className="bg-card/30 border-white/10 backdrop-blur-md mb-8 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Presentation className="h-5 w-5 text-indigo-400" />
                    Stage 1: Presentation
                  </CardTitle>
                  <CardDescription>Submit the link to your slide deck (e.g., Google Slides, Canva, Pitch).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-black/40 border border-white/5 mb-4">
                    <h4 className="text-sm font-semibold text-indigo-300 uppercase tracking-wider mb-2">Problem Statement</h4>
                    <p className="text-neutral-300 text-sm leading-relaxed">{problemStatement}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="pptLink">Presentation URL</Label>
                    <Input 
                      id="pptLink" 
                      placeholder="https://docs.google.com/presentation/..." 
                      value={pptLink}
                      onChange={(e) => setPptLink(e.target.value)}
                      className="bg-background/50 border-white/10 focus:border-indigo-500"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* STAGE 2: GitHub Submission */}
              <Card className="bg-card/30 border-white/10 backdrop-blur-md mb-8 overflow-hidden relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Code2 className="h-5 w-5 text-purple-400" />
                    Stage 2: Source Code
                  </CardTitle>
                  <CardDescription>Submit the link to your project's code repository.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 rounded-lg bg-black/40 border border-white/5 mb-4">
                    <h4 className="text-sm font-semibold text-purple-300 uppercase tracking-wider mb-2">Problem Statement</h4>
                    <p className="text-neutral-300 text-sm leading-relaxed">{problemStatement}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="repoLink">Repository URL</Label>
                    <Input 
                      id="repoLink" 
                      placeholder="https://github.com/..." 
                      value={repoLink}
                      onChange={(e) => setRepoLink(e.target.value)}
                      className="bg-background/50 border-white/10 focus:border-purple-500"
                    />
                  </div>
                </CardContent>
              </Card>

              <Button 
                type="submit" 
                size="lg"
                disabled={mutation.isPending}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02]"
              >
                {mutation.isPending ? "Saving..." : "Save Submissions"}
              </Button>
            </form>
          </div>

          {/* Sidebar / Evaluation Status */}
          <div className="space-y-6">
            <Card className="bg-card/30 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-xl">Evaluation Status</CardTitle>
              </CardHeader>
              <CardContent>
                {status === "PENDING" ? (
                  <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-orange-950/20 border border-orange-900/30 text-center">
                    <div className="h-12 w-12 rounded-full bg-orange-900/50 flex items-center justify-center mb-4">
                      <Clock className="h-6 w-6 text-orange-400 animate-pulse" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">Under Evaluation</h3>
                    <p className="text-sm text-neutral-400">The jury is currently reviewing your project. Scores will appear here once finalized.</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-green-950/20 border border-green-900/30 text-center">
                    <div className="h-12 w-12 rounded-full bg-green-900/50 flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-6 w-6 text-green-400" />
                    </div>
                    <h3 className="text-white font-bold text-lg mb-1">Evaluated</h3>
                    <p className="text-sm text-neutral-400 mb-4">Your project has been successfully reviewed by the jury.</p>
                    
                    <div className="w-full bg-black/40 rounded-lg p-4 border border-white/5">
                      <span className="block text-xs text-neutral-500 font-bold uppercase tracking-wider mb-1">Total Score</span>
                      <span className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-green-400 to-emerald-600">
                        {dashboard.total_score || "0"}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-8 space-y-4">
                  <h4 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider border-b border-white/10 pb-2">Checklist</h4>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-400">Team Registered</span>
                    <span className="text-green-400 flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4"/> Done</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-400">Stage 1 Submission</span>
                    {dashboard.ppt_link ? (
                      <span className="text-green-400 flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4"/> Submitted</span>
                    ) : (
                      <span className="text-orange-400 flex items-center gap-1.5"><Clock className="h-4 w-4"/> Pending</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-neutral-400">Stage 2 Submission</span>
                    {dashboard.repo_url ? (
                      <span className="text-green-400 flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4"/> Submitted</span>
                    ) : (
                      <span className="text-orange-400 flex items-center gap-1.5"><Clock className="h-4 w-4"/> Pending</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
}
