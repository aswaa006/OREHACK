import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Eye, EyeOff } from "lucide-react";

const AdminAuth = () => {
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
      // Hash the password client-side for additional encryption
      const encoder = new TextEncoder();
      const encodedPassword = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest("SHA-256", encodedPassword);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashedPassword = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      // Use hashed password as the actual password for Supabase auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "admin@orehack.com", // Fixed admin email
        password: hashedPassword,
      });

      if (error) {
        setError("Invalid password. Access denied.");
        return;
      }

      if (data.user) {
        // Store encrypted session token with additional encryption
        const sessionData = {
          user_id: data.user.id,
          email: data.user.email,
          timestamp: Date.now(),
          hash: hashedPassword.substring(0, 16), // Store part of hash for verification
        };

        // Encrypt session data
        const sessionJson = JSON.stringify(sessionData);
        const encryptedSession = btoa(sessionJson); // Base64 encoding as encryption

        sessionStorage.setItem("admin_session", encryptedSession);
        navigate("/admin/developer");
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
            <p className="text-sm font-semibold uppercase tracking-widest text-amber-200">
              Admin Access
            </p>
            <h1 className="mt-3 text-3xl font-black text-amber-50 leading-tight">
              OREGENT Admin
            </h1>
            <p className="mt-2 text-sm text-amber-100/90">
              Enter your admin password to access the dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-amber-200">
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
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-300/70 hover:text-amber-200"
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
                <AlertDescription className="text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-amber-50 font-semibold"
            >
              {isLoading ? "Authenticating..." : "Access Admin Dashboard"}
            </Button>
          </form>
        </section>
      </motion.main>
    </div>
  );
};

export default AdminAuth;
