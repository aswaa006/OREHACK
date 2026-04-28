import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Eye, EyeOff } from "lucide-react";
import {
  clearAdminSession,
  normalizeDashboardRole,
  resolveAdminRoute,
  storeAdminSession,
} from "@/lib/dashboard-routing";

const AdminAuth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setError("Invalid password. Access denied.");
        return;
      }

      if (data.user) {
        const { data: userProfile, error: profileError } = await supabase
          .from("users")
          .select("id, email, full_name, default_role, is_active")
          .eq("id", data.user.id)
          .maybeSingle();

        if (profileError || !userProfile) {
          clearAdminSession();
          setError("Your Supabase account is not linked to a dashboard profile.");
          return;
        }

        if (userProfile.is_active === false) {
          clearAdminSession();
          setError("This account is disabled.");
          return;
        }

        const { data: roleRows, error: roleError } = await supabase
          .from("user_roles")
          .select("role, hackathon_id")
          .eq("user_id", data.user.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (roleError) {
          clearAdminSession();
          setError(roleError.message || "Unable to resolve your dashboard role.");
          return;
        }

        const resolvedRole = normalizeDashboardRole(roleRows?.[0]?.role ?? userProfile.default_role);
        const roleRoute = resolveAdminRoute(resolvedRole);

        if (resolvedRole === "unknown") {
          clearAdminSession();
          setError("No dashboard role is assigned to this account.");
          return;
        }

        storeAdminSession({
          userId: data.user.id,
          email: userProfile.email ?? data.user.email ?? null,
          role: resolvedRole,
          hackathonId: roleRows?.[0]?.hackathon_id ? String(roleRows[0].hackathon_id) : null,
          source: "supabase",
          createdAt: Date.now(),
        });

        navigate(roleRoute, { replace: true });
      }
    } catch (err) {
      setError("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden px-6">
      <div className="absolute inset-0 grid-bg opacity-20" />

      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-500 via-purple-600 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, 50, -50, 0],
            y: [0, 50, 0, 50],
            scale: [1, 1.1, 1, 1.05],
            opacity: [0.3, 0.4, 0.3, 0.35],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/4 right-0 w-80 h-80 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full blur-3xl"
          animate={{
            x: [-50, 50, 0, 50],
            y: [0, -50, 50, 0],
            scale: [1, 1.05, 1.1, 1],
            opacity: [0.25, 0.35, 0.3, 0.28],
          }}
          transition={{
            duration: 14,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />
      </div>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-md"
      >
        <section className="surface-elevated rounded-2xl border border-amber-300/30 bg-amber-500/10 p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-amber-400" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-200" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Admin Access
            </p>
            <h1
              className="mt-3 leading-tight"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
                fontWeight: 500,
                fontSize: "clamp(2.2rem, 6vw, 3.2rem)",
                color: "#fff8f0",
                letterSpacing: "-0.01em",
                textShadow: "0 0 40px rgba(251,191,36,0.35), 0 0 80px rgba(251,191,36,0.15)",
              }}
            >
              Oregent Admin
            </h1>
            <p className="mt-2 text-sm text-amber-100/90" style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400 }}>
              Enter your credentials to access the dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-amber-200"
                style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}
              >
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@company.com"
                className="bg-amber-500/5 border-amber-300/30 text-amber-50 placeholder:text-amber-300/50"
                style={{ fontFamily: "'Outfit', sans-serif" }}
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-amber-200"
                style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}
              >
                Admin Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="pr-10 bg-amber-500/5 border-amber-300/30 text-amber-50 placeholder:text-amber-300/50"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-300 hover:text-amber-100 transition-colors duration-150 focus:outline-none"
                  style={{ background: "transparent", border: "none", cursor: "pointer", padding: "2px" }}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <Alert className="border-red-500/30 bg-red-500/10">
                <AlertDescription
                  className="text-red-200"
                  style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 400 }}
                >
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full font-semibold transition-all duration-200"
              style={{
                background: isLoading ? "rgba(255,255,255,0.75)" : "#ffffff",
                color: "#1a1108",
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 600,
                letterSpacing: "0.02em",
                boxShadow: "0 0 24px rgba(255,255,255,0.18), 0 2px 8px rgba(0,0,0,0.25)",
                border: "none",
              }}
            >
              {isLoading ? "Authenticating..." : "Sign In"}
            </Button>
          </form>
        </section>
      </motion.main>
    </div>
  );
};

export default AdminAuth;
