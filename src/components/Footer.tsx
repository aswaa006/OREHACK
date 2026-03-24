const Footer = () => {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const navLinks = [
    { label: "Hackathons", id: "hackathons" },
    { label: "How It Works", id: "how-it-works" },
    { label: "About", id: "about" },
    { label: "Contact", id: "contact" },
  ];

  const socialLinks = [
    { label: "LinkedIn", href: "https://www.linkedin.com/company/oregent" },
    { label: "Instagram", href: "https://www.instagram.com/oregent" },
    { label: "YouTube", href: "https://youtube.com/@oregent" },
    { label: "WhatsApp", href: "https://wa.me/oregent" },
  ];

  return (
    <footer className="bg-background border-t border-border/50 pt-16 pb-0 overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Top section: Navigation + Social */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-6">
              Navigation
            </h4>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollToSection(link.id)}
                    className="text-base text-foreground/80 hover:text-primary transition-colors duration-300"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-6">
              Social
            </h4>
            <ul className="space-y-3">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-foreground/80 hover:text-primary transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Branding column */}
          <div className="flex flex-col justify-between">
            <div>
              <span className="text-xl font-bold tracking-tight text-foreground">
                Ore<span className="text-gradient-primary">hack</span>
              </span>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                A Controlled Technical Evaluation System — engineered by Oregent.
              </p>
            </div>
          </div>
        </div>

        {/* Divider + copyright bar */}
        <div className="border-t border-border/50 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Oregent. All rights reserved.
          </p>
          <a
            href="mailto:contact@oregent.com"
            className="text-sm text-primary hover:text-primary/80 transition-colors duration-300"
          >
            contact@oregent.com
          </a>
        </div>
      </div>

      {/* Giant brand text */}
      <div className="relative mt-8 flex items-end justify-center overflow-hidden select-none pointer-events-none">
        <h2
          className="text-[clamp(5rem,18vw,16rem)] font-black leading-[0.85] tracking-tighter text-center pb-0"
          style={{
            background: "linear-gradient(180deg, hsl(263 84% 58%) 0%, hsl(263 84% 38%) 50%, transparent 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          OREHACK
        </h2>
      </div>
    </footer>
  );
};

export default Footer;
