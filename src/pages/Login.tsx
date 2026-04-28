import { useState, useCallback } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useEvent } from "@/context/EventContext";
import { useEventState } from "@/hooks/useEventState";
import { supabase } from "@/lib/supabase";
import { resolveHackathonBySlug } from "@/lib/event-db";
import { verifyTeamCredentials } from "@/lib/team-auth";
import PageTransition from "@/components/PageTransition";

const Login = () => {
  const { eventId }    = useParams<{ eventId: string }>();
  const navigate       = useNavigate();
  const { setAuthenticated } = useEvent();
  const { isEventLive, isAuthenticated } = useEventState();

  const [teamId,    setTeamId]    = useState("");
  const [teamName,  setTeamName]  = useState("");
  const [password,  setPassword]  = useState("");
  const [error,     setError]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [shakeTick, setShakeTick] = useState(0);
  const [authState, setAuthState] = useState<"idle" | "checking" | "granted">("idle");

  const baseEvent = eventId ?? "origin-2k25";
  const hackName  = baseEvent
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const teamLabel = teamName.trim() || teamId.trim() || "XYZ";

  /* ── Submit ── */
  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const id   = teamId.trim();
    const name = teamName.trim();
    const pass = password.trim();

    const idValid   = /^[A-Za-z0-9_-]{2,24}$/.test(id);
    const nameValid = name.length >= 2 && name.length <= 60;
    const passValid = pass.length >= 6;

    if (!idValid || !nameValid || !passValid) {
      setError("Enter a valid Team ID, Team Name, and a password with at least 6 characters.");
      setShakeTick((n) => n + 1);
      return;
    }

    setError("");
    setLoading(true);
    setAuthState("checking");

    const { data: hackathon, error: hackathonError } = await resolveHackathonBySlug(baseEvent);
    if (hackathonError) {
      setError(hackathonError.message || "Login failed. Please try again.");
      setAuthState("idle");
      setLoading(false);
      setShakeTick((n) => n + 1);
      return;
    }

    if (!hackathon) {
      setError("Hackathon not found.");
      setAuthState("idle");
      setLoading(false);
      setShakeTick((n) => n + 1);
      return;
    }

    const verification = await verifyTeamCredentials({
      hackathonId: hackathon.id,
      teamCode: id,
      teamName: name,
      password: pass,
    });

    if (!verification.valid) {
      setError(verification.error || "Invalid Team ID, Team Name, or password.");
      setAuthState("idle");
      setLoading(false);
      setShakeTick((n) => n + 1);
      return;
    }

    const resolvedTeamId = verification.teamCode || id;
    const resolvedTeamDbId = verification.teamDbId;
    const resolvedTeamName = verification.teamName || name;

    if (resolvedTeamDbId) {
      await supabase.from("submissions").upsert(
        {
          hackathon_id: hackathon.id,
          team_id: resolvedTeamDbId,
          teamID: resolvedTeamId,
          TeamID: resolvedTeamId,
          Team_Name: resolvedTeamName,
          Progress: "queued",
        },
        { onConflict: "team_id" },
      );
    } else {
      await supabase.from("submissions").update({ Team_Name: resolvedTeamName }).eq("teamID", resolvedTeamId);
    }

    await new Promise((r) => setTimeout(r, 700));
    setAuthState("granted");
    setAuthenticated(resolvedTeamId, resolvedTeamName);

    await new Promise((r) => setTimeout(r, 1900));
    setLoading(false);
    navigate(`/event/${baseEvent}/rules`);
  }, [teamId, teamName, password, setAuthenticated, navigate, baseEvent]);

  /* ── Route guards ── */
  if (isAuthenticated && authState !== "granted") return <Navigate to={`/event/${baseEvent}/rules`} replace />;
  if (!isEventLive)    return <Navigate to={`/event/${baseEvent}`}       replace />;

  /* ══════════════════════════════════════════════════════
     RENDER — Black / Origin-poster theme
  ══════════════════════════════════════════════════════ */
  return (
    <PageTransition>
      <div
        className="relative min-h-screen overflow-hidden text-white"
        style={{ background: "linear-gradient(160deg, #0a0a0a 0%, #141414 40%, #1a1a1a 70%, #0d0d0d 100%)" }}
      >
        {/* Subtle grid */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "52px 52px",
          }}
        />

        {/* Radial grey glows */}
        {[0, 1].map((i) => (
          <motion.div
            key={i}
            className="pointer-events-none absolute rounded-full blur-[120px]"
            style={{
              width:  i === 0 ? 500 : 380,
              height: i === 0 ? 500 : 380,
              left:   i === 0 ? "-10%" : "60%",
              top:    i === 0 ? "-12%" : "55%",
              background: i === 0
                ? "radial-gradient(circle, rgba(180,180,180,0.06) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(120,120,120,0.04) 0%, transparent 70%)",
            }}
            animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 8 + i * 3, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}

        {/* ── ACCESS GRANTED overlay ── */}
        <AnimatePresence>
          {authState === "granted" && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }} className="absolute inset-0 z-30"
            >
              <div className="absolute inset-0" style={{ background: "linear-gradient(160deg,#0a0a0a,#141414)" }} />
              {[0, 1, 2].map((ring) => (
                <motion.div
                  key={ring}
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border"
                  style={{ width: "40vmax", height: "40vmax", borderColor: `rgba(200,200,200,${0.1 - ring * 0.025})` }}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: [0.7, 1.05], opacity: [0.05, 0.3, 0.05] }}
                  transition={{ duration: 1.3 + ring * 0.2, ease: "easeOut" }}
                />
              ))}
              <div className="relative flex h-full items-center justify-center px-6 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.12 }} className="max-w-2xl"
                >
                  <p className="text-xs uppercase tracking-[0.34em]" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Access Granted
                  </p>
                  <h2 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
                    Welcome Team <span className="text-white">{teamLabel}</span>
                  </h2>
                  <div className="mt-5 space-y-2 text-left text-sm sm:text-base" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {[
                      "Identity verified and workspace unlocked.",
                      "Redirecting to Rules & Regulations…",
                      "You must accept the rules before entering the waiting room.",
                    ].map((line, idx) => (
                      <motion.p
                        key={line}
                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.22 + idx * 0.14, duration: 0.45 }}
                      >
                        {line}
                      </motion.p>
                    ))}
                  </div>
                  <motion.div
                    className="mx-auto mt-8 h-[1px] w-60 overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                  >
                    <motion.div
                      className="h-full bg-white"
                      initial={{ x: "-100%" }} animate={{ x: "0%" }}
                      transition={{ duration: 1.0, ease: "easeInOut" }}
                    />
                  </motion.div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── MAIN FORM ── */}
        <main className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
          <motion.section
            initial={{ opacity: 0, y: 26, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="w-full max-w-lg"
          >
            <motion.div
              key={shakeTick}
              animate={{ x: error ? [0, -10, 10, -6, 6, 0] : 0 }}
              transition={{ duration: 0.42 }}
              className="relative overflow-hidden rounded-3xl"
              style={{ border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 28px 90px rgba(0,0,0,0.9)" }}
            >
              {/* ── Card hero: Origin poster ── */}
              <div
                className="relative flex flex-col items-center justify-center px-8 text-center"
                style={{
                  backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(10,10,10,0.88)), url('/place to strt.jpeg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  minHeight: "200px",
                }}
              >
                {/* fade-to-card-body */}
                <div
                  className="pointer-events-none absolute bottom-0 left-0 right-0 h-10"
                  style={{ background: "linear-gradient(to bottom, transparent, rgba(14,14,14,1))" }}
                />
              </div>

              {/* ── Card body ── */}
              <div className="px-8 pb-8 pt-2" style={{ background: "linear-gradient(to bottom, #0e0e0e, #111111)" }}>

                {/* error flash */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: [0.1, 0.18, 0.1] }}
                    transition={{ duration: 0.45 }}
                    className="pointer-events-none absolute inset-0 rounded-3xl"
                    style={{ background: "rgba(255,60,60,0.06)" }}
                  />
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  {[
                    { label: "Team ID",    value: teamId,    setter: setTeamId,    placeholder: "Enter your team ID",   type: "text",     delay: 0.10 },
                    { label: "Team Name",  value: teamName,  setter: setTeamName,  placeholder: "Enter your team name", type: "text",     delay: 0.16 },
                    { label: "Password",   value: password,  setter: setPassword,  placeholder: "Enter password",       type: "password", delay: 0.22 },
                  ].map(({ label, value, setter, placeholder, type, delay }) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay, duration: 0.4 }}
                    >
                      <label
                        className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.16em]"
                        style={{ color: "rgba(255,255,255,0.32)" }}
                      >
                        {label}
                      </label>
                      <input
                        type={type}
                        value={value}
                        onChange={(e) => setter(e.target.value)}
                        placeholder={placeholder}
                        className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-300"
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          caretColor: "white",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.border      = "1px solid rgba(255,255,255,0.28)";
                          e.currentTarget.style.background  = "rgba(255,255,255,0.07)";
                          e.currentTarget.style.boxShadow   = "0 0 0 3px rgba(255,255,255,0.04)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.border      = "1px solid rgba(255,255,255,0.08)";
                          e.currentTarget.style.background  = "rgba(255,255,255,0.05)";
                          e.currentTarget.style.boxShadow   = "none";
                        }}
                      />
                    </motion.div>
                  ))}

                  {error && (
                    <p className="text-xs" style={{ color: "rgba(255,100,100,0.8)" }}>{error}</p>
                  )}

                  {/* Submit */}
                  <motion.button
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    whileHover={{ y: -1, scale: 1.01 }} whileTap={{ scale: 0.99 }}
                    type="submit" disabled={loading}
                    className="relative mt-2 w-full overflow-hidden rounded-xl py-3.5 text-sm font-semibold text-black transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg, #e8e8e8 0%, #ffffff 50%, #d0d0d0 100%)",
                      boxShadow: "0 4px 24px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.6)",
                    }}
                  >
                    <span className="relative z-10 tracking-wide">
                      {authState === "granted"
                        ? "Preparing Workspace…"
                        : loading
                          ? "Authenticating…"
                          : "Enter Portal"}
                    </span>
                    {/* shimmer sweep */}
                    <motion.span
                      className="pointer-events-none absolute inset-0"
                      style={{ background: "linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.35) 50%, transparent 80%)" }}
                      animate={{ x: ["-140%", "140%"] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </motion.button>

                  <motion.p
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.4 }}
                    className="pt-1 text-center text-xs tracking-wide"
                    style={{ color: "rgba(255,255,255,0.28)" }}
                  >
                    Sign in to continue to {hackName}
                  </motion.p>
                </form>
              </div>
            </motion.div>

            <p
              className="mt-6 text-center text-xs tracking-[0.25em] font-medium"
              style={{ color: "rgba(255,255,255,0.16)" }}
            >
              OREHACK — {hackName.toUpperCase()}
            </p>
          </motion.section>
        </main>
      </div>
    </PageTransition>
  );
};

export default Login;
