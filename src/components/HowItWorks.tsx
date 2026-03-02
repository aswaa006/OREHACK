import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Register & Authenticate",
    desc: "Teams receive credentials and log in through the secure submission portal.",
  },
  {
    num: "02",
    title: "Submit Repository",
    desc: "Submit your public GitHub repository link along with an optional problem statement.",
  },
  {
    num: "03",
    title: "Automated Evaluation",
    desc: "Our engine parses, inspects, and evaluates your submission through structured intelligence.",
  },
  {
    num: "04",
    title: "Results & Leaderboard",
    desc: "Scores and structured feedback are generated. Rankings update in real time.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-foreground mb-2">How It Works</h2>
          <p className="text-muted-foreground text-sm">A structured evaluation pipeline from submission to scoring.</p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="relative"
            >
              <span className="text-5xl font-bold text-primary/10 mb-4 block">{s.num}</span>
              <h3 className="text-base font-semibold text-foreground mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 right-0 translate-x-1/2 w-6 text-muted-foreground/30">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
