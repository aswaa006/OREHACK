import { motion } from "framer-motion";

const AdminAuth = () => {
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
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
      </div>

      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-xl"
      >
        <section className="surface-elevated rounded-2xl border border-amber-300/30 bg-amber-500/10 p-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-amber-200">Contact Admin</p>
          <h1 className="mt-3 text-4xl md:text-5xl font-black text-amber-50 leading-tight">
            OREGENT - OREHACK loads
          </h1>
          <p className="mt-4 text-base text-amber-100/90">
            For any other hackathon, please contact the admin team.
          </p>
        </section>
      </motion.main>
    </div>
  );
};

export default AdminAuth;
