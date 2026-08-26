import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { registerTeamV2, loginTeamV2 } from "@/lib/backend-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Register() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [isLoginMode, setIsLoginMode] = useState(false);
  
  const [formData, setFormData] = useState({
    teamCode: "",
    institution: "",
    teamName: "",
    leaderName: "",
    email: "",
    phone: "",
  });

  const registerMutation = useMutation({
    mutationFn: (data: typeof formData) => registerTeamV2(eventId || "", data),
    onSuccess: () => {
      toast.success("Team registered successfully!");
      navigate(`/hackathon/v2/dashboard`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to register team.");
    }
  });

  const loginMutation = useMutation({
    mutationFn: (data: { teamCode: string }) => loginTeamV2(eventId || "", data),
    onSuccess: () => {
      toast.success("Logged in successfully!");
      navigate(`/hackathon/v2/dashboard`);
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to login.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;
    if (isLoginMode) {
      loginMutation.mutate({ teamCode: formData.teamCode });
    } else {
      registerMutation.mutate(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-foreground flex items-center justify-center p-4">
      {/* Background styling similar to admin login but themed */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#080c14] to-[#080c14]"></div>
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-card/30 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          
          <div className="p-8">
            <div className="flex bg-background/50 p-1 rounded-lg mb-6 border border-border/50">
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${!isLoginMode ? 'bg-indigo-500/20 text-indigo-300' : 'text-muted-foreground hover:text-white'}`}
                onClick={() => setIsLoginMode(false)}
              >
                Register
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${isLoginMode ? 'bg-indigo-500/20 text-indigo-300' : 'text-muted-foreground hover:text-white'}`}
                onClick={() => setIsLoginMode(true)}
              >
                Login
              </button>
            </div>

            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60 mb-2">
                {isLoginMode ? "Team Login" : "Team Registration"}
              </h1>
              <p className="text-muted-foreground text-sm">
                {isLoginMode ? "Welcome back! Enter your team code to access the dashboard." : "Register your team to begin the hackathon."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="teamCode">Team Code</Label>
                <Input 
                  id="teamCode" 
                  name="teamCode"
                  placeholder="e.g. SHC-ORIGIN-0E0FY"
                  value={formData.teamCode}
                  onChange={handleChange}
                  required
                  className="bg-background/50 border-border/50 focus:border-indigo-500"
                />
              </div>

              {!isLoginMode && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="teamName">Team Name</Label>
                    <Input 
                      id="teamName" 
                      name="teamName"
                      placeholder="e.g. The Innovators"
                      value={formData.teamName}
                      onChange={handleChange}
                      required
                      className="bg-background/50 border-border/50 focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="institution">Institution Name</Label>
                    <Input 
                      id="institution" 
                      name="institution"
                      placeholder="e.g. University of Technology"
                      value={formData.institution}
                      onChange={handleChange}
                      required
                      className="bg-background/50 border-border/50 focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="leaderName">Leader Name</Label>
                    <Input 
                      id="leaderName" 
                      name="leaderName"
                      placeholder="Your Name"
                      value={formData.leaderName}
                      onChange={handleChange}
                      required
                      className="bg-background/50 border-border/50 focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        name="email"
                        type="email"
                        placeholder="leader@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="bg-background/50 border-border/50 focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        name="phone"
                        type="tel"
                        placeholder="+1 234 567 890"
                        value={formData.phone}
                        onChange={handleChange}
                        className="bg-background/50 border-border/50 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <Button 
                type="submit" 
                className="w-full mt-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium shadow-lg shadow-indigo-500/25"
                disabled={isLoginMode ? loginMutation.isPending : registerMutation.isPending}
              >
                {isLoginMode 
                  ? (loginMutation.isPending ? "Logging in..." : "Login") 
                  : (registerMutation.isPending ? "Registering..." : "Proceed to Dashboard")}
              </Button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
