import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const hackathons = [
  {
    id: "origin-2k26",
    name: "Origin 2K26",
    status: "Live",
    participants: 128,
    deadline: "March 15, 2026",
  },
  {
    id: "buildcore-v3",
    name: "BuildCore v3",
    status: "Upcoming",
    participants: 0,
    deadline: "April 5, 2026",
  },
  {
    id: "devstrike-24",
    name: "DevStrike '24",
    status: "Completed",
    participants: 256,
    deadline: "Ended",
  },
];

const statusColor: Record<string, string> = {
  Live: "bg-success/20 text-success",
  Upcoming: "bg-primary/20 text-primary",
  Completed: "bg-muted text-muted-foreground",
};

const ActiveHackathons = () => {
  const navigate = useNavigate();

  return (
    <section id="hackathons" className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold text-foreground mb-2">Active Hackathons</h2>
          <p className="text-muted-foreground text-sm">Click to enter submission portal.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {hackathons.map((h, i) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() => h.status === "Live" && navigate(`/hackathon/${h.id}/login`)}
              className={`surface-elevated rounded-xl p-6 transition-all duration-300 ${
                h.status === "Live"
                  ? "cursor-pointer hover:glow-primary hover:border-primary/30"
                  : "opacity-60 cursor-default"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">{h.name}</h3>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColor[h.status]}`}>
                  {h.status}
                </span>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Participants</span>
                  <span className="text-foreground font-medium">{h.participants}</span>
                </div>
                <div className="flex justify-between">
                  <span>Deadline</span>
                  <span className="text-foreground font-medium">{h.deadline}</span>
                </div>
              </div>

              {h.status === "Live" && (
                <div className="mt-5">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
                    Enter Portal
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ActiveHackathons;
