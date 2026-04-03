import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

const HackathonLogin = () => {
  const { hackathonId } = useParams();
  const navigate = useNavigate();
  const [teamId, setTeamId] = useState("");
  const [teamName, setTeamName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shakeTick, setShakeTick] = useState(0);
  const [authState, setAuthState] = useState<"idle" | "checking" | "granted">("idle");

  const hackathonName = hackathonId?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Hackathon";
  const teamLabel = teamName.trim() || teamId.trim() || "XYZ";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedTeamId = teamId.trim();
    const normalizedTeamName = teamName.trim();
    const normalizedPassword = password.trim();
    const idValid = /^[A-Za-z0-9_-]{3,24}$/.test(normalizedTeamId);
    const nameValid = normalizedTeamName.length >= 2 && normalizedTeamName.length <= 60;
    const passValid = normalizedPassword.length >= 6;

    if (!idValid || !nameValid || !passValid) {
      setError("Enter a valid Team ID, Team Name, and a password with at least 6 characters.");
      setShakeTick((prev) => prev + 1);
      return;
    }

    setError("");
    setLoading(true);
    setAuthState("checking");

    const { data: submission, error: loginError } = await supabase
      .from("submissions")
      .select("teamID, Team_Name, password")
      .eq("teamID", normalizedTeamId)
      .maybeSingle();

    if (loginError) {
      setError(loginError.message || "Login failed. Please try again.");
      setAuthState("idle");
      setLoading(false);
      setShakeTick((prev) => prev + 1);
      return;
    }

    if (!submission) {
      setError("Invalid Team ID, Team Name, or password.");
      setAuthState("idle");
      setLoading(false);
      setShakeTick((prev) => prev + 1);
      return;
    }

    const dbTeamName = ((submission.Team_Name as string | undefined) || "").trim();
    const dbPassword = ((submission.password as string | undefined) || "").trim();

    if (dbTeamName.toLowerCase() !== normalizedTeamName.toLowerCase()) {
      setError("Team name does not match this Team ID.");
      setAuthState("idle");
      setLoading(false);
      setShakeTick((prev) => prev + 1);
      return;
    }

    if (dbPassword !== normalizedPassword) {
      setError("Password does not match this Team ID.");
      setAuthState("idle");
      setLoading(false);
      setShakeTick((prev) => prev + 1);
      return;
    }

    const resolvedTeamId =
      (submission.teamID as string | undefined) || normalizedTeamId;

    const resolvedTeamName = dbTeamName || normalizedTeamName;

    await supabase
      .from("submissions")
      .update({
        Team_Name: resolvedTeamName,
      })
      .eq("teamID", resolvedTeamId);

    await new Promise((r) => setTimeout(r, 700));
    setAuthState("granted");
    await new Promise((r) => setTimeout(r, 1900));
    localStorage.setItem(
      "orehack_team_session",
      JSON.stringify({
        hackathonId,
        teamId: resolvedTeamId,
        teamName: resolvedTeamName,
      }),
    );
    setLoading(false);
    navigate(`/hackathon/${hackathonId}/submit`, {
      state: { teamId: resolvedTeamId, teamName: resolvedTeamName },
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0b0f1a] text-foreground">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_16%_18%,rgba(168,85,247,0.24),transparent_34%),radial-gradient(circle_at_84%_14%,rgba(217,70,239,0.2),transparent_40%),radial-gradient(circle_at_38%_82%,rgba(139,92,246,0.19),transparent_38%),linear-gradient(180deg,#0b0f1a_0%,#151029_100%)]" />
      <div className="pointer-events-none absolute inset-0 grid-bg opacity-25" />

      {[0, 1, 2].map((idx) => (
        <motion.div
          key={idx}
          className="pointer-events-none absolute rounded-full blur-3xl"
          style={{
            width: idx === 0 ? 380 : idx === 1 ? 310 : 260,
            height: idx === 0 ? 380 : idx === 1 ? 310 : 260,
            left: idx === 0 ? "-6%" : idx === 1 ? "62%" : "30%",
            top: idx === 0 ? "-7%" : idx === 1 ? "8%" : "66%",
            background:
              idx === 0
                ? "linear-gradient(140deg, rgba(167,139,250,0.3), rgba(99,40,150,0.08))"
                : idx === 1
                  ? "linear-gradient(150deg, rgba(232,121,249,0.32), rgba(124,58,237,0.1))"
                  : "linear-gradient(130deg, rgba(196,181,253,0.28), rgba(168,85,247,0.08))",
          }}
          animate={{
            x: idx === 0 ? [0, 42, -18, 0] : idx === 1 ? [0, -30, 24, 0] : [0, 24, -34, 0],
            y: idx === 0 ? [0, 24, -26, 0] : idx === 1 ? [0, -18, 26, 0] : [0, -32, 18, 0],
            scale: [1, 1.08, 0.96, 1],
          }}
          transition={{ duration: 16 + idx * 2, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {[14, 28, 42, 57, 71, 86].map((left, index) => (
        <motion.span
          key={left}
          className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-fuchsia-200/65 shadow-[0_0_12px_rgba(217,70,239,0.72)]"
          style={{ left: `${left}%`, top: `${18 + (index % 4) * 16}%` }}
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -8, 0] }}
          transition={{ duration: 2.8 + index * 0.25, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      <AnimatePresence>
        {authState === "granted" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 z-30"
          >
            <motion.div
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="absolute inset-0 bg-[#0b0f1a]"
            />

            {[0, 1, 2].map((ring) => (
              <motion.div
                key={ring}
                className="pointer-events-none absolute left-1/2 top-1/2 h-[40vmax] w-[40vmax] -translate-x-1/2 -translate-y-1/2 rounded-full border"
                style={{ borderColor: `rgba(217, 70, 239, ${0.16 - ring * 0.04})` }}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: [0.7, 1.03], opacity: [0.05, 0.4, 0.1] }}
                transition={{ duration: 1.2 + ring * 0.22, ease: "easeOut" }}
              />
            ))}

            <div className="relative flex h-full items-center justify-center px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.12 }}
                className="max-w-2xl"
              >
                <p className="text-xs uppercase tracking-[0.34em] text-fuchsia-200/70">Access Granted</p>
                <h2 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
                  Welcome Team <span className="text-fuchsia-300">{teamLabel}</span>
                </h2>

                <div className="mt-5 space-y-2 text-left text-sm text-fuchsia-100/80 sm:text-base">
                  {[
                    "Identity verified and workspace unlocked.",
                    "Upload channel is now open for your repository.",
                    "Next: share your GitHub link and submit for evaluation.",
                  ].map((line, idx) => (
                    <motion.p
                      key={line}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.22 + idx * 0.14, duration: 0.45 }}
                    >
                      {line}
                    </motion.p>
                  ))}
                </div>

                <motion.div
                  className="mx-auto mt-8 h-1 w-60 overflow-hidden rounded-full bg-fuchsia-500/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-violet-400 to-indigo-400"
                    initial={{ x: "-100%" }}
                    animate={{ x: "0%" }}
                    transition={{ duration: 0.95, ease: "easeInOut" }}
                  />
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
        <motion.section
          initial={{ opacity: 0, y: 26, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <motion.div
            key={shakeTick}
            animate={{ x: error ? [0, -10, 10, -6, 6, 0] : 0 }}
            transition={{ duration: 0.42 }}
            className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.07] p-8 shadow-[0_18px_80px_rgba(16,12,28,0.62)] backdrop-blur-2xl sm:p-9"
          >
            <motion.div
              className="pointer-events-none absolute -inset-28 bg-[conic-gradient(from_200deg,rgba(196,181,253,0.28),rgba(99,102,241,0),rgba(217,70,239,0.22),rgba(196,181,253,0.28))]"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            />
            <div className="pointer-events-none absolute inset-[1px] rounded-[22px] bg-[#101426]/88" />

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.1, 0.25, 0.1] }}
                transition={{ duration: 0.45 }}
                className="pointer-events-none absolute inset-0 rounded-[22px] bg-rose-500/20"
              />
            )}

            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="mb-8 text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-fuchsia-300/30 bg-fuchsia-400/10 shadow-[0_0_30px_rgba(217,70,239,0.28)]">
                  <span className="text-xl font-semibold text-fuchsia-100">O</span>
                </div>
                <h1 className="mb-1 text-2xl font-bold tracking-tight text-white">{hackathonName}</h1>
                <p className="text-sm text-fuchsia-100/70">Sign in to continue to project upload</p>
              </motion.div>

              <form onSubmit={handleLogin} className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.24, duration: 0.45 }}
                >
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.18em] text-fuchsia-100/70">
                    Team ID
                  </label>
                  <input
                    type="text"
                    value={teamId}
                    onChange={(e) => setTeamId(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-fuchsia-100/45 outline-none transition-all duration-300 focus:border-fuchsia-300/60 focus:bg-white/[0.1] focus:shadow-[0_0_0_4px_rgba(217,70,239,0.14)]"
                    placeholder="Enter your team ID"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28, duration: 0.45 }}
                >
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.18em] text-fuchsia-100/70">
                    Team Name
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-fuchsia-100/45 outline-none transition-all duration-300 focus:border-fuchsia-300/60 focus:bg-white/[0.1] focus:shadow-[0_0_0_4px_rgba(217,70,239,0.14)]"
                    placeholder="Enter your team name"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.45 }}
                >
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.18em] text-fuchsia-100/70">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3 text-sm text-white placeholder:text-fuchsia-100/45 outline-none transition-all duration-300 focus:border-fuchsia-300/60 focus:bg-white/[0.1] focus:shadow-[0_0_0_4px_rgba(217,70,239,0.14)]"
                    placeholder="Enter password"
                  />
                </motion.div>

                {error && <p className="text-xs text-rose-300">{error}</p>}

                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.36, duration: 0.45 }}
                  whileHover={{ y: -1, scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading}
                  className="relative w-full overflow-hidden rounded-xl border border-fuchsia-300/40 bg-gradient-to-r from-violet-600 via-fuchsia-500 to-indigo-600 py-3 text-sm font-semibold text-white transition-all duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="relative z-10">
                    {authState === "granted" ? "Preparing Upload Space..." : loading ? "Authenticating..." : "Enter Portal"}
                  </span>
                  <motion.span
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.4)_50%,transparent_80%)]"
                    animate={{ x: ["-140%", "140%"] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                  />
                </motion.button>
              </form>
            </div>
          </motion.div>

          <p className="mt-6 text-center text-xs tracking-[0.22em] text-fuchsia-100/45">
            Ore<span className="text-fuchsia-300">hack</span> by Oregent
          </p>
        </motion.section>
      </main>
    </div>
  );
};

export default HackathonLogin;
