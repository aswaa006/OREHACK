import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const AdminAuth = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<"hackathon" | "developer" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !role) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    navigate(role === "hackathon" ? "/admin/hackathon" : "/admin/developer");
  };

  const roleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.6 },
    }),
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-20" />
      
      {/* Animated 4-Color Gradient Background */}
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
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-gradient-to-tr from-indigo-600 via-purple-500 to-transparent rounded-full blur-3xl"
          animate={{
            x: [50, -50, 50, 0],
            y: [50, 0, -50, 50],
            scale: [1.05, 1, 1.1, 1],
            opacity: [0.3, 0.25, 0.35, 0.3],
          }}
          transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-80 h-80 bg-gradient-to-tl from-teal-500 via-cyan-600 to-transparent rounded-full blur-3xl"
          animate={{
            x: [0, -50, 50, -50],
            y: [-50, 50, 0, 50],
            scale: [1, 1.08, 1, 1.1],
            opacity: [0.28, 0.32, 0.3, 0.33],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-6"
      >
        <div className="surface-elevated rounded-xl p-8 border border-primary/10">
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h1 className="text-2xl font-bold text-foreground mb-2">Admin Access</h1>
              <p className="text-sm text-muted-foreground">Orehack Control System</p>
            </motion.div>
          </div>

          {!role ? (
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  role: "hackathon",
                  title: "Hackathon Admin",
                  desc: "View & manage events",
                  icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5",
                  index: 0,
                },
                {
                  role: "developer",
                  title: "Developer Admin",
                  desc: "Full system access",
                  icon: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
                  index: 1,
                },
              ].map((item) => (
                <motion.button
                  key={item.role}
                  custom={item.index}
                  variants={roleVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setRole(item.role as "hackathon" | "developer")}
                  className="surface-elevated rounded-xl p-5 text-center border border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
                >
                  <motion.div
                    className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3"
                    whileHover={{ rotate: 10, scale: 1.1 }}
                  >
                    <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                    </svg>
                  </motion.div>
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </motion.button>
              ))}
            </div>
          ) : (
            <motion.form
              onSubmit={handleLogin}
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <button
                type="button"
                onClick={() => setRole(null)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
              >
                ← Back to role selection
              </button>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
                <motion.input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                  placeholder="admin@oregent.com"
                  whileFocus={{ borderColor: "hsl(var(--primary))" }}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Password</label>
                <motion.input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                  placeholder="Enter password"
                  whileFocus={{ borderColor: "hsl(var(--primary))" }}
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-accent transition-all duration-300 disabled:opacity-50"
              >
                {loading ? "Authenticating…" : `Sign in as ${role === "hackathon" ? "Hackathon" : "Developer"} Admin`}
              </motion.button>
            </motion.form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminAuth;
