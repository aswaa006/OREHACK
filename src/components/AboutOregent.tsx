import { motion } from "framer-motion";
import CardSwap, { Card } from './CardSwap'

const features = [
  {
    title: "Agentic Infrastructure",
    desc: "Systems that observe, reason, and act — building autonomous operational layers.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
  },
  {
    title: "Intelligent Evaluation Engines",
    desc: "Automated analysis pipelines that evaluate, score, and report with structured precision.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
      </svg>
    ),
  },
  {
    title: "Distributed Processing Systems",
    desc: "Scalable backend architecture for concurrent evaluation across multiple hackathons.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
      </svg>
    ),
  },
];

const AboutOregent = () => {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Text section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex-1 max-w-2xl"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Built by <span className="text-primary">Oregent</span></h2>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Orehack is developed by Oregent — focused on building agentic systems and controlled execution platforms
              for the next generation of technical infrastructure.
            </p>
          </motion.div>

          {/* Cards Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-1 flex justify-center w-full"
          >
            <div style={{ height: '450px', width: '100%', maxWidth: '400px', position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <CardSwap
                cardDistance={35}
                verticalDistance={40}
                delay={2500}
                pauseOnHover={false}
                width={320}
                height={280}
              >
                {features.map((f, i) => (
                  <Card key={i}>
                    <div className="surface-elevated rounded-[1.5rem] p-8 h-full flex flex-col justify-center shadow-2xl bg-card border border-border/50 text-card-foreground hover:border-primary/50 transition-colors">
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 ring-1 ring-primary/20">
                        {f.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-3 tracking-tight">{f.title}</h3>
                      <p className="text-[15px] text-muted-foreground leading-relaxed">{f.desc}</p>
                    </div>
                  </Card>
                ))}
              </CardSwap>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutOregent;
